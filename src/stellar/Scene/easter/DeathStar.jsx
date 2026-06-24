/* eslint-disable react/no-unknown-property */
import { nearBody } from "../../config/destinations";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/*
 * Death Star — moved out of the dense asteroid belt where it was
 * being occluded by ~700 rocks. New position is just above the belt
 * plane (y=2.4) so it reads against the deep starfield. 2.4× larger
 * than before, with a subtle pulsing blue dish light to draw the eye.
 *
 * Click → fires 'stellar:deathstar' (Achievements unlocks the
 * "That's no moon" badge).
 */

const POSITION = nearBody("achievements", [1.5, 0.6, 1.1]); // beside Ceres / the belt, in the tour view
const RADIUS = 0.42; // a believable moon-sized sphere (~120 km canon), not a giant

const DeathStar = () => {
  const groupRef = useRef();
  const dishLightRef = useRef();

  useFrame((_, dt) => {
    if (groupRef.current) groupRef.current.rotation.y += dt * 0.05;
    if (dishLightRef.current) {
      const t = performance.now() * 0.001;
      dishLightRef.current.intensity = 0.4 + Math.sin(t * 2) * 0.25;
    }
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
        <sphereGeometry args={[RADIUS, 36, 28]} />
        <meshStandardMaterial color="#9a9d9f" roughness={0.55} metalness={0.4} />
      </mesh>
      {/* Equator trench */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[RADIUS * 1.005, 0.022, 6, 96]} />
        <meshBasicMaterial color="#0a0c0e" />
      </mesh>
      {/* Superlaser dish — a wide, recessed concave dish in the NORTHERN
          hemisphere (canon), with the focusing eye glowing at its centre. The
          dish group is aimed outward along the surface normal. */}
      <group position={[RADIUS * 0.42, RADIUS * 0.62, RADIUS * 0.48]} rotation={[-0.7, 0, -0.6]}>
        {/* recessed dark dish bowl */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <sphereGeometry args={[RADIUS * 0.3, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2.4]} />
          <meshStandardMaterial color="#46494b" roughness={0.45} metalness={0.55} side={THREE.DoubleSide} />
        </mesh>
        {/* the focusing eye */}
        <mesh position={[0, RADIUS * 0.02, 0]}>
          <sphereGeometry args={[RADIUS * 0.07, 12, 12]} />
          <meshBasicMaterial color="#4a96ff" toneMapped={false} />
        </mesh>
      </group>
      <pointLight
        ref={dishLightRef}
        color="#3a8aff"
        intensity={0.4}
        distance={2.5}
        decay={2}
        position={[RADIUS * 0.45, RADIUS * 0.55, RADIUS * 0.6]}
      />
    </group>
  );
};

export default DeathStar;
