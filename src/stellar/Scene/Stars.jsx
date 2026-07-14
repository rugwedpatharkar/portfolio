/* eslint-disable react/no-unknown-property */
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { STARS, STAR_COUNT, STAR_STRIDE } from "../data/brightStars";
import { makeSoftDot } from "./shared/textures";

/*
 * The REAL night sky — 8,920 naked-eye stars (HYG catalogue, derived from
 * Hipparcos / Yale BSC) at their TRUE equatorial positions, TRUE visual
 * magnitudes, and TRUE colours from each star's B–V index. Not random points:
 * Sirius, Orion's belt, the Pleiades, the real Milky Way density — all where
 * they actually are.
 *
 * The catalogue is equatorial (ICRS); the scene's planets orbit the ecliptic
 * (the xz-plane). We rotate the celestial sphere by Earth's real axial
 * obliquity (23.44°) so the sky sits at the correct tilt to the planet plane —
 * the ecliptic constellations really do hug the orbital plane. Stars are the
 * fixed backdrop (they don't drift with the scene clock; stellar motion over a
 * human timescale is nil), centred on the origin like the Tycho skybox so the
 * two parallax together.
 */

const R = 6800; // celestial-sphere radius (just inside the Tycho skybox at 7000)
const OBLIQUITY = 23.44 * (Math.PI / 180);

/* Soft round sprite — crisp bright core, fast falloff; bloom adds the glow. */
const SPRITE_TEXTURE = makeSoftDot({
  size: 64,
  stops: [
    [0, "rgba(255,255,255,1)"],
    [0.18, "rgba(255,255,255,0.9)"],
    [0.4, "rgba(255,255,255,0.28)"],
    [0.8, "rgba(255,255,255,0.03)"],
    [1, "rgba(255,255,255,0)"],
  ],
  mipmaps: true,
  anisotropy: 8,
});

/* Diffraction-spike sprite matching JWST's SIGNATURE 6-point pattern: three
   long primary spikes 60° apart (from the hexagonal mirror segments) — a
   vertical pair + two diagonal pairs — plus a short faint horizontal pair (the
   secondary-mirror strut). This is what makes the bright stars in a Webb deep
   field instantly read as "JWST". Built on a canvas; used only in `sparse` mode.
   Small stars render this at a few px so only a dot shows; the brightest show
   the full spikes. */
