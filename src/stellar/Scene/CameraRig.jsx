
import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { DESTINATIONS, SKY_SCALE } from "../config/destinations";
import { useSceneClock } from "./SceneClock";
import {
  FOV_DEFAULT,
  LIVE_FOCUS_LERP_60, POS_LERP_60, LOOK_LERP_60, FOV_LERP_60, ROLL_LERP_60, FOCUS_STATIC_LERP_60, fAlpha,
  BANK_GAIN, BANK_MAX,
  BACKLIT_FOV,
} from "./camera/util";
import { runFinaleStrategy } from "./camera/finaleStrategy";
import { runScrollStrategy } from "./camera/scrollStrategy";
import { runFocusStrategy } from "./camera/focusStrategy";
import { maybeStartJump, runJumpStrategy } from "./camera/jumpStrategy";

/*
 * Camera controller — SNAP + live-orbit tracking.
 *
 * §6.1 (full): the four per-frame strategies live in ./camera/:
 *   finaleStrategy — pull-back to FINALE_CAM (returns true → done)
 *   scrollStrategy — hybrid glide along the destination chain
 *   focusStrategy  — direction-aware 3rd-person on the focused body + parallax
 *   jumpStrategy   — hyperspace fly-through 3rd → 1st → 3rd
 *
 * CameraRig owns all the runtime state (refs + scratch vectors) and passes
 * a ctx object into each strategy. Strategies mutate scratch + refs; the
 * dispatcher writes camera.position/lookAt/fov/rotateZ once at the end.
 *
 * Runtime-shared scratch vectors are kept module-local (no per-frame
 * allocation) and packaged into a `scratch` object handed to strategies —
 * this keeps the strategies pure functions of their input while avoiding
 * fresh allocations.
 */

/* Scratch vectors — module-local so we don't allocate per frame. */
const scratch = {
  _p: new THREE.Vector3(),
  _po: new THREE.Vector3(),
  _lo: new THREE.Vector3(),
  _camTarget: new THREE.Vector3(),
  _lookTarget: new THREE.Vector3(),
  _camA: new THREE.Vector3(),
  _lookA: new THREE.Vector3(),
  _camB: new THREE.Vector3(),
  _lookB: new THREE.Vector3(),
  _viewDir: new THREE.Vector3(),
  _right: new THREE.Vector3(),
  _radial: new THREE.Vector3(),
  _dir: new THREE.Vector3(),
  _upp: new THREE.Vector3(),
  _up2: new THREE.Vector3(),
};

