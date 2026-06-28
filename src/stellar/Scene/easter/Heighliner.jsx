/* eslint-disable react/no-unknown-property */
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { remapPosition, frontOfSun } from "../../config/destinations";

/*
 * PHASE 4 (Wave 3) — a GUILD HEIGHLINER (Dune). The Spacing Guild's colossal
 * fold-space transport: a mountainous elongated hull that "travels without moving,"
 * its holds lit by faint spice-orange glow. Diegetic cameo, scannable, frozen on
 * reduced-motion. Stock materials only.
 */

export const HEIGHLINER_RAW = [-44, 30, -38];

export default function Heighliner({ animate = true }) {
  const ref = useRef();
  const pos = useMemo(() => new THREE.Vector3(...remapPosition(frontOfSun(HEIGHLINER_RAW))), []);

  useFrame((_, dt) => { if (animate && ref.current) ref.current.rotation.y += dt * 0.03; });

  return (
    <group position={pos} rotation={[0.2, 0.5, 0.08]} scale={1.5}>
      <group ref={ref}>
        {/* main hull — a long capsule */}
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <capsuleGeometry args={[1.1, 4.6, 8, 20]} />
          <meshStandardMaterial color="#4a4034" metalness={0.45} roughness={0.7} />
        </mesh>
        {/* hull greebles / hold blocks */}
        {[-1.6, -0.4, 0.8, 2.0].map((x, i) => (
          <mesh key={x} position={[x, 0.9, 0]}>
            <boxGeometry args={[0.7, 0.5, 1.8]} />
            <meshStandardMaterial color={i % 2 ? "#3e362b" : "#52483a"} metalness={0.5} roughness={0.65} />
          </mesh>
        ))}
        {/* spice-orange hold glows (additive) */}
        {[-2.6, 0, 2.6].map((x) => (
          <mesh key={x} position={[x, 0, 1.12]}>
            <sphereGeometry args={[0.34, 14, 14]} />
            <meshBasicMaterial color="#ff8a2a" transparent opacity={0.5} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
          </mesh>
        ))}
        {/* engine ring at the stern */}
        <mesh position={[-3.0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.9, 0.16, 8, 24]} />
          <meshStandardMaterial color="#2c261d" metalness={0.6} roughness={0.5} emissive="#ff7a1a" emissiveIntensity={0.25} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}
