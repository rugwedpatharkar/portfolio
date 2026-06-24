/*
 * Real physical + orbital data (NASA NSSDCA / JPL SSD), keyed by destination id.
 * Used for accurate rotation, retrograde spin, elliptical orbits and orbital
 * inclination. Radii + axial tilts live on the destinations themselves.
 *
 *   rotationHours — sidereal rotation period; NEGATIVE = retrograde spin
 *   eccentricity  — orbit ellipticity (0 = circle)
 *   inclination   — orbit-plane tilt to the ecliptic, degrees
 */
export const PLANET_DATA = {
  about:      { rotationHours: 1407.6,  eccentricity: 0.2056, inclination: 7.00 }, // Mercury
  funfacts:   { rotationHours: -5832.5, eccentricity: 0.0068, inclination: 3.39 }, // Venus — retrograde
  experience: { rotationHours: 23.93,   eccentricity: 0.0167, inclination: 0.00 }, // Earth
  projects:   { rotationHours: 24.62,   eccentricity: 0.0934, inclination: 1.85 }, // Mars
  skills:     { rotationHours: 9.93,    eccentricity: 0.0489, inclination: 1.30 }, // Jupiter
  notes:      { rotationHours: 10.66,   eccentricity: 0.0565, inclination: 2.49 }, // Saturn
  education:  { rotationHours: -17.24,  eccentricity: 0.0457, inclination: 0.77 }, // Uranus — retrograde / on its side
  hobbies:    { rotationHours: 16.11,   eccentricity: 0.0113, inclination: 1.77 }, // Neptune
};

/* Visual spin rate (rad/s) from the real period: Earth is the anchor, others
   scale by 24h / |period|, sign carries retrograde. Gas giants visibly whirl,
   Venus/Mercury barely creep. */
const SPIN_BASE = 0.12;
export const rotationSpeedFor = (id, fallback = 0.08) => {
  const h = PLANET_DATA[id]?.rotationHours;
  if (!h) return fallback;
  return (SPIN_BASE * 24) / h; // sign of h → retrograde
};
