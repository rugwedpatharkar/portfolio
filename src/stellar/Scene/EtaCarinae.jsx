/* eslint-disable react/no-unknown-property */
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { remapPosition, frontOfSun } from "../config/destinations";

/*
 * PHASE 4 (Wave 1) — ETA CARINAE's HOMUNCULUS. One of the most massive, luminous
 * stars known (~100× the Sun) and so unstable it nearly destroyed itself in the
 * 1840s "Great Eruption", flinging out two billowing lobes of gas + dust that
 * form the bipolar Homunculus Nebula we still see expanding today. A supernova
 * (or hypernova) waiting to happen. Rendered as a brilliant central star pinched
 * at the waist by a thin equatorial dust skirt between two glowing bipolar lobes.
 * Registered in config/objects.js (scan) + explorer.js (discoverable). Frozen on RM.
 */

export const ETACARINAE_RAW = [-70, 22, -38];

export default function EtaCarinae({ animate = true }) {
  const core = useRef();
  const loA = useRef();
  const loB = useRef();
  const t = useRef(0);
  const pos = useMemo(() => new THREE.Vector3(...remapPosition(frontOfSun(ETACARINAE_RAW))), []);

  useFrame((_, dt) => {
    if (!animate) return;
    t.current += Math.min(dt, 1 / 20);
    const T = t.current;
    if (core.current) core.current.scale.setScalar(1 + Math.sin(T * 0.5) * 0.05); // LBV flicker
    const sh = 0.2 + Math.sin(T * 0.35) * 0.05; // lobe shimmer
    if (loA.current) loA.current.material.opacity = sh;
    if (loB.current) loB.current.material.opacity = sh;
  });

  const R = 6;
  return (
    <group position={pos} rotation={[0.4, 0, 0.5]}>
      {/* the luminous blue variable at the waist */}
      <mesh ref={core}>
        <sphereGeometry args={[R * 0.16, 24, 24]} />
        <meshBasicMaterial color="#fff0e8" toneMapped={false} />
      </mesh>
      {/* two billowing bipolar lobes (outer dust shells) */}
      <mesh ref={loA} position={[0, R * 0.95, 0]} scale={[R * 0.78, R * 1.15, R * 0.78]}>
        <sphereGeometry args={[1, 28, 28]} />
        <meshBasicMaterial color="#ff8a5a" transparent opacity={0.2} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh ref={loB} position={[0, -R * 0.95, 0]} scale={[R * 0.78, R * 1.15, R * 0.78]}>
        <sphereGeometry args={[1, 28, 28]} />
        <meshBasicMaterial color="#ff8a5a" transparent opacity={0.2} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
      {/* brighter inner lobe cores */}
      {[1, -1].map((s) => (
        <mesh key={s} position={[0, s * R * 0.68, 0]} scale={[R * 0.4, R * 0.7, R * 0.4]}>
          <sphereGeometry args={[1, 20, 20]} />
          <meshBasicMaterial color="#ffd2a0" transparent opacity={0.28} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
        </mesh>
      ))}
      {/* thin equatorial dust skirt pinching the waist */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[R * 0.6, R * 0.07, 10, 48]} />
        <meshBasicMaterial color="#c97a4a" transparent opacity={0.38} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
}
