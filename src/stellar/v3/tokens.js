/*
 * Stellar v3 — design tokens (single source of truth for the v3 skin).
 *
 * Radical-minimal dark canvas + one PER-BODY accent. Near-white type (never
 * pure #fff). Editorial serif display / grotesk UI / mono data. Utopia fluid
 * clamp() scales so type + space breathe together. Motion tokens mirror the
 * motion-foundations system (transform+opacity only, reduced-motion disables
 * transforms). See docs/v3/PLAN.md §1.
 */

/* ---- color ---------------------------------------------------------------- */
export const COLOR = {
  bgVoid: "#050609", // deepest space
  bg0: "#0a0c11", // base surface
  bg1: "#111520", // raised (HUD panels)
  line: "rgba(255,255,255,0.07)", // hairline dividers/frames
  lineStrong: "rgba(255,255,255,0.15)",
  fg: "#f5f7fc", // primary (~96%, never pure white)
  fgDim: "#b3b9c7", // secondary
  fgMute: "#7c8391", // mono meta / captions — ~5.3:1 on the void (WCAG AA small text; was #6b7280 ≈ 4.2:1)
  accent: "#e9c675", // Sol default (warm-white gold)
};

/* Per-body accent — each stop's REAL color tints its HUD/labels/active states.
   Keyed by destination id AND by common body name so callers can use either. */
export const ACCENT = {
  sol: "#e9c675",
  mercury: "#8a8079",
  venus: "#e6c98a",
  earth: "#3d7fd6",
  mars: "#c1440e",
  jupiter: "#d8a06a",
  saturn: "#e3c07a",
  uranus: "#a9dbe0",
  neptune: "#3f66d6",
  belt: "#9a8f80",
  kuiper: "#8fb4c4",
  comet: "#7fd3ff",
  heliopause: "#6f86c9",
  blackhole: "#ffb14a",
  wormhole: "#8ea2ff",
  nebula: "#ff5a8a",
  pulsar: "#bcd4ff",
  milkyway: "#e8ddc4",
};

/* Resolve an accent from a destination id / section / body name (fallback = Sol). */
export const accentFor = (key) =>
  (key && ACCENT[String(key).toLowerCase()]) || COLOR.accent;

/* ---- type ----------------------------------------------------------------- */
export const FONT = {
  /* Font stack — Option B: cinematic magazine-cover feel.
     DM Serif Display: high-contrast, dramatic serif for headlines + big stat values.
     Instrument Serif: italic-forward serif for section heads (kept as accent).
     Manrope: warmer geometric sans for UI/body — better readability at small sizes.
     Geist Mono: Vercel's modern monospace for data channels + kicker labels. */
  display: "'DM Serif Display', Georgia, serif",
  serif: "'Instrument Serif', Georgia, serif",
  ui: "'Manrope', system-ui, sans-serif",
  mono: "'Geist Mono', ui-monospace, monospace",
};

/* Utopia fluid clamp() steps (type). Hero name (step6) bumped per sign-off. */
export const TYPE = {
  cap: "clamp(0.8rem, 0.76rem + 0.18vw, 0.9rem)", // mono caption
  body: "clamp(1rem, 0.94rem + 0.3vw, 1.15rem)",
  s2: "clamp(1.55rem, 1.3rem + 1.2vw, 2.3rem)", // subhead
  s4: "clamp(2.7rem, 2rem + 3.4vw, 4.6rem)", // section head (serif)
  s6: "clamp(5.2rem, 3rem + 9.5vw, 10.5rem)", // hero name (Fraunces)
};

/* ---- space (8pt grid) ----------------------------------------------------- */
export const SPACE = {
  1: "4px", 2: "8px", 3: "12px", 4: "16px", 6: "24px",
  8: "32px", 12: "48px", 16: "64px", 24: "96px", 32: "128px",
};

/* ---- motion (mirrors motion-foundations) ---------------------------------- */
export const MOTION = {
  duration: { instant: 0.08, fast: 0.18, normal: 0.35, slow: 0.6, crawl: 1.0 },
  easing: {
    smooth: [0.22, 1, 0.36, 1],
    sharp: [0.4, 0, 0.2, 1],
    bounce: [0.34, 1.56, 0.64, 1],
  },
  /* CSS cubic-bezier strings for GSAP/CSS use */
  cssSmooth: "cubic-bezier(0.22,1,0.36,1)",
  spring: {
    snappy: { type: "spring", stiffness: 300, damping: 30 },
    gentle: { type: "spring", stiffness: 120, damping: 14 },
    release: { type: "spring", stiffness: 200, damping: 20, restDelta: 0.001 },
  },
};

/* Build the :root CSS custom-property block for the v3 surface. */
export const cssVars = () => `
  --v3-bg-void:${COLOR.bgVoid};
  --v3-bg-0:${COLOR.bg0};
  --v3-bg-1:${COLOR.bg1};
  --v3-line:${COLOR.line};
  --v3-line-strong:${COLOR.lineStrong};
  --v3-fg:${COLOR.fg};
  --v3-fg-dim:${COLOR.fgDim};
  --v3-fg-mute:${COLOR.fgMute};
  --v3-accent:${COLOR.accent};
  --focus-ring:var(--v3-accent);
  --v3-font-display:${FONT.display};
  --v3-font-serif:${FONT.serif};
  --v3-font-ui:${FONT.ui};
  --v3-font-mono:${FONT.mono};
  --v3-type-cap:${TYPE.cap};
  --v3-type-body:${TYPE.body};
  --v3-type-s2:${TYPE.s2};
  --v3-type-s4:${TYPE.s4};
  --v3-type-s6:${TYPE.s6};
  --v3-ease-smooth:${MOTION.cssSmooth};
`;
