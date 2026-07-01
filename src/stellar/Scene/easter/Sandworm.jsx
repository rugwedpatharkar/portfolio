/* eslint-disable react/no-unknown-property */
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { besidePlanet } from "../../config/destinations";

/*
 * Shai-Hulud — a Dune sandworm breaching beside the red planet, the closest thing
 * the system has to Arrakis. A curved chain of ribbed segments rising to a ringed,
 * toothed mouth; it sways gently as if cresting a dune. Click → fires 'stellar:sandworm'.
 */

const POSITION = besidePlanet("projects", [-1, 0.5]); // beside Mars
const SEGMENTS = 7;

export default function Sandworm() {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.z = -0.35 + Math.sin(clock.elapsedTime * 0.6) * 0.12;
  });

  const handleClick = (e) => {
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent("stellar:sandworm"));
    console.log("%c🪱  The spice must flow.", "color:#d8a35a;font-size:14px;font-family:monospace;");
  };

  return (
    <group
      position={POSITION}
      rotation={[0.2, 0.4, 0]}
      scale={0.5}
      onClick={handleClick}
      onPointerOver={() => { document.body.style.cursor = "pointer"; }}
      onPointerOut={() => { document.body.style.cursor = ""; }}
    >
      <group ref={ref}>
        {/* body — segments along a rising arc */}
        {Array.from({ length: SEGMENTS }).map((_, i) => {
          const t = i / (SEGMENTS - 1);
          const y = Math.sin(t * 1.3) * 1.7;
          const x = t * 0.9;
          const r = 0.42 * (1 - t * 0.45);
          return (
            <mesh key={i} position={[x, y, 0]} rotation={[0, 0, t * 0.8]}>
              <cylinderGeometry args={[r, r * 1.05, 0.5, 14]} />
              <meshStandardMaterial color={i % 2 ? "#b87f43" : "#a06f39"} roughness={0.9} metalness={0.05} />
            </mesh>
          );
        })}
        {/* ringed mouth at the head */}
        <group position={[0.9 + 0, Math.sin(1.3) * 1.7 + 0.3, 0]} rotation={[0, 0, 0.9]}>
          {[0.24, 0.17, 0.1].map((mr, i) => (
            <mesh key={mr} position={[0, i * 0.04, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[mr, 0.04, 6, 16]} />
              <meshStandardMaterial color="#5e3f20" roughness={0.85} emissive="#2a1606" emissiveIntensity={0.4} />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  );
}
