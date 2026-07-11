/* eslint-disable react/no-unknown-property */
import { useMemo, useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { useSceneClock } from "../SceneClock";
import { nearCamera } from "../shared/hooks";

/* Milky-Way skybox path — shared with Scene/Skybox.jsx. Loaded here as a
   uniform so the lensing shader can sample the real starfield and bend it
   around the event horizon per Schwarzschild. useLoader is content-addressed
   by URL, so this doesn't re-fetch. */
const SKYBOX_URL = "/textures/space/milkyway-space.webp";

/* Object-space Schwarzschild lensing shader. For each fragment on a proxy
   sphere around the hole, we compute:
     - view direction (world-space, from camera to fragment)
     - impact parameter b: perpendicular distance from the black-hole centre
       to the incoming ray
     - deflection angle α = 2·rs / max(b, rs) — the weak-field lensing formula,
       clamped so the direction bend is smooth all the way to the horizon
     - sample the equirectangular skybox with the deflected direction
   Below the photon sphere (b < ~1.5·rs) light gets captured; we fade to black
   inside that radius so the shadow reads solid.
   Additive-blended on top of the black event-horizon sphere so it composits
   with Bloom without needing a second post pass. */
const LENS_VERT = /* glsl */ `
  varying vec3 vWorldPos;
  void main() {
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorldPos = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;
const LENS_FRAG = /* glsl */ `
  uniform sampler2D uSkybox;
  uniform vec3 uCentre;        // black-hole world position
  uniform vec3 uCameraPos;     // camera world position
  uniform float uRs;           // Schwarzschild-ish scale radius (~event horizon)
  uniform float uIntensity;    // 0 disables the whole effect
  varying vec3 vWorldPos;

  /* Equirectangular sample: dir in world space → (u, v). Matches Skybox.jsx's
     BackSide sphere UV convention closely enough for the deflected sample to
     read as a continuous starfield. */
  vec2 dirToUV(vec3 d) {
    d = normalize(d);
    return vec2(
      0.5 + atan(d.z, d.x) / 6.28318530718,
      0.5 - asin(d.y) / 3.14159265359
    );
  }

  void main() {
    if (uIntensity < 0.001) discard;
    /* Undeflected view direction — camera through this fragment. */
    vec3 rayDir = normalize(vWorldPos - uCameraPos);

    /* Impact parameter: closest-approach distance of the ray to the BH centre.
       t = (C - O) . d, closest point = O + t·d, b = |closest - C|. */
    vec3 toCentre = uCentre - uCameraPos;
    float t = dot(toCentre, rayDir);
    vec3 closest = uCameraPos + rayDir * t;
    float b = length(closest - uCentre);

    /* Below the photon sphere (~1.5·rs) light is captured. Smooth-shadow it
       to black there so the horizon looks solid, not a bright edge. */
    float capture = smoothstep(uRs * 1.5, uRs * 1.7, b);
    if (capture < 0.02) discard;

    /* Weak-field deflection angle α ≈ 2·rs/b (in radians). Clamp b to avoid
       explosive bends near the shadow — a real full-GR trace would ray-march
       geodesics, but for the proxy-sphere approach this smooth approximation
       reads as the classic "wrap" without visible artifacts. */
    float bClamp = max(b, uRs * 1.55);
    float alpha = 2.0 * uRs / bClamp;

    /* Rotate rayDir toward uCentre by angle alpha in the plane containing
       both. Rodrigues-style rotation around the perpendicular axis. */
    vec3 towardBH = normalize(uCentre - closest);
    vec3 deflected = normalize(rayDir * cos(alpha) + towardBH * sin(alpha));

    vec3 col = texture2D(uSkybox, dirToUV(deflected)).rgb;
    /* Brighten the bent starfield a touch near the shadow's edge where real
       lensing concentrates flux (the Einstein ring bright limb). */
    float rimBoost = 1.0 + smoothstep(uRs * 2.4, uRs * 1.6, b) * 0.9;
    gl_FragColor = vec4(col * rimBoost * capture * uIntensity, capture * uIntensity);
  }
`;

/*
 * A black hole — rendered the way Interstellar's Gargantua and the Event
 * Horizon Telescope's real images actually look, entirely in object space
 * (no second post-processing pass — the scene's single Bloom haloes it).
 *
 * Anatomy, from the inside out:
 *   1. Event horizon  — a pure-black sphere that occludes everything behind it.
 *   2. Photon ring    — the razor-thin, brightest feature: light that orbited
 *                        the hole once or more before escaping (~1.5 rs).
 *   3. Accretion disk — superheated plasma spiralling inward; white-hot at the
 *                        ISCO → orange → deep red outward, turbulent (FBM), with
 *                        relativistic DOPPLER beaming (the limb rotating toward
 *                        you is boosted bright + blue-shifted, the receding limb
 *                        dimmed + red-shifted) and a faster inner spin.
 *   4. Lensed halo    — the gravitationally-bent image of the disk's far side,
 *                        wrapped up and over the horizon so the glow rings the
 *                        black sphere from any angle (the iconic "halo").
 *
 * `tilt` controls the look: ~edge-on (default) gives the dramatic Interstellar
 * silhouette; near face-on gives the EHT "orange ring" of Sagittarius A*.
 */

const DISK_VERT = /* glsl */ `
  varying float vR;
  varying vec2 vLocal;
  varying float vLos;   // line-of-sight speed: +approaching camera, -receding
  uniform float uInner;
  uniform float uOuter;
  void main() {
    vLocal = position.xy;
    float rad = length(position.xy);
    vR = clamp((rad - uInner) / (uOuter - uInner), 0.0, 1.0);
    /* Orbital (azimuthal) velocity dir in disk-local space for a CCW spin,
       carried into view space. View -Z points at the camera, so the negated
       view-Z of the velocity is how fast this point moves TOWARD the viewer —
       the physical driver of relativistic Doppler beaming + shift. Tracks the
       tilted disk and the camera as both move. */
    vec3 vel = normalize(vec3(-position.y, position.x, 0.0));
    vec3 velView = mat3(modelViewMatrix) * vel;
    vLos = -velView.z;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const DISK_FRAG = /* glsl */ `
  varying float vR;
  varying vec2 vLocal;
  varying float vLos;
  uniform float uTime;
  uniform float uBeam;   // doppler strength (lower for face-on EHT look)

  vec3 hash3(vec3 p){ p=vec3(dot(p,vec3(127.1,311.7,74.7)),dot(p,vec3(269.5,183.3,246.1)),dot(p,vec3(113.5,271.9,124.6))); return fract(sin(p)*43758.5453); }
  float noise(vec3 p){ vec3 i=floor(p),f=fract(p); f=f*f*(3.0-2.0*f);
    float n=mix(mix(mix(dot(hash3(i+vec3(0,0,0))-0.5,f-vec3(0,0,0)),dot(hash3(i+vec3(1,0,0))-0.5,f-vec3(1,0,0)),f.x),
                   mix(dot(hash3(i+vec3(0,1,0))-0.5,f-vec3(0,1,0)),dot(hash3(i+vec3(1,1,0))-0.5,f-vec3(1,1,0)),f.x),f.y),
               mix(mix(dot(hash3(i+vec3(0,0,1))-0.5,f-vec3(0,0,1)),dot(hash3(i+vec3(1,0,1))-0.5,f-vec3(1,0,1)),f.x),
                   mix(dot(hash3(i+vec3(0,1,1))-0.5,f-vec3(0,1,1)),dot(hash3(i+vec3(1,1,1))-0.5,f-vec3(1,1,1)),f.x),f.y),f.z);
    return n; }
  float fbm(vec3 p){ float v=0.0,a=0.5; for(int i=0;i<3;i++){ v+=a*noise(p); p*=2.0; a*=0.5; } return v+0.5; }

  void main() {
    float r = vR;
    float ang = atan(vLocal.y, vLocal.x);

    /* Spiral turbulence dragged around the hole — faster on the inside
       (Keplerian shear), stretched tangentially into streaks. */
    float spin = uTime * (0.7 + 1.9 * (1.0 - r));
    vec3 sp = vec3(cos(ang + spin) * 3.0, sin(ang + spin) * 3.0, r * 6.0);
    float turb = fbm(sp + vec3(uTime * 0.15));
    /* Subtle tangential filaments so the plasma reads as flowing — kept gentle
       so the disk stays a smooth EHT-style ring, not a spiky starburst. */
    float streak = 0.84 + 0.16 * sin(ang * 26.0 + spin * 2.0 + turb * 6.0);

    /* Radial profile: a sharp white-hot inner edge at the ISCO that falls off
       outward — the brightness lives in the inner third, like a real disk. */
    float inner = smoothstep(0.0, 0.04, r);
    float outer = 1.0 - smoothstep(0.30, 1.0, r);
    float radial = inner * outer;
    float bright = radial * (0.35 + 0.95 * turb) * streak;

    /* Relativistic Doppler beaming — approaching limb (vLos>0) boosted hard,
       receding limb dimmed. uBeam scales it down for a face-on EHT ring. */
    float los = clamp(vLos, -1.0, 1.0);
    float doppler = mix(1.0, 0.28 + 1.5 * pow(max(los, 0.0), 1.6) + 0.12 * max(-los, 0.0), uBeam);

    /* Temperature gradient: white-hot ISCO → orange → deep ember red. */
    vec3 col = mix(vec3(1.0, 0.98, 0.93), vec3(1.0, 0.62, 0.22), smoothstep(0.0, 0.32, r));
    col = mix(col, vec3(0.82, 0.16, 0.04), smoothstep(0.32, 1.0, r));
    /* Relativistic colour shift: approaching plasma blue-shifts, receding
       red-shifts. Subtle so the disk still reads as superheated, not neon. */
    col = mix(col, col * vec3(0.80, 0.92, 1.22), 0.45 * uBeam * max(los, 0.0));
    col = mix(col, col * vec3(1.28, 0.6, 0.4), 0.4 * uBeam * max(-los, 0.0));

    float a = clamp(bright * doppler, 0.0, 1.0);
    if (a < 0.01) discard;
    gl_FragColor = vec4(col * a * 2.2, a);
  }
`;

const BlackHole = ({
  position = [0, 0, 0],
  radius = 2.2,
  tilt = Math.PI * 0.46,
  beam = 1.0,
  animate = true,
  onClick,
  onPointerOver,
  onPointerOut,
}) => {
  const diskMat = useRef();
  const haloMat = useRef();
  const diskGroup = useRef();
  const ringRef = useRef();
  const haloRef = useRef();
  const lensMat = useRef();
  const sceneClock = useSceneClock();

  /* Skybox texture for the lensing shader. Same URL as Scene/Skybox.jsx →
     useLoader dedups. Configured lazily. */
  const skyboxTex = useLoader(THREE.TextureLoader, SKYBOX_URL);
  const lensUniforms = useMemo(() => ({
    uSkybox: { value: skyboxTex },
    uCentre: { value: new THREE.Vector3(...position) },
    uCameraPos: { value: new THREE.Vector3() },
    uRs: { value: radius * 1.02 },      // scale radius ≈ event horizon
    uIntensity: { value: 0.9 },
  }), [skyboxTex, position, radius]);

  /* §7 distance gate: skip the lookAt + disk rotation work when the camera is
     far from this mount. The two BlackHole call sites live at very different
     distances (the decorative one near the inner tour; the Contact destination
     at ~4300u), so we key the gate off the actual world position each mount
     was given rather than a constant. Vector3 memoized once — the gate check
     itself allocates nothing. */
  const posVec = useMemo(() => new THREE.Vector3(...position), [position]);

  const diskUniforms = useMemo(
    () => ({ uTime: { value: 0 }, uInner: { value: radius * 1.3 }, uOuter: { value: radius * 5.5 }, uBeam: { value: beam } }),
    [radius, beam]
  );
  /* Lensed-halo uniforms — the bright wrap that arcs over/under the horizon
     (the gravitationally lensed image of the far side of the disk). */
  const haloUniforms = useMemo(
    () => ({ uTime: { value: 0 }, uInner: { value: radius * 1.16 }, uOuter: { value: radius * 3.2 }, uBeam: { value: beam * 0.6 } }),
    [radius, beam]
  );

  useFrame(({ camera }) => {
    const t = animate ? sceneClock.t : 0;
    /* Uniform sync stays UNGATED — the shader clock must stay in step with
       SceneClock so opening the gate on approach doesn't jump the animation
       forward visibly. Uniform writes are cheap. */
    if (diskMat.current) diskMat.current.uniforms.uTime.value = t;
    if (haloMat.current) haloMat.current.uniforms.uTime.value = t * 0.6;
    /* Everything below is the expensive per-frame work — skip when the camera
       is far from this mount (its billboarding + rotation aren't visible). */
    if (!nearCamera(camera, posVec, 320)) return;
    if (diskGroup.current && animate) diskGroup.current.rotation.z = t * 0.05;
    /* Photon ring + lensed halo billboard to the camera — the halo is the
       Interstellar "wrap": disk light bent up and over the hole so the glow
       rings the black sphere from every angle. */
    if (ringRef.current) {
      ringRef.current.lookAt(camera.position);
      /* The photon ring shimmers — light that orbited the hole flickers faintly as
         it escapes (two beat frequencies). Static under reduced-motion (t pinned 0). */
      if (animate) ringRef.current.material.opacity = 0.82 + Math.sin(t * 3.1) * 0.1 + Math.sin(t * 7.7) * 0.05;
    }
    if (haloRef.current) haloRef.current.lookAt(camera.position);
    /* Lensing shader needs the live camera position each frame to compute
       impact parameters. Centre stays static (BlackHole is a fixed body). */
    if (lensMat.current) lensMat.current.uniforms.uCameraPos.value.copy(camera.position);
  });

  return (
    <group position={position} onClick={onClick} onPointerOver={onPointerOver} onPointerOut={onPointerOut}>
      {/* Event horizon — pure black, swallows everything behind it. Sits just
          inside the photon ring so no background leaks through the shadow. */}
      <mesh>
        <sphereGeometry args={[radius * 1.02, 48, 48]} />
        <meshBasicMaterial color="#000000" toneMapped={false} />
      </mesh>

      {/* §14.3 Gargantua gravitational lensing — proxy sphere around the horizon
          whose fragment shader samples the Milky-Way skybox with each ray
          deflected by the weak-field Schwarzschild formula (α = 2·rs/b).
          Additive so it composits with the halo + disk under the existing
          Bloom pass — no second mainImage. renderOrder: -1 so it lays down
          before the additive rings that sit inside it. */}
      <mesh renderOrder={-1}>
        <sphereGeometry args={[radius * 4.5, 96, 64]} />
        <shaderMaterial
          ref={lensMat}
          vertexShader={LENS_VERT}
          fragmentShader={LENS_FRAG}
          uniforms={lensUniforms}
          transparent
          depthWrite={false}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>

      {/* Lensed halo — the gravitational "wrap": the far side of the disk bent
          up and over the horizon so the glow rings the black sphere from any
          angle. Camera-facing, runs the disk shader at reduced beaming. */}
      <mesh ref={haloRef}>
        <ringGeometry args={[radius * 1.16, radius * 3.2, 128, 3]} />
        <shaderMaterial
          ref={haloMat}
          vertexShader={DISK_VERT}
          fragmentShader={DISK_FRAG}
          uniforms={haloUniforms}
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>

      {/* Photon ring — the razor-thin, brightest Einstein ring hugging the
          shadow. Two passes: a bright core + a faint outer falloff. */}
      <mesh ref={ringRef}>
        <ringGeometry args={[radius * 1.04, radius * 1.12, 200]} />
        <meshBasicMaterial color="#fff3da" transparent opacity={1} side={THREE.DoubleSide} toneMapped={false} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>

      {/* Accretion disk — tilted, swirling, Doppler-beamed. */}
      <group ref={diskGroup} rotation={[tilt, 0, 0]}>
        <mesh>
          <ringGeometry args={[radius * 1.3, radius * 5.5, 160, 6]} />
          <shaderMaterial
            ref={diskMat}
            vertexShader={DISK_VERT}
            fragmentShader={DISK_FRAG}
            uniforms={diskUniforms}
            transparent
            depthWrite={false}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </mesh>
      </group>
    </group>
  );
};

export default BlackHole;
