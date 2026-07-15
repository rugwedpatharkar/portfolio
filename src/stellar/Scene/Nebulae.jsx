/* eslint-disable react/no-unknown-property */
import { useMemo, useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { useSceneClock } from "./SceneClock";
import { ktx2Url } from "./shared/textureUrl";
import { makeSoftDot } from "./shared/textures";
import { SKY_SCALE } from "../config/destinations";

/*
 * The Milky Way's real nebulae, placed at their TRUE sky coordinates (J2000
 * RA/Dec) on the deep-space shell that the star field + galactic band ride on.
 * Because they cluster along the galactic plane (Cygnus, Sagittarius, Orion,
 * Carina), placing them by real coordinates reinforces the real Milky Way band
 * rather than fighting it.
 *
 * Two render paths:
 *   - LUMINOUS nebulae (emission / HII / planetary / SNR / reflection) — real
 *     Hubble sprite textures, ADDITIVE over the sky, two-layer (core + halo)
 *     for volumetric colour depth. Each carries its real emission-line palette
 *     as core/halo tints, so objects sharing a texture still read in their true
 *     colours (Hα red, [OIII] teal, reflection blue).
 *   - DARK nebulae (Horsehead, Coalsack) — additive can only ADD light, so a
 *     dark cloud is rendered with MULTIPLY blending instead: a soft disc that is
 *     near-black at the core (multiplies the star field toward black) and white
 *     at the rim (multiplies by 1 → no change), so it OCCLUDES the background
 *     the way real interstellar dust does.
 *
 * Distances are light-years; at true scale even the nearest (Helix, 655 ly)
 * would be billions of units out, so like the skybox they ride a stylised shell
 * at R≈5500 — beyond the heliopause/Oort, just inside the star sphere (6800).
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

const OBLIQUITY = 23.44 * Math.PI / 180;
const R_SHELL = 5500 * SKY_SCALE;

/* Equatorial (RA hours, Dec deg) → scene position on the shell. IDENTICAL to
   Stars.jsx / DistantGalaxies.jsx / MilkyWay.jsx so every sky-fixed layer
   agrees on where a real sky direction points. */
function scenePos(raHours, decDeg) {
  const ra = raHours * Math.PI / 12;
  const dec = decDeg * Math.PI / 180;
  const cd = Math.cos(dec);
  const xe = cd * Math.cos(ra);
  const ye = cd * Math.sin(ra);
  const ze = Math.sin(dec);
  const cosE = Math.cos(OBLIQUITY);
  const sinE = Math.sin(OBLIQUITY);
  return new THREE.Vector3(xe, -ye * sinE + ze * cosE, ye * cosE + ze * sinE)
    .normalize().multiplyScalar(R_SHELL).toArray();
}

function hexRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

/* Sprite scale from real angular size (arcmin). The real range is enormous
   (Ring 3.5′ → Coalsack 420′, a 120× spread), so map it LOG-compressed into a
   tight world-scale band: tiny planetaries stay near-point jewels (~200u) and
   the giants read as diffuse smears (~2400u) — never oversized featureless
   blobs (a min-clamp that was too high turned the 3.5′ Ring into a 230px wash).
   Priority (iconic) nebulae get a modest size bump. */
const LOG_MIN = Math.log10(3.5);   // smallest catalogued (Ring)
const LOG_SPAN = Math.log10(420) - LOG_MIN;
function scaleFor(arcmin, priority) {
  const t = THREE.MathUtils.clamp((Math.log10(arcmin) - LOG_MIN) / LOG_SPAN, 0, 1);
  return (200 + t * 2200) * (priority ? 1.3 : 1);
}

/*
 * The catalogue — 25 real Milky Way nebulae, each wired to its OWN real
 * NASA/ESA/ESO photo (`tex`). `core`/`halo` are the real emission-line palette
 * used only as a gentle secondary-hue depth cue now that the texture carries
 * the true colour. `p` flags the iconic priority objects (bigger + brighter).
 * ra in decimal hours, dec in decimal degrees (J2000); size in arcmin.
 *
 * Horsehead is an EMISSION entry: its photo is the dark horse silhouetted on
 * the red IC 434 glow — additive luminance-thresholding shows the red field and
 * lets space through the dark horse, so the silhouette reads for free. Coalsack
 * has no emission (pure dust), so it stays a multiply occluder.
 */
const CATALOG = [
  { name: "Orion (M42)",        tex: "orion",           type: "emission",   ra: 5.588,  dec: -5.391,  arcmin: 85,  core: "#ff3b2f", halo: "#4fb9a8", p: true },
  { name: "Eagle (M16)",        tex: "eagle",           type: "emission",   ra: 18.313, dec: -13.783, arcmin: 35,  core: "#ff3b2f", halo: "#3bd6c6", p: true },
  { name: "Lagoon (M8)",        tex: "lagoon",          type: "emission",   ra: 18.061, dec: -24.383, arcmin: 90,  core: "#ff3b2f", halo: "#ff7a8a", p: true },
  { name: "Trifid (M20)",       tex: "trifid",          type: "emission",   ra: 18.045, dec: -22.972, arcmin: 28,  core: "#ff3b2f", halo: "#6f9bd6", p: true },
  { name: "Carina (NGC 3372)",  tex: "carina",          type: "emission",   ra: 10.752, dec: -59.868, arcmin: 120, core: "#ff5a36", halo: "#4fb9a8", p: true },
  { name: "Rosette (NGC 2237)", tex: "rosette",         type: "emission",   ra: 6.563,  dec: 4.998,   arcmin: 80,  core: "#ff3b2f", halo: "#33ccaa" }, // Hα red ring + [OIII] teal central cavity
  { name: "Helix (NGC 7293)",   tex: "helix",           type: "planetary",  ra: 22.494, dec: -20.833, arcmin: 25,  core: "#3bd6c6", halo: "#ff6b4a", p: true },
  { name: "Ring (M57)",         tex: "ring",            type: "planetary",  ra: 18.893, dec: 33.029,  arcmin: 3.5, core: "#3bd6c6", halo: "#ff3b2f" },
  { name: "Crab (M1)",          tex: "crab",            type: "snr",        ra: 5.575,  dec: 22.017,  arcmin: 6,   core: "#b8c8e8", halo: "#ff5a4a" }, // blue-white pulsar-wind synchrotron interior, red Hα filament cage
  { name: "Veil (Cygnus Loop)", tex: "veil",            type: "snr",        ra: 20.85,  dec: 30.7,    arcmin: 180, core: "#ff3b2f", halo: "#3bd6c6", p: true },
  { name: "North America",      tex: "north_america",   type: "emission",   ra: 20.988, dec: 44.53,   arcmin: 120, core: "#ff3b2f", halo: "#4fb9a8" },
  { name: "Cat's Eye (NGC 6543)", tex: "cats_eye",      type: "planetary",  ra: 17.976, dec: 66.633, arcmin: 5,   core: "#3bd6c6", halo: "#ff6b4a" },
  { name: "Dumbbell (M27)",     tex: "dumbbell",        type: "planetary",  ra: 19.993, dec: 22.717,  arcmin: 8,   core: "#3bd6c6", halo: "#ff5a4a" }, // [OIII] teal apple-core, Hα/[NII] red wings
  { name: "California (NGC 1499)", tex: "california",   type: "emission",   ra: 4.055, dec: 36.42,    arcmin: 150, core: "#ff3b2f", halo: "#c62f2f" },
  { name: "Flame (NGC 2024)",   tex: "flame",           type: "emission",   ra: 5.698,  dec: -1.85,   arcmin: 30,  core: "#ff5a36", halo: "#c62f2f" },
  { name: "Pelican (IC 5070)",  tex: "pelican",         type: "emission",   ra: 20.847, dec: 44.35,   arcmin: 60,  core: "#ff3b2f", halo: "#c62f2f" },
  { name: "Cave (Sh2-155)",     tex: "cave",            type: "emission",   ra: 22.95,  dec: 62.52,   arcmin: 50,  core: "#ff3b2f", halo: "#6f9bd6" },
  { name: "Elephant's Trunk (IC 1396)", tex: "elephants_trunk", type: "emission", ra: 21.65, dec: 57.49, arcmin: 170, core: "#ff3b2f", halo: "#c62f2f" },
  { name: "Cocoon (IC 5146)",   tex: "cocoon",          type: "emission",   ra: 21.891, dec: 47.267,  arcmin: 12,  core: "#ff3b2f", halo: "#6f9bd6" },
  { name: "Omega / Swan (M17)", tex: "omega",           type: "emission",   ra: 18.341, dec: -16.183, arcmin: 20,  core: "#ff3b2f", halo: "#ff7a8a" },
  { name: "Cone (NGC 2264)",    tex: "cone",            type: "emission",   ra: 6.686,  dec: 9.88,    arcmin: 30,  core: "#ff3b2f", halo: "#6f9bd6" },
  { name: "Bubble (NGC 7635)",  tex: "bubble",          type: "emission",   ra: 23.347, dec: 61.2,    arcmin: 15,  core: "#ff3b2f", halo: "#3bd6c6" },
  { name: "Iris (NGC 7023)",    tex: "iris",            type: "reflection", ra: 21.027, dec: 68.163,  arcmin: 18,  core: "#6f9bd6", halo: "#4a7fc0" },
  { name: "Horsehead (B33)",    tex: "horsehead",       type: "emission",   ra: 5.683,  dec: -2.458,  arcmin: 8,   core: "#ff3b2f", halo: "#6f9bd6", p: true },
  { name: "Coalsack",           type: "dark",           ra: 12.833, dec: -62.5,   arcmin: 420 },
];

/* Split into the additive (luminous, real photo per object) and multiply (dark
   dust) render lists. */
const LUMINOUS = CATALOG.filter((n) => n.type !== "dark").map((n) => ({
  key: n.name,
  url: `/textures/nebulae/${n.tex}.webp`,
  position: scenePos(n.ra, n.dec),
  /* sprite grows with the shell so the sky subtends the same angle in either mode */
  scale: scaleFor(n.arcmin, n.p) * SKY_SCALE,
  opacity: n.p ? 0.36 : 0.22,
  coreTint: hexRgb(n.core),
  haloTint: hexRgb(n.halo),
  /* Second (soft-halo) plane only for the big priority nebulae — the depth cue
     is invisible on the small ones, so skipping it there halves their fillrate. */
  halo: !!n.p,
}));
const DARK = CATALOG.filter((n) => n.type === "dark").map((n) => ({
  key: n.name,
  position: scenePos(n.ra, n.dec),
  scale: THREE.MathUtils.clamp(scaleFor(n.arcmin, false), 500, 2600) * SKY_SCALE,
  opacity: 0.72,
}));

const NebulaPlane = ({ url, position, scale, opacity, haloTint, coreTint, halo = true }) => {
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
      /* Real photo carries the true colour now, so only a whisper of tint. */
      uTintAmt: { value: 0.1 },
      uSat: { value: 0.95 },
    };
  }, [tex, opacity, coreTint]);

  /* Halo layer: dimmer outer gas, wider + softer, pushed toward the secondary
     hue. Lower threshold catches faint material the core clips; lower opacity
     and a wide edge fade keep it a gentle wash (bloom-safe). */
  const haloUniforms = useMemo(() => {
    return {
      uMap: { value: tex },
      uOpacity: { value: opacity * 0.42 },
      uLumThresholdLow: { value: 0.05 },
      uLumThresholdHigh: { value: 0.34 },
      uEdgeInner: { value: 0.16 },
      uTint: { value: new THREE.Color(...haloTint) },
      uTintAmt: { value: 0.4 },
      uSat: { value: 0.82 },
    };
  }, [tex, opacity, haloTint]);

  useFrame(({ camera }) => {
    if (billboardRef.current) billboardRef.current.lookAt(camera.position);
    if (haloMatRef.current) {
      const t = sceneClock ? sceneClock.t : 0;
      haloMatRef.current.uniforms.uTintAmt.value = 0.6 + 0.08 * Math.sin(t * 0.25 + position[0]);
    }
  });

  return (
    <group ref={billboardRef} position={position}>
      {/* HALO — slightly larger, drawn first (behind the core). Priority nebulae only. */}
      {halo && (
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
      )}
      {/* CORE — original crisp layer on top. */}
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

/* Dark nebula — a MULTIPLY disc: near-black core (multiplies the star field
   toward black) feathering to white at the rim (×1 → no change), so it occludes
   the background the way real dust does. Additive blending physically cannot do
   this (it only adds light), which is why the dark clouds get their own path. */
const DARK_SPRITE = makeSoftDot({
  size: 128,
  stops: [
    [0, "rgba(8,6,5,1)"],
    [0.45, "rgba(28,20,15,1)"],
    [0.8, "rgba(190,180,172,1)"],
    [1, "rgba(255,255,255,1)"],
  ],
  mipmaps: true,
});

const DarkNebula = ({ position, scale, opacity }) => {
  const billboardRef = useRef();
  useFrame(({ camera }) => {
    if (billboardRef.current) billboardRef.current.lookAt(camera.position);
  });
  return (
    <group ref={billboardRef} position={position}>
      <mesh>
        <planeGeometry args={[scale, scale]} />
        <meshBasicMaterial
          map={DARK_SPRITE}
          transparent
          opacity={opacity}
          depthWrite={false}
          blending={THREE.MultiplyBlending}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
};

const Nebulae = () => (
  <>
    {LUMINOUS.map((n) => (
      <NebulaPlane key={n.key} {...n} />
    ))}
    {DARK.map((n) => (
      <DarkNebula key={n.key} {...n} />
    ))}
  </>
);

export default Nebulae;
