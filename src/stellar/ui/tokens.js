/*
 * Stellar Command — design tokens (JS mirror of the :root cockpit vars in index.css).
 * Kept as hex (not oklch) so three.js `Color` and inline React styles consume them
 * directly. DOM overlay components may use either these or the matching `var(--sc-*)`.
 *
 * Palette is contrast-checked against --sc-bg (#02040a): *-ink variants are the
 * text-safe ones (≥4.5:1); the saturated base colors are for glow/borders/large+bold.
 */
export const SC = {
  bg: "#02040a", // near-black canopy base
  surface: "#070b16", // panel fill — use sparingly, not glass-by-default
  blue: "#4da6ff", // hologram blue — brackets / glow / ≥14px-bold text
  blueInk: "#8fcfff", // body-safe blue text (~9.5:1 on bg)
  blueDim: "#2f6da0", // panel borders / quiet lines
  amber: "#ffb84d", // active target / highlight
  amberInk: "#ffcf8a", // secondary text (~11:1)
  alert: "#ff4d4d", // hazard — large/bold only
  alertInk: "#ff8a8a", // alert text
  status: "#2fe0b0", // "online / available" (kept, not brand)
  line: "rgba(77, 166, 255, 0.14)", // scan-lines / grid ticks
  ink: "#eaf4ff", // brightest heading ink
  muted: "#6f9fce", // muted labels / data keys
};

/* hex (#rgb or #rrggbb) + alpha → rgba() string. */
export const rgba = (hex, a) => {
  const h = hex.replace("#", "");
  const f = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(f, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};

/* Pre-baked holographic glows for box-shadow / text-shadow. */
export const GLOW = {
  blue: `0 0 12px ${rgba("#4da6ff", 0.5)}`,
  amber: `0 0 12px ${rgba("#ffb84d", 0.45)}`,
  alert: `0 0 12px ${rgba("#ff4d4d", 0.5)}`,
};
