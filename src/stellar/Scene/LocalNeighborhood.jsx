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
 * neighbourhood agrees with the fixed sky + the band. sizeAttenuation ON (unlike
 * the fixed-size infinity sky) so nearer stars read bigger → real depth.
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

const LocalNeighborhood = ({ active = false }) => {
  const built = useMemo(() => {
    const dir = new THREE.Vector3();
    const col = new THREE.Color();
    const positions = [];
    const colors = [];
    for (let k = 0; k < STAR_COUNT; k++) {
      const b = k * STAR_STRIDE;
      const distLy = STARS[b + 4];
      if (distLy <= 0 || distLy > LOCAL_CAP_LY) continue; // unknown / far → backdrop
      sceneVec(STARS[b], STARS[b + 1], dir).multiplyScalar(distLy * LY_UNIT);
      positions.push(dir.x, dir.y, dir.z);
      bvToColor(STARS[b + 3], col);
      // brightness from apparent magnitude; jewel colours from B–V (reused helper)
      const mag = STARS[b + 2];
      const bright = THREE.MathUtils.clamp(1.3 - mag * 0.12, 0.45, 1.7);
      colors.push(col.r * bright, col.g * bright, col.b * bright);
    }
    return {
      positions: new Float32Array(positions),
      colors: new Float32Array(colors),
      count: positions.length / 3,
    };
  }, []);

  if (!active) return null;

  return (
    <group>
      {/* The Sun — our star, at the origin: a warm bright point among its neighbours. */}
      <sprite scale={[18, 18, 1]}>
        <spriteMaterial map={SPRITE} color="#fff0cc" transparent opacity={0.95} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </sprite>
      {/* Nearest real stars at true depth. */}
      <points frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={built.count} array={built.positions} itemSize={3} />
          <bufferAttribute attach="attributes-color" count={built.count} array={built.colors} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial
          size={26}
          sizeAttenuation
          vertexColors
          transparent
          map={SPRITE}
          alphaTest={0.01}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </points>
    </group>
  );
};

export default LocalNeighborhood;
