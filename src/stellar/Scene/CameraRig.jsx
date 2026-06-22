/* eslint-disable react/no-unknown-property */
import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { DESTINATIONS } from "../config/destinations";

/*
 * Camera controller — Catmull-Rom spline through destinations + the
 * cinematic camera moves layered on top:
 *
 *   - Per-destination FOV (38° close-up → 60° wide). Interpolated
 *     across the spline so transitions zoom in/out naturally.
 *   - Push-in dolly: after the camera settles at a destination,
 *     ease forward along the look vector by ~10% over 1.4 s.
 *   - Wide pull-back mode (Z key): overrides position with a far
 *     system-view shot until released. Smooth in + out.
 */

const FOV_DEFAULT = 52;
const PUSH_IN_FACTOR = 0.06;   // 6% closer to lookAt — subtle, and keeps
                               // sun-backed shots (Earth) from pushing the
                               // sun's glow into frame
const PUSH_IN_DURATION = 1.4;  // seconds to ease into push
const SETTLE_THRESHOLD = 0.0005; // |dt| below which we consider "settled"
const SETTLE_DELAY = 0.4;       // wait before push starts
const WIDE_LERP = 0.04;         // wide-view ease speed

const WIDE_POSITION = new THREE.Vector3(0, 30, 80);
const WIDE_LOOK = new THREE.Vector3(20, 0, 0);
const WIDE_FOV = 32; // narrow FOV at distance compresses depth like a long lens

