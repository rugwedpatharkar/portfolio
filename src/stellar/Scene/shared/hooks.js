/*
 * §7 / Phase 6 — shared runtime helpers.
 *
 * nearCamera(camera, position, threshold)
 *   Squared-distance gate for expensive per-frame work on far anomalies.
 *   Uses distanceToSquared to avoid the sqrt on the hot path.
 *
 *   Contract: pass `position` as a Vector3 (memoize with useMemo at the
 *   caller — avoids allocating per frame). Threshold in scene units.
 *
 *   Guidance:
 *   - Only gate the EXPENSIVE parts of a useFrame body (lookAts, matrix
 *     writes, per-frame math). Keep cheap uniform updates ungated so the
 *     shader clock stays in sync with the shared SceneClock — otherwise
 *     the animation jumps forward when the gate re-opens.
 *   - Threshold sized so a body is fully invisible to the tour camera at
 *     that distance (the tour camera framings and orbital radii; 250-350u
 *     is usually right for the deep-field anomalies).
 *   - Skip this for anomalies that publish shared state (moon world pos,
 *     eclipse hooks, etc.) — the gate would starve their consumers.
 *
 *   Usage:
 *     import { useMemo } from "react";
 *     import { nearCamera } from "../shared/hooks";
 *     const POS = useMemo(() => new THREE.Vector3(...placeInFrontOfSun([...])), []);
 *     useFrame(({ camera }) => {
 *       // ... cheap uniform sync (unconditional) ...
 *       if (!nearCamera(camera, POS, 300)) return;
 *       // ... expensive per-frame math (gated) ...
 *     });
 */
export function nearCamera(camera, position, threshold) {
  const px = Array.isArray(position) ? position[0] : position.x;
  const py = Array.isArray(position) ? position[1] : position.y;
  const pz = Array.isArray(position) ? position[2] : position.z;
  const dx = camera.position.x - px;
  const dy = camera.position.y - py;
  const dz = camera.position.z - pz;
  return dx * dx + dy * dy + dz * dz < threshold * threshold;
}
