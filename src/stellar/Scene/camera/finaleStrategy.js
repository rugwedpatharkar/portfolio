/*
 * §6.1 — finale strategy.
 *
 * When finaleT > 0 the tour transitions to the pull-back "Sun among its
 * local neighbourhood" pose. Handoff pose (last-destination camera) is
 * snapshotted the first frame the reveal engages so scrubbing back and
 * forth lands identically.
 *
 * Returns true if the strategy took the frame (caller should return
 * without running scroll/focus/jump).
 */
import * as THREE from "three";
import { FINALE_CAM } from "./util";

export function runFinaleStrategy(ctx) {
  const { camera, lookAtTarget, finaleActive, finaleFrom, finale, finaleT, scratch } = ctx;
  const fT = finaleT ? THREE.MathUtils.clamp(finaleT.current ?? 0, 0, 1) : (finale ? 1 : 0);
  if (fT === 0) {
    finaleActive.current = false; // scrubbed back into the tour → release handoff
    return false;
  }
  if (!finaleActive.current) {
    finaleActive.current = true;
    finaleFrom.current.pos.copy(camera.position);
    finaleFrom.current.look.copy(lookAtTarget.current);
  }
  /* Hold at the handoff pose while the solar system fades to black in the
     first half, then travel to FINALE_CAM during the reveal — so the camera
     never flies visibly through the fading system. */
  const e = THREE.MathUtils.smoothstep(fT, 0.5, 1.0);
  camera.position.lerpVectors(finaleFrom.current.pos, FINALE_CAM, e);
  scratch._lookTarget.set(0, 0, 0);
  lookAtTarget.current.lerpVectors(finaleFrom.current.look, scratch._lookTarget, e);
  camera.lookAt(lookAtTarget.current);
  if (Math.abs(camera.fov - 60) > 0.05) {
    camera.fov += (60 - camera.fov) * (0.5 * e + 0.05);
    camera.updateProjectionMatrix();
  }
  return true;
}
