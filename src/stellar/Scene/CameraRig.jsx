 
import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { DESTINATIONS } from "../config/destinations";
import { getOrbit, orbitalPosition, laneObjectPosition } from "../config/orbits";
import { GALAXY } from "../config/galaxy";
import { useSceneClock } from "./SceneClock";

/* ── Finale camera pose, derived from the real galactic geometry ──
   Same equatorial→scene transform as MilkyWay.jsx so the pose agrees with the
   band. C = galactic-centre (Sagittarius) direction; P = galactic pole (band
   normal). We pull back OPPOSITE the core and slightly ABOVE the plane, then
   look at the Sun: the band is seen edge-on (arching across, not a face-on
   ring) with the bright core glowing behind the Sun — our place in the galaxy. */
const _OBLIQ = 23.44 * (Math.PI / 180);
function galacticSceneVec(raHours, decDeg) {
  const ra = raHours * (Math.PI / 12);
  const dec = decDeg * (Math.PI / 180);
  const cd = Math.cos(dec);
  const xe = cd * Math.cos(ra);
  const ye = cd * Math.sin(ra);
  const ze = Math.sin(dec);
  const cosE = Math.cos(_OBLIQ);
  const sinE = Math.sin(_OBLIQ);
  return new THREE.Vector3(xe, -ye * sinE + ze * cosE, ye * cosE + ze * sinE).normalize();
}
const _GAL_C = galacticSceneVec(GALAXY.orientation.galacticCenter.raHours, GALAXY.orientation.galacticCenter.decDeg);
const _GAL_P = galacticSceneVec(GALAXY.orientation.galacticNorthPole.raHours, GALAXY.orientation.galacticNorthPole.decDeg);
const FINALE_CAM = _GAL_C.clone().multiplyScalar(-1300).addScaledVector(_GAL_P, 430);

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
/* Lane-object focus (←→): track the object's live orbiting position + frame it
   from a short distance, with a snappier lerp than the wide map for a quick
   hyperloop-style shift between objects. */
const DEST_BY_ID = Object.fromEntries(DESTINATIONS.map((d) => [d.id, d]));
const FOCUS_DIST = 1.8;
const LIVE_FOCUS_LERP_60 = 0.14;

/* Lerp alphas expressed @60fps; fAlpha rescales for real delta. Look
   tracks a hair tighter than position so the orbiting planet stays
   centred (tracking a moving target with a proportional lerp lags a
   little; a tighter aim keeps that lag invisible). */
const POS_LERP_60 = 0.2;
const LOOK_LERP_60 = 0.26;
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
/* ASYMMETRIC dwell — almost no hold at the START of a segment (the camera leaves
   immediately the moment you scroll / press a nav key, killing the old "press,
   then wait ~seconds before it moves" lag) but still settles + holds on ARRIVAL
   so you land composed on each planet. */
