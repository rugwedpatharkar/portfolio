/* eslint-disable react/no-unknown-property */
import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { DESTINATIONS } from "../config/destinations";
import { getOrbit, orbitalPosition } from "../config/orbits";
import { useSceneClock } from "./SceneClock";

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
const POS_LERP_60 = 0.14;
const LOOK_LERP_60 = 0.20;
const FOV_LERP_60 = 0.12;
const ROLL_LERP_60 = 0.05;
const WIDE_LERP_60 = 0.09;
const FREEROAM_LERP_60 = 0.55;

const WIDE_POSITION = new THREE.Vector3(0, 34, 86);
const WIDE_LOOK = new THREE.Vector3(20, 0, 0);
const WIDE_FOV = 34;

/* Cinematic launch (intro): a far, oblique establishing shot of the whole
   tilted system, then an accelerating warp-dive into Sol. */
const ESTABLISH_POS = new THREE.Vector3(-110, 170, 390); // scaled for the true-scale system
const ESTABLISH_LOOK = new THREE.Vector3(110, -10, -20);
const ESTABLISH_FOV = 30;
const ESTABLISH_DUR = 2.2; // seconds — pull back + reveal
const WARP_DUR = 2.2; // seconds — hyperspeed fly-in from the system edge to Sol
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
const _camA = new THREE.Vector3();
const _lookA = new THREE.Vector3();
const _camB = new THREE.Vector3();
const _lookB = new THREE.Vector3();
const _viewDir = new THREE.Vector3();
const _right = new THREE.Vector3();
const _radial = new THREE.Vector3();
const _dir = new THREE.Vector3();
const _upp = new THREE.Vector3();
const _up2 = new THREE.Vector3();

const fAlpha = (base, dt) => 1 - Math.pow(1 - base, dt * 60);

/* Dwell-ease: hold (plateau) near each planet so you settle there and can
   read, glide (smoothstep) through the middle of a segment. Keeps the
   "always framed on a planet" property while making the tour continuous.
   DWELL raised 0.24 → 0.34: the camera reaches each planet's framing sooner
   and lingers there, so a scroll spends ~68% settled and only ~32% gliding —
   snappier, and far less time parked in the cluttered space between bodies. */
const DWELL = 0.34;
const dwellEase = (f) => {
  if (f <= DWELL) return 0;
  if (f >= 1 - DWELL) return 1;
  const x = (f - DWELL) / (1 - 2 * DWELL);
  return x * x * (3 - 2 * x);
};
const BANK_GAIN = 0.04; // roll per (destination-unit / second) of travel
const BANK_MAX = 0.085;
/* When framing the planet to the right, pull the camera back this much so the
   WHOLE planet fits with margin instead of being cropped (cropping a
   frame-filling planet reads as flying "inside" it). */
const FRAME_DOLLY = 1.34;

/* Slow cinematic push-in: once the tour settles on a body, the camera eases
   PUSH_AMOUNT closer over PUSH_DUR seconds, then holds — a gentle "lean in" on
   arrival. Resets while gliding to the next body. */
const PUSH_DUR = 5.0;
const PUSH_AMOUNT = 0.13;

/* Backlit hero framing (planets): the camera sits BEHIND the planet (anti-sun,
   radially outward), tilted up so the Sun crests the planet's top limb — a
   cinematic "sunrise over the edge" shot, the default for every planet. The
   Sun's angular offset from the planet ≈ the tilt angle, so a tilt just past the
   planet's apparent radius makes the Sun crest the edge for point-Sun outer
   planets, and wraps the limb dramatically for the huge-Sun inner ones. Distance
   is derived from the planet's radius, so every planet is framed to ~the same
   on-screen size ("one default angle" for all). Orbiting toward dead-centre
   alignment (free-roam) deepens the geometric eclipse (SolarEclipse.jsx). */
