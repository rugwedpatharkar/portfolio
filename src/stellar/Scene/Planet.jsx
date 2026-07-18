/* eslint-disable react/no-unknown-property */
import { useMemo, useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import PlanetMaterial from "./PlanetMaterial";
import AtmosphereGlow from "./AtmosphereGlow";
import RingSystem from "./RingSystem";
import IoPlasmaTorus from "./IoPlasmaTorus";
import GiantAurorae from "./GiantAurorae";
import EnceladusGeysers from "./EnceladusGeysers";
import IoVolcanoes from "./IoVolcanoes";
import LowEarthOrbit from "./LowEarthOrbit";
import { useSceneClock } from "./SceneClock";
import { ktx2Urls } from "./shared/textureUrl";

/* Jupiter's Great Red Spot swirl texture — a soft red-orange oval with a
   handful of curved bands so the sprite's material-rotation reads as an
   actually-rotating storm rather than a symmetric dot. Overlaid on top of
   Jupiter's baked GRS at ~22°S; the baked GRS carries the storm's
   position, and this overlay adds the visible internal rotation
   (~6-day period compressed to tour timescale). */
function makeGRSSwirl(size = 128) {
  if (typeof document === "undefined") return null;
  const cv = document.createElement("canvas");
  cv.width = cv.height = size;
  const ctx = cv.getContext("2d");
  const c = size / 2;
  const bg = ctx.createRadialGradient(c, c, 0, c, c, size * 0.5);
  bg.addColorStop(0, "rgba(238, 128, 82, 0.85)");
  bg.addColorStop(0.55, "rgba(178, 76, 46, 0.42)");
  bg.addColorStop(1, "rgba(120, 50, 30, 0)");
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.ellipse(c, c, size * 0.48, size * 0.34, 0, 0, Math.PI * 2);
  ctx.fill();
  /* Swirl bands — offset arcs at successive radii, each rotated to break
     radial symmetry so the sprite's material.rotation is visible. */
  ctx.strokeStyle = "rgba(255, 208, 172, 0.55)";
  ctx.lineWidth = size * 0.024;
  ctx.lineCap = "round";
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    const r = size * (0.14 + i * 0.07);
    const a0 = i * Math.PI * 0.35;
    ctx.arc(c, c, r, a0, a0 + Math.PI * 0.85);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}
const GRS_SWIRL = makeGRSSwirl(128);

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
  adamsArcs = false, // Neptune only — bright dust bunches on the Adams ring
  greatRedSpot = false, // Jupiter only — visibly spinning storm at ~22°S
  plasmaTorus = false, // Jupiter only — Io's neon-purple sulfur ring
  aurorae = null, // "jupiter" | "saturn" | "uranus" | "neptune" — giant-planet polar aurorae
  lowEarthOrbit = false, // Earth only — Starlink constellation + ISS
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
  const grsRef = useRef(); // Jupiter's Great Red Spot swirl (only used when greatRedSpot=true)
  const adamsArcsRef = useRef(); // Neptune's Adams-ring arcs (only used when adamsArcs=true)
  const moonsRef = useRef([]);
  const sceneClock = useSceneClock();

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
  /* §9.3 KTX2 flag — ktx2Urls() maps `.webp` → `.ktx2` on every URL only when
     ?ktx2=1 is on. Behavior is IDENTICAL to the previous WebP path with the
     flag off (default) because the URL passes through untouched. */
  const loadedColor = useLoader(THREE.TextureLoader, colorUrls.length ? ktx2Urls(colorUrls) : []);
  const loadedData = useLoader(THREE.TextureLoader, dataUrls.length ? ktx2Urls(dataUrls) : []);

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

  /* §7 Planet LOD — three precomputed sphere geometries; the useFrame below swaps
     `planetRef.current.geometry` between them based on camera distance so React
     never re-renders and the material instance (with its texture uniforms) never
     re-mounts. Only vertex-processing cost scales with distance. */
  const bodyGeos = useMemo(() => ({
    high: new THREE.SphereGeometry(radius, 48, 48),
    mid: new THREE.SphereGeometry(radius, 24, 24),
    low: new THREE.SphereGeometry(radius, 12, 12),
  }), [radius]);
  const lodTier = useRef("high");
  const _lodProbe = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ camera }, delta) => {
    /* Clamp dt: VisibilityController pauses the loop while the tab is hidden, so
       the first delta on refocus ≈ the whole hidden span — unclamped, the planets
       + moons would snap-spin a full frame. Matches SceneClock's own 1/20 clamp.
       Scaled by clock.scale so ONE master control speeds spin + moons together
       with the orbits + Sun churn (they read the same clock). */
    const dt = Math.min(delta, 1 / 20) * sceneClock.scale;
    /* Axial rotation + moons — frozen on reduced-motion (animate=false). */
    if (!animate) return;
    if (planetRef.current) {
      planetRef.current.rotation.y += dt * rotationSpeed;
      /* §7 Planet LOD swap. Thresholds scaled by body radius so a Jupiter-sized
         giant swaps later than a Ceres-sized dwarf (the giant fills more of the
         frame at any given world distance). Snap boundaries — a smooth blend
         would require running both meshes and blending, which drops the win. */
      planetRef.current.getWorldPosition(_lodProbe);
      const d = camera.position.distanceTo(_lodProbe);
      const nextTier = d < radius * 40 ? "high" : d < radius * 200 ? "mid" : "low";
      if (nextTier !== lodTier.current) {
        lodTier.current = nextTier;
        planetRef.current.geometry = bodyGeos[nextTier];
      }
    }
    if (cloudRef.current) cloudRef.current.rotation.y += dt * rotationSpeed * 1.35;
    /* Great Red Spot internal storm rotation — real GRS takes ~6 Jupiter-days
       per rotation, so on top of Jupiter's own spin the storm churns at
       roughly rotationSpeed × (1 / 6-days-in-Jupiter-days) ≈ rotationSpeed /
       14.4. Slightly amplified so the swirl is legibly rotating during a
       Jupiter stop of ~10-30 scene-seconds. */
    if (grsRef.current) grsRef.current.material.rotation += dt * rotationSpeed * 0.14;
    /* Neptune Adams-ring arcs — slowly drift around the Adams ring at the
       real 42:43 resonance rate with Galatea (the shepherd moon). At tour
       compression this reads as a stately clockwise rotation. */
    if (adamsArcsRef.current) adamsArcsRef.current.rotation.z += dt * rotationSpeed * 0.11;
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
        {/* Enceladus south-pole water-ice geysers — rendered as a child of
            the moon mesh so they ride Enceladus's orbit around Saturn and
            inherit any tilt. */}
        {md?.geysers && <EnceladusGeysers radius={radius * ms} />}
        {/* Io — real named volcano plumes (Pele/Prometheus/Loki/Amirani). */}
        {md?.volcanoes && <IoVolcanoes radius={radius * ms} />}
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
        {/* Great Red Spot — Jupiter only. Sits at ~22°S on the planet
            surface (sin(-22°) = -0.375, cos(-22°) = 0.927). The sprite
            rides Jupiter's rotation via the parent mesh; its own
            material.rotation (see useFrame) advances at ~6-day period so
            the swirl visibly churns on top of the baked GRS. */}
        {greatRedSpot && GRS_SWIRL && (
          <sprite ref={grsRef} position={[0, -radius * 0.375, radius * 0.927]} scale={[radius * 0.32, radius * 0.24, 1]}>
            <spriteMaterial
              map={GRS_SWIRL}
              color="#e58254"
              transparent
              opacity={0.55}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              toneMapped={false}
            />
          </sprite>
        )}
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
          now visibly occlude the sky behind.
          When `adamsArcs` is set (Neptune), the outer ring is punctuated by
          the real Adams-ring arc concentrations — Voyager 2 saw four distinct
          dust bunches (Courage, Liberté, Égalité 1 & 2, Fraternité) held in a
          42:43 resonance with Galatea. Rendered as three brighter azimuthal
          sectors on the outer band. */}
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
          {adamsArcs && (
            /* Three bright arcs at the outer (Adams) ring — Liberté / Égalité
               / Fraternité, the three brightest of Neptune's four dust bunches.
               Wrapped in a rotating group so they slowly orbit Neptune at the
               real 42:43 Galatea-resonance rate (see useFrame above). */
            <group ref={adamsArcsRef}>
              {[
                { start: 0.15, length: 0.16 }, // Liberté
                { start: 0.45, length: 0.12 }, // Égalité 1
                { start: 0.66, length: 0.24 }, // Fraternité (widest)
              ].map((a, i) => (
                <mesh key={`arc${i}`}>
                  <ringGeometry args={[radius * 1.99, radius * 2.13, 40, 1, a.start, a.length]} />
                  <meshBasicMaterial color="#f2f4ff" transparent opacity={0.7} side={THREE.DoubleSide} depthWrite={false} toneMapped={false} />
                </mesh>
              ))}
            </group>
          )}
        </group>
      )}

      {/* Io plasma torus (Jupiter only) — the neon-purple ring of ionized
          sulfur/oxygen that Io feeds Jupiter's magnetosphere. Rides inside
          the group so it inherits the axial tilt. */}
      {plasmaTorus && <IoPlasmaTorus jupiterRadius={radius} />}
      {/* Giant-planet aurorae — feathered rings around each pole. */}
      {aurorae && <GiantAurorae radius={radius} kind={aurorae} />}
      {/* Earth's LEO satellite layer — Starlink + ISS orbits. */}
      {lowEarthOrbit && <LowEarthOrbit earthRadius={radius} />}

      {moonNodes}
    </group>
  );
};

export default Planet;
