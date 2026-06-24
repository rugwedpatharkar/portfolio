/* eslint-disable react/prop-types */
import { useState } from "react";

/*
 * Read-mode "living system" time control. The whole model is physically real
 * (real orbits, periods following Kepler), but at 1× the orbits creep — so this
 * lets a visitor speed up time and actually WATCH the system come alive: planets
 * sweep around, the inner ones lap the outer, Halley dives toward the Sun, and
 * an eclipse forms when a body crosses in front. It only changes the *rate* of
 * real time (sceneClock.scale) — nothing about the bodies. Minimal by design, to
 * match the rest of the Read UI; hidden under reduced-motion (time is frozen
 * there) and in the game (which has its own console).
 */

const MONO = "'JetBrains Mono', monospace";
const STEPS = [
  { s: 0, label: "❙❙", title: "Pause the orbits" },
  { s: 1, label: "1×", title: "Real-time drift" },
  { s: 30, label: "30×", title: "Watch the inner planets move" },
  { s: 300, label: "300×", title: "Watch the whole system come alive" },
];

const TimeControl = ({ clockRef, animate = true }) => {
  const [scale, setScale] = useState(() => clockRef?.current?.scale ?? 1);
  const set = (s) => {
    if (clockRef?.current) clockRef.current.scale = s;
    setScale(s);
  };
  return (
    <div
      style={{
        position: "fixed", bottom: 18, left: "50%", transform: "translateX(-50%)",
        zIndex: 46, display: "flex", alignItems: "center", gap: 4,
        padding: "5px 7px", borderRadius: 11,
        background: "rgba(8,11,24,0.58)", border: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(12px) saturate(1.1)", WebkitBackdropFilter: "blur(12px) saturate(1.1)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
      }}
    >
      <span style={{ fontFamily: MONO, fontSize: 8, letterSpacing: "0.16em", color: "rgba(223,217,255,0.5)", padding: "0 3px" }}>TIME</span>
      {STEPS.map((t) => {
        const active = scale === t.s;
        return (
          <button
            key={t.s}
            onClick={() => set(t.s)}
            title={t.title}
            aria-label={t.title}
            style={{
              all: "unset", cursor: "pointer", minWidth: 28, height: 24, padding: "0 7px",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              borderRadius: 7, fontFamily: MONO, fontSize: 11,
              color: active ? "#fff" : "rgba(255,255,255,0.6)",
              background: active ? "rgba(145,94,255,0.3)" : "transparent",
              border: `1px solid ${active ? "rgba(145,94,255,0.55)" : "transparent"}`,
              transition: animate ? "background 150ms ease, color 150ms ease" : "none",
            }}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
};

export default TimeControl;