function makeSpikeSprite(size = 160) {
  if (typeof document === "undefined") return null;
  const cv = document.createElement("canvas");
  cv.width = cv.height = size;
  const ctx = cv.getContext("2d");
  const c = size / 2;
  /* soft round core */
  const core = ctx.createRadialGradient(c, c, 0, c, c, size * 0.16);
  core.addColorStop(0, "rgba(255,255,255,1)");
  core.addColorStop(0.5, "rgba(255,255,255,0.55)");
  core.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = core;
  ctx.fillRect(0, 0, size, size);
  /* one call = a full spike LINE through centre (two tips), thin near the tip. */
  const spike = (angle, len, width, alpha) => {
    ctx.save();
    ctx.translate(c, c);
    ctx.rotate(angle);
    const g = ctx.createLinearGradient(0, 0, len, 0);
    g.addColorStop(0, `rgba(255,255,255,${alpha})`);
    g.addColorStop(0.5, `rgba(255,255,255,${alpha * 0.35})`);
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    for (const dir of [1, -1]) {
      ctx.beginPath();
      ctx.moveTo(0, -width / 2);
      ctx.lineTo(dir * len, 0);
      ctx.lineTo(0, width / 2);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  };
  const half = size / 2;
  /* 6 primary tips at 30/90/150/210/270/330° (three lines 60° apart) */
  spike(Math.PI / 2, half * 0.98, 2.6, 0.95);      // vertical pair
  spike(Math.PI / 6, half * 0.96, 2.4, 0.9);       // +30°
  spike(-Math.PI / 6, half * 0.96, 2.4, 0.9);      // −30° (= 150°)
  /* faint secondary strut — the short horizontal pair */
  spike(0, half * 0.5, 1.8, 0.22);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}
export const SPIKE_TEXTURE = makeSpikeSprite(160);

/* B–V colour index → RGB. Ballesteros' formula gives effective temperature from
   B–V; a blackbody approximation (Tanner Helland) turns that into the star's
   real tint — hot blue-white (B–V<0) through the Sun's yellow-white (~0.65) to
   cool orange-red (B–V>1.4). */
export function bvToColor(bv, out) {
  const t = 4600 * (1 / (0.92 * bv + 1.7) + 1 / (0.92 * bv + 0.62));
  const k = t / 100;
  let r, g, b;
  if (k <= 66) r = 255;
  else r = 329.7 * Math.pow(k - 60, -0.1332);
  if (k <= 66) g = 99.47 * Math.log(k) - 161.12;
  else g = 288.12 * Math.pow(k - 60, -0.0755);
  if (k >= 66) b = 255;
  else if (k <= 19) b = 0;
  else b = 138.52 * Math.log(k - 10) - 305.04;
  // Keep each star's real B–V colour (blue/gold) so the field reads rich, not
  // washed grey-white — but eased back from the 0.08 over-push toward a more
  // natural tint (higher mix = whiter; original desaturated look was 0.22).
  const cr = THREE.MathUtils.clamp(r / 255, 0, 1);
  const cg = THREE.MathUtils.clamp(g / 255, 0, 1);
  const cb = THREE.MathUtils.clamp(b / 255, 0, 1);
  const mix = 0.15;
  out.setRGB(cr * (1 - mix) + mix, cg * (1 - mix) + mix, cb * (1 - mix) + mix);
}

/* Twinkling — brightest stars gently pulse in size + brightness so the sky
   feels alive. Each star's phase is a hash of its own position so the
   twinkle is per-star (not synchronised) and the amplitude is proportional
   to size (the brightest stars twinkle most, faint ones stay steady). */
const VERT = /* glsl */ `
  attribute float aSize;
  attribute vec3 aColor;
  uniform float uTime;
  varying vec3 vColor;
  varying float vTwinkle;
  void main() {
    /* Per-star hash — position dotted with a magic vector — gives every star
       its own twinkle phase without needing a separate attribute. */
    float phase = fract(sin(dot(position, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
    float twinkle = 1.0 + sin(uTime * 2.4 + phase * 6.2831) * 0.14 * smoothstep(2.0, 7.0, aSize);
    vTwinkle = 0.75 + 0.25 * twinkle;
    vColor = aColor * vTwinkle;
    gl_PointSize = aSize * twinkle;      // slightly grow/shrink with brightness
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const FRAG = /* glsl */ `
  uniform sampler2D uMap;
  varying vec3 vColor;
  varying float vTwinkle;
  void main() {
    float a = texture2D(uMap, gl_PointCoord).a * vTwinkle;
    if (a < 0.01) discard;
    gl_FragColor = vec4(vColor, a);
  }
`;

const Stars = ({ sparse = false, visible = true }) => {
  const { geometry, material } = useMemo(() => {
    /* Sparse (homepage/JWST) mode — only the ~700 brightest stars (the
       catalogue is sorted brightest-first), larger, with diffraction spikes,
       against near-black. Full field (8,920) during the tour. */
    const count = sparse ? Math.min(4800, STAR_COUNT) : STAR_COUNT;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const col = new THREE.Color();
    const cosE = Math.cos(OBLIQUITY);
    const sinE = Math.sin(OBLIQUITY);
    for (let i = 0; i < count; i++) {
      const b = i * STAR_STRIDE; // stride-5: [raRad, decRad, mag, ci, distLy]
      const ra = STARS[b];
      const dec = STARS[b + 1];
      const mag = STARS[b + 2];
      const bv = STARS[b + 3];
      // distLy = STARS[b + 4] — ignored in the solar regime (fixed-sphere sky)
      // equatorial unit vector (z = north celestial pole)
      const cd = Math.cos(dec);
      const xe = cd * Math.cos(ra);
      const ye = cd * Math.sin(ra);
      const ze = Math.sin(dec);
      // equatorial → ecliptic (rotate about the vernal-equinox x-axis by ε)
      const yEcl = ye * cosE + ze * sinE;
      const zEcl = -ye * sinE + ze * cosE; // ecliptic north
      // scene frame: ecliptic plane = xz, ecliptic north = +Y
      positions[i * 3] = xe * R;
      positions[i * 3 + 1] = zEcl * R;
      positions[i * 3 + 2] = yEcl * R;

      bvToColor(bv, col);
      const bright = THREE.MathUtils.clamp(1.12 - mag * 0.13, 0.26, 1.3);
      colors[i * 3] = col.r * bright;
      colors[i * 3 + 1] = col.g * bright;
      colors[i * 3 + 2] = col.b * bright;

      /* Sparse mode renders spike sprites, which need more pixels to read the
         cross; bump the base size so the diffraction spikes are visible. */
      const baseSize = THREE.MathUtils.clamp(1.3 + (6.5 - mag) * 1.15, 1.3, 11);
      /* Sparse (JWST homepage): a wide size range so the brightest ~few show the
         full 6-point spikes while the dense majority read as small round points. */
      sizes[i] = sparse ? baseSize * 2.0 + 1.4 : baseSize;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    const material = new THREE.ShaderMaterial({
      uniforms: { uMap: { value: sparse && SPIKE_TEXTURE ? SPIKE_TEXTURE : SPRITE_TEXTURE }, uTime: { value: 0 } },
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    });
    return { geometry, material };
  }, [sparse]);

  const groupRef = useRef();

  useFrame((_, dt) => {
    /* Twinkle advances on real time (not sceneClock) so bright stars still
       pulse even when the tour time-scale is at 0 (reduced-motion). */
    material.uniforms.uTime.value += dt;
    /* Sky-wide micro-rotation — 360° in ~24 hours of real time (the Earth's
       sky rotates once per sidereal day). Gives the whole star field a
       subtle sense of celestial motion so the sky never reads frozen. */
    if (groupRef.current) groupRef.current.rotation.y += dt * 7.27e-5;
  });

  /* §9.6 disposal — Stars unmounts when the finale engages (Scene/index.jsx
     gates `!finale && <Stars />`). Manually allocated BufferGeometry +
     ShaderMaterial won't be auto-disposed on unmount because they came
     from useMemo, not from JSX children. */
  useEffect(() => () => {
    geometry.dispose();
    material.dispose();
  }, [geometry, material]);

  return (
    <group ref={groupRef} visible={visible}>
      <points geometry={geometry} material={material} frustumCulled={false} />
    </group>
  );
};

export default Stars;
