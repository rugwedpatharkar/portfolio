/*
 * Unified visual tokens — single palette + spacing so the HUD reads
 * cohesively. Used by new components; older ones migrate over time.
 *
 * Color philosophy: charcoal-glass surface + one of three semantic
 * accents (calm cyan for info, warm orange for sun/contact, soft
 * violet for cosmic). No more than two accents per visible region.
 */

export const COLORS = {
  /* Surfaces */
  bgDeep: "rgba(3, 5, 14, 0.92)",
  bgSurface: "rgba(6, 9, 22, 0.72)",
  bgGlass: "rgba(8, 10, 26, 0.78)",
  border: "rgba(255, 255, 255, 0.08)",
  borderStrong: "rgba(255, 255, 255, 0.18)",
  divider: "rgba(255, 255, 255, 0.06)",

  /* Text */
  textPrimary: "rgba(255, 255, 255, 0.95)",
  textSecondary: "rgba(255, 255, 255, 0.68)",
  textMuted: "rgba(255, 255, 255, 0.42)",
  textFaint: "rgba(255, 255, 255, 0.22)",

  /* Accents (the only three colors used for status / interactivity) */
  accentCyan: "#00cea8",
  accentCyanSoft: "rgba(0, 206, 168, 0.55)",
  accentOrange: "#ffb86b",
  accentOrangeSoft: "rgba(255, 184, 107, 0.55)",
  accentViolet: "#bf61ff",
  accentVioletSoft: "rgba(191, 97, 255, 0.55)",

  /* Status */
  ok: "#00cea8",
  warn: "#ffd57a",
  danger: "#ff6b6b",
};

export const SHADOWS = {
  card: "0 18px 50px rgba(0, 0, 0, 0.5)",
  modal: "0 30px 80px rgba(0, 0, 0, 0.6)",
  glow: (c) => `0 0 18px ${c}40`,
};

export const RADII = {
  pill: 999,
  card: 12,
  chip: 6,
};
