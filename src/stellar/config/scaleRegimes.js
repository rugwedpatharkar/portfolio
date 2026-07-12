/*
 * Scale regimes — the solar → local-neighborhood handoff for the view-from-within
 * Milky Way (docs/galaxy/technical-scale-regimes.md).
 *
 * Why two regimes: 1 ly = 63,241 AU, so a single float32 space can't hold both
 * AU-scale planet detail and even the nearest star (~2.5e7 su). We keep the
 * existing solar regime (AU_UNIT) and add a separate LOCAL regime (LY_UNIT) for
 * the pull-back finale, joined by a cinematic "powers of ten" CUT (no continuous
 * zoom through the empty orders of magnitude, no floating-origin, no log-depth).
 *
 * AU_UNIT is imported (single source for solar scale); LY_UNIT + LOCAL_CAP_LY are
 * the single source for galactic scale. Everything stays inside the existing
 * far-clip (14000). Unimported by the running scene until the render phase.
 */
import { AU_UNIT } from "./destinations";

export const FAR_CLIP = 14000; // mirrors Scene/index.jsx camera far (do not exceed)

export const LY_UNIT = 6; // scene-units per light-year — TUNED in the render phase (~5-8)
export const LOCAL_CAP_LY = 1500; // local-neighborhood outer edge (Local Bubble → naked-eye reach)

/* Ordered regimes. Sun sits at the origin in BOTH — the vantage never leaves us. */
export const SCALE_REGIMES = [
  { id: "solar", unit: "AU", scale: AU_UNIT, rangeAU: [0, 40], anchor: [0, 0, 0] },
  { id: "local", unit: "ly", scale: LY_UNIT, rangeLy: [0, LOCAL_CAP_LY], anchor: "sun" },
];

/* The pull-back distance (camera distance from the Sun, scene units) at which the
   AU-scale solar system collapses to the Sun-as-a-sprite and cross-dissolves into
   the local regime. ~just past the Oort/skybox shell. Tuned in the render phase. */
export const REGIME_HANDOFF = { atSceneUnits: 7000 };

/* Self-check (dev): the invariants the render layer relies on. */
(() => {
  const ok = (c, m) => { if (!c) throw new Error(`scaleRegimes.js: ${m}`); };
  ok(typeof AU_UNIT === "number" && AU_UNIT > 0, "AU_UNIT must import as a positive number");
  ok(LY_UNIT > 0, "LY_UNIT must be positive");
  ok(LOCAL_CAP_LY * LY_UNIT < FAR_CLIP, "local neighborhood must fit inside the far-clip");
  ok(SCALE_REGIMES[0].id === "solar" && SCALE_REGIMES[1].id === "local", "regimes must be ordered solar → local");
  ok(REGIME_HANDOFF.atSceneUnits > 0 && REGIME_HANDOFF.atSceneUnits < FAR_CLIP, "handoff distance out of range");
})();
