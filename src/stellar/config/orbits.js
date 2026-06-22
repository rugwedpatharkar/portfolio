import * as THREE from "three";

/*
 * Orbital revolution for the "living system".
 *
 * Every PLANET revolves around the sun; the sun (centre), the asteroid /
 * Kuiper belts (already rings) and the edge beacon stay put. Each planet's
 * orbit is derived from its authored position so t=0 reproduces the exact
 * hand-tuned layout, then it drifts from there.
 *
 * Speed follows a gentle Kepler-ish law (inner planets faster, ω ∝ R^-1.5)
 * but scaled to a slow cinematic pace: the tour camera TRACKS the active
 * planet (see CameraRig), so a parked viewer sees the starfield + sun sweep
 * behind a still-framed planet rather than a dizzy spin. In the pulled-back
 * system view the whole system visibly turns over time.
 */

const SPEED_BASE = 0.6;

const _cache = new Map();

export const getOrbit = (dest) => {
  const cached = _cache.get(dest.id);
  if (cached) return cached;
  const [x, y, z] = dest.position;
  const R = Math.hypot(x, z);
  const theta0 = Math.atan2(z, x);
  const omega = dest.kind === "planet" && R > 0.01 ? SPEED_BASE / Math.pow(R, 1.5) : 0;
  const orbit = { R, theta0, omega, y };
  _cache.set(dest.id, orbit);
  return orbit;
};

/* World position of a body at time t. Writes into `out` (a THREE.Vector3)
   to avoid per-frame allocation; pass one in from a module scratch. */
export const orbitalPosition = (dest, t, out) => {
  const { R, theta0, omega, y } = getOrbit(dest);
  const a = theta0 + omega * t;
  return (out || new THREE.Vector3()).set(Math.cos(a) * R, y, Math.sin(a) * R);
};
