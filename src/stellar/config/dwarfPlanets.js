/*
 * Dwarf planets + named belt bodies. Single source of truth: the 3D meshes
 * (DwarfPlanets.jsx) and the object registry (objects.js → radar / scanner /
 * game) both read this, so each appears, is scannable, and carries real facts.
 * Sizes use the same true-scale factor as the planets (radii are tiny — these
 * are small worlds) with a small visibility floor; positions sit within the
 * asteroid belt (~x19) and the Kuiper belt (~x44).
 */
import { remapRadius } from "./destinations";

const RAW = [
  // Asteroid belt
  {
    id: "ceres", label: "Ceres", position: [18.4, 0.5, 1.3], radius: 0.05, color: "#8a8378",
    info: "The largest asteroid and the inner solar system's only dwarf planet — round under its own gravity, holding about a third of the belt's entire mass.",
  },
  {
    id: "vesta", label: "Vesta", position: [20.4, -0.6, -1.1], radius: 0.04, color: "#b8a98c",
    info: "The brightest asteroid and second-largest belt body, scarred by a giant impact basin near its south pole that flung debris across the solar system.",
  },
  // Kuiper belt
  {
    id: "pluto", label: "Pluto", position: [43.3, 1.3, 2.2], radius: 0.058, color: "#c9b9a3",
    info: "The famous dwarf planet — a frozen world with a vast nitrogen-ice 'heart', five moons, and a wildly tilted, eccentric orbit. Reclassified from planet in 2006.",
  },
  {
    id: "eris", label: "Eris", position: [45.6, -1.4, -2.4], radius: 0.057, color: "#dad6cd",
    info: "The most massive dwarf planet known — its 2005 discovery is what prompted the demotion of Pluto. A distant, icy, highly reflective world.",
  },
  {
    id: "makemake", label: "Makemake", position: [42.3, 1.9, -1.7], radius: 0.046, color: "#caa98a",
    info: "A reddish Kuiper-belt dwarf planet, one of the largest beyond Neptune, coated in frozen methane.",
  },
  {
    id: "haumea", label: "Haumea", position: [44.7, -1.1, 2.7], radius: 0.044, color: "#e3e0d9",
    info: "An egg-shaped dwarf planet spinning so fast (~4-hour day) that it's stretched into an ellipsoid — and it has its own ring.",
  },
];

/* Carry each dwarf out to the true-scale belt distances (same radial remap as
   the planets), preserving its direction from the Sun. */
export const DWARF_PLANETS = RAW.map((d) => {
  const [x, y, z] = d.position;
  const r = Math.hypot(x, y, z) || 1;
  const f = remapRadius(r) / r;
  return { ...d, position: [x * f, y * f, z * f] };
});
