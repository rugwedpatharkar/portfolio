/* eslint-disable react/no-unknown-property */
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import PlanetMaterial from "./PlanetMaterial";

/*
 * Planet primitive. Wraps PlanetMaterial (procedural shader) with an
 * optional ring system, axial tilt, and orbital moons.
 *
 * Each planet rotates on its own axis. Moons orbit on a slightly inclined
 * plane so they catch the camera at different heights as the visitor
 * scrolls past.
 */

const Planet = ({
  position = [0, 0, 0],
  radius = 1,
  type = "rocky",
  color,
  colorB,
  rotationSpeed = 0.1,
  rings = false,
  ringColor,
  axialTilt = 0,
  moons = 0,
  moonColor,
  moonScale = 0.12,
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
        m.position.set(
          Math.cos(t) * orbitR,
          Math.sin(t * 0.7) * orbitR * 0.22,
          Math.sin(t) * orbitR
        );
      }
    });
  });

  const moonNodes = [];
  const mColor = moonColor || color || "#cccccc";
  for (let i = 0; i < moons; i++) {
    const orbit = radius * 1.85 + i * 0.16 * radius;
    const initial = (i / Math.max(1, moons)) * Math.PI * 2;
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
        <sphereGeometry args={[radius * moonScale, 16, 16]} />
        <meshStandardMaterial
          color={mColor}
          emissive={new THREE.Color(mColor).multiplyScalar(0.55)}
          emissiveIntensity={0.7}
          roughness={0.45}
          metalness={0.2}
        />
      </mesh>
    );
  }

  const rColor = ringColor || color || "#f8c555";

  return (
    <group position={position} ref={groupRef} rotation={[0, 0, axialTilt]}>
      <mesh ref={planetRef}>
        <sphereGeometry args={[radius, 64, 64]} />
        <PlanetMaterial type={type} color={color} colorB={colorB} />
      </mesh>

      {rings && (
        <group rotation={[Math.PI / 2.1, 0, 0]}>
          {/* Inner faint ring */}
          <mesh>
            <ringGeometry args={[radius * 1.32, radius * 1.55, 64]} />
            <meshBasicMaterial
              color={rColor}
              transparent
              opacity={0.18}
              side={THREE.DoubleSide}
              toneMapped={false}
            />
          </mesh>
          {/* Main bright ring */}
          <mesh>
            <ringGeometry args={[radius * 1.58, radius * 1.92, 96]} />
            <meshBasicMaterial
              color={rColor}
              transparent
              opacity={0.55}
              side={THREE.DoubleSide}
              toneMapped={false}
            />
          </mesh>
          {/* Outer thin ring */}
          <mesh>
            <ringGeometry args={[radius * 1.96, radius * 2.15, 96]} />
            <meshBasicMaterial
              color={rColor}
              transparent
              opacity={0.28}
              side={THREE.DoubleSide}
              toneMapped={false}
            />
          </mesh>
        </group>
      )}

      {moonNodes}
    </group>
  );
};

export default Planet;
