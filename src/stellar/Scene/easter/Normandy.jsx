/* eslint-disable react/no-unknown-property */
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { besidePlanet } from "../../config/destinations";

/*
 * The SSV Normandy (Mass Effect) — a sleek human-Alliance frigate with swept wings
 * and a glowing drive core, cruising over Earth. Click → fires 'stellar:normandy'.
 */

const POSITION = besidePlanet("experience", [0.4, 1.2]); // over Earth

export default function Normandy() {
  const ref = useRef();
  const coreRef = useRef();
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (ref.current) ref.current.rotation.y = 0.6 + Math.sin(t * 0.35) * 0.12;
    if (coreRef.current) coreRef.current.material.opacity = 0.55 + Math.sin(t * 3) * 0.2;
  });

  const handleClick = (e) => {
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent("stellar:normandy"));
    console.log("%c🛰️  SSV Normandy — I should go.", "color:#bcd0ff;font-size:14px;font-family:monospace;");
  };

  return (
    <group
      ref={ref}
      position={POSITION}
      rotation={[0.18, 0.5, 0]}
      scale={0.34}
      onClick={handleClick}
      onPointerOver={() => { document.body.style.cursor = "pointer"; }}
      onPointerOut={() => { document.body.style.cursor = ""; }}
    >
      {/* fuselage */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <capsuleGeometry args={[0.32, 1.6, 6, 14]} />
        <meshStandardMaterial color="#e8ecf2" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* nose */}
      <mesh position={[0, 1.25, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.3, 0.5, 14]} />
        <meshStandardMaterial color="#cfd6e0" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* swept wing nacelles */}
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 0.5, -0.5, 0]} rotation={[0, 0, -s * 0.55]}>
          <mesh><boxGeometry args={[0.8, 0.16, 0.34]} /><meshStandardMaterial color="#aeb6c2" metalness={0.55} roughness={0.45} /></mesh>
          <mesh position={[s * 0.42, 0, 0]}>
            <boxGeometry args={[0.12, 0.2, 0.4]} />
            <meshStandardMaterial color="#2a3550" emissive="#3a78ff" emissiveIntensity={1.1} toneMapped={false} />
          </mesh>
        </group>
      ))}
      {/* drive core glow (additive) */}
      <mesh ref={coreRef} position={[0, -1.0, 0]}>
        <sphereGeometry args={[0.3, 14, 14]} />
        <meshBasicMaterial color="#4a86ff" transparent opacity={0.6} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
}