const CameraRig = ({
  scrollT,
  controlsEnabled,
  parallaxOffsetRef,
  freeRoamOffsetRef,
  freeRoamEnabled,
  wideRef,
}) => {
  const { camera, clock } = useThree();
  const lookAtTarget = useRef(new THREE.Vector3(0, 0, 0));
  const basePos = useRef(new THREE.Vector3());
  const tmpFwd = useRef(new THREE.Vector3());
  const tmpLook = useRef(new THREE.Vector3());

  /* Settle tracker for push-in dolly */
  const settledAt = useRef(0);
  const lastRawT = useRef(0);
  /* Damped current roll for dutch-tilt easing */
  const rollCurrent = useRef(0);

  /* Build splines once */
  const splines = useRef(null);
  if (!splines.current) {
    const camPoints = DESTINATIONS.map((d) => new THREE.Vector3(...d.cameraTarget.position));
    const lookPoints = DESTINATIONS.map((d) => new THREE.Vector3(...d.cameraTarget.lookAt));
    /* FOV curve: parallel to position/look so it interpolates smoothly
       along the same scroll t. We use a Spline through scalar values
       represented as Vector3 (x = fov). */
    const fovPoints = DESTINATIONS.map((d) => new THREE.Vector3(d.cameraTarget.fov ?? FOV_DEFAULT, 0, 0));
    /* Roll curve — camera Z rotation per destination for dutch-tilt
       drama on a couple of shots. Stored as x of a Vector3 so it rides
       the same Catmull-Rom machinery as fov. */
    const rollPoints = DESTINATIONS.map((d) => new THREE.Vector3(d.cameraTarget.roll ?? 0, 0, 0));
    splines.current = {
      cam: new THREE.CatmullRomCurve3(camPoints, false, "catmullrom", 0.4),
      look: new THREE.CatmullRomCurve3(lookPoints, false, "catmullrom", 0.4),
      fov: new THREE.CatmullRomCurve3(fovPoints, false, "catmullrom", 0.4),
      roll: new THREE.CatmullRomCurve3(rollPoints, false, "catmullrom", 0.4),
    };
  }

  /* Initial pose */
  useEffect(() => {
    const initial = DESTINATIONS[0].cameraTarget;
    camera.position.set(...initial.position);
    lookAtTarget.current.set(...initial.lookAt);
    camera.fov = initial.fov ?? FOV_DEFAULT;
    camera.updateProjectionMatrix();
    camera.lookAt(lookAtTarget.current);
  }, [camera]);

  useFrame(() => {
    if (controlsEnabled) return;
    const rawT = THREE.MathUtils.clamp(scrollT.current ?? 0, 0, 1);

    /* Settle detection — track scroll-T velocity to know when to push */
    const dt = Math.abs(rawT - lastRawT.current);
    lastRawT.current = rawT;
    if (dt > SETTLE_THRESHOLD) {
      settledAt.current = clock.elapsedTime;
    }

    /* Per-segment easing — easeOutCubic for snappy arrival */
    const segCount = DESTINATIONS.length - 1;
    const segT = rawT * segCount;
    const segIdx = Math.floor(segT);
    const innerT = THREE.MathUtils.clamp(segT - segIdx, 0, 1);
    const easedInner = 1 - Math.pow(1 - innerT, 3);
    const t = THREE.MathUtils.clamp((segIdx + easedInner) / segCount, 0, 1);

    /* Sample splines */
    const camP = splines.current.cam.getPoint(t);
    const lookP = splines.current.look.getPoint(t);
    const fovP = splines.current.fov.getPoint(t).x;
    const rollP = splines.current.roll.getPoint(t).x;

    /* Push-in dolly: once settled for > SETTLE_DELAY, ease camera
       forward along the look direction by up to PUSH_IN_FACTOR. */
    const settledFor = clock.elapsedTime - settledAt.current;
    const pushProgress = Math.max(0, Math.min(1, (settledFor - SETTLE_DELAY) / PUSH_IN_DURATION));
    /* easeOutQuad on push */
    const push = 1 - Math.pow(1 - pushProgress, 2);
    tmpFwd.current.copy(lookP).sub(camP).multiplyScalar(PUSH_IN_FACTOR * push);

    /* Composite the final base position */
    basePos.current.copy(camP).add(tmpFwd.current);
    if (parallaxOffsetRef?.current) {
      basePos.current.x += parallaxOffsetRef.current.x;
      basePos.current.y += parallaxOffsetRef.current.y;
    }
    if (freeRoamEnabled && freeRoamOffsetRef?.current) {
      basePos.current.add(freeRoamOffsetRef.current);
    }
    tmpLook.current.copy(lookP);

    /* Wide pull-back override (Z) — replace the target entirely with the
       fixed system-wide shot. (The old code lerped basePos toward wide
       each frame then reset it from the spline, so it never actually
       reached the wide position — the camera barely moved.) The slow
       per-frame camera lerp below eases the pull-back cinematically. */
    const wide = !!wideRef?.current;
    if (wide) {
      basePos.current.copy(WIDE_POSITION);
      tmpLook.current.copy(WIDE_LOOK);
    }

    /* Final camera mutation — wide uses a gentle lerp for a slow
       cinematic pull-back; free-roam snaps responsively; tour eases. */
    const posLerp = wide ? WIDE_LERP : (freeRoamEnabled ? 0.55 : 0.18);
    camera.position.lerp(basePos.current, posLerp);
    lookAtTarget.current.lerp(tmpLook.current, wide ? WIDE_LERP : 0.18);
    camera.lookAt(lookAtTarget.current);

    /* Dutch-tilt roll — applied after lookAt (which resets up to world
       up). Damped toward the target roll so it eases in/out. Disabled
       in free-roam + wide so they stay level. */
    const targetRoll = (freeRoamEnabled || wideRef?.current) ? 0 : rollP;
    rollCurrent.current += (targetRoll - rollCurrent.current) * 0.06;
    if (Math.abs(rollCurrent.current) > 0.0005) {
      camera.rotateZ(rollCurrent.current);
    }

    /* FOV interpolation — separate lerp from position so zooms feel
       distinct from pans. */
    const targetFov = wideRef?.current ? WIDE_FOV : fovP;
    const fovDelta = targetFov - camera.fov;
    if (Math.abs(fovDelta) > 0.02) {
      camera.fov += fovDelta * 0.08;
      camera.updateProjectionMatrix();
    }
  });

  return null;
};

export default CameraRig;
