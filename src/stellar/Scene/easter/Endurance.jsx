/* eslint-disable react/no-unknown-property */
import { remapPosition } from "../../config/destinations";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

/*
 * The Endurance from Interstellar — the ring of 12 modules the crew rode to
 * Saturn's wormhole. A connecting ring with twelve pods (the lit one is the
 * command module) plus a central hub, spinning slowly for artificial
 * gravity. Out in the cold of the outer system, small and discoverable.
 *
 * Click → fires 'stellar:endurance'.
 */

const POSITION = remapPosition([37.0, 1.1, -2.5]);
const R = 0.5;
const PODS = 12;

const Endurance = () => {
  const ringRef = useRef();
  useFrame((_, dt) => {
    if (ringRef.current) ringRef.current.rotation.z += dt * 0.22;
  });

  const handleClick = (e) => {
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent("stellar:endurance"));
    console.log("%c🪐  Endurance — see you on the other side.", "color: #cfd6e0; font-size: 14px; font-family: monospace;");
  };

  return (
    <group
      position={POSITION}
      rotation={[Math.PI * 0.34, 0.35, 0]}
      onClick={handleClick}
      onPointerOver={() => { document.body.style.cursor = "pointer"; }}
      onPointerOut={() => { document.body.style.cursor = ""; }}
    >
      <group ref={ringRef}>
        {/* Connecting ring */}
        <mesh>
          <torusGeometry args={[R, 0.026, 8, 48]} />
          <meshStandardMaterial color="#c8cacc" metalness={0.6} roughness={0.4} />
        </mesh>
        {/* 12 modules around the ring; pod 0 is the lit command module */}
        {Array.from({ length: PODS }).map((_, i) => {
          const a = (i / PODS) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(a) * R, Math.sin(a) * R, 0]} rotation={[0, 0, a]}>
              <boxGeometry args={[0.14, 0.085, 0.085]} />
              <meshStandardMaterial
                color={i === 0 ? "#eef2f6" : "#aeb1b4"}
                metalness={0.5}
                roughness={0.45}
                emissive={i === 0 ? "#22324a" : "#000000"}
                emissiveIntensity={i === 0 ? 0.8 : 0}
              />
            </mesh>
          );
        })}
      </group>
      {/* Central hub */}
      <mesh>
        <sphereGeometry args={[0.085, 16, 16]} />
        <meshStandardMaterial color="#d0d2d4" metalness={0.6} roughness={0.4} />
      </mesh>
    </group>
  );
};

export default Endurance;
