/* eslint-disable react/no-unknown-property */
import { useMemo, useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { useSceneClock } from "./SceneClock";
import { ktx2Url } from "./shared/textureUrl";

/*
 * Real Hubble nebulae as billboarded sprite planes.
 *
 * Each nebula is built from TWO co-planar, camera-facing layers for
 * volumetric depth:
 *
 *   - CORE layer  — the original luminance-thresholded sprite: only bright
 *     nebula material contributes, additive over the skybox.
 *   - HALO layer  — a larger, much softer, lower-opacity wash behind the core,
 *     pulled toward a per-nebula SECONDARY hue (uTint at depth=1). It catches
 *     the dimmer outer gas the core threshold clips, so the cloud reads as a
 *     layered volume with colour that shifts from rim to core rather than one
 *     flat tint.
 *
 * The shader mixes the sampled colour toward a per-layer tint by `uTintAmt`,
 * giving each nebula a richer two-tone palette (cool/warm depth) while staying
 * desaturated and soft so it never overpowers the planets or over-drives bloom.
 *
 * Image credits: ESA/Hubble + NASA, CC-BY-4.0
 */

const NEBULA_VERTEX = `
varying vec2 vUv;
void main() {
  vUv = uv;
  vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mvPos;
}
`;

const NEBULA_FRAGMENT = `
varying vec2 vUv;
uniform sampler2D uMap;
uniform float uOpacity;
uniform float uLumThresholdLow;
uniform float uLumThresholdHigh;
uniform float uEdgeInner;   // radius where the sprite starts fading out
uniform vec3  uTint;        // secondary hue to push this layer toward
uniform float uTintAmt;     // 0 = true colour, 1 = full tint
uniform float uSat;         // saturation retained after desaturation
void main() {
  vec4 c = texture2D(uMap, vUv);
  float lum = max(c.r, max(c.g, c.b));
  float a = smoothstep(uLumThresholdLow, uLumThresholdHigh, lum) * uOpacity;
  /* Radial edge fade — dissolve the sprite into space toward its rim so the
     square plane boundary (and any nebula material that runs to the image
     edge) never shows as a hard border. The halo uses a wider fade. */
  float r = length(vUv - 0.5);
  a *= smoothstep(0.5, uEdgeInner, r);
  if (a < 0.005) discard;
  /* DESATURATE toward luminance (the raw NASA JPEGs sit ~0.6 saturation —
     too punchy for a soft backdrop), THEN tint toward a per-layer secondary
     hue for chromatic depth. Core layers keep more true colour; the halo
     leans into its tint, so each cloud reads as a graded volume, not a flat
     wash. */
  vec3 col = c.rgb;
  float g = dot(col, vec3(0.299, 0.587, 0.114));
  col = mix(vec3(g), col, uSat);
  col = mix(col, g * uTint, uTintAmt);  // tint scaled by local brightness
  gl_FragColor = vec4(col, a);
}
`;

/*
 * Nebulae are DEEP-SPACE BACKDROP — light-years away, not solar-system objects.
 * At true scale (1 AU = 95u) even the closest, the Helix at 650 ly, would be
 * ~3.9 BILLION units out, so like the skybox they're a stylised far backdrop:
 * placed at radius ~6,200u — beyond the heliopause (~5,400) and Oort cloud
 * (~5,200), just inside the star sphere (6,800) / Tycho skybox (7,000) — and
 * spread around the whole sky so none ever crowds the Sun or a planet (the old
 * positions sat at ~40-70u, INSIDE Mercury's orbit, hence a nebula glued to the
 * Sun). Far + additive over the starfield ⇒ they read as distant cosmic clouds.
 *
 * Scale tracks each nebula's REAL physical diameter, log-compressed:
 *   Carina ~460 ly  ≫  Eagle ~70 ly  >  Orion ~24 ly  >  Crab ~11 ly  >  Helix ~2.5 ly.
 * Each carries TWO tints faithful to its real palette — a secondary hue for the
 * soft halo and a truer near-tint for the bright core — so the cloud gains
 * chromatic depth (rim→core) while staying soft and bloom-safe.
 */
/*
 * All five sit in the −X hemisphere because the whole planet tour is laid out
 * along +X: every backlit stop puts the camera OUTSIDE its planet looking back
 * toward the Sun (−X), so the deep-sky backdrop visible behind/around the Sun is
 * the −X sky. The nebulae are fanned ~30° off that axis (varied in Y and Z) so
 * they RING the Sun rather than hide directly behind its glare — a consistent,
 * fixed celestial backdrop (as real nebulae are) that's in frame throughout the
 * tour. The hero looks down −Z, so the Sun there stands alone, uncluttered.
 */
const NEBULAE = [
  // Carina (NGC 3372) — largest emission nebula (~460 ly): warm red/orange dust
  // lanes, blue glow around the hot O-stars. The big one, upper-right of the Sun.
  { url: "/textures/nebulae/carina.webp", position: [-5444, 1197, 2722], scale: 2400, opacity: 0.58, haloTint: [0.6, 0.6, 1.0], coreTint: [1.0, 0.66, 0.5] },
  // Eagle (M16, Pillars of Creation, ~70 ly): gold/teal pillars on a reddish field.
  { url: "/textures/nebulae/eagle.webp", position: [-5187, 1349, -2697], scale: 1600, opacity: 0.54, haloTint: [0.5, 0.86, 0.7], coreTint: [1.0, 0.85, 0.6] },
  // Orion (M42, ~24 ly): magenta-pink Hα core + teal O-III + blue reflection wisps.
  { url: "/textures/nebulae/orion.webp", position: [-5287, -1057, 2854], scale: 1500, opacity: 0.54, haloTint: [0.55, 0.78, 1.0], coreTint: [1.0, 0.66, 0.84] },
  // Crab (M1, supernova remnant, ~11 ly): orange-red filaments + blue-white synchrotron core.
  { url: "/textures/nebulae/crab.webp", position: [-5200, -1247, -2495], scale: 1050, opacity: 0.5, haloTint: [0.55, 0.72, 1.0], coreTint: [1.0, 0.7, 0.55] },
  // Helix (NGC 7293, "Eye of God" planetary, ~2.5 ly, closest): teal eye, red-orange rim.
  { url: "/textures/nebulae/helix.webp", position: [-5268, 1791, 632], scale: 820, opacity: 0.48, haloTint: [1.0, 0.6, 0.5], coreTint: [0.6, 1.0, 0.92] },
  // HERO BACKDROP — the others sit off on the −X tour axis, leaving the front-on
  // Sol view's −Z void empty. These two fill the deep field BEHIND the Sun that
  // the hero camera looks into, giving the dark centre cosmic colour + depth.
  { url: "/textures/nebulae/carina.webp", position: [900, 1200, -5100], scale: 2900, opacity: 0.5, haloTint: [0.55, 0.6, 1.0], coreTint: [1.0, 0.68, 0.55] },
  { url: "/textures/nebulae/orion.webp", position: [-1900, -250, -4800], scale: 2200, opacity: 0.46, haloTint: [0.6, 0.8, 1.0], coreTint: [1.0, 0.62, 0.86] },
  // Additional real-sky nebulae — positions from IAU RA/Dec, transformed onto
  // a 5300u sky shell so they ride the same fixed backdrop as the star field
  // and Milky Way band. Textures reused across visually-similar objects.
  // Pleiades (M45) — blue reflection nebula around hot young B-stars.
  { url: "/textures/nebulae/helix.webp",  position: [-3620, 2200,  3350], scale: 1500, opacity: 0.36, haloTint: [0.7, 0.85, 1.0], coreTint: [0.8, 0.92, 1.0] },
  // Lagoon (M8) + Trifid (M20) region — dense H-alpha nebulosity in Sagittarius.
  { url: "/textures/nebulae/orion.webp",  position: [ 2800, -2100, -4100], scale: 1800, opacity: 0.42, haloTint: [0.55, 0.7, 1.0], coreTint: [1.0, 0.55, 0.75] },
  // Rosette (NGC 2237) — red hydrogen ring in Monoceros.
  { url: "/textures/nebulae/orion.webp",  position: [-2400,  700,  4600], scale: 1500, opacity: 0.34, haloTint: [0.6, 0.7, 1.0], coreTint: [1.0, 0.4, 0.6] },
  // Veil / Cygnus Loop — supernova remnant filaments in Cygnus.
  { url: "/textures/nebulae/crab.webp",   position: [ 3900,  2400, -2700], scale: 1600, opacity: 0.38, haloTint: [0.5, 0.75, 1.0], coreTint: [0.85, 0.9, 1.0] },
  // Tarantula (30 Doradus) — brightest star-forming region in the Local Group,
  // in the LMC. Sits down-south past Crux.
  { url: "/textures/nebulae/carina.webp", position: [ 2400, -3800, -2600], scale: 1400, opacity: 0.38, haloTint: [0.55, 0.65, 1.0], coreTint: [1.0, 0.6, 0.5] },
];

const NebulaPlane = ({ url, position, scale, opacity, haloTint, coreTint }) => {
  const tex = useLoader(THREE.TextureLoader, ktx2Url(url));
  const sceneClock = useSceneClock();
  const billboardRef = useRef();
  const haloMatRef = useRef();

  /* Core layer: the original sharp, true-ish look. */
  const coreUniforms = useMemo(() => {
    tex.colorSpace = THREE.SRGBColorSpace;
    return {
      uMap: { value: tex },
      uOpacity: { value: opacity },
      uLumThresholdLow: { value: 0.11 },
      uLumThresholdHigh: { value: 0.46 },
      uEdgeInner: { value: 0.3 },
      uTint: { value: new THREE.Color(...coreTint) },
      uTintAmt: { value: 0.18 },
      uSat: { value: 0.74 },
    };
  }, [tex, opacity, coreTint]);

  /* Halo layer: dimmer outer gas, wider + softer, pushed toward the secondary
     hue. Lower threshold catches faint material the core clips; lower opacity
     and a wide edge fade keep it a gentle wash (bloom-safe). */
  const haloUniforms = useMemo(() => {
    return {
      uMap: { value: tex },
      uOpacity: { value: opacity * 0.55 },
      uLumThresholdLow: { value: 0.05 },
      uLumThresholdHigh: { value: 0.34 },
      uEdgeInner: { value: 0.16 },
      uTint: { value: new THREE.Color(...haloTint) },
      uTintAmt: { value: 0.6 },
      uSat: { value: 0.54 },
    };
  }, [tex, opacity, haloTint]);

  useFrame(({ camera }) => {
    /* Billboard the whole group so BOTH layers face the camera together. */
    if (billboardRef.current) billboardRef.current.lookAt(camera.position);
    /* Very gentle chromatic "breathing" of the halo tint — adds slow life to
       the colour depth. Driven by the shared virtual clock, so it FREEZES
       under reduced-motion (sceneClock.t stays 0) and respects time control. */
    if (haloMatRef.current) {
      const t = sceneClock ? sceneClock.t : 0;
      haloMatRef.current.uniforms.uTintAmt.value = 0.6 + 0.08 * Math.sin(t * 0.25 + position[0]);
    }
  });

  return (
    <group ref={billboardRef} position={position}>
      {/* HALO — slightly larger, drawn first (behind the core). */}
      <mesh scale={1.45} renderOrder={-1}>
        <planeGeometry args={[scale, scale]} />
        <shaderMaterial
          ref={haloMatRef}
          vertexShader={NEBULA_VERTEX}
          fragmentShader={NEBULA_FRAGMENT}
          uniforms={haloUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* CORE — original crisp layer on top. Shares the halo's billboard
          orientation via the parent group, so it tracks the camera too. */}
      <mesh>
        <planeGeometry args={[scale, scale]} />
        <shaderMaterial
          vertexShader={NEBULA_VERTEX}
          fragmentShader={NEBULA_FRAGMENT}
          uniforms={coreUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};

const Nebulae = () => (
  <>
    {NEBULAE.map((n, i) => (
      // index, not n.url: some textures (carina, orion) are reused for the hero
      // backdrop, so the path alone is a duplicate key. The array is static.
      <NebulaPlane key={`${n.url}-${i}`} {...n} />
    ))}
  </>
);

export default Nebulae;
