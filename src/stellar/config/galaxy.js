import * as THREE from "three";
import { DESTINATIONS, DESTINATION_BY_ID } from "./destinations";
import { getOrbit, orbitalPosition } from "./orbits";

/*
 * Helical-motion model — the Sun marches through the galaxy and the planets
 * trace HELICES around its line of travel.
 *
 * THE PHYSICS (correct, not the viral "vortex" video):
 *  - It is a HELIX, not a vortex. Each planet's path is simply its own orbit
 *    SUPERPOSED on the Sun's straight-line galactic motion — no drag, no
 *    interaction between bodies.
 *  - The Sun travels toward the SOLAR APEX (near Vega / Hercules) at ~230 km/s;
 *    one galactic year ≈ 230 Myr. Here the apex is +Z and the camera trails it.
 *  - PRIME CORRECTNESS DETAIL: the ecliptic plane is tilted ~60° to the
 *    direction of travel (a tilted "windshield"), NOT 90°. So the orbital-plane
 *    NORMAL sits 30° from the travel axis, and planets alternately LEAD and
 *    TRAIL the Sun — they do NOT trail flat behind it like a comet tail.
 *
 * This module is PURE (no React/canvas) so the 60° convention + the lead/trail
 * behaviour can be asserted headlessly (see tests/galaxy.test.mjs).
 */

const DEG = Math.PI / 180;

/* The Sun's straight-line march toward the solar apex, in galaxy-view space. */
export const APEX_AXIS = new THREE.Vector3(0, 0, 1);

/* THE prime constant. Plane 60° to travel ⇒ normal 30° from travel. */
export const PLANE_TO_TRAVEL_DEG = 60;
export const NORMAL_TO_TRAVEL_DEG = 90 - PLANE_TO_TRAVEL_DEG; // 30

/* Tilt the ecliptic (normal +Y, plane = world XZ) about +X by 60°, which lands
   the normal 30° from the apex axis +Z (asserted in the galaxy test). */
export const ECLIPTIC_TILT = new THREE.Quaternion().setFromAxisAngle(
  new THREE.Vector3(1, 0, 0),
  PLANE_TO_TRAVEL_DEG * DEG
);

/* The bodies that trace helices: the orbiting planets (Mercury … Pluto). */
export const GALAXY_PLANETS = DESTINATIONS.filter((d) => d.kind === "planet");

/* True orbital radii span ~37u (Mercury) → ~3750u (Pluto): a 100:1 range that
   can't be framed together. Compress each planet's whole ellipse by a sqrt law
   so every helix reads in one shot (the DjSadhu look) while keeping the PHYSICS
   exact — true angular speed (inner faster), true eccentricity / inclination,
   true lead/trail. Uniformly scaling a Kepler ellipse keeps it a valid ellipse. */
const COMPRESS = 0.5;
const EARTH_TARGET = 70; // compressed scene-units for Earth's orbital radius
const K = EARTH_TARGET / Math.pow(getOrbit(DESTINATION_BY_ID.experience).R, COMPRESS);

/* Per-planet ellipse scale = Rc / R. Sun (R≈0) → 0 (stays on the apex line). */
const compressFor = (dest) => {
  const R = getOrbit(dest).R;
  return R < 1 ? 0 : K * Math.pow(R, COMPRESS - 1);
};

export const galaxyOrbitRadius = (dest) => K * Math.pow(getOrbit(dest).R, COMPRESS);
/* Outermost compressed radius — used to frame the camera. */
export const GALAXY_SPAN = Math.max(...GALAXY_PLANETS.map(galaxyOrbitRadius));

/* Advance per unit time, tuned so Earth gains ~PITCH_FACTOR orbit-diameters of
   forward travel each orbit: visible leaning coils, inner tight, outer
   stretched. */
const PITCH_FACTOR = 1.15;
const EARTH_PERIOD = (2 * Math.PI) / getOrbit(DESTINATION_BY_ID.experience).omega;
export const APEX_SPEED = (2 * EARTH_TARGET * PITCH_FACTOR) / EARTH_PERIOD;

/* Sun position along the apex axis at time t. */
export const sunPosition = (t, out) =>
  (out || new THREE.Vector3()).copy(APEX_AXIS).multiplyScalar(APEX_SPEED * t);

/* Helical world position of a planet at time t: its (compressed) ecliptic-frame
   orbit, tilted to the 60° windshield, plus the Sun's straight-line advance.
   Allocation-free when an `out` Vector3 is supplied. */
const _local = new THREE.Vector3();
export const helixPosition = (dest, t, out) => {
  orbitalPosition(dest, t, _local).multiplyScalar(compressFor(dest));
  _local.applyQuaternion(ECLIPTIC_TILT);
  return (out || new THREE.Vector3()).copy(_local).addScaledVector(APEX_AXIS, APEX_SPEED * t);
};

/* Per-planet trail extent + sample count. Inner planets show ~TRAIL_LOOPS tight
   coils; outer planets (huge periods) are capped to a bounded axial length so
   the helix bundle stays in frame, sampled just densely enough to read smooth. */
const TRAIL_LOOPS = 2.4;
const TRAIL_AXIAL_CAP = 2.4 * GALAXY_SPAN;
const SAMPLES_PER_LOOP = 44;
export const trailParams = (dest) => {
  const period = (2 * Math.PI) / getOrbit(dest).omega;
  const spanT = Math.min(TRAIL_LOOPS * period, TRAIL_AXIAL_CAP / APEX_SPEED);
  const loops = spanT / period;
  const samples = Math.max(40, Math.min(340, Math.round(loops * SAMPLES_PER_LOOP)));
  return { spanT, samples };
};

/* ── Verification helpers (headless galaxy test) ── */

/* Angle between the tilted ecliptic normal and the apex axis. MUST be 30°. */
export const tiltNormalDeg = () => {
  const n = new THREE.Vector3(0, 1, 0).applyQuaternion(ECLIPTIC_TILT);
  return THREE.MathUtils.radToDeg(Math.acos(THREE.MathUtils.clamp(n.dot(APEX_AXIS), -1, 1)));
};

/* Earth's signed forward offset (along the apex axis) relative to the Sun, at
   orbital-phase fraction f ∈ [0,1]. MUST change sign across an orbit (the
   planet leads, then trails) — proving the helix is NOT a flat comet tail. */
export const planetLeadAt = (dest, f, _p = new THREE.Vector3(), _s = new THREE.Vector3()) => {
  const T = (2 * Math.PI) / getOrbit(dest).omega;
  helixPosition(dest, f * T, _p);
  sunPosition(f * T, _s);
  return _p.sub(_s).dot(APEX_AXIS);
};
