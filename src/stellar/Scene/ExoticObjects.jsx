/* eslint-disable react/no-unknown-property */
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { remapPosition, frontOfSun } from "../config/destinations";
import BlackHole from "./BlackHole";

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
  crab: [82, 28, -44],
  trappist: [-52, -22, -40],
};
const pos = (raw) => remapPosition(frontOfSun(raw));

/* Sagittarius A* — the real supermassive black hole. Rendered with the shared
   BlackHole component in a near-FACE-ON orientation with gentle beaming, to
   match the Event Horizon Telescope's 2022 image: a fairly symmetric orange
   photon ring around the dark central shadow (vs Gargantua's edge-on drama). */
const SgrA = ({ animate }) => (
  <group position={pos(EXOTIC_RAW.sgra)}>
    <BlackHole position={[0, 0, 0]} radius={30} tilt={Math.PI * 0.14} beam={0.5} animate={animate} />
    <pointLight color="#ffd9a0" intensity={1.6} distance={420} decay={1.6} />
  </group>
);

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

/* Crab Nebula — a supernova remnant: layered additive glows (teal O-III, red
   H-alpha, blue synchrotron) around a bright central pulsar. */
const CrabNebula = ({ animate }) => {
  const g = useRef();
  useFrame((_, dt) => { if (animate && g.current) g.current.rotation.z += dt * 0.02; });
  return (
    <group position={pos(EXOTIC_RAW.crab)}>
      <group ref={g}>
        <mesh scale={[34, 24, 20]}><sphereGeometry args={[1, 20, 20]} /><meshBasicMaterial color="#3fae9a" transparent opacity={0.15} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} toneMapped={false} /></mesh>
        <mesh scale={[26, 31, 18]} rotation={[0, 0, 0.7]}><sphereGeometry args={[1, 20, 20]} /><meshBasicMaterial color="#c8643c" transparent opacity={0.14} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} toneMapped={false} /></mesh>
        <mesh scale={[18, 18, 18]}><sphereGeometry args={[1, 20, 20]} /><meshBasicMaterial color="#9be0ff" transparent opacity={0.12} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} toneMapped={false} /></mesh>
      </group>
      <mesh><sphereGeometry args={[1.4, 16, 16]} /><meshBasicMaterial color="#eaf6ff" toneMapped={false} /></mesh>
      <pointLight color="#bfe9ff" intensity={0.8} distance={140} decay={1.6} />
    </group>
  );
};

/* TRAPPIST-1 — an ultracool red dwarf with 7 tight Earth-sized worlds. */
const Trappist = ({ animate }) => {
  const g = useRef();
  useFrame((_, dt) => { if (animate && g.current) g.current.rotation.y += dt * 0.15; });
  const planets = useMemo(
    () => [5, 6.4, 8, 9.6, 11.4, 13.4, 15.6].map((r, i) => ({ r, a: i * 0.9, c: ["#c9a892", "#b89a82", "#a8b39a", "#9bb0a8", "#8aa8b4", "#8a98c0", "#9aa8c0"][i] })),
    []
  );
  return (
    <group position={pos(EXOTIC_RAW.trappist)} rotation={[0.5, 0, 0]}>
      <mesh><sphereGeometry args={[3, 24, 24]} /><meshBasicMaterial color="#ff6a3a" toneMapped={false} /></mesh>
      <mesh><sphereGeometry args={[5.5, 24, 24]} /><meshBasicMaterial color="#ff8a4a" transparent opacity={0.22} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.BackSide} toneMapped={false} /></mesh>
      <group ref={g}>
        {planets.map((p, i) => (
          <mesh key={i} position={[Math.cos(p.a) * p.r, 0, Math.sin(p.a) * p.r]}>
            <sphereGeometry args={[0.6, 12, 12]} />
            <meshStandardMaterial color={p.c} emissive={new THREE.Color(p.c)} emissiveIntensity={0.25} roughness={0.9} />
          </mesh>
        ))}
      </group>
      <pointLight color="#ff8a4a" intensity={1.4} distance={90} decay={1.5} />
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
    <CrabNebula animate={animate} />
    <Trappist animate={animate} />
  </>
);

export default ExoticObjects;
