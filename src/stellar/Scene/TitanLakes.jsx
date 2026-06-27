/* eslint-disable react/no-unknown-property */
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/*
 * PHASE 4 (Wave 2) — TITAN's METHANE LAKES. Saturn's giant moon, wrapped in a thick
 * orange smog, is the only other world with stable surface liquid — but its seas and
 * rivers are liquid METHANE and ethane, pooled near the north pole at −180 °C. Cassini
 * radar mapped them; convection + possible protocell chemistry keep it in the news.
 * Rendered as a hazy amber moon with dark polar lakes under an atmospheric halo,
 * mounted inside Saturn's OrbitGroup at Titan's offset. Frozen on RM. Scan in moons.js.
 */

const LAKES = [[0.32, 0.84, 0.2], [-0.24, 0.8, 0.42], [0.12, 0.92, -0.28], [-0.4, 0.74, -0.18]];

export default function TitanLakes({ offset = [2.4, 0.6, 0.5], radius = 0.18, animate = true }) {
  const spin = useRef();
  const pos = useMemo(() => new THREE.Vector3(...offset), [offset]);

  useFrame((_, dt) => { if (animate && spin.current) spin.current.rotation.y += dt * 0.04; });

  const R = radius;
  return (
    <group position={pos}>
      <group ref={spin}>
        {/* the hazy amber body */}
        <mesh>
          <sphereGeometry args={[R, 26, 26]} />
          <meshStandardMaterial color="#d99a4a" roughness={0.9} metalness={0} emissive="#6e3f17" emissiveIntensity={0.12} />
        </mesh>
        {/* dark methane lakes near the north pole */}
        {LAKES.map((d, i) => (
          <mesh key={i} position={[d[0] * R, d[1] * R, d[2] * R]} scale={[R * 0.3, R * 0.16, R * 0.3]}>
            <sphereGeometry args={[1, 10, 10]} />
            <meshStandardMaterial color="#161e2a" roughness={0.4} metalness={0.2} />
          </mesh>
        ))}
      </group>
      {/* thick orange smog halo — Titan's signature atmosphere */}
      <mesh>
        <sphereGeometry args={[R * 1.32, 22, 22]} />
        <meshBasicMaterial color="#e0a85a" transparent opacity={0.2} side={THREE.BackSide} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
}
