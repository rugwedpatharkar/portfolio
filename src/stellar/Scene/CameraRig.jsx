/* eslint-disable react/no-unknown-property */
import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { DESTINATIONS } from "../config/destinations";
import { getOrbit, orbitalPosition } from "../config/orbits";

/*
 * Camera controller — SNAP + live-orbit tracking.
 *
 * The scroll position selects the NEAREST destination (round), so the
 * camera is always framed on a planet at its authored distance and never
 * parked between two or "inside" one — a small scroll past the midpoint
 * snaps cleanly to the next planet.
 *
 * Each planet revolves around the sun (see config/orbits). The framing is
 * stored as an OFFSET from the planet; every frame we take the planet's
 * LIVE position and rotate that offset by the same orbital angle, so the
 * whole shot rigidly tracks the planet: it stays perfectly composed while
 * the sun + starfield + other planets sweep behind it (the "living
 * system" tracking shot). For the sun / belts / beacon (ω = 0) this
 * reduces to the original static framing.
 *
 * Layered on top: pointer parallax, camera shake, free-roam, the wide
 * pull-back (Z), per-destination FOV + dutch-tilt roll. All eases are
 * delta-time normalized so the feel matches on 30/60/144Hz.
 */

const FOV_DEFAULT = 52;

/* Lerp alphas expressed @60fps; fAlpha rescales for real delta. Look
   tracks a hair tighter than position so the orbiting planet stays
   centred (tracking a moving target with a proportional lerp lags a
   little; a tighter aim keeps that lag invisible). */
const POS_LERP_60 = 0.11;
const LOOK_LERP_60 = 0.17;
const FOV_LERP_60 = 0.12;
const ROLL_LERP_60 = 0.05;
const WIDE_LERP_60 = 0.09;
const FREEROAM_LERP_60 = 0.55;

const WIDE_POSITION = new THREE.Vector3(0, 34, 86);
const WIDE_LOOK = new THREE.Vector3(20, 0, 0);
const WIDE_FOV = 34;

/* Cinematic launch (intro): a far, oblique establishing shot of the whole
   tilted system, then an accelerating warp-dive into Sol. */
const ESTABLISH_POS = new THREE.Vector3(-22, 34, 78);
const ESTABLISH_LOOK = new THREE.Vector3(22, -2, -4);
const ESTABLISH_FOV = 30;
const ESTABLISH_DUR = 2.2; // seconds — pull back + reveal
const WARP_DUR = 1.15; // seconds — dive into Sol
const SOL_CAM = DESTINATIONS[0].cameraTarget;
const SOL_POS = new THREE.Vector3(...SOL_CAM.position);
const SOL_LOOK = new THREE.Vector3(...SOL_CAM.lookAt);
const SOL_FOV = SOL_CAM.fov ?? FOV_DEFAULT;

const UP = new THREE.Vector3(0, 1, 0);
const _p = new THREE.Vector3();
const _po = new THREE.Vector3();
const _lo = new THREE.Vector3();
const _camTarget = new THREE.Vector3();
const _lookTarget = new THREE.Vector3();

const fAlpha = (base, dt) => 1 - Math.pow(1 - base, dt * 60);