const DWELL_IN = 0.05;
const DWELL_OUT = 0.30;
const dwellEase = (f) => {
  if (f <= DWELL_IN) return 0;
  if (f >= 1 - DWELL_OUT) return 1;
  const x = (f - DWELL_IN) / (1 - DWELL_IN - DWELL_OUT);
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

/* ── Direction-aware third-person model ──
   The camera sits BEHIND the active body relative to the DIRECTION OF TRAVEL and
   looks AHEAD along it: an INWARD hop frames Camera → body → Sun, an OUTWARD hop
   frames Camera → body → deep space, and a ←→ lane hop looks along the lane. The
   travel direction comes from the from→target hop (persisted at idle), so the
   orientation flips with how you arrived rather than which input you used.
   During a hop the standoff dips toward the flight path (FIRST_FRAC) for a
   first-person fly-through, then settles back to third-person — a felt
   3rd → 1st → 3rd journey. Distances are radius-derived (uniform on-screen size). */
const BACK_FLOOR = 0.55;   // min 3rd-person standoff (guards the tiniest bodies)
const FIRST_FRAC = 0.32;   // 1st-person pass distance = FIRST_FRAC × 3rd-person standoff
const UP_FRAC = 0.2;       // 3rd-person up-lift, as a fraction of the standoff
const LOOK_FRAC = 1.15;    // look-ahead distance, as a fraction of the standoff
const FOV_FLY = 64;        // FOV widens to this mid-flight (speed); settled = BACKLIT_FOV
/* hump(g): 0 at the segment ends, 1 mid — drives the first-person dip + warp
   streak + FOV widen so the journey peaks in the middle and eases at both ends. */
const hump = (g) => Math.sin(Math.PI * THREE.MathUtils.clamp(g, 0, 1));
/* Settled 3rd-person standoff that frames a body's FULL visual extent — not just
   its radius — so ringed giants (Saturn's rings reach 2.3×, the faint rings 2.12×)
   and oblate worlds fit fully and centred, in both inward + outward views. */
const visualExtentFor = (dest) => {
  const r = dest.radius;
  let ext = r;
  if (dest.rings) ext = Math.max(ext, r * 2.3);          // Saturn's prominent rings — fit fully
  /* Faint rings (Jupiter/Uranus/Neptune) are barely visible, so don't pull all the
     way back to their outer edge (that shrinks the body) — frame the body
     prominently and let the faint outer edge sit near the frame margin. */
  if (dest.faintRings) ext = Math.max(ext, r * 1.4);
  if (dest.oblateness) ext = Math.max(ext, r * (1 + dest.oblateness));
  return ext;
};
const backDistFor = (extent, halfAngle = BACKLIT_HALF_ANGLE, floor = BACK_FLOOR) => Math.max(floor, (extent / Math.tan(halfAngle)) * BACKLIT_MARGIN);
/* v3 cinematic split: every planet's BODY is framed to the SAME on-screen size (big,
   right of centre, info left). We frame by the body radius (× oblateness so the squashed
   giants don't crop vertically), IGNORING rings — so Saturn's disc matches Jupiter's and
   the rings simply extend off-frame (cinematic), instead of the rings shrinking the body. */
const V3_HALF_ANGLE = 11.5 * DEG; // → the body fills the empty right column (right of the
//                                  content card, above the bottom-right Planet Information
//                                  card) rather than sitting small in a sea of empty space.
//                                  (smaller specimen — the planet
//                                is a discoverable interaction, not the dominant hero;
//                                content wraps around it, telemetry appears on hover)
/* Tiny dwarfs (Pluto r≈0.034, Ceres r≈0.06) would clamp to BACK_FLOOR and look small,
   so v3 uses a much lower floor — just clear of the ~0.1 near-clip (+ the body radius) —
   letting even Pluto frame near the same size as the giants. */
const V3_BACK_FLOOR = 0.14;
/* v3 vertical framing: seat the focused body in the UPPER-right (above the bottom-
   right Planet Information card). Companion to the horizontal frameShift. Small so
   ringed giants (Saturn) keep their ring tops in frame. */
const V3_VSHIFT = 0.14;
const v3ExtentFor = (dest) => dest.radius * (1 + (dest.oblateness || 0));

const CameraRig = ({
  scrollT,
  parallaxOffsetRef,
  freeRoamOffsetRef,
  freeRoamEnabled,
  wideRef,
  wideOrbitRef,
  focusRef,
  cameraRef,
  warpVelRef,
  onLaunchComplete,
  launchPhase,
  frameShift = 0,
  reducedMotion = false,
  isMobile = false,
  v3 = false,
  finale = false,
  finaleT,
}) => {
  const { camera } = useThree();
  const sceneClock = useSceneClock();
  const lookAtTarget = useRef(new THREE.Vector3(0, 0, 0));
  /* Finale scrub — captures the handoff pose (last-destination camera) the first
     frame the reveal engages, so the pull-back to FINALE_CAM is a consistent
     function of finaleT (scrub back and forth lands identically). */
  const finaleActive = useRef(false);
  const finaleFrom = useRef({ pos: new THREE.Vector3(), look: new THREE.Vector3() });
  const rollCurrent = useRef(0);
  const lastPos = useRef(0); // continuous destination position, for banking
  const bankCurrent = useRef(0);
  const dwellTime = useRef(0); // seconds settled on the current body (drives the push-in)
  /* Launch state — captures the from-pose at each phase change so the
     scripted establish/warp moves are deterministic and smooth. */
  const launch = useRef({ phase: null, t0: 0, fromPos: new THREE.Vector3(), fromLook: new THREE.Vector3(), fromFov: FOV_DEFAULT });
  /* Warp-jump transition — each nav becomes a real travel (accel→decel over a
     distance-scaled time, the destination swelling as you cross the gap, with
     the hyperloop streaks peaking mid-jump). dt-accumulated so it runs even when
     the scene clock is frozen (reduced-motion). */
  const jump = useRef({ active: false, elapsed: 0, dur: 0, intensity: 0, fromBody: new THREE.Vector3(), toBody: new THREE.Vector3(), dir: new THREE.Vector3(1, 0, 0), back: 1, fov: BACKLIT_FOV, lastKey: "sol:-1" });
  /* Persisted travel direction so the resting third-person view keeps the
     orientation of the hop you arrived on (idle has no from→target). */
  const lastDir = useRef(new THREE.Vector3(1, 0, 0));
  const focusBack = useRef(1); // last settled standoff (the fly-through eases back to it)
  /* Flight state → DOM: hide the section info during the fly-through, reveal it on
     arrival. flyingRef is also read by SolarEclipse (suppress scoring mid-flight).
     The event is edge-triggered (hide instantly, reveal debounced on settle) so it
     never fires per-frame. */
  const flyingRef = useRef(false);
  const wasFlying = useRef(false);
  const flightOffTimer = useRef(null);
  const setFlying = (v) => {
    flyingRef.current = v;
    if (v === wasFlying.current) return;
    wasFlying.current = v;
    if (v) {
      if (flightOffTimer.current) { clearTimeout(flightOffTimer.current); flightOffTimer.current = null; }
      window.dispatchEvent(new CustomEvent("stellar:flight", { detail: { flying: true } }));
    } else {
      if (flightOffTimer.current) clearTimeout(flightOffTimer.current);
      flightOffTimer.current = setTimeout(() => {
        window.dispatchEvent(new CustomEvent("stellar:flight", { detail: { flying: false } }));
        flightOffTimer.current = null;
      }, 180);
    }
  };
  useEffect(() => () => { if (flightOffTimer.current) clearTimeout(flightOffTimer.current); }, []);

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
    /* Reduced-motion + mobile → SNAP: no first-person fly-through, no streaks,
       info stays visible. The normal lerp still glides gently to the pose. */
    const snap = reducedMotion || isMobile;

    /* ── Pull-back finale (?finale=1) — park the camera pulled back, looking at
       the Sun among its local-neighbourhood stars. Debug pose for now; the real
       scroll-driven cinematic transition wires here next. */
    /* ── Pull-back finale scrub ──
       finaleT (0→1) eases the camera from the last-destination handoff pose to
       FINALE_CAM (~1370u): OUR vantage, framing the Sun among its nearest real
       neighbours (α Cen ≈26u, Sirius ≈52u at LY_UNIT=6), oriented along the
       galactic plane so the band arches edge-on with the Sagittarius core behind
       the Sun. `finale` (content-swapped, incl. ?finale=1) forces full arrival. */
    const fT = finaleT ? THREE.MathUtils.clamp(finaleT.current ?? 0, 0, 1) : (finale ? 1 : 0);
    if (fT > 0) {
      if (!finaleActive.current) {
        finaleActive.current = true;
        finaleFrom.current.pos.copy(camera.position);
        finaleFrom.current.look.copy(lookAtTarget.current);
      }
      /* Hold at the handoff (last-destination) pose while the solar system fades
         to black in the first half, then travel to FINALE_CAM during the reveal
         — so the camera never flies visibly through the fading system. */
      const e = THREE.MathUtils.smoothstep(fT, 0.5, 1.0);
      camera.position.lerpVectors(finaleFrom.current.pos, FINALE_CAM, e);
      _lookTarget.set(0, 0, 0);
      lookAtTarget.current.lerpVectors(finaleFrom.current.look, _lookTarget, e);
      camera.lookAt(lookAtTarget.current);
      if (Math.abs(camera.fov - 60) > 0.05) { camera.fov += (60 - camera.fov) * (0.5 * e + 0.05); camera.updateProjectionMatrix(); }
      return;
    }
    finaleActive.current = false; // scrubbed back into the tour → release handoff

    /* ── Cinematic launch override (intro) ──
       establish: pull back from Sol to reveal the tilted system (ease-out);
       warp: accelerate back into Sol (ease-in), synced with the streak burst. */
    if (launchPhase === "establish" || launchPhase === "warp") {
      const L = launch.current;
      if (L.phase !== launchPhase) {
        L.phase = launchPhase;
        L.t0 = t;
        L.completed = false;
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
      let toPos, toLook, toFov, e, p = 0;
      if (launchPhase === "establish") {
        p = Math.min(1, (t - L.t0) / ESTABLISH_DUR);
        e = 1 - Math.pow(1 - p, 3); // ease-out — decelerate into the reveal
        toPos = ESTABLISH_POS; toLook = ESTABLISH_LOOK; toFov = ESTABLISH_FOV;
      } else {
        p = Math.min(1, (t - L.t0) / WARP_DUR);
        e = p * p * (3 - 2 * p); // smoothstep — fast through the middle, eased arrival
        toPos = SOL_POS; toLook = SOL_LOOK; toFov = SOL_FOV;
        /* Drive the HyperLoop streak: tube fills then collapses to points as the
           dive arrives (sin → 0 at p=1). Same ref the planet-jump uses. */
        if (warpVelRef) warpVelRef.current = Math.sin(p * Math.PI);
      }
      _camTarget.copy(L.fromPos).lerp(toPos, e);
      if (launchPhase === "establish") _camTarget.x += Math.sin(t * 0.25) * 1.4 * e; // slow drift
      _lookTarget.copy(L.fromLook).lerp(toLook, e);
      camera.position.copy(_camTarget);
      lookAtTarget.current.copy(_lookTarget);
      camera.lookAt(lookAtTarget.current);
      const fv = L.fromFov + (toFov - L.fromFov) * e;
      if (Math.abs(camera.fov - fv) > 0.01) { camera.fov = fv; camera.updateProjectionMatrix(); }
      /* End the warp the moment the CAMERA actually arrives (clock-driven p≥1),
         not on a wall-clock timer that desyncs from the scene clock on a slow
         load → no mid-warp snap at the tour handoff (bug-sweep H2 / issue 4). */
      if (launchPhase === "warp" && p >= 1 && !L.completed) {
        L.completed = true;
        onLaunchComplete?.();
      }
      return;
    }
    if (launch.current.phase) { launch.current.phase = null; if (warpVelRef) warpVelRef.current = 0; }

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
      if (focus.live && focus.target) {
        /* Direction-aware third-person: sit BEHIND the body relative to the travel
           direction (from→target) and look AHEAD past it. An INWARD hop frames
           Camera → body → Sun; an OUTWARD hop frames Camera → body → deep space; a
           ←→ lane hop looks along the lane. The Sun is just another body here — its
           direction comes from the hop vector, never normalize(origin). The travel
           direction is persisted (lastDir) so the resting view keeps the hop you
           arrived on; the actual 3rd→1st→3rd fly-through is the warp-jump below. */
        const tgt = DEST_BY_ID[focus.target.destId];
        if (tgt) {
          const k = focus.target.k;
          if (k >= 0) laneObjectPosition(tgt, k, t, _p);
          else orbitalPosition(tgt, t, _p);
          let haveDir = false;
          if (focus.from) {
            const frm = DEST_BY_ID[focus.from.destId];
            if (frm) {
              if (focus.from.k >= 0) laneObjectPosition(frm, focus.from.k, t, _po);
              else orbitalPosition(frm, t, _po);
              _dir.copy(_p).sub(_po);
              if (_dir.lengthSq() > 1e-6) { _dir.normalize(); haveDir = true; }
            }
          }
          if (!haveDir) _dir.copy(lastDir.current); // idle: keep the last hop's orientation
          lastDir.current.copy(_dir);
          /* up ⟂ the travel direction (cinematic lift). */
          _upp.copy(UP).addScaledVector(_dir, -UP.dot(_dir));
          if (_upp.lengthSq() < 1e-6) _upp.set(0, 1, 0); else _upp.normalize();
          let D = k >= 0 ? FOCUS_DIST : backDistFor(v3 ? v3ExtentFor(tgt) : visualExtentFor(tgt), v3 ? V3_HALF_ANGLE : BACKLIT_HALF_ANGLE, v3 ? V3_BACK_FLOOR : BACK_FLOOR);
          /* Keep the right-of-centre body fully in frame: a small pull-back to make
             up for the frameShift aim-shift on desktop. (v3 wants it big → minimal.) */
          if (frameShift && k < 0) D *= 1 + frameShift * (v3 ? 0.1 : 0.25);
          focusBack.current = D;
          /* Camera BEHIND the body (−dir), gently lifted; LOOK AT THE BODY CENTRE so
             it sits centred + fully visible (the look-ahead lives only in the
             fly-through below — keeping it here pushed the body off the top of frame
             and cropped ringed giants). The Sun / deep space still fills the
             background behind the centred body. */
          _camTarget.copy(_p).addScaledVector(_dir, -D).addScaledVector(_upp, D * UP_FRAC);
          _lookTarget.copy(_p);
          /* slide the body right-of-centre (desktop) so the cockpit chrome clears. */
          if (frameShift && k < 0) {
            _viewDir.copy(_lookTarget).sub(_camTarget);
            const dd = _viewDir.length() || 1;
            _viewDir.divideScalar(dd);
            _right.crossVectors(_viewDir, UP).normalize();
            const halfW = Math.tan(THREE.MathUtils.degToRad((focus.fov || 42) * 0.5)) * dd * camera.aspect;
            /* Focused planet stops slide the body further right than the overview
               (the overview uses the full prop below, which must keep the Sun on
               screen) — so decoupled: a higher multiplier here frames the planet
               right for the content column without pushing the overview Sun off. */
            _lookTarget.addScaledVector(_right, -halfW * frameShift * 1.0);
            /* Vertical companion to frameShift: aim a fraction of the view's half-
               HEIGHT below the body so it seats in the UPPER-right, clearing the
               bottom-right Planet Information card (the layout's cleanest gap).
               Kept small (0.26) so ringed giants don't crop at the top. */
            const halfH = Math.tan(THREE.MathUtils.degToRad((focus.fov || 42) * 0.5)) * dd;
            _lookTarget.addScaledVector(_upp, -halfH * V3_VSHIFT);
          }
        }
      } else {
        _camTarget.set(focus.position[0], focus.position[1], focus.position[2]);
        _lookTarget.set(focus.lookAt[0], focus.lookAt[1], focus.lookAt[2]);
      }
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
      /* Overview (the only non-focus v3 stop): use a GENTLER shift than the raw
         prop so the Sun sits inward-right (not jammed at the edge), leaving room on
         its right for the full compressed orbit system to stay in frame as the
         planets revolve. The base look angle already places the Sun right. */
      _lookTarget.addScaledVector(_right, -halfW * frameShift * 0.5);
    }

    /* Pointer parallax — shift the camera along its OWN right/up by a fraction
       of the framing distance, so the angular sway is identical on every body
       and it stays anchored while the background parallaxes. v2 applied it only
       off-focus (the hero); v3 applies it on FOCUSED planet stops too, so moving
       the cursor sways every planet like the hero. (Still skipped in wide/free-roam.) */
    if (!wide && (!focus || v3) && !freeRoamEnabled && parallaxOffsetRef?.current) {
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

    /* ── Hyperspace fly-through ── on a new focus target, FLY along the path from
       the FROM body to the TARGET body: the standoff dips toward the flight line
       mid-hop (first-person), the streaks + FOV peak, then it settles back BEHIND
       the destination (third-person) — a felt 3rd→1st→3rd journey, the same for
       every direction. Skipped on reduced-motion / mobile (snap; the lerp glides
       gently to the settled pose instead). */
    const jmpKey = focus && focus.live && focus.target ? `${focus.target.destId}:${focus.target.k}` : "";
    /* Active-jump guard: while a hop is in flight, IGNORE a newly-changed focus
       target — don't restart the jump from mid-path (that reversed the camera
       mid-warp during the Saturn→Uranus oscillation). When the current jump lands
       (active=false), the next frame sees the still-different key and starts a fresh
       hop toward it, so rapid nav coalesces cleanly instead of stuttering. */
    if (jmpKey && jmpKey !== jump.current.lastKey && !jump.current.active) {
      jump.current.lastKey = jmpKey;
      if (!snap && focus.from) {
        const J = jump.current;
        /* Flight endpoints: FROM body → TARGET body (live positions). _p already
           holds the target body (computed in the focus block); recompute the from
           body. dir + back come from the focus block (lastDir / focusBack). */
        J.toBody.copy(_p);
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
    if (jump.current.active) {
      const J = jump.current;
      /* Advance on REAL delta (not the orbit-tracking clamped `d`) so the jump
         finishes in `dur` real seconds regardless of frame rate. */
      J.elapsed += Math.min(dt || 1 / 60, 0.25);
      const e = THREE.MathUtils.clamp(J.elapsed / J.dur, 0, 1);
      const ee = e * e * (3 - 2 * e); // accelerate then decelerate along the path
      const h = hump(e);              // 0 at ends, 1 mid → the first-person dip
      /* ride point glides FROM→TARGET; standoff dips to FIRST_FRAC mid-flight. */
      _p.copy(J.fromBody).lerp(J.toBody, ee);
      const back = J.back * (1 - h * (1 - FIRST_FRAC));
      _upp.copy(UP).addScaledVector(J.dir, -UP.dot(J.dir));
      if (_upp.lengthSq() < 1e-6) _upp.set(0, 1, 0); else _upp.normalize();
      camera.position.copy(_p).addScaledVector(J.dir, -back).addScaledVector(_upp, back * UP_FRAC * (1 - h * 0.7));
      lookAtTarget.current.copy(_p).addScaledVector(J.dir, back * LOOK_FRAC);
      camera.lookAt(lookAtTarget.current);
      const fv = J.fov + (FOV_FLY - J.fov) * h;
      if (Math.abs(camera.fov - fv) > 0.01) { camera.fov = fv; camera.updateProjectionMatrix(); }
      if (warpVelRef) warpVelRef.current = Math.sin(e * Math.PI) * J.intensity;
      setFlying(h > 0.12);
      if (e >= 1) { J.active = false; if (warpVelRef) warpVelRef.current = 0; setFlying(false); }
      return;
    }
    setFlying(false);

    const posBase = focus?.live ? LIVE_FOCUS_LERP_60 : focus || wide ? WIDE_LERP_60 : freeRoamEnabled ? FREEROAM_LERP_60 : POS_LERP_60;
    const lookBase = focus?.live ? LIVE_FOCUS_LERP_60 : focus || wide ? WIDE_LERP_60 : LOOK_LERP_60;
    camera.position.lerp(_camTarget, fAlpha(posBase, d));
    lookAtTarget.current.lerp(_lookTarget, fAlpha(lookBase, d));
    camera.lookAt(lookAtTarget.current);

    /* Dutch-tilt roll + travel bank — after lookAt (resets up to world up). */
    const targetRoll = freeRoamEnabled || wide || focus ? 0 : rollTarget + bankCurrent.current;
    rollCurrent.current += (targetRoll - rollCurrent.current) * fAlpha(ROLL_LERP_60, d);
    if (Math.abs(rollCurrent.current) > 0.0005) camera.rotateZ(rollCurrent.current);

    /* FOV */
    const targetFov = focus ? (focus.fov || 42) : wide ? WIDE_FOV : fovTarget;
    const fovDelta = targetFov - camera.fov;
    if (Math.abs(fovDelta) > 0.02) {
      camera.fov += fovDelta * fAlpha(FOV_LERP_60, d);
      camera.updateProjectionMatrix();
    }
  });

  return null;
};

export default CameraRig;
