/* eslint-disable react/no-unknown-property */
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { remapPosition, frontOfSun } from "../../config/destinations";

/*
 * PHASE 4 (Wave 3) — a FORERUNNER HALO (Halo / 343 Guilty Spark). A ribbon-world
 * curved into a vast ring; you live on the inner surface, spun for gravity, with
 * the far side of the ring arcing overhead. Rendered as a spinning band whose
 * inner face glows faint green-blue (oceans + continents + night-side lights),
 * walled at both rims. Diegetic cameo, scannable. Frozen on reduced-motion.
 */

export const HALO_RAW = [58, -14, -30];

export default function HaloRing({ animate = true }) {
  const ref = useRef();
  const pos = useMemo(() => new THREE.Vector3(...remapPosition(frontOfSun(HALO_RAW))), []);

  useFrame((_, dt) => {
    if (animate && ref.current) ref.current.rotation.y += dt * 0.08; // spun for gravity
  });

  const R = 6;
  const W = 1.15;
  return (
    <group position={pos} rotation={[1.12, 0.35, 0.18]}>
      <group ref={ref}>
        {/* inner habitable surface (faces inward) */}
        <mesh>
          <cylinderGeometry args={[R, R, W, 120, 1, true]} />
          <meshStandardMaterial color="#56776a" roughness={0.85} side={THREE.BackSide} emissive="#26404e" emissiveIntensity={0.18} />
        </mesh>
        {/* outer structural shell */}
        <mesh>
          <cylinderGeometry args={[R * 1.03, R * 1.03, W * 1.02, 120, 1, true]} />
          <meshStandardMaterial color="#9aa4b2" roughness={0.45} metalness={0.45} side={THREE.FrontSide} />
        </mesh>
        {/* retaining walls at both rims */}
        {[1, -1].map((s) => (
          <mesh key={s} position={[0, (s * W) / 2, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[R * 1.01, W * 0.05, 8, 120]} />
            <meshStandardMaterial color="#c6ccd4" roughness={0.4} metalness={0.5} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
