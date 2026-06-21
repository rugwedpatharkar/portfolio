/* eslint-disable react/no-unknown-property */
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/*
 * Generic planet primitive. Each destination renders one of these with its
 * own color + radius + optional rings + optional axial tilt + optional moons.
 *
 * The surface uses meshStandardMaterial so it picks up light from the sun.
 * A subtle emissive tint at the chosen color so the planet reads on the
 * dark side too — visitors should always be able to see where they're
 * navigating to.
 */

const Planet = ({
  position = [0, 0, 0],
  radius = 1,
  color = "#915eff",
  rotationSpeed = 0.1,
  rings = false,
  axialTilt = 0,
  moons = 0,
}) => {
  const groupRef = useRef();
  const planetRef = useRef();
  const moonsRef = useRef([]);

  useFrame((_, delta) => {
    if (planetRef.current) planetRef.current.rotation.y += delta * rotationSpeed;
    moonsRef.current.forEach((m, i) => {
      if (m) {
        const t = m.userData.t + delta * (0.25 + (i % 3) * 0.05);
        m.userData.t = t;
        const orbitR = m.userData.orbit;
        m.position.set(Math.cos(t) * orbitR, Math.sin(t * 0.7) * orbitR * 0.18, Math.sin(t) * orbitR);
      }
    });
  });

  const baseColor = new THREE.Color(color);
  const emissive = baseColor.clone().multiplyScalar(0.45);

  const moonNodes = [];
  for (let i = 0; i < moons; i++) {
    const orbit = radius * 1.8 + i * 0.18;
    const initial = (i / moons) * Math.PI * 2;
    moonNodes.push(
      <mesh
        key={i}
        ref={(el) => {
          if (el) {
            el.userData = { orbit, t: initial };
            moonsRef.current[i] = el;
          }
        }}
        position={[Math.cos(initial) * orbit, 0, Math.sin(initial) * orbit]}
      >
        <sphereGeometry args={[radius * 0.12, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={0.6}
          roughness={0.4}
          metalness={0.2}
        />
      </mesh>
    );
  }

  return (
    <group position={position} ref={groupRef} rotation={[0, 0, axialTilt]}>
      <mesh ref={planetRef}>
        <sphereGeometry args={[radius, 48, 48]} />
        <meshStandardMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={0.18}
          roughness={0.78}
          metalness={0.12}
        />
      </mesh>

      {rings && (
        <mesh rotation={[Math.PI / 2.1, 0, 0]}>
          <ringGeometry args={[radius * 1.4, radius * 2.05, 64]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.42}
            side={THREE.DoubleSide}
            toneMapped={false}
          />
        </mesh>
      )}

      {moonNodes}
    </group>
  );
};

export default Planet;
