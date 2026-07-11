/*
 * §6.1 — focus strategy.
 *
 * Handles both the live-focus branch (nav to a body — direction-aware
 * 3rd-person framing anti-hop) and the fallback for a static focus pose
 * (dead-set position + lookAt). Then applies frameShift for non-focus /
 * overview and layers parallax on top.
 *
 * Precedence: focus (nav to a body) > scroll framing. If focus is set,
 * overwrites scratch._camTarget + scratch._lookTarget. Also updates
 * lastDir + focusBack refs so a subsequent jump can read them.
 *
 * Returns { focus, focused } — the caller uses `focus` for lerp-alpha
 * selection (live vs static) and `focused` to skip banking.
 */
import * as THREE from "three";
import { orbitalPosition, laneObjectPosition } from "../../config/orbits";
import { DESTINATIONS } from "../../config/destinations";
import {
  UP,
  FOCUS_DIST,
  BACKLIT_HALF_ANGLE,
  BACK_FLOOR,
  UP_FRAC,
  FRAME_DOLLY,
  PARALLAX_FRAC,
  visualExtentFor,
  backDistFor,
  V3_HALF_ANGLE,
  V3_BACK_FLOOR,
  V3_VSHIFT,
  v3ExtentFor,
} from "./util";

const DEST_BY_ID = Object.fromEntries(DESTINATIONS.map((d) => [d.id, d]));

export function runFocusStrategy(ctx, { fovTarget }) {
  const { camera, t, focusRef, parallaxOffsetRef, frameShift, v3, lastDir, focusBack, scratch } = ctx;
  const focus = focusRef?.current || null;

  if (focus) {
    if (focus.live && focus.target) {
      const tgt = DEST_BY_ID[focus.target.destId];
      if (tgt) {
        const k = focus.target.k;
        if (k >= 0) laneObjectPosition(tgt, k, t, scratch._p);
        else orbitalPosition(tgt, t, scratch._p);
        let haveDir = false;
        if (focus.from) {
          const frm = DEST_BY_ID[focus.from.destId];
          if (frm) {
            if (focus.from.k >= 0) laneObjectPosition(frm, focus.from.k, t, scratch._po);
            else orbitalPosition(frm, t, scratch._po);
            scratch._dir.copy(scratch._p).sub(scratch._po);
            if (scratch._dir.lengthSq() > 1e-6) { scratch._dir.normalize(); haveDir = true; }
          }
        }
        if (!haveDir) scratch._dir.copy(lastDir.current);
        lastDir.current.copy(scratch._dir);
        scratch._upp.copy(UP).addScaledVector(scratch._dir, -UP.dot(scratch._dir));
        if (scratch._upp.lengthSq() < 1e-6) scratch._upp.set(0, 1, 0); else scratch._upp.normalize();
        let D = k >= 0 ? FOCUS_DIST : backDistFor(v3 ? v3ExtentFor(tgt) : visualExtentFor(tgt), v3 ? V3_HALF_ANGLE : BACKLIT_HALF_ANGLE, v3 ? V3_BACK_FLOOR : BACK_FLOOR);
        if (frameShift && k < 0) D *= 1 + frameShift * (v3 ? 0.1 : 0.25);
        focusBack.current = D;
        scratch._camTarget.copy(scratch._p).addScaledVector(scratch._dir, -D).addScaledVector(scratch._upp, D * UP_FRAC);
        scratch._lookTarget.copy(scratch._p);
        if (frameShift && k < 0) {
          scratch._viewDir.copy(scratch._lookTarget).sub(scratch._camTarget);
          const dd = scratch._viewDir.length() || 1;
          scratch._viewDir.divideScalar(dd);
          scratch._right.crossVectors(scratch._viewDir, UP).normalize();
          const halfW = Math.tan(THREE.MathUtils.degToRad((focus.fov || 42) * 0.5)) * dd * camera.aspect;
          scratch._lookTarget.addScaledVector(scratch._right, -halfW * frameShift * 1.0);
          const halfH = Math.tan(THREE.MathUtils.degToRad((focus.fov || 42) * 0.5)) * dd;
          scratch._lookTarget.addScaledVector(scratch._upp, -halfH * V3_VSHIFT);
        }
      }
    } else {
      scratch._camTarget.set(focus.position[0], focus.position[1], focus.position[2]);
      scratch._lookTarget.set(focus.lookAt[0], focus.lookAt[1], focus.lookAt[2]);
    }
  }

  /* Overview (idx-0) subject to RIGHT of centre when no focus is set. */
  if (!focus && frameShift) {
    scratch._viewDir.copy(scratch._camTarget).sub(scratch._lookTarget);
    scratch._camTarget.copy(scratch._lookTarget).addScaledVector(scratch._viewDir, FRAME_DOLLY);
    scratch._viewDir.copy(scratch._lookTarget).sub(scratch._camTarget);
    const dist = scratch._viewDir.length() || 1;
    scratch._viewDir.divideScalar(dist);
    scratch._right.crossVectors(scratch._viewDir, UP).normalize();
    const halfW = Math.tan(THREE.MathUtils.degToRad(fovTarget * 0.5)) * dist * camera.aspect;
    scratch._lookTarget.addScaledVector(scratch._right, -halfW * frameShift * 0.5);
  }

  /* Pointer parallax. */
  if ((!focus || v3) && parallaxOffsetRef?.current) {
    scratch._viewDir.copy(scratch._lookTarget).sub(scratch._camTarget);
    const fd = scratch._viewDir.length() || 1;
    scratch._viewDir.divideScalar(fd);
    scratch._right.crossVectors(scratch._viewDir, UP).normalize();
    scratch._up2.crossVectors(scratch._right, scratch._viewDir).normalize();
    const s = fd * PARALLAX_FRAC;
    scratch._camTarget
      .addScaledVector(scratch._right, parallaxOffsetRef.current.x * s)
      .addScaledVector(scratch._up2, parallaxOffsetRef.current.y * s);
  }

  return { focus };
}

export { DEST_BY_ID };
