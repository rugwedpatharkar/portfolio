/* eslint-disable react/no-unknown-property, react/prop-types */
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/*
 * A small ISRO spacecraft on a local orbit around its host body — mounted inside
 * the host's OrbitGroup (like EarthStation), so it inherits the host's solar
 * position and just circles the planet. Click to "chart" it: fires a discovery
 * event the Achievements layer listens for. Chandrayaan rides Earth's group out
 * near the Moon; Mangalyaan rides Mars. Freezes under reduced-motion.
 */
const IsroProbe = ({
  orbitRadius = 1.4, speed = 0.32, tilt = 0.35, phase = 0, scale = 0.12,
  event, animate = true, onPointerOver, onPointerOut,
}) => {
  const orbitRef = useRef();
  const bodyRef = useRef();
  const tRef = useRef(phase);

  const place = (a) => {
    const ring = Math.sin(a) * orbitRadius;
    orbitRef.current?.position.set(Math.cos(a) * orbitRadius, ring * Math.sin(tilt), ring * Math.cos(tilt));
  };
  if (!animate && orbitRef.current && orbitRef.current.position.lengthSq() === 0) place(tRef.current);

  useFrame((_, dt) => {
    if (!animate) return;
    tRef.current += Math.min(dt, 1 / 20) * speed;
    place(tRef.current);
    if (bodyRef.current) bodyRef.current.rotation.y = tRef.current * 1.6;
  });

  const handleClick = (e) => {
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent(event));
  };

  return (
    <group ref={orbitRef}>
      <group ref={bodyRef} scale={scale} onClick={handleClick} onPointerOver={onPointerOver} onPointerOut={onPointerOut}>
        {/* gold-foil bus */}
        <mesh>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshStandardMaterial color="#caa23a" emissive="#7a5a12" emissiveIntensity={0.5} roughness={0.4} metalness={0.85} />
        </mesh>
        {/* solar wings */}
        {[-1, 1].map((sx) => (
          <mesh key={sx} position={[0.66 * sx, 0, 0]}>
            <boxGeometry args={[0.72, 0.02, 0.42]} />
            <meshStandardMaterial color="#1b3a5c" emissive="#1f5388" emissiveIntensity={0.5} roughness={0.4} metalness={0.3} />
          </mesh>
        ))}
        {/* high-gain dish */}
        <mesh position={[0, 0.36, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.22, 0.16, 16, 1, true]} />
          <meshStandardMaterial color="#e8e4d8" side={THREE.DoubleSide} roughness={0.6} metalness={0.3} />
        </mesh>
      </group>
    </group>
  );
};

export default IsroProbe;
