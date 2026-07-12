/*
 * Real orbital periods per planet, in Julian years (NASA / Standish 1992
 * simplified). Keyed by destination id (which is a legacy section name — see
 * config/destinations.js for the three-name identity model). Consumed by
 * config/orbits.js so the tour's relative orbital speeds are accurate.
 *
 * The dormant J2000 mean-longitude table + `planetPhaseToday` / `planetOffsetToday`
 * were removed as dead exports; the accompanying `astronomy-engine` dep was
 * dropped in commit `9be1d58`. If a "position at real date" feature ships later
 * (Phase 11 in the plan), reintroduce a proper ephemeris module — not a
 * hand-rolled Kepler approximation.
 *
 * `voyagerPositions` also lived here until commit `b1896f6` retired the man-made
 * craft (per the "natural objects only" cleanup); the export was orphaned.
 */

export const PERIOD = {
  experience: 0.2408,      // Mercury
  projects: 0.6152,   // Venus
  achievements: 1.0,    // Earth
  skills: 1.8809,   // Mars
  education: 11.862,     // Jupiter
  hobbies: 29.4571,     // Saturn
  testimonials: 84.0205, // Uranus
  whatsetsmeapart: 164.8,     // Neptune
};
