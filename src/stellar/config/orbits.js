import * as THREE from "three";
import { PLANET_DATA } from "./planetData";

/*
 * Orbital revolution for the "living system".
 *
 * Every PLANET revolves around the sun; the sun (centre), the asteroid /
 * Kuiper belts (already rings) and the edge beacon stay put. Each planet's
 * orbit is derived from its authored position so t=0 reproduces the exact
 * hand-tuned layout, then it drifts from there.
 *
 * Speed follows Kepler's third law (inner planets faster, ω ∝ R^-1.5), scaled
 * to a slow cinematic pace. Orbits are ELLIPTICAL with the Sun at a focus and
 * tilted by each planet's real INCLINATION — the semi-latus rectum is chosen so
 * the authored point still lies on the ellipse (layout preserved at t=0). The
 * tour camera TRACKS the live position (see CameraRig), so framing follows.
 */

const SPEED_BASE = 0.6;
const DEG = Math.PI / 180;

const _cache = new Map();

export const getOrbit = (dest) => {
  const cached = _cache.get(dest.id);
  if (cached) return cached;
  const [x, y, z] = dest.position;
  const R = Math.hypot(x, z);
  const theta0 = Math.atan2(z, x);
  const omega = dest.kind === "planet" && R > 0.01 ? SPEED_BASE / Math.pow(R, 1.5) : 0;
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
