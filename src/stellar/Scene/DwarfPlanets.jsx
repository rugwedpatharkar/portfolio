/* eslint-disable react/no-unknown-property */
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { DWARF_PLANETS } from "../config/dwarfPlanets";

/*
 * Dwarf planets + named belt bodies (Ceres, Vesta, Pluto, Eris, Makemake,
 * Haumea). Small icy/rocky spheres with a faint emissive lift so they read in
 * the dark outer system. Positions + radii come from config/dwarfPlanets.js,
 * which the object registry also reads — so they're on the radar + scannable in
 * the game automatically. Bodies with a `ring` (Chariklo, Chiron, Haumea,
 * Quaoar — the real ringed small bodies) get a thin icy annulus sibling.
 */
const DwarfPlanets = ({ animate = true }) => {
  const refs = useRef([]);
  useFrame((_, dt) => {
    if (!animate) return;
    const d = Math.min(dt || 1 / 60, 1 / 20);
    for (const m of refs.current) if (m) m.rotation.y += d * 0.12;
  });
  return (
    <group>
      {DWARF_PLANETS.map((dw, i) => (
        <group key={dw.id} position={dw.position}>
          <mesh scale={dw.scale || 1} frustumCulled={false} ref={(el) => { refs.current[i] = el; }}>
            <sphereGeometry args={[dw.radius, 32, 32]} />
            {/* Low emissive floor (not a self-lit bulb): the scene's sun-direction
                KeyLight + fill now sculpt a real day/night terminator on these
                faint outer-system bodies, instead of a flat uniform glow. */}
            <meshStandardMaterial color={dw.color} roughness={1} metalness={0} emissive={dw.color} emissiveIntensity={0.08} />
          </mesh>
          {dw.ring && (
            /* Thin icy ring — a sibling (not a child), so the body's spin +
               any ellipsoid scale don't distort it. Tilted so it reads as a ring. */
            <mesh rotation={[-1.28, 0.25, 0]} frustumCulled={false}>
              <ringGeometry args={[dw.radius * dw.ring[0], dw.radius * dw.ring[1], 48]} />
              <meshBasicMaterial color="#c9d2dc" transparent opacity={0.55} side={THREE.DoubleSide} depthWrite={false} toneMapped={false} />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
};

export default DwarfPlanets;
