/* eslint-disable react/no-unknown-property */
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/*
 * Hidden Death Star at a fixed position inside the asteroid belt.
 * Two grey hemispheres separated by a thin equatorial trench, plus a
 * dimpled superlaser dish offset on the upper hemisphere.
 *
 * Click → fires 'stellar:deathstar' (Achievements catches it). Also
 * a tiny console message.
 */

const POSITION = [21.5, 0.8, -3.5]; // tucked inside the asteroid belt
const RADIUS = 0.42;

const DeathStar = () => {
  const groupRef = useRef();

  useFrame((_, dt) => {
    if (groupRef.current) groupRef.current.rotation.y += dt * 0.05;
  });

  const handleClick = (e) => {
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent("stellar:deathstar"));
    console.log("%c☠  That's no moon...", "color: #cccccc; font-size: 14px; font-family: monospace;");
  };

  return (
    <group ref={groupRef} position={POSITION} onClick={handleClick}>
      {/* Body */}
      <mesh>
        <sphereGeometry args={[RADIUS, 28, 22]} />
        <meshStandardMaterial color="#9a9d9f" roughness={0.55} metalness={0.4} />
      </mesh>
      {/* Equator trench */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[RADIUS * 1.005, 0.012, 6, 64]} />
        <meshBasicMaterial color="#1a1c1e" />
      </mesh>
      {/* Superlaser dish — small dimple on upper hemisphere */}
      <mesh position={[RADIUS * 0.45, RADIUS * 0.55, RADIUS * 0.5]}>
        <sphereGeometry args={[RADIUS * 0.18, 16, 12]} />
        <meshStandardMaterial color="#6a6c6e" roughness={0.4} metalness={0.5} />
      </mesh>
      <mesh position={[RADIUS * 0.45, RADIUS * 0.55, RADIUS * 0.5]}>
        <sphereGeometry args={[RADIUS * 0.06, 12, 12]} />
        <meshBasicMaterial color="#3a8aff" />
      </mesh>
    </group>
  );
};

export default DeathStar;
