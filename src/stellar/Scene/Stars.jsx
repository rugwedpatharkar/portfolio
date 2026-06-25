/* eslint-disable react/no-unknown-property */
import { useMemo } from "react";
import * as THREE from "three";
import { STARS, STAR_COUNT } from "../data/brightStars";

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
const SPRITE_TEXTURE = (() => {
  if (typeof document === "undefined") return null;
  const s = 64;
  const c = document.createElement("canvas");
  c.width = c.height = s;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.18, "rgba(255,255,255,0.9)");
  g.addColorStop(0.4, "rgba(255,255,255,0.28)");
  g.addColorStop(0.8, "rgba(255,255,255,0.03)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  const t = new THREE.CanvasTexture(c);
  t.minFilter = THREE.LinearMipmapLinearFilter;
  t.magFilter = THREE.LinearFilter;
  t.anisotropy = 8;
  t.needsUpdate = true;
  return t;
})();

/* B–V colour index → RGB. Ballesteros' formula gives effective temperature from
   B–V; a blackbody approximation (Tanner Helland) turns that into the star's
   real tint — hot blue-white (B–V<0) through the Sun's yellow-white (~0.65) to
   cool orange-red (B–V>1.4). */
function bvToColor(bv, out) {
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
  // lightly desaturate — keep more of each star's real B–V colour (blue/gold)
  // so the field reads richer, not washed grey-white (was 0.35).
  const cr = THREE.MathUtils.clamp(r / 255, 0, 1);
  const cg = THREE.MathUtils.clamp(g / 255, 0, 1);
  const cb = THREE.MathUtils.clamp(b / 255, 0, 1);
  const mix = 0.22;
  out.setRGB(cr * (1 - mix) + mix, cg * (1 - mix) + mix, cb * (1 - mix) + mix);
}

const VERT = /* glsl */ `
  attribute float aSize;
  attribute vec3 aColor;
  varying vec3 vColor;
  void main() {
    vColor = aColor;
    gl_PointSize = aSize;                 // constant screen size — sky is at infinity
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const FRAG = /* glsl */ `
  uniform sampler2D uMap;
  varying vec3 vColor;
  void main() {
    float a = texture2D(uMap, gl_PointCoord).a;
    if (a < 0.01) discard;
    gl_FragColor = vec4(vColor, a);
  }
`;

const Stars = () => {
  const { geometry, material } = useMemo(() => {
    const positions = new Float32Array(STAR_COUNT * 3);
    const colors = new Float32Array(STAR_COUNT * 3);
    const sizes = new Float32Array(STAR_COUNT);
    const col = new THREE.Color();
    const cosE = Math.cos(OBLIQUITY);
    const sinE = Math.sin(OBLIQUITY);
    for (let i = 0; i < STAR_COUNT; i++) {
      const ra = STARS[i * 4];
      const dec = STARS[i * 4 + 1];
      const mag = STARS[i * 4 + 2];
      const bv = STARS[i * 4 + 3];
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

      sizes[i] = THREE.MathUtils.clamp(1.3 + (6.5 - mag) * 1.15, 1.3, 11);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    const material = new THREE.ShaderMaterial({
      uniforms: { uMap: { value: SPRITE_TEXTURE } },
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    });
    return { geometry, material };
  }, []);

  return <points geometry={geometry} material={material} frustumCulled={false} />;
};

export default Stars;
