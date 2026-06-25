/*
 * Dwarf planets + named belt bodies. Single source of truth: the 3D meshes
 * (DwarfPlanets.jsx) and the object registry (objects.js → radar / scanner /
 * game) both read this, so each appears, is scannable, and carries real facts.
 * Sizes use the same true-scale factor as the planets (radii are tiny — these
 * are small worlds) with a small visibility floor; positions sit within the
 * asteroid belt (~x19) and the Kuiper belt (~x44).
 */
import { remapRadius } from "./destinations";

/* Ceres + Pluto are NOT here — they graduated to full tour stops (the
   Achievements + Testimonials destinations). These are the remaining background
   dwarf planets / large belt bodies. */
const RAW = [
  // ── Near-Earth asteroids (the famous sample-return / flyby trio) ──
  {
    id: "bennu", label: "Bennu", category: "Asteroid", position: [10.6, 0.5, -1.4], radius: 0.016, color: "#4a4642",
    info: "101955 Bennu — a 500 m carbon-rich rubble pile. NASA's OSIRIS-REx returned a sample in 2023 that holds amino acids and even sugars — building blocks of life.",
  },
  {
    id: "ryugu", label: "Ryugu", category: "Asteroid", position: [12.1, -0.6, 1.3], radius: 0.017, color: "#4f4a44",
    info: "162173 Ryugu — an 850 m spinning-top asteroid. Japan's Hayabusa2 brought back grains containing uracil, an RNA base. Bennu's sibling from the same parent body.",
  },
  {
    id: "apophis", label: "Apophis", category: "Asteroid", position: [10.0, 0.7, 0.9], radius: 0.015, color: "#6b5f52",
    info: "99942 Apophis — a 340 m asteroid that will skim just 36,000 km past Earth on 13 Apr 2029, closer than our geostationary satellites. No impact risk — OSIRIS-APEX will be waiting.",
  },
  // ── Main asteroid belt ──
  {
    id: "vesta", label: "Vesta", category: "Asteroid", position: [20.4, -0.6, -1.1], radius: 0.045, color: "#b8a98c",
    info: "The brightest asteroid and second-largest belt body (S-type), scarred by a giant impact basin near its south pole that flung debris across the solar system. With Ceres, Pallas and Hygiea it holds over half the belt's entire mass.",
  },
  {
    id: "pallas", label: "Pallas", category: "Asteroid", position: [20.7, 2.2, -1.6], radius: 0.043, color: "#9aa4ac",
    info: "2 Pallas — the third-largest belt body, on a steeply tilted (~35°) orbit. A B-type protoplanet survivor, bluish-grey and heavily battered; one of the four giants that dominate the belt's mass.",
  },
  {
    id: "hygiea", label: "Hygiea", category: "Asteroid", position: [21.5, -0.9, 1.9], radius: 0.038, color: "#5e5852",
    info: "10 Hygiea — the fourth-largest belt body and the most massive dark C-type carbonaceous asteroid. Round enough that it may itself qualify as a dwarf planet.",
  },
  {
    id: "psyche", label: "16 Psyche", category: "Metal asteroid", position: [20.9, 0.9, 1.4], radius: 0.03, color: "#9a9082",
    info: "16 Psyche — a giant (~220 km) metal asteroid of iron-nickel, possibly the exposed core of a shattered protoplanet. NASA's Psyche spacecraft is en route to this 'world of metal'.",
  },
  // ── Kuiper belt + scattered disc ──
  {
    id: "eris", label: "Eris", category: "Dwarf planet", position: [45.6, -1.4, -2.4], radius: 0.057, color: "#dad6cd",
    info: "The most massive dwarf planet known — its 2005 discovery is what prompted the demotion of Pluto. A distant, icy, highly reflective world.",
  },
  {
    id: "makemake", label: "Makemake", category: "Dwarf planet", position: [42.3, 1.9, -1.7], radius: 0.046, color: "#caa98a",
    info: "A reddish Kuiper-belt dwarf planet, one of the largest beyond Neptune, coated in frozen methane.",
  },
  {
    id: "haumea", label: "Haumea", category: "Dwarf planet", position: [44.7, -1.1, 2.7], radius: 0.044, color: "#e3e0d9",
    /* Spins every ~4h → famously stretched ~2:1 into a triaxial ellipsoid. */
    scale: [1.6, 0.78, 0.95],
    info: "An egg-shaped dwarf planet spinning so fast (~4-hour day) that it's stretched into an ellipsoid — and it has its own ring.",
  },
  {
    id: "arrokoth", label: "Arrokoth", category: "Kuiper object", position: [45.6, 0.8, 1.7], radius: 0.022, color: "#8a5a44",
    info: "486958 Arrokoth — the most distant world ever explored. New Horizons flew past in 2019 and found a 36 km contact-binary 'snowman': two reddish lobes gently frozen together 44 AU from the Sun.",
  },
  {
    id: "sedna", label: "Sedna", category: "Dwarf planet", position: [59, -3.2, 5.0], radius: 0.05, color: "#7a3a2a",
    info: "90377 Sedna — one of the most distant known worlds, on an extreme 11,400-year orbit that never approaches the planets. Its deep-red, tholin-coated surface is among the reddest in the solar system.",
  },
  {
    id: "quaoar", label: "Quaoar", category: "Dwarf planet", position: [43.2, 1.6, -2.3], radius: 0.041, color: "#b09a82",
    info: "50000 Quaoar — a ~1,100 km Kuiper dwarf with a moon (Weywot) and a ring that sits impossibly far out, beyond where rings should be able to survive — rewriting the textbook on ring formation.",
  },
  {
    id: "gonggong", label: "Gonggong", category: "Dwarf planet", position: [53, -2.6, 3.1], radius: 0.046, color: "#9a5a4a",
    info: "225088 Gonggong — a big, slow, deep-red scattered-disc dwarf (~1,230 km) on a 550-year orbit, with a moon (Xiangliu) and likely water ice + methane frost.",
  },
  {
    id: "orcus", label: "Orcus", category: "Dwarf planet", position: [44.5, 2.3, 2.6], radius: 0.038, color: "#bcc6cc",
    info: "90482 Orcus — the 'anti-Pluto': same size class and orbital period as Pluto but always on the opposite side of its orbit. Has a large moon, Vanth, and signs of past ice volcanism.",
  },
  {
    id: "chiron", label: "Chiron", category: "Centaur", position: [32.6, 1.5, -2.1], radius: 0.02, color: "#8a7a6a",
    info: "2060 Chiron — the first centaur (an icy body orbiting between Saturn and Uranus), part-asteroid part-comet: it shows a comet-like coma AND a faint ring system, blurring the line between the two.",
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
