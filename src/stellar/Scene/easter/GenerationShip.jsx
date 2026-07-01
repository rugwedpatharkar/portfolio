/* eslint-disable react/no-unknown-property */
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { remapPosition, frontOfSun } from "../../config/destinations";

/*
 * PHASE 4 (Wave 3) — a DERELICT GENERATION SHIP. A vast O'Neill-cylinder ark built
 * for a thousand-year crossing, now dead and slowly tumbling: a long ribbed hull, a
 * dim window band mostly gone dark, one porthole still flickering. Diegetic cameo,
 * scannable, frozen on reduced-motion. Stock materials only (no Metal-NaN).
 */

export const GENSHIP_RAW = [54, 4, -40];

export default function GenerationShip({ animate = true }) {
  const ref = useRef();
  const flickerRef = useRef();
  const pos = useMemo(() => new THREE.Vector3(...remapPosition(frontOfSun(GENSHIP_RAW))), []);

  useFrame((state, dt) => {
    if (!animate) return;
    if (ref.current) { ref.current.rotation.y += dt * 0.06; ref.current.rotation.z += dt * 0.012; }
    if (flickerRef.current) flickerRef.current.material.emissiveIntensity = Math.sin(state.clock.elapsedTime * 6.5) > 0.55 ? 1.2 : 0.05;
  });

  return (
    <group position={pos} rotation={[0.35, 0.6, 0.2]} scale={1.7}>
      <group ref={ref}>
        {/* hull */}
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[1.0, 1.0, 5.4, 30]} />
          <meshStandardMaterial color="#3a3e46" metalness={0.6} roughness={0.62} />
        </mesh>
        {/* end caps + rib rings */}
        {[-2.7, -1.0, 1.0, 2.7].map((x) => (
          <mesh key={x} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[1.04, 0.07, 6, 30]} />
            <meshStandardMaterial color="#23262b" metalness={0.7} roughness={0.5} />
          </mesh>
        ))}
        {/* dim window band (dead) */}
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[1.02, 1.02, 0.5, 30, 1, true]} />
          <meshStandardMaterial color="#0c0d10" emissive="#ffce7a" emissiveIntensity={0.12} side={THREE.DoubleSide} toneMapped={false} />
        </mesh>
        {/* the one flickering porthole */}
        <mesh ref={flickerRef} position={[0.4, 1.0, 0.18]}>
          <boxGeometry args={[0.12, 0.18, 0.06]} />
          <meshStandardMaterial color="#111" emissive="#ffd98a" emissiveIntensity={0.6} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}