const CameraRig = ({
  scrollT,
  controlsEnabled,
  parallaxOffsetRef,
  freeRoamOffsetRef,
  freeRoamEnabled,
  wideRef,
  launchPhase,
}) => {
  const { camera, clock } = useThree();
  const lookAtTarget = useRef(new THREE.Vector3(0, 0, 0));
  const rollCurrent = useRef(0);
  /* Launch state — captures the from-pose at each phase change so the
     scripted establish/warp moves are deterministic and smooth. */
  const launch = useRef({ phase: null, t0: 0, fromPos: new THREE.Vector3(), fromLook: new THREE.Vector3(), fromFov: FOV_DEFAULT });

  /* Per-destination framing offsets (camera + aim relative to the planet),
     captured once from the authored cameraTarget values. */
  const frames = useRef(null);
  if (!frames.current) {
    frames.current = DESTINATIONS.map((d) => {
      const base = new THREE.Vector3(...d.position);
      return {
        posOffset: new THREE.Vector3(...d.cameraTarget.position).sub(base),
        lookOffset: new THREE.Vector3(...d.cameraTarget.lookAt).sub(base),
        fov: d.cameraTarget.fov ?? FOV_DEFAULT,
        roll: d.cameraTarget.roll ?? 0,
      };
    });
  }

  /* Initial pose — framed on Sol. */
  useEffect(() => {
    const d0 = DESTINATIONS[0];
    camera.position.set(...d0.cameraTarget.position);
    lookAtTarget.current.set(...d0.cameraTarget.lookAt);
    camera.fov = d0.cameraTarget.fov ?? FOV_DEFAULT;
    camera.updateProjectionMatrix();
    camera.lookAt(lookAtTarget.current);
  }, [camera]);

  useFrame((_, dt) => {
    if (controlsEnabled) return;
    const d = Math.min(dt || 1 / 60, 1 / 20);
    const t = clock.elapsedTime;
    const rawT = THREE.MathUtils.clamp(scrollT.current ?? 0, 0, 1);

    /* ── Cinematic launch override (intro) ──
       establish: pull back from Sol to reveal the tilted system (ease-out);
       warp: accelerate back into Sol (ease-in), synced with the streak burst. */
    if (launchPhase === "establish" || launchPhase === "warp") {
      const L = launch.current;
      if (L.phase !== launchPhase) {
        L.phase = launchPhase;
        L.t0 = t;
        L.fromPos.copy(camera.position);
        L.fromLook.copy(lookAtTarget.current);
        L.fromFov = camera.fov;
      }
      let toPos, toLook, toFov, e;
      if (launchPhase === "establish") {
        const p = Math.min(1, (t - L.t0) / ESTABLISH_DUR);
        e = 1 - Math.pow(1 - p, 3); // ease-out — decelerate into the reveal
        toPos = ESTABLISH_POS; toLook = ESTABLISH_LOOK; toFov = ESTABLISH_FOV;
      } else {
        const p = Math.min(1, (t - L.t0) / WARP_DUR);
        e = p * p; // ease-in — accelerate the dive
        toPos = SOL_POS; toLook = SOL_LOOK; toFov = SOL_FOV;
      }
      _camTarget.copy(L.fromPos).lerp(toPos, e);
      if (launchPhase === "establish") _camTarget.x += Math.sin(t * 0.25) * 1.4 * e; // slow drift
      _lookTarget.copy(L.fromLook).lerp(toLook, e);
      camera.position.copy(_camTarget);
      lookAtTarget.current.copy(_lookTarget);
      camera.lookAt(lookAtTarget.current);
      const fv = L.fromFov + (toFov - L.fromFov) * e;
      if (Math.abs(camera.fov - fv) > 0.01) { camera.fov = fv; camera.updateProjectionMatrix(); }
      return;
    }
    if (launch.current.phase) launch.current.phase = null;

    /* SNAP — nearest destination, never between/inside. */
    const idx = Math.round(rawT * (DESTINATIONS.length - 1));
    const dest = DESTINATIONS[idx];
    const frame = frames.current[idx];
    const { omega } = getOrbit(dest);
    const delta = omega * t; // orbital angle advanced since t=0

    /* Live planet centre + offsets rotated by the same delta → the shot
       rigidly follows the orbiting planet. */
    orbitalPosition(dest, t, _p);
    _po.copy(frame.posOffset).applyAxisAngle(UP, delta);
    _lo.copy(frame.lookOffset).applyAxisAngle(UP, delta);
    _camTarget.copy(_p).add(_po);
    _lookTarget.copy(_p).add(_lo);

    const wide = !!wideRef?.current;
    if (wide) {
      _camTarget.copy(WIDE_POSITION);
      _lookTarget.copy(WIDE_LOOK);
    } else {
      if (parallaxOffsetRef?.current) {
        _camTarget.x += parallaxOffsetRef.current.x;
        _camTarget.y += parallaxOffsetRef.current.y;
      }
      if (freeRoamEnabled && freeRoamOffsetRef?.current) {
        _camTarget.add(freeRoamOffsetRef.current);
      }
    }

    const posBase = wide ? WIDE_LERP_60 : freeRoamEnabled ? FREEROAM_LERP_60 : POS_LERP_60;
    const lookBase = wide ? WIDE_LERP_60 : LOOK_LERP_60;
    camera.position.lerp(_camTarget, fAlpha(posBase, d));
    lookAtTarget.current.lerp(_lookTarget, fAlpha(lookBase, d));
    camera.lookAt(lookAtTarget.current);

    /* Dutch-tilt roll — after lookAt (which resets up to world up). */
    const targetRoll = freeRoamEnabled || wide ? 0 : frame.roll;
    rollCurrent.current += (targetRoll - rollCurrent.current) * fAlpha(ROLL_LERP_60, d);
    if (Math.abs(rollCurrent.current) > 0.0005) camera.rotateZ(rollCurrent.current);

    /* FOV */
    const targetFov = wide ? WIDE_FOV : frame.fov;
    const fovDelta = targetFov - camera.fov;
    if (Math.abs(fovDelta) > 0.02) {
      camera.fov += fovDelta * fAlpha(FOV_LERP_60, d);
      camera.updateProjectionMatrix();
    }
  });

  return null;
};

export default CameraRig;
