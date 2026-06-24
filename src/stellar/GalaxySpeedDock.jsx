/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";

/*
 * Galaxy-view speed control. Writes the shared virtual clock's `scale` so the
 * helix visibly forms — from a slow drift up to a "galactic year" sprint. The
 * SceneClock accumulates delta·scale, so changing scale bends speed without
 * phase-jumping. StellarApp resets scale to 1 when the galaxy view closes.
 */

const PRESETS = [
  { label: "Pause", scale: 0 },
  { label: "Drift", scale: 220 },
  { label: "Flow", scale: 1400 },
  { label: "Galactic year", scale: 6000 },
];

const GalaxySpeedDock = ({ clock }) => {
  const [active, setActive] = useState(2); // Flow

  useEffect(() => {
    clock.scale = PRESETS[active].scale;
  }, [active, clock]);

  return (
    <div
      style={{
        position: "fixed",
        bottom: 26,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 50,
        display: "flex",
        gap: 4,
        padding: 4,
        borderRadius: 999,
        background: "rgba(8,11,24,0.78)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.14)",
        boxShadow: "0 12px 36px rgba(0,0,0,0.5)",
      }}
    >
      {PRESETS.map((p, i) => (
        <button
          key={p.label}
          onClick={() => setActive(i)}
          aria-pressed={active === i}
          style={{
            all: "unset",
            cursor: "pointer",
            padding: "7px 13px",
            borderRadius: 999,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: active === i ? "#06122a" : "rgba(255,255,255,0.74)",
            background: active === i ? "rgba(150,195,255,0.92)" : "transparent",
            transition: "all 0.15s ease",
          }}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
};

export default GalaxySpeedDock;
