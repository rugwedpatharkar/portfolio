/* eslint-disable react/no-unknown-property */
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { remapPosition, frontOfSun } from "../../config/destinations";

/*
 * PHASE 4 (Wave 3) — THE RING (The Expanse). A vast protomolecule-built gate ring
 * hanging silent in the dark; pass through its membrane into the "slow zone" and
 * the hub of a thousand gates. Rendered as a dark slate torus with a faint blue
 * surface glow and a dim gate membrane across its mouth, turning slowly. Diegetic
 * cameo, scannable. Frozen on reduced-motion.
 */

export const SOLGATE_RAW = [46, 26, -32];

export default function SolGate({ animate = true }) {
  const ref = useRef();
  const mem = useRef();
  const t = useRef(0);
  const pos = useMemo(() => new THREE.Vector3(...remapPosition(frontOfSun(SOLGATE_RAW))), []);

  useFrame((_, dt) => {
    if (!animate) return;
    t.current += Math.min(dt, 1 / 20);
    if (ref.current) ref.current.rotation.z += dt * 0.03;
    if (mem.current) mem.current.material.opacity = 0.4 + Math.sin(t.current * 0.5) * 0.1;
  });

  const R = 5;
  return (
    <group position={pos} rotation={[0.5, 0.35, 0.1]}>
      <group ref={ref}>
        {/* the ring structure */}
        <mesh>
          <torusGeometry args={[R, 0.8, 18, 90]} />
          <meshStandardMaterial color="#2b3138" roughness={0.7} metalness={0.3} />
        </mesh>
        {/* faint blue surface glow */}
        <mesh>
          <torusGeometry args={[R, 0.86, 18, 90]} />
          <meshBasicMaterial color="#3a6a8a" transparent opacity={0.12} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
        </mesh>
        {/* the gate membrane across the mouth (slow-zone threshold) */}
        <mesh ref={mem} rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[R - 0.7, 56]} />
          <meshBasicMaterial color="#0c141e" transparent opacity={0.4} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      </group>
    </group>
  );
}