const CameraRig = ({
  scrollT,
  parallaxOffsetRef,
  focusRef,
  cameraRef,
  warpVelRef,
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
  const finaleActive = useRef(false);
  const finaleFrom = useRef({ pos: new THREE.Vector3(), look: new THREE.Vector3() });
  const rollCurrent = useRef(0);
  const lastPos = useRef(0);
  const bankCurrent = useRef(0);
  const dwellTime = useRef(0);
  const jump = useRef({ active: false, elapsed: 0, dur: 0, intensity: 0, fromBody: new THREE.Vector3(), toBody: new THREE.Vector3(), dir: new THREE.Vector3(1, 0, 0), back: 1, fov: BACKLIT_FOV, lastKey: "sol:-1" });
  const lastDir = useRef(new THREE.Vector3(1, 0, 0));
  const focusBack = useRef(1);
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

  /* Per-destination framing offsets, captured once from the authored cameraTarget values. */
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
    /* Expose the live camera to DOM overlays. */
    if (cameraRef) cameraRef.current = camera;

    const d = Math.min(dt || 1 / 60, 1 / 20);
    const t = sceneClock.t;
    const rawT = THREE.MathUtils.clamp(scrollT.current ?? 0, 0, 1);
    const snap = reducedMotion || isMobile;

    /* Shared context passed to every strategy. Rebuilt each frame with the
       latest per-frame values; ref + scratch fields are stable across frames
       so strategies read/write the same objects. */
    const ctx = {
      camera, lookAtTarget,
      t, dt, d, rawT, snap,
      finaleActive, finaleFrom, finale, finaleT,
      dwellTime, lastPos, frames,
      focusRef, parallaxOffsetRef, frameShift, v3,
      lastDir, focusBack,
      jump, warpVelRef, setFlying,
      scratch,
    };

    /* 1) Finale takes precedence when finaleT > 0. Returns true if it handled. */
    if (runFinaleStrategy(ctx)) return;

    /* 2) Scroll — writes scratch._camTarget + _lookTarget from the destination
          chain; returns fov/roll targets and travel speed. */
    const { fovTarget, rollTarget, posVel } = runScrollStrategy(ctx);

    /* 1b) Hyperspace warp — TRUE-SCALE ONLY. posVel is scroll velocity (scale-
          invariant), but at true scale the same scroll speed flings the camera
          ~45× farther in world space, so the inter-planet legs are genuine warps.
          Mask that travel with the streak effect, driven by scroll velocity and
          capped low (a motion streak, not a blinding tunnel); it decays to 0 at
          each dwell. At the compressed scale world-travel is slow → no warp. */
    if (warpVelRef) {
      const warp = SKY_SCALE > 1 ? THREE.MathUtils.clamp((Math.abs(posVel) - 0.15) * 0.4, 0, 0.5) : 0;
      warpVelRef.current = Math.max(warp, (warpVelRef.current || 0) * 0.85);
    }

    /* Banking — a subtle roll into the direction of travel, smoothed. */
    const targetBank = THREE.MathUtils.clamp(-posVel * BANK_GAIN, -BANK_MAX, BANK_MAX);
    bankCurrent.current += (targetBank - bankCurrent.current) * fAlpha(0.1, d);

    /* 3) Focus + frameShift + parallax — overrides scratch._camTarget/lookTarget
          when a focus is set; otherwise adds the frameShift + parallax on top. */
    const { focus } = runFocusStrategy(ctx, { fovTarget });

    /* 4) Jump — start a new hop if the focus target changed, then run the
          active jump (returns true → we're done for this frame). */
    maybeStartJump(ctx);
    if (runJumpStrategy(ctx)) return;
    setFlying(false);

    /* Settle-lerp — the same for every non-jump frame. Focused / live-focus
       branches pick tighter lerp alphas. */
    const posBase = focus?.live ? LIVE_FOCUS_LERP_60 : focus ? FOCUS_STATIC_LERP_60 : POS_LERP_60;
    /* Look lerp: while a body is orbit-tracked (focus.live), snap lookAt to
       the live target every frame so the fast-orbiting Mercury doesn't get
       nudged off-axis by proportional chase-lag. */
    const lookBase = focus?.live ? 1 : focus ? FOCUS_STATIC_LERP_60 : LOOK_LERP_60;
    camera.position.lerp(scratch._camTarget, fAlpha(posBase, d));
    lookAtTarget.current.lerp(scratch._lookTarget, fAlpha(lookBase, d));
    camera.lookAt(lookAtTarget.current);

    /* Dutch-tilt roll + travel bank — after lookAt (resets up to world up). */
    const targetRoll = focus ? 0 : rollTarget + bankCurrent.current;
    rollCurrent.current += (targetRoll - rollCurrent.current) * fAlpha(ROLL_LERP_60, d);
    if (Math.abs(rollCurrent.current) > 0.0005) camera.rotateZ(rollCurrent.current);

    /* FOV */
    const targetFov = focus ? (focus.fov || 42) : fovTarget;
    const fovDelta = targetFov - camera.fov;
    if (Math.abs(fovDelta) > 0.02) {
      camera.fov += fovDelta * fAlpha(FOV_LERP_60, d);
      camera.updateProjectionMatrix();
    }
  });

  return null;
};

export default CameraRig;
