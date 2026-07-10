/*
 * Milky Way — galactic structure data (light-years).
 *
 * The single source of truth for the "view-from-within" galaxy. Used LATER to
 * (a) render the accurate galactic BAND on our sky (project arm density + the
 * bulge toward the real galactic-center direction, darken the Great Rift) and
 * (b) orient the local-neighborhood pull-back. It is NEVER used to render the
 * whole disk as an external object.
 *
 * Units: light-years and degrees. Scene-unit conversion happens only at render
 * time via LY_UNIT (see config/scaleRegimes.js). Nothing in the running scene
 * imports this yet — it cannot regress the app.
 *
 * Provenance: docs/galaxy/astronomy-milky-way.md (every value cited there).
 *   Bland-Hawthorn & Gerhard 2016 (structure); Reid et al. 2019 BeSSeL (arms);
 *   Wegg/Gerhard/Portail 2015 (bar); GRAVITY 2019 (Sun R0, Sgr A* mass);
 *   IAU 1958 galactic coordinate frame.
 */

const KPC_TO_LY = 3261.56;

export const GALAXY = {
  type: "SBbc", // barred spiral

  diskRadiusLy: 50000, // bright stellar-disk edge (outer disk extends further)
  scaleLengthLy: 8500, // exp(-R/scaleLength) surface-brightness falloff (~2.6 kpc)
  thinScaleHeightLy: 1000, // ~300 pc — why the galaxy reads as a BAND from inside
  thickScaleHeightLy: 2900, // ~900 pc

  pitchAngleDeg: 12.5, // mean log-spiral pitch

  bulge: { radiusLy: 10000 },
  bar: { halfLengthLy: 16000, angleDeg: 27, axisRatio: [1, 0.4, 0.3] },

  // The Sun's anchor inside the galaxy (the vantage everything is seen from).
  sun: {
    galactocentricRadiusLy: 26670, // 8.178 kpc (GRAVITY 2019)
    heightLy: 65, // ~20 pc north of the mid-plane
    arm: "Orion Spur",
  },

  // Supermassive black hole at the galactic center — used as the core DIRECTION
  // (where the band peaks), not a place we fly to. Direction == galacticCenter below.
  sgrA: { massSolar: 4.3e6, raHours: 17.7611, decDeg: -29.0078 },

  // Fixes the band's great circle on OUR sky. Equatorial (ICRS, J2000); the
  // renderer applies the same obliquity rotation Stars.jsx uses.
  orientation: {
    galacticNorthPole: { raHours: 12.8573, decDeg: 27.1283 },
    galacticCenter: { raHours: 17.7611, decDeg: -29.0078 },
    eclipticInclinationDeg: 60.2,
  },

  // Major arms as log-spirals: r(theta) = refRadiusLy * exp(tan(pitch)*(theta-refAzimuth)).
  // Representative reference radii/pitches from Reid et al. 2019 (kpc->ly). Azimuths +
  // density weights are tunable for the band-brightness projection in the render phase.
  arms: [
    { name: "Norma/Outer", refRadiusLy: 13.0 * KPC_TO_LY, refAzimuthDeg: 18, pitchDeg: 13.8, spanDeg: 250, densityWeight: 0.7 },
    { name: "Scutum-Centaurus", refRadiusLy: 5.0 * KPC_TO_LY, refAzimuthDeg: 23, pitchDeg: 14.0, spanDeg: 300, densityWeight: 1.0 },
    { name: "Sagittarius-Carina", refRadiusLy: 6.6 * KPC_TO_LY, refAzimuthDeg: 24, pitchDeg: 17.0, spanDeg: 300, densityWeight: 0.9 },
    { name: "Orion Spur", refRadiusLy: 8.18 * KPC_TO_LY, refAzimuthDeg: 25, pitchDeg: 11.4, spanDeg: 80, densityWeight: 0.6, hostsSun: true },
    { name: "Perseus", refRadiusLy: 9.9 * KPC_TO_LY, refAzimuthDeg: 15, pitchDeg: 9.4, spanDeg: 300, densityWeight: 0.9 },
  ],
};

/* Self-check (dev): invariants the render layer relies on. Runs at first import;
   the module stays unimported by the scene until then. */
(() => {
  const g = GALAXY;
  const ok = (c, m) => { if (!c) throw new Error(`galaxy.js: ${m}`); };
  ok(g.sun.galactocentricRadiusLy > 0 && g.sun.galactocentricRadiusLy < g.diskRadiusLy, "Sun radius must be inside the disk");
  ok(g.orientation.eclipticInclinationDeg > 0 && g.orientation.eclipticInclinationDeg < 90, "ecliptic inclination out of range");
  ok(g.arms.length >= 4 && g.arms.some((a) => a.hostsSun), "need the major arms incl. the Sun's");
  // log-spiral r(theta) is monotonic in theta iff pitch != 0 (tan(pitch) finite, nonzero)
  g.arms.forEach((a) => ok(a.pitchDeg > 0 && a.pitchDeg < 45 && a.refRadiusLy > 0, `arm ${a.name}: bad log-spiral params`));
})();
