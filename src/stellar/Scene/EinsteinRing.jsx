/* eslint-disable react/no-unknown-property */
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { placeInFrontOfSun } from "../config/destinations";

/*
 * PHASE 4 (Wave 1) — an EINSTEIN RING. When a massive foreground galaxy sits
 * almost exactly between us and a more distant one, its gravity bends the farther
 * galaxy's light into a near-perfect ring around it — predicted by Einstein in
 * 1936, first fully imaged in 1998, and now seen often by Hubble + JWST. A direct,
 * beautiful proof that mass curves spacetime. Rendered as a soft elliptical lens
 * galaxy haloed by a bright, faintly shimmering ring of the lensed background
 * galaxy, turned to face the inner system. Frozen on reduced-motion.
 * Registered in config/objects.js (scan) + explorer.js (discoverable).
 */

export const EINSTEINRING_RAW = [-66, -26, 28];

export default function EinsteinRing({ animate = true }) {
  const ring = useRef();
  const t = useRef(0);
  const pos = useMemo(() => new THREE.Vector3(...placeInFrontOfSun(EINSTEINRING_RAW)), []);
  /* Face the ring toward the inner system (the Sun-ward tour camera) so it reads
     as a ring, not an edge-on line. */
  const quat = useMemo(() => {
    const q = new THREE.Quaternion();
    if (pos.lengthSq() > 1e-6) q.setFromUnitVectors(new THREE.Vector3(0, 0, 1), pos.clone().multiplyScalar(-1).normalize());
    return q;
  }, [pos]);

  useFrame((_, dt) => {
    if (!animate) return;
    t.current += Math.min(dt, 1 / 20);
    if (ring.current) ring.current.material.opacity = 0.55 + Math.sin(t.current * 0.6) * 0.12; // shimmer
  });

  const R = 6;
  return (
    <group position={pos} quaternion={quat}>
      {/* the lensed background galaxy — a bright thin ring */}
      <mesh ref={ring}>
        <torusGeometry args={[R, R * 0.055, 12, 96]} />
        <meshBasicMaterial color="#cfe2ff" transparent opacity={0.55} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
      {/* soft glow halo around the ring */}
      <mesh>
        <torusGeometry args={[R, R * 0.16, 12, 96]} />
        <meshBasicMaterial color="#9ec3ff" transparent opacity={0.12} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
      {/* the foreground lens galaxy — a soft warm elliptical glow at the centre */}
      <mesh scale={[R * 0.5, R * 0.36, R * 0.5]}>
        <sphereGeometry args={[1, 24, 24]} />
        <meshBasicMaterial color="#ffe6b0" transparent opacity={0.5} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
}
