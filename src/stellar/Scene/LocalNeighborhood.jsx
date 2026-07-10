/* eslint-disable react/no-unknown-property */
import { useMemo } from "react";
import * as THREE from "three";
import { STARS, STAR_COUNT, STAR_STRIDE } from "../data/brightStars";
import { bvToColor } from "./Stars";
import { LY_UNIT, LOCAL_CAP_LY } from "../config/scaleRegimes";

/*
 * The LOCAL STELLAR NEIGHBORHOOD — the nearest real stars placed at TRUE 3D
 * DEPTH (distLy × LY_UNIT) around the Sun at the origin. This is the visual
 * payload of the pull-back finale ("here's our place in the galaxy, seen from
 * our vantage"): the Sun becomes one point among its real neighbours, with
 * genuine parallax depth as the camera pulls out.
 *
 * ONLY mounted in the finale (`active`) — at solar-regime scales it would
 * collide with the AU-scale planets (the powers-of-ten gap). Stars with unknown
 * parallax (distLy = 0) or beyond LOCAL_CAP_LY stay on the fixed background
 * sphere (Stars.jsx) + the galactic band (MilkyWay.jsx), which remain as the
 * far backdrop. Uses the SAME equatorial→scene transform as Stars.jsx so the
 * neighbourhood agrees with the fixed sky + the band. A shader sizes each star
 * by magnitude with a CLAMPED distance attenuation, so nearer neighbours grow
 * into jewels (real depth) without any star ballooning into a bloom blob.
 *
 * See docs/galaxy/technical-scale-regimes.md §4.
 */

const OBLIQUITY = 23.44 * (Math.PI / 180);

/* Equatorial RA/Dec (radians) → scene-frame unit vector — identical to
   Stars.jsx / MilkyWay.jsx so all three share one sky. */
function sceneVec(ra, dec, out) {
  const cd = Math.cos(dec);
  const xe = cd * Math.cos(ra);
  const ye = cd * Math.sin(ra);
  const ze = Math.sin(dec);
  const cosE = Math.cos(OBLIQUITY);
  const sinE = Math.sin(OBLIQUITY);
  return out.set(xe, -ye * sinE + ze * cosE, ye * cosE + ze * sinE);
}

const SPRITE = (() => {
  if (typeof document === "undefined") return null;
  const s = 64;
  const c = document.createElement("canvas");
  c.width = c.height = s;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.25, "rgba(255,255,255,0.75)");
  g.addColorStop(0.55, "rgba(255,255,255,0.12)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  const t = new THREE.CanvasTexture(c);
  t.needsUpdate = true;
  return t;
})();

const VERT = /* glsl */ `
  attribute float aSize;
  attribute vec3 aColor;
  varying vec3 vColor;
  void main() {
    vColor = aColor;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    // Base size (by magnitude) with a MILD distance attenuation for depth, then
    // clamped — near neighbours grow into jewels, far ones stay points, but no
    // single star ever balloons into a bloom-merged blob.
    gl_PointSize = clamp(aSize * (950.0 / -mv.z), 1.5, 26.0);
    gl_Position = projectionMatrix * mv;
  }
`;
const FRAG = /* glsl */ `
  uniform sampler2D uMap;
  varying vec3 vColor;
  void main() {
    float a = texture2D(uMap, gl_PointCoord).a;
    if (a < 0.02) discard;
    gl_FragColor = vec4(vColor, a);
  }
`;

const LocalNeighborhood = ({ active = false }) => {
  const { geometry, material } = useMemo(() => {
    const dir = new THREE.Vector3();
    const col = new THREE.Color();
    const positions = [];
    const colors = [];
    const sizes = [];
    for (let k = 0; k < STAR_COUNT; k++) {
      const b = k * STAR_STRIDE;
      const distLy = STARS[b + 4];
      if (distLy <= 0 || distLy > LOCAL_CAP_LY) continue; // unknown / far → backdrop
      sceneVec(STARS[b], STARS[b + 1], dir).multiplyScalar(distLy * LY_UNIT);
      positions.push(dir.x, dir.y, dir.z);
      bvToColor(STARS[b + 3], col);
      // Jewel colours from B–V (reused helper); brightness + size from apparent
      // magnitude so the real bright neighbours (Sirius, Vega, Arcturus,
      // Betelgeuse…) read as gems and the faint field recedes into depth.
      const mag = STARS[b + 2];
      const bright = THREE.MathUtils.clamp(1.05 + (2.5 - mag) * 0.16, 0.4, 1.6);
      colors.push(col.r * bright, col.g * bright, col.b * bright);
      sizes.push(THREE.MathUtils.clamp(2.6 + (5.0 - mag) * 1.7, 1.6, 13));
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(positions), 3));
    geometry.setAttribute("aColor", new THREE.BufferAttribute(new Float32Array(colors), 3));
    geometry.setAttribute("aSize", new THREE.BufferAttribute(new Float32Array(sizes), 1));
    const material = new THREE.ShaderMaterial({
      uniforms: { uMap: { value: SPRITE } },
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    });
    return { geometry, material };
  }, []);

  if (!active) return null;

  return (
    <group>
      {/* The Sun — our star, at the origin: the finale's focal point ("that warm
          dot is us — the whole tour, one star among its neighbours"). A single
          warm additive sprite, unmistakably brighter than the neighbour points,
          yet still a point, not a disk. */}
      <sprite scale={[190, 190, 1]}>
        <spriteMaterial map={SPRITE} color="#ffcf85" transparent opacity={0.26} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </sprite>
      <sprite scale={[66, 66, 1]}>
        <spriteMaterial map={SPRITE} color="#fff1d4" transparent opacity={1} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </sprite>
      {/* Nearest real stars at true depth — gem sizes/brightness by magnitude. */}
      <points geometry={geometry} material={material} frustumCulled={false} />
    </group>
  );
};

export default LocalNeighborhood;
