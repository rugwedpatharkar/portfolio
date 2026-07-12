/*
 * §6.1 — jump strategy.
 *
 * Hyperspace fly-through on nav to a new focus target. Standoff dips
 * toward the flight line mid-hop (first-person), streaks + FOV peak,
 * then settles back BEHIND the destination — a 3rd → 1st → 3rd journey.
 *
 * Two responsibilities in one file because they share the jump ref:
 *   - detect a new hop and start the jump (arm the ref)
 *   - drive the active jump each frame (return true if handled)
 *
 * Returns true when the active jump handled the frame (caller returns
 * without settle-lerp).
 */
import * as THREE from "three";
import { orbitalPosition, laneObjectPosition } from "../../config/orbits";
import { DEST_BY_ID } from "./focusStrategy";
import {
  UP,
  UP_FRAC,
  LOOK_FRAC,
  FIRST_FRAC,
  FOV_FLY,
  BACKLIT_FOV,
  hump,
} from "./util";

export function maybeStartJump(ctx) {
  const { camera, t, jump, snap, lastDir, focusBack, focusRef, scratch } = ctx;
  const focus = focusRef?.current || null;
  const jmpKey = focus && focus.live && focus.target ? `${focus.target.destId}:${focus.target.k}` : "";
  if (jmpKey && jmpKey !== jump.current.lastKey && !jump.current.active) {
    jump.current.lastKey = jmpKey;
    if (!snap && focus.from) {
      const J = jump.current;
      J.toBody.copy(scratch._p);
      const frm = DEST_BY_ID[focus.from.destId];
      if (frm) {
        if (focus.from.k >= 0) laneObjectPosition(frm, focus.from.k, t, J.fromBody);
        else orbitalPosition(frm, t, J.fromBody);
      } else {
        J.fromBody.copy(camera.position);
      }
      J.dir.copy(lastDir.current);
      J.back = focusBack.current;
      J.fov = focus.fov || BACKLIT_FOV;
      const dist = J.fromBody.distanceTo(J.toBody);
      J.active = true;
      J.elapsed = 0;
      J.dur = THREE.MathUtils.clamp(0.5 + dist * 0.016, 0.55, 2.6);
      J.intensity = THREE.MathUtils.clamp(dist * 0.06, 0.22, 1.5);
    }
  }
}

export function runJumpStrategy(ctx) {
  const { camera, lookAtTarget, t, dt, jump, warpVelRef, setFlying, focusRef, scratch } = ctx;
  if (!jump.current.active) return false;
  const focus = focusRef?.current || null;
  const J = jump.current;
  /* Advance on REAL delta (not the orbit-tracking clamped `d`). */
  J.elapsed += Math.min(dt || 1 / 60, 0.25);
  const e = THREE.MathUtils.clamp(J.elapsed / J.dur, 0, 1);
  const ee = e * e * (3 - 2 * e);
  const h = hump(e);
  /* Re-fetch endpoints from live orbital position each frame — Mercury moves
     ~1.6 su during a 1s hop, so a jump-start snapshot goes stale. */
  const jT = focus?.target ? DEST_BY_ID[focus.target.destId] : null;
  if (jT) {
    if (focus.target.k >= 0) laneObjectPosition(jT, focus.target.k, t, J.toBody);
    else orbitalPosition(jT, t, J.toBody);
  }
  const jF = focus?.from ? DEST_BY_ID[focus.from.destId] : null;
  if (jF) {
    if (focus.from.k >= 0) laneObjectPosition(jF, focus.from.k, t, J.fromBody);
    else orbitalPosition(jF, t, J.fromBody);
  }
  scratch._p.copy(J.fromBody).lerp(J.toBody, ee);
  const back = J.back * (1 - h * (1 - FIRST_FRAC));
  scratch._upp.copy(UP).addScaledVector(J.dir, -UP.dot(J.dir));
  if (scratch._upp.lengthSq() < 1e-6) scratch._upp.set(0, 1, 0); else scratch._upp.normalize();
  camera.position.copy(scratch._p).addScaledVector(J.dir, -back).addScaledVector(scratch._upp, back * UP_FRAC * (1 - h * 0.7));
  lookAtTarget.current.copy(scratch._p).addScaledVector(J.dir, back * LOOK_FRAC);
  camera.lookAt(lookAtTarget.current);
  /* FOV punch softened to a hair (was → FOV_FLY 64, a "warp whoosh"). The
     visitor wants plain smooth travel between planets, not a hyperspace jump —
     so the camera still swoops body→body (the dolly + first-person dip above)
     but without the wide-angle lunge. */
  const fv = J.fov + (FOV_FLY - J.fov) * h * 0.18;
  if (Math.abs(camera.fov - fv) > 0.01) { camera.fov = fv; camera.updateProjectionMatrix(); }
  /* Hyperspace streak tunnel + glare REMOVED from planet travel — keep
     warpVelRef at 0 so neither Hyperspace nor StellarGlare fire. */
  if (warpVelRef) warpVelRef.current = 0;
  setFlying(h > 0.12);
  if (e >= 1) { J.active = false; if (warpVelRef) warpVelRef.current = 0; setFlying(false); }
  return true;
}
