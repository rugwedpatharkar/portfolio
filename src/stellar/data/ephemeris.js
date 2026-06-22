/*
 * Lightweight Keplerian planet position calculator. Returns a
 * normalised angular position (radians) for each planet given a
 * Julian-Date offset from J2000 (2000-01-01 12:00 TT).
 *
 * We don't need true 3D ecliptic — the portfolio uses a stylised
 * inline-x layout. We expose a "phase shift" per planet that nudges
 * the orbit angle to reflect TODAY'S real position. The caller maps
 * that into a small visible offset.
 *
 * Source: J2000 mean elements (NASA / Standish 1992 simplified).
 */

/* Orbital period in Julian years */
const PERIOD = {
  about: 0.2408,      // Mercury
  funfacts: 0.6152,   // Venus
  experience: 1.0,    // Earth
  projects: 1.8809,   // Mars
  skills: 11.862,     // Jupiter
  notes: 29.4571,     // Saturn
  education: 84.0205, // Uranus
  hobbies: 164.8,     // Neptune
};

/* Mean longitude at J2000 (deg) — simplified to phase angle. */
const PHASE_J2000 = {
  about: 252.25,
  funfacts: 181.98,
  experience: 100.46,
  projects: 355.43,
  skills: 34.40,
  notes: 49.94,
  education: 313.23,
  hobbies: 304.88,
};

/* Days since J2000 epoch */
const daysSinceJ2000 = (date = new Date()) => {
  const J2000 = Date.UTC(2000, 0, 1, 12, 0, 0);
  return (date.getTime() - J2000) / 86400000;
};

/* Phase angle today in radians, 0..2π */
export const planetPhaseToday = (planetId, date = new Date()) => {
  const period = PERIOD[planetId];
  if (!period) return 0;
  const phase0 = (PHASE_J2000[planetId] || 0) * Math.PI / 180;
  const days = daysSinceJ2000(date);
  const periodDays = period * 365.25;
  const meanMotion = (2 * Math.PI) / periodDays; // rad / day
  return ((phase0 + meanMotion * days) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
};

/* Map a phase angle to a small XY drift around the planet's stylised
   destination position. Radius is per-planet so inner planets get
   tighter wobble than outer giants. */
export const planetOffsetToday = (planetId, date = new Date()) => {
  const phase = planetPhaseToday(planetId, date);
  const driftR = {
    about: 0.18, funfacts: 0.22, experience: 0.26, projects: 0.32,
    skills: 0.55, notes: 0.7, education: 0.85, hobbies: 1.0,
  }[planetId] ?? 0;
  return [Math.cos(phase) * driftR, 0, Math.sin(phase) * driftR];
};

/* Voyager probe real positions (AU). Linear extrapolation from known
   speeds, accurate enough for visual marker placement. */
export const voyagerPositions = (date = new Date()) => {
  const days = daysSinceJ2000(date);
  /* Voyager 1: was at 121 AU in Aug 2012; moves at 3.6 AU/yr */
  const v1AU = 121 + ((days - daysSinceJ2000(new Date(Date.UTC(2012, 7, 1)))) / 365.25) * 3.58;
  /* Voyager 2: was at 119 AU in Nov 2018; moves at 3.3 AU/yr */
  const v2AU = 119 + ((days - daysSinceJ2000(new Date(Date.UTC(2018, 10, 1)))) / 365.25) * 3.26;
  return {
    voyager1: { auFromSun: v1AU, direction: [0.3, 0.7, -0.65] },
    voyager2: { auFromSun: v2AU, direction: [-0.4, -0.85, 0.35] },
  };
};
