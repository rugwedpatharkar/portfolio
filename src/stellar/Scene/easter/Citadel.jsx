/* eslint-disable react/no-unknown-property */
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { remapPosition, frontOfSun } from "../../config/destinations";

/*
 * PHASE 4 (Wave 3) — THE CITADEL (Mass Effect). A vast deep-space station: five
 * arm-like Wards that can close like a flower, around the central Presidium ring.
 * Built (it turns out) by the Reapers as a trap. Rendered as five lit arms
 * radiating from a glowing ring, turning slowly. Diegetic cameo, scannable.
 * Frozen on reduced-motion.
 */

export const CITADEL_RAW = [-52, 18, -30];

export default function Citadel({ animate = true }) {
  const ref = useRef();
  const pos = useMemo(() => new THREE.Vector3(...remapPosition(frontOfSun(CITADEL_RAW))), []);

  useFrame((_, dt) => { if (animate && ref.current) ref.current.rotation.y += dt * 0.03; });

  return (
    <group position={pos} rotation={[0.4, 0, 0.2]}>
      <group ref={ref}>
        {/* central Presidium ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.1, 0.18, 12, 48]} />
          <meshStandardMaterial color="#9ab0c4" metalness={0.5} roughness={0.4} emissive="#3a6a8a" emissiveIntensity={0.22} />
        </mesh>
        {/* five Ward arms */}
        {[0, 1, 2, 3, 4].map((i) => (
          <group key={i} rotation={[0, (i / 5) * Math.PI * 2, 0]}>
            <mesh position={[0, 0, 2.6]}>
              <boxGeometry args={[0.5, 0.22, 4.2]} />
              <meshStandardMaterial color="#8a98a8" metalness={0.55} roughness={0.4} emissive="#2a5a7a" emissiveIntensity={0.18} />
            </mesh>
            <mesh position={[0, 0, 4.7]}>
              <sphereGeometry args={[0.12, 10, 10]} />
              <meshBasicMaterial color="#bfe0ff" toneMapped={false} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}
