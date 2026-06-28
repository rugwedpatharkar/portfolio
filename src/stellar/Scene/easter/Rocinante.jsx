/* eslint-disable react/no-unknown-property */
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { besidePlanet } from "../../config/destinations";

/*
 * The Rocinante (The Expanse) — a corvette-class Martian frigate the crew "borrowed,"
 * patrolling near the asteroid belt. A lean hull, nose cluster, side fins, and a blue
 * Epstein-drive plume. Click → fires 'stellar:rocinante'.
 */

const POSITION = besidePlanet("achievements", [-1, -0.6]); // by the belt (Ceres)

export default function Rocinante() {
  const ref = useRef();
  const plumeRef = useRef();
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (ref.current) ref.current.rotation.y = 0.5 + Math.sin(t * 0.4) * 0.15;
    if (plumeRef.current) plumeRef.current.scale.y = 1 + Math.sin(t * 9) * 0.18;
  });

  const handleClick = (e) => {
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent("stellar:rocinante"));
    console.log("%c🚀  Rocinante — we're in the shit now, but we're in it together.", "color:#9fb4c8;font-size:14px;font-family:monospace;");
  };

  return (
    <group
      ref={ref}
      position={POSITION}
      rotation={[0.2, 0.5, 0]}
      scale={0.36}
      onClick={handleClick}
      onPointerOver={() => { document.body.style.cursor = "pointer"; }}
      onPointerOut={() => { document.body.style.cursor = ""; }}
    >
      {/* hull */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.34, 0.5, 2.0, 12]} />
        <meshStandardMaterial color="#8b94a0" metalness={0.6} roughness={0.45} />
      </mesh>
      {/* nose */}
      <mesh position={[0, 1.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.34, 0.5, 12]} />
        <meshStandardMaterial color="#9aa3af" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* side fins */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.42, -0.5, 0]} rotation={[0, 0, s * 0.5]}>
          <boxGeometry args={[0.5, 0.5, 0.06]} />
          <meshStandardMaterial color="#6f7884" metalness={0.55} roughness={0.5} />
        </mesh>
      ))}
      {/* drive bell + plume */}
      <mesh position={[0, -1.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.42, 0.4, 12]} />
        <meshStandardMaterial color="#3a3f47" metalness={0.7} roughness={0.4} />
      </mesh>
      <mesh ref={plumeRef} position={[0, -1.7, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.3, 1.0, 12, 1, true]} />
        <meshBasicMaterial color="#6fc6ff" transparent opacity={0.55} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}
