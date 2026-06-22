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

/* All lerp constants below are expressed as the alpha they'd use AT
   60fps. fAlpha() rescales them by real delta-time so the camera feel
   is identical on 30/60/144Hz displays (the previous fixed-alpha lerps
   moved 2.4× faster on a 144Hz screen). */
const POS_LERP_60 = 0.12;   // tour position settle
const LOOK_LERP_60 = 0.15;  // aim lags position slightly → lead-in feel
const FOV_LERP_60 = 0.14;   // zoom resolves with arrival, not after
const ROLL_LERP_60 = 0.05;  // dutch-tilt ease
const WIDE_LERP_60 = 0.09;  // wide pull-back ease (was a sluggish 0.04)
const FREEROAM_LERP_60 = 0.55;

/* Orbital sway — a slow cinematic drift around the planet once the
   camera settles, so each stop feels like a living "shot" instead of a
   frozen frame. ~±2.5° azimuth + a tiny vertical bob, eased in. */
const SWAY_AZIMUTH = 0.045;  // radians (~2.6°)
const SWAY_BOB = 0.05;       // world units
const SWAY_SPEED = 0.16;

const WIDE_POSITION = new THREE.Vector3(0, 30, 80);
const WIDE_LOOK = new THREE.Vector3(20, 0, 0);
const WIDE_FOV = 32; // narrow FOV at distance compresses depth like a long lens

/* Module scratch — avoids per-frame allocation in the sway math. */
const _offset = new THREE.Vector3();
const UP = new THREE.Vector3(0, 1, 0);

/* Frame-rate-independent lerp alpha. base is the alpha you'd want at
   60fps; this rescales it for the actual frame delta. */
const fAlpha = (base, dt) => 1 - Math.pow(1 - base, dt * 60);

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

  useFrame((_, dt) => {
    if (controlsEnabled) return;
    /* Guard against huge dt after a tab-switch / pause so the camera
       doesn't teleport on the first frame back. */
    const d = Math.min(dt || 1 / 60, 1 / 20);
    const rawT = THREE.MathUtils.clamp(scrollT.current ?? 0, 0, 1);

    /* Settle detection — track scroll-T velocity to know when to push */
    const vel = Math.abs(rawT - lastRawT.current);
    lastRawT.current = rawT;
    if (vel > SETTLE_THRESHOLD) {
      settledAt.current = clock.elapsedTime;
    }

    /* Raw per-segment t — NO easeOutCubic here anymore. The old code
       eased the spline param AND lerped the camera, so velocity was
       discontinuous at every destination boundary (a jerk ×11). The
       single delta-time camera lerp below now owns all the easing. */
    const segCount = DESTINATIONS.length - 1;
    const segT = rawT * segCount;
    const segIdx = Math.floor(segT);
    const innerT = THREE.MathUtils.clamp(segT - segIdx, 0, 1);
    const t = THREE.MathUtils.clamp((segIdx + innerT) / segCount, 0, 1);

    /* Sample splines */
    const camP = splines.current.cam.getPoint(t);
    const lookP = splines.current.look.getPoint(t);
    const fovP = splines.current.fov.getPoint(t).x;
    const rollP = splines.current.roll.getPoint(t).x;

    const settledFor = clock.elapsedTime - settledAt.current;

    /* Push-in dolly: once settled, ease camera forward along the look
       direction by up to PUSH_IN_FACTOR (easeOutQuad). */
    const pushProgress = Math.max(0, Math.min(1, (settledFor - SETTLE_DELAY) / PUSH_IN_DURATION));
    const push = 1 - Math.pow(1 - pushProgress, 2);
    tmpFwd.current.copy(lookP).sub(camP).multiplyScalar(PUSH_IN_FACTOR * push);

    /* Composite base position = spline point + push-in */
    basePos.current.copy(camP).add(tmpFwd.current);

    /* Orbital sway — once settled, slowly arc the camera around the
       planet + a gentle vertical bob. Eased in over ~1.5s so it starts
       only after arrival. This is the "living tour" motion. */
    const swayEase = THREE.MathUtils.clamp((settledFor - SETTLE_DELAY) / 1.5, 0, 1);
    if (swayEase > 0.001) {
      const e = clock.elapsedTime;
      const az = Math.sin(e * SWAY_SPEED) * SWAY_AZIMUTH * swayEase;
      _offset.copy(basePos.current).sub(lookP);
      _offset.applyAxisAngle(UP, az);
      basePos.current.copy(lookP).add(_offset);
      basePos.current.y += Math.sin(e * SWAY_SPEED * 0.7 + 1.3) * SWAY_BOB * swayEase;
    }

    if (parallaxOffsetRef?.current) {
      basePos.current.x += parallaxOffsetRef.current.x;
      basePos.current.y += parallaxOffsetRef.current.y;
    }
    if (freeRoamEnabled && freeRoamOffsetRef?.current) {
      basePos.current.add(freeRoamOffsetRef.current);
    }
    tmpLook.current.copy(lookP);

    /* Wide pull-back override (Z) — replace the target with the fixed
       system-wide shot; the gentle wide lerp eases the pull-back. */
    const wide = !!wideRef?.current;
    if (wide) {
      basePos.current.copy(WIDE_POSITION);
      tmpLook.current.copy(WIDE_LOOK);
    }

    /* Final camera mutation — all delta-time normalized. */
    const posBase = wide ? WIDE_LERP_60 : (freeRoamEnabled ? FREEROAM_LERP_60 : POS_LERP_60);
    const lookBase = wide ? WIDE_LERP_60 : LOOK_LERP_60;
    camera.position.lerp(basePos.current, fAlpha(posBase, d));
    lookAtTarget.current.lerp(tmpLook.current, fAlpha(lookBase, d));
    camera.lookAt(lookAtTarget.current);

    /* Dutch-tilt roll — applied after lookAt (which resets up to world
       up). Disabled in free-roam + wide so they stay level. */
    const targetRoll = (freeRoamEnabled || wide) ? 0 : rollP;
    rollCurrent.current += (targetRoll - rollCurrent.current) * fAlpha(ROLL_LERP_60, d);
    if (Math.abs(rollCurrent.current) > 0.0005) {
      camera.rotateZ(rollCurrent.current);
    }

    /* FOV — delta-time lerp so the zoom resolves with the arrival. */
    const targetFov = wide ? WIDE_FOV : fovP;
    const fovDelta = targetFov - camera.fov;
    if (Math.abs(fovDelta) > 0.02) {
      camera.fov += fovDelta * fAlpha(FOV_LERP_60, d);
      camera.updateProjectionMatrix();
    }
  });

  return null;
};

export default CameraRig;