const DEG = Math.PI / 180;
const BACKLIT_HALF_ANGLE = 15 * DEG; // larger → planet fills ~half the frame (prominent hero)
const BACKLIT_TILT = 12 * DEG;       // Sun crests just past the limb
const BACKLIT_MARGIN = 1.12;         // breathing room around the body
/* Every planet uses the SAME fov + zero static roll, so the framing is identical
   from body to body (the authored per-planet fov 40–52 + dutch tilts made each
   stop feel different). Distance is derived from radius (above), so uniform fov
   ⇒ uniform on-screen size. */
const BACKLIT_FOV = 47;
/* Pointer parallax as a FRACTION of the framing distance → identical angular
   sway on every planet (a fixed world offset was violent on small bodies and
   invisible on big ones). */
const PARALLAX_FRAC = 0.08;

const CameraRig = ({
  scrollT,
  parallaxOffsetRef,
  freeRoamOffsetRef,
  freeRoamEnabled,
  wideRef,
  wideOrbitRef,
  focusRef,
  cameraRef,
  launchPhase,
  frameShift = 0,
}) => {
  const { camera } = useThree();
  const sceneClock = useSceneClock();
  const lookAtTarget = useRef(new THREE.Vector3(0, 0, 0));
  const rollCurrent = useRef(0);
  const lastPos = useRef(0); // continuous destination position, for banking
  const bankCurrent = useRef(0);
  const dwellTime = useRef(0); // seconds settled on the current body (drives the push-in)
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
    /* Expose the live camera to DOM overlays (the overview map projects
       object positions to screen space through it). */
    if (cameraRef) cameraRef.current = camera;

    const d = Math.min(dt || 1 / 60, 1 / 20);
    /* Scaled "world time" from the shared virtual clock — the SAME source
       OrbitGroup/KeyLight read, so the tracking shot stays locked to the
       orbiting planets at any time-scale. Reduced-motion freezes it (t stays
       0), reproducing the authored layout with no drift. */
    const t = sceneClock.t;
    const rawT = THREE.MathUtils.clamp(scrollT.current ?? 0, 0, 1);

    /* ── Cinematic launch override (intro) ──
       establish: pull back from Sol to reveal the tilted system (ease-out);
       warp: accelerate back into Sol (ease-in), synced with the streak burst. */
    if (launchPhase === "establish" || launchPhase === "warp") {
      const L = launch.current;
      if (L.phase !== launchPhase) {
        L.phase = launchPhase;
        L.t0 = t;
        /* The warp always begins at the far establishing pose, so it reads
           as a hyperspeed fly-in from the edge of the system into Sol (the
           streaks come from WarpField). Establish (if used) starts wherever
           the camera currently is. */
        if (launchPhase === "warp") {
          L.fromPos.copy(ESTABLISH_POS);
          L.fromLook.copy(ESTABLISH_LOOK);
          L.fromFov = ESTABLISH_FOV;
        } else {
          L.fromPos.copy(camera.position);
          L.fromLook.copy(lookAtTarget.current);
          L.fromFov = camera.fov;
        }
      }
      let toPos, toLook, toFov, e;
      if (launchPhase === "establish") {
        const p = Math.min(1, (t - L.t0) / ESTABLISH_DUR);
        e = 1 - Math.pow(1 - p, 3); // ease-out — decelerate into the reveal
        toPos = ESTABLISH_POS; toLook = ESTABLISH_LOOK; toFov = ESTABLISH_FOV;
      } else {
        const p = Math.min(1, (t - L.t0) / WARP_DUR);
        e = p * p * (3 - 2 * p); // smoothstep — fast through the middle, eased arrival
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

    /* ── HYBRID GLIDE — continuous position along the destination chain
       with an eased DWELL at each planet (settle there, read the panel),
       gliding through the middle of each segment. Far nav-jumps sweep
       through fast (the warp). Each segment endpoint keeps the live
       orbital tracking, so planets stay framed as they revolve. */
    const N = DESTINATIONS.length;
    const pos = rawT * (N - 1);
    const i = Math.min(N - 2, Math.max(0, Math.floor(pos)));
    const fe = dwellEase(pos - i);

    /* Travel speed — drives banking + the settle detector below. */
    const posVel = (pos - lastPos.current) / d;
    lastPos.current = pos;
    /* Slow push-in: ease closer once the scroll settles on a body, then hold;
       reset while gliding. (Applied to the hero distance D in blendFrame.) */
    const settled = Math.abs(posVel) < 0.05;
    dwellTime.current = settled
      ? Math.min(dwellTime.current + d, PUSH_DUR)
      : Math.max(0, dwellTime.current - d * 3);
    const pe = dwellTime.current / PUSH_DUR;
    const dollyFactor = 1 - PUSH_AMOUNT * (pe * pe * (3 - 2 * pe));

    const blendFrame = (j, outPos, outLook) => {
      const dst = DESTINATIONS[j];
      const fr = frames.current[j];
      orbitalPosition(dst, t, _p);
      if (dst.kind === "planet") {
        /* Backlit hero pose, computed from the planet's LIVE position so it
           tracks the orbit and always sits anti-sun. Look at the planet centre;
           the Sun (origin) sits just past the top limb. */
        _radial.copy(_p).normalize(); // sun→planet, i.e. anti-sun (outward) dir
        _upp.copy(UP).addScaledVector(_radial, -UP.dot(_radial)).normalize(); // up ⟂ radial
        _dir
          .copy(_radial)
          .multiplyScalar(Math.cos(BACKLIT_TILT))
          .addScaledVector(_upp, Math.sin(BACKLIT_TILT))
          .normalize();
        /* Signature scale: giants fill more of the frame (grand), small lonely
           worlds sit a little smaller with more void around them. Subtle,
           log-mapped on radius + clamped so framing stays cohesive, not jarring. */
        const heroHalf = THREE.MathUtils.clamp(
          BACKLIT_HALF_ANGLE * (1 + 0.13 * Math.log2(dst.radius / 0.18)),
          BACKLIT_HALF_ANGLE * 0.85,
          BACKLIT_HALF_ANGLE * 1.22
        );
        const D = (dst.radius / Math.tan(heroHalf)) * BACKLIT_MARGIN * dollyFactor;
        outPos.copy(_p).addScaledVector(_dir, D);
        outLook.copy(_p);
        /* Uniform fov + no static roll → every planet framed identically. */
        return { fov: BACKLIT_FOV, roll: 0 };
      }
      /* Sun + Edge Beacon keep their authored framing, orbit-rotated. */
      const dl = getOrbit(dst).omega * t;
      _po.copy(fr.posOffset).applyAxisAngle(UP, dl);
      _lo.copy(fr.lookOffset).applyAxisAngle(UP, dl);
      outPos.copy(_p).add(_po);
      outLook.copy(_p).add(_lo);
      return fr;
    };
    const frA = blendFrame(i, _camA, _lookA);
    const frB = blendFrame(i + 1, _camB, _lookB);
    _camTarget.copy(_camA).lerp(_camB, fe);
    _lookTarget.copy(_lookA).lerp(_lookB, fe);
    const fovTarget = frA.fov + (frB.fov - frA.fov) * fe;
    const rollTarget = frA.roll + (frB.roll - frA.roll) * fe;

    /* Banking — a subtle roll into the direction of travel, smoothed. */
    const targetBank = THREE.MathUtils.clamp(-posVel * BANK_GAIN, -BANK_MAX, BANK_MAX);
    bankCurrent.current += (targetBank - bankCurrent.current) * fAlpha(0.1, d);

    /* Precedence: focus (click-to-visit an object from the overview map) >
       wide (system overview) > scroll framing. Focus + wide use absolute
       world coords, so the planet frameShift/parallax are skipped. */
    const focus = focusRef?.current || null;
    const wide = !focus && !!wideRef?.current;
    if (focus) {
      _camTarget.set(focus.position[0], focus.position[1], focus.position[2]);
      _lookTarget.set(focus.lookAt[0], focus.lookAt[1], focus.lookAt[2]);
    } else if (wide) {
      /* Game-map view — pan (drag) + zoom (wheel) + orbit (right-drag) around an
         adjustable centre, so you can scroll across the system and zoom in/out
         like an in-game world map. panX/panZ shift the look centre; radius zooms;
         az/el orbit. The existing lerp below smooths it (inertia-like). */
      const o = wideOrbitRef?.current;
      if (o) {
        const ce = Math.cos(o.el);
        const cx = WIDE_LOOK.x + (o.panX || 0);
        const cz = WIDE_LOOK.z + (o.panZ || 0);
        _camTarget.set(
          cx + o.radius * ce * Math.cos(o.az),
          o.radius * Math.sin(o.el),
          cz + o.radius * ce * Math.sin(o.az)
        );
        _lookTarget.set(cx, WIDE_LOOK.y, cz);
      } else {
        _camTarget.copy(WIDE_POSITION);
        _lookTarget.copy(WIDE_LOOK);
      }
    } else if (freeRoamEnabled && freeRoamOffsetRef?.current) {
      _camTarget.add(freeRoamOffsetRef.current);
    }

    /* Frame the planet to the RIGHT of centre so the left column has room
       for the content overlay. We aim a fraction of the view's half-width to
       the LEFT of the subject, which slides the subject right on screen
       without moving the camera or changing the planet's size. Desktop only
       (frameShift is 0 on compact/mobile, where the layout stacks); skipped
       in wide + free-roam. */
    if (!wide && !focus && !freeRoamEnabled && frameShift) {
      /* (1) Dolly back along the planet→camera axis so the whole body fits
         on the right with margin. (2) Then aim a fraction of the view's
         half-width LEFT of the subject, sliding it right to clear the left
         for the content column. */
      _viewDir.copy(_camTarget).sub(_lookTarget);
      _camTarget.copy(_lookTarget).addScaledVector(_viewDir, FRAME_DOLLY);
      _viewDir.copy(_lookTarget).sub(_camTarget);
      const dist = _viewDir.length() || 1;
      _viewDir.divideScalar(dist);
      _right.crossVectors(_viewDir, UP).normalize();
      const halfW = Math.tan(THREE.MathUtils.degToRad(fovTarget * 0.5)) * dist * camera.aspect;
      _lookTarget.addScaledVector(_right, -halfW * frameShift);
    }

    /* Pointer parallax — shift the camera along its OWN right/up by a fraction
       of the framing distance, so the angular sway is identical on every planet
       and the body stays anchored while the background parallaxes. (Skipped in
       wide / focus / free-roam, which own the camera.) */
    if (!wide && !focus && !freeRoamEnabled && parallaxOffsetRef?.current) {
      _viewDir.copy(_lookTarget).sub(_camTarget);
      const fd = _viewDir.length() || 1;
      _viewDir.divideScalar(fd);
      _right.crossVectors(_viewDir, UP).normalize();
      _up2.crossVectors(_right, _viewDir).normalize();
      const s = fd * PARALLAX_FRAC;
      _camTarget
        .addScaledVector(_right, parallaxOffsetRef.current.x * s)
        .addScaledVector(_up2, parallaxOffsetRef.current.y * s);
    }

    const posBase = focus || wide ? WIDE_LERP_60 : freeRoamEnabled ? FREEROAM_LERP_60 : POS_LERP_60;
    const lookBase = focus || wide ? WIDE_LERP_60 : LOOK_LERP_60;
    camera.position.lerp(_camTarget, fAlpha(posBase, d));
    lookAtTarget.current.lerp(_lookTarget, fAlpha(lookBase, d));
    camera.lookAt(lookAtTarget.current);

    /* Dutch-tilt roll + travel bank — after lookAt (resets up to world up). */
    const targetRoll = freeRoamEnabled || wide || focus ? 0 : rollTarget + bankCurrent.current;
    rollCurrent.current += (targetRoll - rollCurrent.current) * fAlpha(ROLL_LERP_60, d);
    if (Math.abs(rollCurrent.current) > 0.0005) camera.rotateZ(rollCurrent.current);

    /* FOV */
    const targetFov = focus ? focus.fov : wide ? WIDE_FOV : fovTarget;
    const fovDelta = targetFov - camera.fov;
    if (Math.abs(fovDelta) > 0.02) {
      camera.fov += fovDelta * fAlpha(FOV_LERP_60, d);
      camera.updateProjectionMatrix();
    }
  });

  return null;
};

export default CameraRig;
