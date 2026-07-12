/*
 * §6.1 — CameraRig support module.
 *
 * Pure constants + math helpers extracted from CameraRig.jsx so the rig itself
 * stays focused on the per-frame orchestration. Everything here is
 * side-effect-free at module load; scratch vectors and stateful refs stay in
 * CameraRig where they belong.
 *
 * The full strategy split (finale / focus / jump / scroll) called out in the
 * plan is deferred — the four blocks share deep state (dwell timers, jump ref,
 * lastDir, focusBack, banking) and need coordinated 13-stop visual regression
 * testing to extract safely. This file starts the modularization; the
 * strategies land in a follow-up phase.
 */
import * as THREE from "three";
import { GALAXY } from "../../config/galaxy";

/* ---- default framing ------------------------------------------------------ */
export const FOV_DEFAULT = 52;
export const FOCUS_DIST = 1.8;

/* ---- lerp alphas (@60fps; fAlpha rescales for real delta) ---------------- */
export const LIVE_FOCUS_LERP_60 = 0.14;
export const POS_LERP_60 = 0.2;
export const LOOK_LERP_60 = 0.26;
export const FOV_LERP_60 = 0.12;
export const ROLL_LERP_60 = 0.05;
export const FOCUS_STATIC_LERP_60 = 0.09;
export const fAlpha = (base, dt) => 1 - Math.pow(1 - base, dt * 60);

/* ---- world basis --------------------------------------------------------- */
export const UP = new THREE.Vector3(0, 1, 0);
export const DEG = Math.PI / 180;

/* ---- dwell ease (asymmetric — see CameraRig comment) --------------------- */
const DWELL_IN = 0.05;
const DWELL_OUT = 0.30;
/* Asymmetric hold-then-ease. The default holds at the arriving pose for the last
   30% (and start pose for the first 5%) of a segment so planet stops park on
   their résumé content. The hold is parametrized so the cinematic opening
   segments (Milky Way → overview → Sun) can pass dIn=dOut=0 for a pure,
   continuous smoothstep with NO frozen dead-zone. */
export const dwellEase = (f, dIn = DWELL_IN, dOut = DWELL_OUT) => {
  if (f <= dIn) return 0;
  if (f >= 1 - dOut) return 1;
  const x = (f - dIn) / (1 - dIn - dOut);
  return x * x * (3 - 2 * x);
};

/* ---- banking ------------------------------------------------------------- */
export const BANK_GAIN = 0.04; // roll per (destination-unit / second)
export const BANK_MAX = 0.085;

/* ---- right-of-centre framing dolly + push-in ----------------------------- */
export const FRAME_DOLLY = 1.34;
export const PUSH_DUR = 5.0;
export const PUSH_AMOUNT = 0.13;

/* ---- backlit hero (planets) ---------------------------------------------- */
export const BACKLIT_HALF_ANGLE = 15 * DEG;
export const BACKLIT_TILT = 12 * DEG;
export const BACKLIT_MARGIN = 1.12;
export const BACKLIT_FOV = 47;
export const PARALLAX_FRAC = 0.08;

/* ---- direction-aware 3rd → 1st → 3rd model ------------------------------- */
export const BACK_FLOOR = 0.55;
export const FIRST_FRAC = 0.32;
export const UP_FRAC = 0.2;
export const LOOK_FRAC = 1.15;
export const FOV_FLY = 64;

/* hump(g): 0 at ends, 1 mid — first-person dip / streak / FOV widen. */
export const hump = (g) => Math.sin(Math.PI * THREE.MathUtils.clamp(g, 0, 1));

/* Full visual extent — respects rings + oblateness so ringed / squashed
   giants aren't cropped. */
export const visualExtentFor = (dest) => {
  const r = dest.radius;
  let ext = r;
  if (dest.rings) ext = Math.max(ext, r * 2.3);
  if (dest.faintRings) ext = Math.max(ext, r * 1.4);
  if (dest.oblateness) ext = Math.max(ext, r * (1 + dest.oblateness));
  return ext;
};

export const backDistFor = (extent, halfAngle = BACKLIT_HALF_ANGLE, floor = BACK_FLOOR) =>
  Math.max(floor, (extent / Math.tan(halfAngle)) * BACKLIT_MARGIN);

/* ---- v3 cinematic split -------------------------------------------------- */
export const V3_HALF_ANGLE = 11.5 * DEG;
export const V3_BACK_FLOOR = 0.14;
export const V3_VSHIFT = 0.14;
export const v3ExtentFor = (dest) => dest.radius * (1 + (dest.oblateness || 0));

/* ---- finale pose (galactic geometry) ------------------------------------- */
const _OBLIQ = 23.44 * DEG;
function galacticSceneVec(raHours, decDeg) {
  const ra = raHours * (Math.PI / 12);
  const dec = decDeg * DEG;
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
/* Pull back OPPOSITE the galactic core and slightly above the plane, looking at
   the Sun: band edge-on with the Sagittarius core glowing behind the Sun. */
export const FINALE_CAM = _GAL_C.clone().multiplyScalar(-1300).addScaledVector(_GAL_P, 430);
