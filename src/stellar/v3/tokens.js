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

/* §6.3: per-stop accent lives on each destination row now (`accent` for
   non-planets, `color` for planets). See config/destinations.js. V3Style
   resolves `dest.accent || dest.color || COLOR.accent`. */

/* ---- type ----------------------------------------------------------------- */
export const FONT = {
  /* Font stack — Option 2 (Rauno/Kenta editorial-technical).
     Fraunces: variable serif for display + values. Uses `opsz`+`SOFT`+`wght`
       axes for optical-size correctness + softened contrast at large sizes.
     Instrument Serif: italic-forward accent serif (kept — its italic is
       iconic and pairs with Fraunces).
     Satoshi: Fontshare geometric sans for UI/body — more character than
       Inter, more restraint than Manrope's warmth. Feels premium without
       generic.
     JetBrains Mono: the tool builders' monospace — signals "software engineer"
       more explicitly than Geist Mono, still modern.
     Fallbacks preserve the legacy AppErrorBoundary + StellarApp read-mode
     stack in case Fraunces / Satoshi / JetBrains Mono fail to load. */
  display: "'Fraunces', 'DM Serif Display', Georgia, serif",
  serif: "'Instrument Serif', Georgia, serif",
  ui: "'Satoshi', 'Manrope', system-ui, sans-serif",
  mono: "'JetBrains Mono', 'Geist Mono', ui-monospace, monospace",
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
