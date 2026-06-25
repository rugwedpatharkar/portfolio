/* eslint-disable react/no-unknown-property */
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { DWARF_PLANETS } from "../config/dwarfPlanets";

/*
 * Dwarf planets + named belt bodies (Ceres, Vesta, Pluto, Eris, Makemake,
 * Haumea). Small icy/rocky spheres with a faint emissive lift so they read in
 * the dark outer system. Positions + radii come from config/dwarfPlanets.js,
 * which the object registry also reads — so they're on the radar + scannable in
 * the game automatically.
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
        <mesh key={dw.id} position={dw.position} scale={dw.scale || 1} ref={(el) => { refs.current[i] = el; }}>
          <sphereGeometry args={[dw.radius, 32, 32]} />
          {/* Low emissive floor (not a self-lit bulb): the scene's sun-direction
              KeyLight + fill now sculpt a real day/night terminator on these
              faint outer-system bodies, instead of a flat uniform glow. */}
          <meshStandardMaterial color={dw.color} roughness={1} metalness={0} emissive={dw.color} emissiveIntensity={0.08} />
        </mesh>
      ))}
    </group>
  );
};

export default DwarfPlanets;
