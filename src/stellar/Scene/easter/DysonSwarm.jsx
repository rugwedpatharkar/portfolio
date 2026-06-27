/* eslint-disable react/no-unknown-property */
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { remapPosition, frontOfSun } from "../../config/destinations";

/*
 * PHASE 4 (Wave 3) — a DYSON SWARM under construction. A Kardashev Type-II project:
 * a host star being wrapped in countless solar collectors to harvest its entire
 * output. Rendered as a bright star encircled by tilted orbital bands of panels,
 * deliberately INCOMPLETE on one arc (still being built). Diegetic cameo, scannable.
 * Frozen on reduced-motion.
 */

export const DYSON_RAW = [-48, -28, -34];

export default function DysonSwarm({ animate = true }) {
  const ref = useRef();
  const pos = useMemo(() => new THREE.Vector3(...remapPosition(frontOfSun(DYSON_RAW))), []);
  const panels = useMemo(() => {
    const arr = [];
    [3.0, 3.7, 4.4].forEach((r, ri) => {
      const tilt = (ri - 1) * 0.5;
      const n = 28 - ri * 3;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        if (a > 1.7 && a < 3.5 && Math.random() > 0.3) continue; // unfinished arc
        arr.push({ p: [Math.cos(a) * r, Math.sin(a) * r * Math.sin(tilt), Math.sin(a) * r * Math.cos(tilt)], rot: [tilt, a, 0] });
      }
    });
    return arr;
  }, []);

  useFrame((_, dt) => { if (animate && ref.current) ref.current.rotation.y += dt * 0.04; });

  return (
    <group position={pos}>
      {/* the host star + corona */}
      <mesh><sphereGeometry args={[1.4, 24, 24]} /><meshBasicMaterial color="#ffe8a0" toneMapped={false} /></mesh>
      <mesh><sphereGeometry args={[2.0, 20, 20]} /><meshBasicMaterial color="#ffd070" transparent opacity={0.16} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} /></mesh>
      <group ref={ref}>
        {panels.map((p, i) => (
          <mesh key={i} position={p.p} rotation={p.rot}>
            <boxGeometry args={[0.5, 0.5, 0.03]} />
            <meshStandardMaterial color="#1a2a44" metalness={0.7} roughness={0.3} emissive="#3a6aa0" emissiveIntensity={0.22} side={THREE.DoubleSide} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
