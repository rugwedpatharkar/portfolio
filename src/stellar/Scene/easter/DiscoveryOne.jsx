/* eslint-disable react/no-unknown-property */
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { besidePlanet } from "../../config/destinations";

/*
 * Discovery One (2001: A Space Odyssey) — the Jupiter mission ship: a spherical
 * command module on a long spine of engine modules, with the high-gain dish facing
 * home. Drifts near Jupiter (where HAL's eye also watches). Click → 'stellar:discovery'.
 */

const POSITION = besidePlanet("skills", [0.3, -1.2]); // by Jupiter

export default function DiscoveryOne() {
  const ref = useRef();
  useFrame(({ clock }) => { if (ref.current) ref.current.rotation.y = 0.4 + Math.sin(clock.elapsedTime * 0.25) * 0.1; });

  const handleClick = (e) => {
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent("stellar:discovery"));
    console.log("%c🛰️  Discovery One — My God, it's full of stars.", "color:#dfe4ea;font-size:14px;font-family:monospace;");
  };

  return (
    <group
      ref={ref}
      position={POSITION}
      rotation={[0.1, 0.4, 0.2]}
      scale={0.42}
      onClick={handleClick}
      onPointerOver={() => { document.body.style.cursor = "pointer"; }}
      onPointerOut={() => { document.body.style.cursor = ""; }}
    >
      {/* command sphere */}
      <mesh position={[0, 1.3, 0]}>
        <sphereGeometry args={[0.42, 22, 22]} />
        <meshStandardMaterial color="#eef1f4" metalness={0.4} roughness={0.5} />
      </mesh>
      {/* high-gain dish */}
      <mesh position={[0, 1.3, 0.5]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.04, 18]} />
        <meshStandardMaterial color="#cfd4da" metalness={0.5} roughness={0.45} />
      </mesh>
      {/* spine */}
      <mesh rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 2.4, 10]} />
        <meshStandardMaterial color="#b6bbc2" metalness={0.5} roughness={0.5} />
      </mesh>
      {/* engine modules at the stern */}
      {[-1.05, -1.35, -1.65].map((y) => (
        <mesh key={y} position={[0, y, 0]}>
          <boxGeometry args={[0.42, 0.26, 0.42]} />
          <meshStandardMaterial color="#9aa0a8" metalness={0.55} roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}
