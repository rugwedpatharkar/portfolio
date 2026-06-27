/* eslint-disable react/no-unknown-property */
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useSceneClock } from "./SceneClock";

/*
 * PHASE 4 (Wave 1) — Neptune's aurora. JWST confirmed it in 2025, and the surprise
 * was WHERE: not at the poles but at MID-LATITUDES, because Neptune's magnetic
 * field is tilted ~47° and offset from the planet's centre. Two faint cyan auroral
 * bands at ~±40° latitude, tipped off the spin axis (the magnetic offset) and
 * tilted with Neptune's obliquity, gently shimmering. Frozen on reduced-motion.
 */
export default function NeptuneAurora({ radius = 1, axialTilt = 0, animate = true }) {
  const matA = useRef();
  const matB = useRef();
  const clock = useSceneClock();
  useFrame(() => {
    if (!animate) return;
    const s = 0.3 + Math.sin(clock.t * 0.8) * 0.12;
    if (matA.current) matA.current.opacity = Math.max(0, s);
    if (matB.current) matB.current.opacity = Math.max(0, s * 0.7);
  });
  const ring = (latRad) => ({ rr: Math.cos(latRad) * radius * 1.02, y: Math.sin(latRad) * radius * 1.02 });
  const N = ring(0.7); // ~40°N
  const S = ring(-0.7); // ~40°S
  return (
    /* tipped by the ~47° magnetic offset (X) + Neptune's obliquity (Z) */
    <group rotation={[0.82, 0, axialTilt]}>
      <mesh position={[0, N.y, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[N.rr, radius * 0.045, 10, 64]} />
        <meshBasicMaterial ref={matA} color="#6cf0d0" transparent opacity={0.3} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh position={[0, S.y, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[S.rr, radius * 0.04, 10, 64]} />
        <meshBasicMaterial ref={matB} color="#6cf0d0" transparent opacity={0.2} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
}
