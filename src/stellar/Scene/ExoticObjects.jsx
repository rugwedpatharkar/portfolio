/* eslint-disable react/no-unknown-property */
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { remapPosition, frontOfSun } from "../config/destinations";

/*
 * New deep-field exotic objects, object-space + additive (no 2nd post pass —
 * the existing Bloom haloes them). Each id/position MATCHES its registry entry
 * in config/objects.js (same remapPosition(frontOfSun(raw))), so the scan map
 * flies you to exactly what you see.
 *
 *  - Sagittarius A*  : the Milky Way's central supermassive black hole — dark
 *                      core + bright, slightly tilted accretion ring.
 *  - Magnetar        : a neutron star with a quadrillion-gauss field — tiny
 *                      blue-white core wrapped in glowing field-line loops.
 *  - Brown dwarf     : a "failed star" — dim red-brown sphere + faint warm halo.
 *  - Rogue planet    : a starless world adrift — dark, barely-lit sphere.
 */

/* Raw positions (pre-remap) — kept in sync with objects.js ANOMALY_RAW. */
export const EXOTIC_RAW = {
  sgra: [70, 16, -52],
  magnetar: [-34, 22, -30],
  browndwarf: [54, -12, 26],
  rogue: [-22, -16, 33],
};
const pos = (raw) => remapPosition(frontOfSun(raw));

const SgrA = ({ animate }) => {
  const ringRef = useRef();
  useFrame((_, dt) => { if (animate && ringRef.current) ringRef.current.rotation.z += dt * 0.05; });
  return (
    <group position={pos(EXOTIC_RAW.sgra)} rotation={[1.15, 0.4, 0]}>
      {/* event horizon */}
      <mesh><sphereGeometry args={[34, 32, 32]} /><meshBasicMaterial color="#000003" toneMapped={false} /></mesh>
      {/* accretion ring (additive, slightly asymmetric via the gradient sprite) */}
      <mesh ref={ringRef}>
        <ringGeometry args={[38, 78, 96]} />
        <meshBasicMaterial color="#ffcf8a" transparent opacity={0.55} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh ref={ringRef}>
        <ringGeometry args={[34, 46, 96]} />
        <meshBasicMaterial color="#fff1d0" transparent opacity={0.5} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
      <pointLight color="#ffd9a0" intensity={2} distance={400} decay={1.6} />
    </group>
  );
};

const Magnetar = ({ animate }) => {
  const g = useRef();
  useFrame((_, dt) => { if (animate && g.current) g.current.rotation.y += dt * 0.6; });
  /* a few great-circle field-line loops at varied tilts */
  const loops = useMemo(() => [
    [0, 0, 0], [Math.PI / 3, 0, 0], [0, 0, Math.PI / 3], [Math.PI / 2, Math.PI / 4, 0],
  ], []);
  return (
    <group position={pos(EXOTIC_RAW.magnetar)}>
      <mesh><sphereGeometry args={[1.5, 24, 24]} /><meshBasicMaterial color="#dff0ff" toneMapped={false} /></mesh>
      <mesh><sphereGeometry args={[3.4, 24, 24]} /><meshBasicMaterial color="#7fb0ff" transparent opacity={0.28} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} /></mesh>
      <group ref={g}>
        {loops.map((r, i) => (
          <mesh key={i} rotation={r}>
            <torusGeometry args={[5.5 + i * 0.4, 0.12, 8, 64]} />
            <meshBasicMaterial color="#9ec8ff" transparent opacity={0.5} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
          </mesh>
        ))}
      </group>
      <pointLight color="#bfe0ff" intensity={1.1} distance={120} decay={1.6} />
    </group>
  );
};

const DimSphere = ({ position, radius, color, halo, haloColor, emissive }) => {
  const ref = useRef();
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.y += dt * 0.05; });
  return (
    <group position={position}>
      <mesh ref={ref}>
        <sphereGeometry args={[radius, 32, 32]} />
        <meshStandardMaterial color={color} emissive={new THREE.Color(emissive || color)} emissiveIntensity={emissive ? 0.5 : 0.04} roughness={0.9} metalness={0.05} />
      </mesh>
      {halo && (
        <mesh>
          <sphereGeometry args={[radius * 1.7, 24, 24]} />
          <meshBasicMaterial color={haloColor} transparent opacity={0.16} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.BackSide} toneMapped={false} />
        </mesh>
      )}
    </group>
  );
};

const ExoticObjects = ({ animate = true }) => (
  <>
    <SgrA animate={animate} />
    <Magnetar animate={animate} />
    {/* brown dwarf — dim, self-luminous red-brown */}
    <DimSphere position={pos(EXOTIC_RAW.browndwarf)} radius={6} color="#5a2c20" emissive="#7a2a18" halo haloColor="#b0432a" />
    {/* rogue planet — dark, starless world */}
    <DimSphere position={pos(EXOTIC_RAW.rogue)} radius={4} color="#2b2a30" />
  </>
);

export default ExoticObjects;
