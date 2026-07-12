import * as THREE from "three";
import { PLANET_DATA } from "./planetData";
import { PERIOD } from "../data/ephemeris";

/*
 * Orbital revolution for the "living system".
 *
 * Every PLANET revolves around the sun; the sun (centre), the asteroid /
 * Kuiper belts (already rings) and the edge beacon stay put. Each planet's
 * orbit is derived from its authored position so t=0 reproduces the exact
 * hand-tuned layout, then it drifts from there.
 *
 * Speed uses each planet's REAL orbital period (ephemeris.js PERIOD) so the
 * relative rates are accurate — Mercury (0.24 yr) zips, Neptune (164.8 yr)
 * crawls, in the true ratio — time-accelerated so Earth completes an orbit in
 * ~EARTH_ORBIT_SEC. (The earlier ω ∝ R^-1.5 used the COMPRESSED scene distance,
 * so its ratios were wrong.) Orbits are ELLIPTICAL with the Sun at a focus and
 * tilted by each planet's real INCLINATION — the semi-latus rectum is chosen so
 * the authored point still lies on the ellipse (layout preserved at t=0). The
 * tour camera TRACKS the live position (see CameraRig), so framing follows.
 */

const SPEED_BASE = 0.6; // legacy R^-1.5 fallback for planets with no PERIOD entry
const DEG = Math.PI / 180;
const TWO_PI = Math.PI * 2;
/* At clock.scale = 1, Earth (period 1.0 yr) completes an orbit in ~EARTH_ORBIT_SEC;
   every other planet follows from its real period. ω = 2π · yr-per-second / period.
   NOTE: this must stay SLOW enough that a planet doesn't out-run the eased tracking
   camera and drift out of frame while you read its panel — at 45 s the inner planets
   (Mercury ~11 s!) lapped the Sun and vanished off-screen. 600 s ≈ the old
   proven-framable pace (Mercury ~144 s); the "alive" motion is carried by the Sun's
   churn + axial spin + orbiting moons, not by planets racing around their orbits. */
const EARTH_ORBIT_SEC = 600;
const YEARS_PER_SECOND = 1 / EARTH_ORBIT_SEC;

const _cache = new Map();

export const getOrbit = (dest) => {
  const cached = _cache.get(dest.id);
  if (cached) return cached;
  const [x, y, z] = dest.position;
  const R = Math.hypot(x, z);
  const theta0 = Math.atan2(z, x);
  /* Real-period ω when we have it; else the legacy Kepler-on-scene-R fallback. */
  const omega =
    dest.kind !== "planet" || R <= 0.01
      ? 0
      : PERIOD[dest.id]
        ? (TWO_PI * YEARS_PER_SECOND) / PERIOD[dest.id]
        : SPEED_BASE / Math.pow(R, 1.5);
  const d = PLANET_DATA[dest.id] || {};
  const e = d.eccentricity || 0;
  const inc = (d.inclination || 0) * DEG;
  /* Semi-latus rectum so the conic r = p/(1+e·cosθ) passes through R at θ0. */
  const p = R * (1 + e * Math.cos(theta0));
  const orbit = { R, theta0, omega, y, e, p, sinInc: Math.sin(inc), cosInc: Math.cos(inc) };
  _cache.set(dest.id, orbit);
  return orbit;
};

/* World position of a body at time t. Writes into `out` (a THREE.Vector3)
   to avoid per-frame allocation; pass one in from a module scratch. */
export const orbitalPosition = (dest, t, out) => {
  const { theta0, omega, y, e, p, sinInc, cosInc } = getOrbit(dest);
  const th = theta0 + omega * t;
  const r = e ? p / (1 + e * Math.cos(th)) : p; // ellipse (Sun at focus); circle when e=0
  const xp = Math.cos(th) * r;
  const zp = Math.sin(th) * r;
  return (out || new THREE.Vector3()).set(xp, y + zp * sinInc, zp * cosInc);
};

const LANE_ARC = 2.8; // scene-units between co-orbital lane objects — spaced out so
//                       you hyperloop-jump between them rather than drift

/* World position on `dest`'s orbit at an arbitrary orbital angle `th`. */
export const positionAtAngle = (dest, th, out) => {
  const { y, e, p, sinInc, cosInc } = getOrbit(dest);
  const r = e ? p / (1 + e * Math.cos(th)) : p;
  const zp = Math.sin(th) * r;
  return (out || new THREE.Vector3()).set(Math.cos(th) * r, y + zp * sinInc, zp * cosInc);
};

/* World position of the k-th résumé object on `dest`'s lane at time t — a
   co-orbital convoy trailing the planet by a uniform arc, so ←→ is a short
   glide with the next object already in view. */
export const laneObjectPosition = (dest, k, t, out) => {
  const o = getOrbit(dest);
  const gap = o.R > 0.01 ? LANE_ARC / o.R : 0.05;
  const th = o.theta0 + o.omega * t - (k + 1) * gap;
  return positionAtAngle(dest, th, out);
};
