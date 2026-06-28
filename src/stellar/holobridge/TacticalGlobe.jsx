/*
 * Tactical globe — a small wireframe hologram twin of the scanned planet, on the
 * facts panel. Pure SVG (no WebGL), so it's cheap and works on every tier. The
 * slow "spin" is a CSS animation (the meridian sweep), frozen when `spinning` is
 * false (reduced-motion / mobile).
 */
export default function TacticalGlobe({ color = "#6fd2ff", size = 48, spinning = true }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      aria-hidden="true"
      className={spinning ? "holo-globe holo-globe--spin" : "holo-globe"}
    >
      <circle cx="24" cy="24" r="19" fill={color} fillOpacity="0.05" />
      <g fill="none" stroke={color} strokeWidth="1">
        <circle cx="24" cy="24" r="19" strokeOpacity="0.55" />
        <ellipse cx="24" cy="24" rx="7" ry="19" strokeOpacity="0.4" />
        <ellipse cx="24" cy="24" rx="14" ry="19" strokeOpacity="0.28" />
        <ellipse cx="24" cy="24" rx="19" ry="7" strokeOpacity="0.35" />
        <ellipse cx="24" cy="24" rx="19" ry="13" strokeOpacity="0.22" />
      </g>
    </svg>
  );
}
