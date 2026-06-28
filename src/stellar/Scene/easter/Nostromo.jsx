/* eslint-disable react/no-unknown-property */
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { besidePlanet } from "../../config/destinations";

/*
 * The USCSS Nostromo (Alien) — a hulking commercial towing vessel, all industrial
 * blocks and work-lights, hauling its refinery through the cold outer dark near
 * Saturn. Click → fires 'stellar:nostromo'.
 */

const POSITION = besidePlanet("notes", [-0.5, -1.1]); // outer dark, by Saturn

export default function Nostromo() {
  const ref = useRef();
  const lampRef = useRef();
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y += 0.03 * 0.016;
    if (lampRef.current) lampRef.current.material.emissiveIntensity = 0.6 + (Math.sin(clock.elapsedTime * 4) > 0 ? 0.5 : 0);
  });

  const handleClick = (e) => {
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent("stellar:nostromo"));
    console.log("%c🛸  Nostromo — in space, no one can hear you scream.", "color:#b7b1a4;font-size:14px;font-family:monospace;");
  };

  return (
    <group
      ref={ref}
      position={POSITION}
      rotation={[0.2, 0.6, 0]}
      scale={0.4}
      onClick={handleClick}
      onPointerOver={() => { document.body.style.cursor = "pointer"; }}
      onPointerOut={() => { document.body.style.cursor = ""; }}
    >
      {/* main hull */}
      <mesh>
        <boxGeometry args={[1.0, 0.6, 2.0]} />
        <meshStandardMaterial color="#6f6a5e" metalness={0.5} roughness={0.7} />
      </mesh>
      {/* command tower */}
      <mesh position={[0, 0.5, 0.7]}>
        <boxGeometry args={[0.5, 0.4, 0.5]} />
        <meshStandardMaterial color="#827c6e" metalness={0.45} roughness={0.7} />
      </mesh>
      {/* side cargo modules */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.75, -0.1, -0.3]}>
          <boxGeometry args={[0.4, 0.5, 1.2]} />
          <meshStandardMaterial color="#5c574c" metalness={0.5} roughness={0.72} />
        </mesh>
      ))}
      {/* stern engine block */}
      <mesh position={[0, 0, -1.2]}>
        <boxGeometry args={[1.1, 0.7, 0.5]} />
        <meshStandardMaterial color="#4a463d" metalness={0.6} roughness={0.6} />
      </mesh>
      {/* work-light */}
      <mesh ref={lampRef} position={[0, 0.72, -0.1]}>
        <sphereGeometry args={[0.08, 10, 10]} />
        <meshStandardMaterial color="#111" emissive="#ffe0a0" emissiveIntensity={0.8} toneMapped={false} />
      </mesh>
    </group>
  );
}
