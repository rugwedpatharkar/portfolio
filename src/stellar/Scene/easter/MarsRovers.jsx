/* eslint-disable react/no-unknown-property */
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { besidePlanet } from "../../config/destinations";

/*
 * Perseverance + Ingenuity — NASA's real Mars pair: the car-sized rover and the
 * little tech-demo helicopter that became the first powered flight on another world.
 * Shown beside the red planet; Ingenuity's rotors spin. Real objects, scannable.
 * Click → fires 'stellar:perseverance'.
 */

const POSITION = besidePlanet("projects", [0.2, -1.1]); // beside Mars

export default function MarsRovers() {
  const rotorRef = useRef();
  const heliRef = useRef();
  useFrame(({ clock }) => {
    if (rotorRef.current) rotorRef.current.rotation.y += 0.5;
    if (heliRef.current) heliRef.current.position.y = 0.85 + Math.sin(clock.elapsedTime * 1.6) * 0.06;
  });

  const handleClick = (e) => {
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent("stellar:perseverance"));
    console.log("%c🚁  Perseverance & Ingenuity — first powered flight on another world.", "color:#d98a5a;font-size:14px;font-family:monospace;");
  };

  return (
    <group
      position={POSITION}
      rotation={[0.1, 0.5, 0]}
      scale={0.42}
      onClick={handleClick}
      onPointerOver={() => { document.body.style.cursor = "pointer"; }}
      onPointerOut={() => { document.body.style.cursor = ""; }}
    >
      {/* rover body */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.7, 0.3, 1.0]} />
        <meshStandardMaterial color="#cdb89a" metalness={0.5} roughness={0.55} />
      </mesh>
      {/* wheels */}
      {[-1, 1].flatMap((s) => [-0.4, 0, 0.4].map((z) => (
        <mesh key={`${s}-${z}`} position={[s * 0.42, -0.22, z]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.12, 0.12, 0.1, 12]} />
          <meshStandardMaterial color="#2a2a2e" roughness={0.8} />
        </mesh>
      )))}
      {/* mast + camera head */}
      <mesh position={[0.18, 0.34, 0.32]}>
        <boxGeometry args={[0.06, 0.4, 0.06]} />
        <meshStandardMaterial color="#9a8a72" metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh position={[0.18, 0.56, 0.32]}>
        <boxGeometry args={[0.16, 0.1, 0.1]} />
        <meshStandardMaterial color="#3a3a40" metalness={0.6} roughness={0.4} emissive="#5a7aa0" emissiveIntensity={0.3} toneMapped={false} />
      </mesh>
      {/* RTG mast at the back */}
      <mesh position={[0, 0.3, -0.5]} rotation={[0.5, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.3, 10]} />
        <meshStandardMaterial color="#7a7268" metalness={0.5} roughness={0.6} />
      </mesh>
      {/* Ingenuity helicopter hovering nearby */}
      <group ref={heliRef} position={[-0.9, 0.85, 0.2]} scale={0.6}>
        <mesh><boxGeometry args={[0.18, 0.16, 0.18]} /><meshStandardMaterial color="#caaf8a" metalness={0.5} roughness={0.5} /></mesh>
        <mesh position={[0, -0.18, 0]}><boxGeometry args={[0.02, 0.2, 0.02]} /><meshStandardMaterial color="#444" /></mesh>
        <group ref={rotorRef} position={[0, 0.16, 0]}>
          <mesh rotation={[0, 0, 0]}><boxGeometry args={[0.9, 0.01, 0.05]} /><meshStandardMaterial color="#cfd6e0" metalness={0.4} roughness={0.5} /></mesh>
          <mesh rotation={[0, Math.PI / 2, 0]}><boxGeometry args={[0.9, 0.01, 0.05]} /><meshStandardMaterial color="#cfd6e0" metalness={0.4} roughness={0.5} /></mesh>
        </group>
      </group>
    </group>
  );
}
