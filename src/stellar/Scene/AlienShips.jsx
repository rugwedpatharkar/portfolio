/* eslint-disable react/no-unknown-property */
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

/*
 * Two tiny alien ships drift on independent Lissajous curves at distinct
 * planes. Each is a glowing disk with a colored emissive trim and a
 * pulsing pointlight, kept under 60 tris between them.
 *
 * Wholly cosmetic — they exist to make the system feel inhabited.
 */

const Ship = ({ a = 14, b = 12, c = 6, p = 1, q = 2, r = 1, phase = 0, color = "#00ffd5", trim = "#2fe0b0", scale = 1 }) => {
  const groupRef = useRef();
  const lightRef = useRef();
  const tRef = useRef(phase);

  useFrame((_, delta) => {
    tRef.current += delta * 0.18;
    const t = tRef.current;
    if (groupRef.current) {
      groupRef.current.position.set(
        Math.sin(p * t) * a,
        Math.sin(r * t + 0.7) * c,
        Math.cos(q * t) * b
      );
      groupRef.current.rotation.y = t * 0.6;
      groupRef.current.rotation.x = Math.sin(t * 0.4) * 0.15;
    }
    if (lightRef.current) {
      lightRef.current.intensity = 0.6 + Math.sin(t * 4) * 0.25;
    }
  });

  return (
    <group ref={groupRef} scale={scale}>
      {/* Saucer body */}
      <mesh>
        <cylinderGeometry args={[0.4, 0.18, 0.12, 16]} />
        <meshStandardMaterial color="#0a0d1e" metalness={0.85} roughness={0.25} emissive={trim} emissiveIntensity={0.15} />
      </mesh>
      {/* Glowing dome on top */}
      <mesh position={[0, 0.09, 0]}>
        <sphereGeometry args={[0.16, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.4} transparent opacity={0.85} />
      </mesh>
      {/* Light ring trim */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <torusGeometry args={[0.36, 0.025, 6, 32]} />
        <meshBasicMaterial color={trim} />
      </mesh>
      <pointLight ref={lightRef} color={color} intensity={0.6} distance={3} decay={2} />
    </group>
  );
};

const AlienShips = () => (
  <>
    <Ship a={18} b={16} c={5} p={1} q={2} r={1} phase={0.3} color="#00ffd5" trim="#2fe0b0" scale={1.0} />
    <Ship a={22} b={14} c={4} p={2} q={1} r={1} phase={2.1} color="#ff6bff" trim="#ffb84d" scale={0.85} />
  </>
);

export default AlienShips;
