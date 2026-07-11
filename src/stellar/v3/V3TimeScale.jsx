/*
 * §11 Interactive — time-scale control.
 *
 * A small HUD widget in the bottom-left that sets `clock.scale` on the shared
 * SceneClock ref. Everything time-driven (planet orbits, Sun churn, anomaly
 * animations, camera scrub speed, etc.) now honors SceneClock — so a single
 * dial bends the whole system coherently. Fine after Phase 2's §4.4
 * migration through Phase 4's per-instance accumulators.
 *
 * Values: pause (0), 0.5×, 1× (default), 2×, 4×. Discrete stops avoid a
 * continuous slider's dexterity problem and match the plan's guidance
 * ("Mercury visibly orbits fast" at ×4). Reduced-motion HIDES the widget
 * entirely — SceneClock's own reducedMotion gate holds scale at 0 so a user
 * dial would be a no-op.
 *
 * The active button gets the accent tint via .v3-glass-accent (same pattern
 * as the section master lists). Hidden on mobile — the compact layout has
 * no space for it, and mobile is snap-only anyway.
 */
import { useEffect, useState } from "react";
import useViewport from "../useViewport";

const STOPS = [
  { label: "II",  value: 0,    aria: "Pause" },     // pause glyph
  { label: "½×",  value: 0.5,  aria: "Half speed" },
  { label: "1×",  value: 1,    aria: "Normal speed" },
  { label: "2×",  value: 2,    aria: "Double speed" },
  { label: "4×",  value: 4,    aria: "Quadruple speed" },
];

export default function V3TimeScale({ clock }) {
  const { isMobile, reducedMotion } = useViewport();
  const [active, setActive] = useState(1); // "1×"

  useEffect(() => {
    if (!clock) return;
    clock.scale = STOPS[active].value;
  }, [clock, active]);

  if (isMobile || reducedMotion || !clock) return null;

  return (
    <div
      role="group"
      aria-label="Time scale"
      style={{
        position: "fixed",
        bottom: "clamp(14px, 2vh, 24px)",
        left: "clamp(14px, 2vw, 24px)",
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: 4,
        border: "1px solid var(--v3-line, rgba(255,255,255,0.07))",
        borderRadius: 999,
        background: "color-mix(in oklab, var(--v3-bg-void, #050609) 50%, transparent)",
        zIndex: 50,
        pointerEvents: "auto",
      }}
    >
      <span aria-hidden style={{
        fontFamily: "var(--v3-font-mono)",
        fontSize: "clamp(9px, 0.3vw + 6px, 11px)",
        letterSpacing: ".24em",
        textTransform: "uppercase",
        color: "var(--v3-fg-mute, #7c8391)",
        padding: "0 8px",
      }}>Time</span>
      {STOPS.map((s, i) => {
        const isActive = i === active;
        return (
          <button
            key={s.label}
            type="button"
            aria-label={s.aria}
            aria-pressed={isActive}
            onClick={() => setActive(i)}
            className={isActive ? "v3-glass-accent" : "v3-glass"}
            style={{
              all: "unset",
              cursor: "pointer",
              minWidth: 28,
              padding: "clamp(4px, 0.4vw, 6px) clamp(8px, 0.9vw, 12px)",
              borderRadius: 999,
              fontFamily: "var(--v3-font-mono)",
              fontSize: "clamp(10px, 0.35vw + 7px, 12px)",
              fontVariantNumeric: "tabular-nums",
              color: isActive ? "var(--v3-fg, #f5f7fc)" : "var(--v3-fg-dim, #b3b9c7)",
              textAlign: "center",
            }}
          >{s.label}</button>
        );
      })}
    </div>
  );
}
