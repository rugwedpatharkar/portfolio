/* eslint-disable react/no-unknown-property */
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/*
 * Interplanetary dust drift — motion-gated parallax depth.
 *
 * A faint field of sunlit motes kept toroidally wrapped in a box around the
 * camera: world-fixed BETWEEN wraps, so they parallax strongly as the ship
 * translates (the natural star parallax is negligible for the short inner
 * hops — the catalogue sky is 6800u out). It's INVISIBLE when settled and
 * fades in only while you travel (warp velocity / translation speed), so the
 * Read tour stays clean and the medium only streams past when it sells motion.
 * Denser in the inner system (real zodiacal dust); frozen on reduced-motion.
 */

const COUNT = 240;
const BOX = 90; // toroidal wrap extent around the camera (world units)

/* Soft round mote. */
const DOT = (() => {
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = c.height = 32;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.4, "rgba(255,255,255,0.35)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 32, 32);
  const t = new THREE.CanvasTexture(c);
  t.needsUpdate = true;
  return t;
})();

const StellarDrift = ({ warpVelRef, reducedMotion = false }) => {
  const matRef = useRef();
  const opRef = useRef(0);

  const { geometry, positions } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT * 3; i++) positions[i] = (Math.random() - 0.5) * BOX;
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return { geometry, positions };
  }, []);

  useFrame(({ camera }, dt) => {
    const cam = camera.position;
    const d = Math.min(dt || 1 / 60, 1 / 20);

    /* Toroidal wrap around the camera → dust is always near AND world-fixed
       between wraps (so it parallaxes instead of riding along with the camera). */
    const half = BOX / 2;
    const a = positions;
    for (let i = 0; i < COUNT; i++) {
      const j = i * 3;
      const dx = a[j] - cam.x, dy = a[j + 1] - cam.y, dz = a[j + 2] - cam.z;
      if (dx > half) a[j] -= BOX; else if (dx < -half) a[j] += BOX;
      if (dy > half) a[j + 1] -= BOX; else if (dy < -half) a[j + 1] += BOX;
      if (dz > half) a[j + 2] -= BOX; else if (dz < -half) a[j + 2] += BOX;
    }
    geometry.attributes.position.needsUpdate = true;

    /* Gate on the WARP-JUMP only (a deliberate hop), never on raw translation —
       the camera live-tracks each orbiting planet, so it's always moving even
       when parked; translation speed can't tell tracking from travel. warpVelRef
       is 0 unless a hop is animating, so the dust streams on a jump and is fully
       gone when settled (keeps the Read tour clean). */
    const warp = reducedMotion ? 0 : Math.min(1, Math.abs(warpVelRef?.current || 0));
    /* Zodiacal density: more dust in the inner system, faint by the outer planets. */
    const prox = THREE.MathUtils.clamp((400 - cam.length()) / 360, 0.1, 1);
    const target = warp * prox;
    opRef.current += (target - opRef.current) * (1 - Math.pow(1 - 0.12, d * 60));
    if (matRef.current) matRef.current.opacity = opRef.current * 0.5;
  });

  return (
    <points geometry={geometry} frustumCulled={false}>
      <pointsMaterial
        ref={matRef}
        map={DOT}
        size={1.4}
        sizeAttenuation
        color="#ffe9cc"
        transparent
        opacity={0}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </points>
  );
};

export default StellarDrift;
