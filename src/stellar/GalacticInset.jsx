 
import { useMemo } from "react";

/*
 * "You are here" — a tasteful, STATIC galactic-context inset (no helical motion).
 * A small top-down spiral-galaxy SVG with a marker on the Orion Arm showing the
 * Sun's place in the Milky Way. Pure DOM/SVG overlay (no 3D / no postprocessing),
 * desktop-only, subtle. The only motion is a gentle marker pulse, dropped under
 * reduced-motion.
 */

/* Logarithmic spiral arm → an SVG path string. r = a·e^(b·θ), centred at 100,100
   in a 0..200 viewBox; capped near the edge. */
const arm = (offset, { a = 9, b = 0.34, turns = 1.15, steps = 70 } = {}) => {
  let d = "";
  for (let i = 0; i <= steps; i++) {
    const th = (i / steps) * turns * Math.PI * 2;
    const r = a * Math.exp(b * th);
    if (r > 95) break;
    const x = 100 + r * Math.cos(th + offset);
    const y = 100 + r * Math.sin(th + offset);
    d += `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)} `;
  }
  return d;
};

const GalacticInset = ({ reducedMotion = false }) => {
  const arms = useMemo(
    () => [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((o) => arm(o)),
    []
  );
  /* Faint background star dots (deterministic so they don't reflow). */
  const dots = useMemo(
    () =>
      Array.from({ length: 34 }, (_, i) => {
        const a = (i * 2.39996) % (Math.PI * 2); // golden-angle spread
        const r = 12 + ((i * 53) % 84);
        return { x: 100 + r * Math.cos(a), y: 100 + r * Math.sin(a), o: 0.12 + ((i * 31) % 30) / 100 };
      }),
    []
  );

  /* The Sun, ~55% out on a spiral arm (Orion Arm). */
  const sun = { x: 134, y: 84 };

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        top: "5.5vh",
        right: 22,
        width: 168,
        zIndex: 44,
        pointerEvents: "none",
        textAlign: "center",
        opacity: 0.9,
      }}
    >
      <svg viewBox="0 0 200 200" width="148" height="148" style={{ display: "block", margin: "0 auto", filter: "drop-shadow(0 0 10px rgba(120,150,255,0.25))" }}>
        <defs>
          <radialGradient id="gi-disc" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#cdd9ff" stopOpacity="0.5" />
            <stop offset="28%" stopColor="#8ea0e0" stopOpacity="0.16" />
            <stop offset="70%" stopColor="#6678c0" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#000010" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="gi-core" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff7e6" stopOpacity="1" />
            <stop offset="45%" stopColor="#ffe7b0" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#ffcaa0" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* faint disc halo */}
        <circle cx="100" cy="100" r="96" fill="url(#gi-disc)" />
        {/* background stars */}
        {dots.map((d, i) => (
          <circle key={i} cx={d.x.toFixed(1)} cy={d.y.toFixed(1)} r="0.7" fill="#cfe0ff" opacity={d.o} />
        ))}
        {/* spiral arms */}
        {arms.map((d, i) => (
          <path key={i} d={d} fill="none" stroke="#aebfff" strokeWidth={i % 2 ? 2.4 : 3.2} strokeLinecap="round" opacity={i % 2 ? 0.28 : 0.42} />
        ))}
        {/* glowing core */}
        <circle cx="100" cy="100" r="26" fill="url(#gi-core)" />

        {/* you-are-here marker */}
        <circle cx={sun.x} cy={sun.y} r="9" fill="none" stroke="#9be7ff" strokeWidth="1" opacity="0.55">
          {!reducedMotion && <animate attributeName="r" values="4;11;4" dur="2.8s" repeatCount="indefinite" />}
          {!reducedMotion && <animate attributeName="opacity" values="0.7;0;0.7" dur="2.8s" repeatCount="indefinite" />}
        </circle>
        <circle cx={sun.x} cy={sun.y} r="2.6" fill="#aef0ff" stroke="#ffffff" strokeWidth="0.6" />
      </svg>
      <div
        style={{
          fontFamily: "'Martian Mono', monospace",
          fontSize: 8.5,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "rgba(174,200,255,0.85)",
          marginTop: -6,
          lineHeight: 1.5,
          textShadow: "0 1px 8px rgba(0,0,0,0.8)",
        }}
      >
        You are here
        <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 7.5, letterSpacing: "0.06em", textTransform: "none" }}>
          Sol · Orion Arm · ~26,000 ly from the core
        </div>
      </div>
    </div>
  );
};

export default GalacticInset;
