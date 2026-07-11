/*
 * §6.1 — scroll strategy.
 *
 * Hybrid glide: continuous position along the destination chain with an
 * eased DWELL at each planet. Blends between segment endpoints; per-frame
 * live orbital tracking so planets stay framed as they revolve.
 *
 * Writes into scratch._camTarget + scratch._lookTarget and returns the
 * blended {fovTarget, rollTarget} — the caller layers focus + parallax +
 * jump + settle-lerp on top before writing camera.position/lookAt.
 */
import * as THREE from "three";
import { getOrbit, orbitalPosition } from "../../config/orbits";
import { DESTINATIONS } from "../../config/destinations";
import {
  UP,
  dwellEase,
  PUSH_DUR,
  PUSH_AMOUNT,
  BACKLIT_HALF_ANGLE,
  BACKLIT_TILT,
  BACKLIT_MARGIN,
  BACKLIT_FOV,
} from "./util";

export function runScrollStrategy(ctx) {
  const { rawT, t, d, dwellTime, lastPos, frames, scratch } = ctx;
  const N = DESTINATIONS.length;
  const pos = rawT * (N - 1);
  const i = Math.min(N - 2, Math.max(0, Math.floor(pos)));
  const fe = dwellEase(pos - i);

  /* Travel speed — drives banking + the settle detector below. */
  const posVel = (pos - lastPos.current) / d;
  lastPos.current = pos;
  /* Slow push-in: ease closer once the scroll settles on a body, then hold;
     reset while gliding. */
  const settled = Math.abs(posVel) < 0.05;
  dwellTime.current = settled
    ? Math.min(dwellTime.current + d, PUSH_DUR)
    : Math.max(0, dwellTime.current - d * 3);
  const pe = dwellTime.current / PUSH_DUR;
  const dollyFactor = 1 - PUSH_AMOUNT * (pe * pe * (3 - 2 * pe));

  const blendFrame = (j, outPos, outLook) => {
    const dst = DESTINATIONS[j];
    const fr = frames.current[j];
    orbitalPosition(dst, t, scratch._p);
    if (dst.kind === "planet") {
      /* Backlit hero pose, computed from the planet's LIVE position so it
         tracks the orbit and always sits anti-sun. Look at the planet centre;
         the Sun (origin) sits just past the top limb. */
      scratch._radial.copy(scratch._p).normalize();
      scratch._upp.copy(UP).addScaledVector(scratch._radial, -UP.dot(scratch._radial)).normalize();
      scratch._dir
        .copy(scratch._radial)
        .multiplyScalar(Math.cos(BACKLIT_TILT))
        .addScaledVector(scratch._upp, Math.sin(BACKLIT_TILT))
        .normalize();
      /* Signature scale: giants fill more of the frame, small worlds sit smaller. */
      const heroHalf = THREE.MathUtils.clamp(
        BACKLIT_HALF_ANGLE * (1 + 0.13 * Math.log2(dst.radius / 0.18)),
        BACKLIT_HALF_ANGLE * 0.85,
        BACKLIT_HALF_ANGLE * 1.22
      );
      const D = (dst.radius / Math.tan(heroHalf)) * BACKLIT_MARGIN * dollyFactor;
      outPos.copy(scratch._p).addScaledVector(scratch._dir, D);
      outLook.copy(scratch._p);
      return { fov: BACKLIT_FOV, roll: 0 };
    }
    /* Sun + Edge Beacon keep their authored framing, orbit-rotated. */
    const dl = getOrbit(dst).omega * t;
    scratch._po.copy(fr.posOffset).applyAxisAngle(UP, dl);
    scratch._lo.copy(fr.lookOffset).applyAxisAngle(UP, dl);
    outPos.copy(scratch._p).add(scratch._po);
    outLook.copy(scratch._p).add(scratch._lo);
    return fr;
  };

  const frA = blendFrame(i, scratch._camA, scratch._lookA);
  const frB = blendFrame(i + 1, scratch._camB, scratch._lookB);
  scratch._camTarget.copy(scratch._camA).lerp(scratch._camB, fe);
  scratch._lookTarget.copy(scratch._lookA).lerp(scratch._lookB, fe);
  const fovTarget = frA.fov + (frB.fov - frA.fov) * fe;
  const rollTarget = frA.roll + (frB.roll - frA.roll) * fe;

  return { fovTarget, rollTarget, posVel };
}
