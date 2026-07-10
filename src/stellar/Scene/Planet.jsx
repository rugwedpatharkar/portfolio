/* eslint-disable react/no-unknown-property */
import { useMemo, useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import PlanetMaterial from "./PlanetMaterial";
import AtmosphereGlow from "./AtmosphereGlow";
import RingSystem from "./RingSystem";

/* Atmosphere preset per planet type. With bloom on, the rim will glow
   secondarily on its own — keep intensities moderate so atmospheres
   don't drown the surface texture. */
const ATMOSPHERE_PRESETS = {
  earth: { color: "#6aa0ff", intensity: 0.6, power: 3.0, scale: 1.05, terminator: 1, termColor: "#ff8a4a" },
  warm: { color: "#ffd99a", intensity: 0.40, power: 2.8, scale: 1.035 },
  rust: { color: "#e0936a", intensity: 0.28, power: 3.0, scale: 1.035 }, // Mars — soft ochre haze, not neon salmon
  gas: { color: "#ecd0a0", intensity: 0.35, power: 2.8, scale: 1.035 }, // Jupiter — cream/tan haze
  golden: { color: "#ffe9a8", intensity: 0.40, power: 2.8, scale: 1.035 },
  ice: { color: "#aadcd6", intensity: 0.40, power: 2.8, scale: 1.04 }, // Uranus — greenish-cyan
  abyss: { color: "#9cc6d6", intensity: 0.50, power: 2.8, scale: 1.045 }, // Neptune — pale greenish-blue
};

/* Earth's auroral ovals — a radially-FEATHERED, angularly-rippled additive glow
   (not a flat hula-hoop ring). Soft at both edges + waved around the oval, so it
   reads as the dancing aurora borealis/australis ringing the magnetic poles. */
const AURORA_VERT = /* glsl */ `
  varying vec3 vLocal;
  void main() { vLocal = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
const AURORA_FRAG = /* glsl */ `
  varying vec3 vLocal;
  uniform vec3 uColor;
  uniform float uInner;
  uniform float uOuter;
  void main() {
    float r = length(vLocal.xy);
    float t = clamp((r - uInner) / (uOuter - uInner), 0.0, 1.0);
    float band = smoothstep(0.0, 0.42, t) * (1.0 - smoothstep(0.55, 1.0, t)); // feather both rims
    float ang = atan(vLocal.y, vLocal.x);
    float wave = 0.5 + 0.5 * sin(ang * 16.0) + 0.28 * sin(ang * 6.0 + 1.3);    // curtains
    float a = band * clamp(wave, 0.0, 1.4) * 0.55;
    if (a < 0.01) discard;
    gl_FragColor = vec4(uColor * a, a);
  }
`;

/*
 * Planet primitive. Renders a textured sphere when a `texture` URL is
 * provided, otherwise falls back to the procedural PlanetMaterial shader.
 *
 * Earth gets the full PBR treatment: day map + emissive night-lights map
 * + a separate cloud-layer sphere that rotates a hair faster. Saturn's
 * rings consume `ringTexture` if supplied.
 */

const Planet = ({
  position = [0, 0, 0],
  radius = 1,
  type = "rocky",
  color,
  colorB,
  texture,
  nightTexture,
  cloudTexture,
  ringTexture,
  moonTexture,
  normalTexture,
  specularTexture,
  bumpTexture,
  rotationSpeed = 0.1,
  animate = true,
  rings = false,
  faintRings = false, // Jupiter / Uranus / Neptune all have real, faint rings
  ringColor,
  axialTilt = 0,
  oblateness = 0, // polar flattening (Jupiter 0.065, Saturn 0.098) — real gas-giant squash
  moons = 0,
  moonColor,
  moonScale = 0.12,
  moonSet, // optional: named major moons [{ color, scale, glow }] — distinct looks

  satelliteRef, // optional: receives the first moon's live WORLD position (for eclipses)
  onClick,
  onPointerOver,
  onPointerOut,
  tint,
  grade, // optional texture colour-correction { sat, lift, mix, tint } — e.g. Neptune true-colour
  children,
}) => {
  const groupRef = useRef();
  const planetRef = useRef();
  const cloudRef = useRef();
  const moonsRef = useRef([]);

  /* Load textures via Suspense — Scene wraps in <Suspense> already.
     Normal + specular + bump maps must NOT be sRGB — they're data,
     not colour. We mark them as Linear after load. */
  const colorUrls = useMemo(
    () => [texture, nightTexture, cloudTexture, ringTexture, moonTexture].filter(Boolean),
    [texture, nightTexture, cloudTexture, ringTexture, moonTexture]
  );
  const dataUrls = useMemo(
    () => [normalTexture, specularTexture, bumpTexture].filter(Boolean),
    [normalTexture, specularTexture, bumpTexture]
  );
  const loadedColor = useLoader(THREE.TextureLoader, colorUrls.length ? colorUrls : []);
  const loadedData = useLoader(THREE.TextureLoader, dataUrls.length ? dataUrls : []);

  const textureMap = useMemo(() => {
    const out = {};
    colorUrls.forEach((url, i) => {
      const tex = loadedColor[i];
      if (tex) {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = 8;
      }
      out[url] = tex;
    });
    dataUrls.forEach((url, i) => {
      const tex = loadedData[i];
      if (tex) {
        tex.colorSpace = THREE.NoColorSpace;
        tex.anisotropy = 8;
      }
      out[url] = tex;
    });
    return out;
  }, [loadedColor, loadedData, colorUrls, dataUrls]);

  /* Surface shader patch (onBeforeCompile) for the textured planets:
     1. LIMB DARKENING — dim gently toward the disc edge (μ = geometric-normal · view
        dir), so every planet reads as a lit SPHERE with rounded depth, not a flat
        textured disc. Applied pre-tonemap; kept subtle (edge → ~70%) so it's depth,
        not a dark ring. Universal (all textured planets).
     2. Optional texture colour-correction — a multiply-only `tint` can't LIGHTEN an
        over-saturated map (e.g. the legacy deep-indigo Neptune), so this desaturates
        → lifts → pulls toward the true hue (Neptune's 2024 true-colour). */
  const surfaceCompile = useMemo(() => {
    /* Limb darkening — applied to EVERY textured planet (μ = geometric normal · view
       dir; dim toward the disc edge, pre-tonemap, gentle). */
    const limb = (shader) => {
      shader.uniforms.uLimb = { value: 0.3 };
      shader.fragmentShader =
        "uniform float uLimb;\n" +
        shader.fragmentShader.replace(
          "#include <tonemapping_fragment>",
          `{
            float _mu = clamp(dot(normalize(vNormal), normalize(vViewPosition)), 0.0, 1.0);
            gl_FragColor.rgb *= 1.0 - (1.0 - _mu) * uLimb;
          }
          #include <tonemapping_fragment>`
        );
    };
    if (!grade) return limb;
    /* Neptune (etc.): limb + true-colour grade. Distinct function body on purpose —
       three's program cache keys on onBeforeCompile.toString(), so a graded planet
       must not share a source string with the limb-only planets. */
    const gg = { sat: grade.sat ?? 1, lift: grade.lift ?? 0, mix: grade.mix ?? 0, tint: new THREE.Color(grade.tint || "#ffffff") };
    return (shader) => {
      limb(shader);
      shader.uniforms.uGSat = { value: gg.sat };
      shader.uniforms.uGLift = { value: gg.lift };
      shader.uniforms.uGMix = { value: gg.mix };
      shader.uniforms.uGTint = { value: gg.tint };
      shader.fragmentShader =
        "uniform float uGSat; uniform float uGLift; uniform float uGMix; uniform vec3 uGTint;\n" +
        shader.fragmentShader.replace(
          "#include <map_fragment>",
          `#include <map_fragment>
          {
            float _l = dot(diffuseColor.rgb, vec3(0.2126, 0.7152, 0.0722));
            vec3 _g = mix(vec3(_l), diffuseColor.rgb, uGSat);
            _g += uGLift;
            diffuseColor.rgb = clamp(mix(_g, uGTint, uGMix), 0.0, 1.0);
          }`
        );
    };
  }, [grade]);

  useFrame((_, delta) => {
    /* Clamp dt: VisibilityController pauses the loop while the tab is hidden, so
       the first delta on refocus ≈ the whole hidden span — unclamped, the planets
       + moons would snap-spin a full frame. Matches SceneClock's own 1/20 clamp. */
    const dt = Math.min(delta, 1 / 20);
    /* Natural axial rotation (frozen on reduced-motion). */
    if (planetRef.current && animate) planetRef.current.rotation.y += dt * rotationSpeed;
    if (cloudRef.current && animate) cloudRef.current.rotation.y += dt * rotationSpeed * 1.35;
    moonsRef.current.forEach((m, i) => {
      if (m) {
        const t = m.userData.t + dt * (0.25 + (i % 3) * 0.05);
        m.userData.t = t;
        const orbitR = m.userData.orbit;
        m.position.set(
          Math.cos(t) * orbitR,
          Math.sin(t * 0.7) * orbitR * 0.22,
          Math.sin(t) * orbitR
        );
        /* Publish the primary moon's WORLD position so the eclipse system can
           use the real Moon as an occluder (no duplicate satellite). */
        if (satelliteRef && i === 0) m.getWorldPosition(satelliteRef.current);
      }
    });
  });

  const moonNodes = [];
  const mColor = moonColor || color || "#cccccc";
  /* Named major moons (moonSet) render with their own colour + relative size
     (Io volcanic-orange, Europa icy-white, Ganymede tan, Callisto dark, Titan
     haze, Triton, Charon). Without a moonSet we fall back to N identical moons
     sharing moonColor/moonTexture (e.g. Earth's textured Luna). */
  const moonList = moonSet && moonSet.length ? moonSet : null;
  const moonCount = moonList ? moonList.length : moons;
  for (let i = 0; i < moonCount; i++) {
    const md = moonList ? moonList[i] : null;
    const mc = md?.color || mColor;
    const ms = md?.scale || moonScale;
    /* moonSet moons are procedural colour (distinct); only the fallback path
       uses the shared lunar texture. */
    const tex = md ? null : textureMap[moonTexture] || null;
    /* Keep generic moons OUTSIDE the rings: push the orbit base past the ring's
       outer edge for ringed planets (Saturn/Jupiter/Neptune moons were orbiting
       inside their rings). */
    const ringOuter = rings ? radius * 2.3 : faintRings ? radius * 2.12 : radius;
    const orbit = Math.max(radius * 1.85, ringOuter * 1.08) + i * 0.16 * radius;
    const initial = (i / Math.max(1, moonCount)) * Math.PI * 2;
    moonNodes.push(
      <mesh
        key={i}
        castShadow
        receiveShadow
        frustumCulled={false}
        ref={(el) => {
          if (el) {
            el.userData = { orbit, t: initial };
            moonsRef.current[i] = el;
          }
        }}
        position={[Math.cos(initial) * orbit, 0, Math.sin(initial) * orbit]}
      >
        <sphereGeometry args={[radius * ms, 24, 24]} />
        <meshStandardMaterial
          color={mc}
          map={tex}
          /* Low emissive floor only — the sun-direction KeyLight sculpts a real
             day/night terminator on the moon instead of a flat self-lit glow.
             Io keeps a small genuine self-emission for its volcanic look. */
          emissive={new THREE.Color(mc).multiplyScalar((tex ? 0.05 : 0.06) + (md?.glow || 0))}
          emissiveIntensity={tex ? 0.12 : md?.glow ? 0.45 : 0.16}
          roughness={tex ? 0.9 : 0.7}
          metalness={tex ? 0.04 : 0.1}
        />
      </mesh>
    );
  }

  const rColor = ringColor || color || "#f8c555";

  /* Earth gets the night-lights + clouds treatment */
  const isEarth = type === "earth" && textureMap[texture] && textureMap[nightTexture];

  /* Material selection: textured PBR when texture is provided, else shader */
  const hasTexture = Boolean(textureMap[texture]);

  /* Real polar flattening: scale the body (and its atmosphere) along the spin
     axis (local Y). Rings + moons stay outside this so they keep circular. */
  const polarScale = [1, 1 - oblateness, 1];

  /* One shared aurora material (Earth only) — feathered + rippled ovals. */
  const auroraMat = useMemo(() => {
    if (type !== "earth") return null;
    return new THREE.ShaderMaterial({
      vertexShader: AURORA_VERT,
      fragmentShader: AURORA_FRAG,
      uniforms: {
        uColor: { value: new THREE.Color("#5cffae") },
        uInner: { value: radius * 0.14 },
        uOuter: { value: radius * 0.5 },
      },
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    });
  }, [type, radius]);

  return (
    <group position={position} ref={groupRef} rotation={[0, 0, axialTilt]}>
      <mesh
        ref={planetRef}
        scale={polarScale}
        castShadow
        receiveShadow
        /* Never frustum-cull the planet body: a tiny inner-planet bounding sphere,
           framed very close + slid off-centre (frameShift), intermittently fails
           the frustum test and the planet vanishes (black) until a hover scale-up
           nudges the sphere back in. Drawing ~10 always-near planets is free. */
        frustumCulled={false}
        onClick={onClick}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}>
        <sphereGeometry args={[radius, 48, 48]} />
        {hasTexture ? (
          <meshStandardMaterial
            map={textureMap[texture]}
            /* tint multiplies the texture — used to knock back Venus,
               which otherwise blooms to pure white. Defaults to neutral. */
            color={tint || "#ffffff"}
            onBeforeCompile={surfaceCompile}
            normalMap={textureMap[normalTexture] || null}
            normalScale={textureMap[normalTexture] ? new THREE.Vector2(0.85, 0.85) : undefined}
            /* Specular map carries Earth's ocean mask — bright on water,
               dark on land. We feed it to roughnessMap inverted so oceans
               are smooth (low roughness, mirror-like) and land is rough. */
            roughnessMap={textureMap[specularTexture] || null}
            bumpMap={textureMap[bumpTexture] || null}
            bumpScale={textureMap[bumpTexture] ? (isEarth ? 0.04 : 0.08) : 0}
            emissiveMap={isEarth ? textureMap[nightTexture] : null}
            emissive={isEarth ? new THREE.Color("#ffc480") : new THREE.Color("#000000")}
            emissiveIntensity={isEarth ? 1.2 : 0}
            /* Earth: low base roughness + the inverted ocean roughnessMap
               makes oceans mirror-like (sharp sun-glint slides across the
               sea as it rotates) while land stays matte. */
            roughness={isEarth ? 0.5 : 0.85}
            metalness={isEarth ? 0.1 : 0.05}
          />
        ) : (
          <PlanetMaterial type={type} color={color} colorB={colorB} />
        )}
        {/* Surface markers (e.g. the Pune pin) ride here so they inherit the
            planet's daily rotation + axial tilt. */}
        {children}
      </mesh>

      {/* Cloud layer for Earth — slightly larger sphere with cloud texture.
          Opacity is lower so continents remain the focal point through the
          haze; the planet, not the weather, is the subject. */}
      {isEarth && textureMap[cloudTexture] && (
        <mesh ref={cloudRef} frustumCulled={false}>
          <sphereGeometry args={[radius * 1.012, 32, 32]} />
          <meshStandardMaterial
            map={textureMap[cloudTexture]}
            alphaMap={textureMap[cloudTexture]}
            transparent
            opacity={0.4}
            depthWrite={false}
            roughness={1}
            metalness={0}
          />
        </mesh>
      )}

      {/* Aurorae — feathered, rippling auroral ovals ringing Earth's poles
          (additive; the existing Bloom haloes them). Ride the planet's axial
          tilt. One shared shader material across both poles. */}
      {isEarth && auroraMat && [1, -1].map((s) => (
        <mesh key={s} position={[0, radius * 0.92 * s, 0]} rotation={[Math.PI / 2, 0, 0]} frustumCulled={false}>
          <ringGeometry args={[radius * 0.14, radius * 0.5, 96]} />
          <primitive object={auroraMat} attach="material" />
        </mesh>
      ))}

      {/* Atmosphere rim glow — earth-blue by default, custom per planet */}
      {hasTexture && ATMOSPHERE_PRESETS[type] && (
        <group scale={polarScale}>
          <AtmosphereGlow radius={radius} {...ATMOSPHERE_PRESETS[type]} />
        </group>
      )}

      {rings && (
        <group rotation={[Math.PI / 2.05, 0, 0]}>
          {/* Realistic ring system (Saturn) — concentric ringlets, Cassini
              Division, granular particle shimmer. Falls back to simple
              banded discs when no ring texture is supplied. */}
          {textureMap[ringTexture] ? (
            <RingSystem radius={radius} texture={textureMap[ringTexture]} tint={rColor} />
          ) : (
            <>
              <mesh>
                <ringGeometry args={[radius * 1.32, radius * 1.55, 64]} />
                <meshBasicMaterial color={rColor} transparent opacity={0.18} side={THREE.DoubleSide} toneMapped={false} />
              </mesh>
              <mesh>
                <ringGeometry args={[radius * 1.58, radius * 1.92, 96]} />
                <meshBasicMaterial color={rColor} transparent opacity={0.55} side={THREE.DoubleSide} toneMapped={false} />
              </mesh>
              <mesh>
                <ringGeometry args={[radius * 1.96, radius * 2.15, 96]} />
                <meshBasicMaterial color={rColor} transparent opacity={0.28} side={THREE.DoubleSide} toneMapped={false} />
              </mesh>
            </>
          )}
        </group>
      )}

      {/* Faint dusty/narrow rings — Jupiter, Uranus, Neptune. Inherit the
          planet's axial tilt, so Uranus's ride near-vertical (its ~98° roll).
          Opacity boosted from the "physically-accurate-invisible" range
          (0.06–0.10) — at real values a bright Orion/Carina backdrop shows
          straight through them. These are still "faint" per real physics but
          now visibly occlude the sky behind. */}
      {faintRings && (
        <group rotation={[Math.PI / 2.05, 0, 0]}>
          <mesh>
            <ringGeometry args={[radius * 1.5, radius * 1.92, 96]} />
            <meshBasicMaterial color={rColor} transparent opacity={0.34} side={THREE.DoubleSide} depthWrite={false} toneMapped={false} />
          </mesh>
          <mesh>
            <ringGeometry args={[radius * 1.98, radius * 2.12, 96]} />
            <meshBasicMaterial color={rColor} transparent opacity={0.22} side={THREE.DoubleSide} depthWrite={false} toneMapped={false} />
          </mesh>
        </group>
      )}

      {moonNodes}
    </group>
  );
};

export default Planet;
