 
import { useState } from "react";

/*
 * Minimal wayfinding for the scroll-driven tour:
 *   - ProgressRail: a column of dots on the right edge, one per stop, with the
 *     active one lit in the planet's accent. Hover/focus reveals the label;
 *     click/Enter jumps there (also gives keyboard + touch users real nav).
 *   - ScrollHint: a one-time "scroll to explore" nudge on the hero that fades
 *     the moment the visitor interacts.
 * Kept deliberately quiet so it doesn't break the otherwise chrome-free UI.
 */

export const ProgressRail = ({ destinations, activeIdx, onJump }) => {
  const [hover, setHover] = useState(-1);
  return (
    <nav
      aria-label="Solar system stops"
      style={{
        position: "fixed",
        right: 16,
        top: "50%",
        transform: "translateY(-50%)",
        zIndex: 46,
        display: "flex",
        flexDirection: "column",
        gap: 9,
        alignItems: "flex-end",
      }}
    >
      {destinations.map((d, i) => {
        const active = i === activeIdx;
        const show = active || hover === i;
        return (
          <button
            key={d.id}
            onClick={() => onJump(i)}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(-1)}
            onFocus={() => setHover(i)}
            onBlur={() => setHover(-1)}
            aria-label={`Go to ${d.label}`}
            aria-current={active ? "true" : undefined}
            style={{
              all: "unset",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 9,
              padding: "3px 2px",
            }}
          >
            <span
              style={{
                fontFamily: "'Martian Mono', monospace",
                fontSize: 9.5,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: active ? d.color : "rgba(255,255,255,0.72)",
                textShadow: "0 1px 7px rgba(0,0,0,0.85)",
                whiteSpace: "nowrap",
                opacity: show ? 1 : 0,
                transform: show ? "translateX(0)" : "translateX(6px)",
                transition: "opacity 0.22s ease, transform 0.22s ease",
                pointerEvents: "none",
              }}
            >
              {d.label}
            </span>
            <span
              style={{
                width: active ? 9 : 6,
                height: active ? 9 : 6,
                borderRadius: "50%",
                background: active ? d.color : "rgba(255,255,255,0.34)",
                boxShadow: active ? `0 0 9px ${d.color}` : "none",
                transition: "all 0.25s ease",
                flexShrink: 0,
              }}
            />
          </button>
        );
      })}
    </nav>
  );
};

export const ScrollHint = ({ visible }) => (
  <div
    aria-hidden
    style={{
      position: "fixed",
      bottom: 56,
      left: 0,
      right: 0,
      display: "flex",
      justifyContent: "center",
      zIndex: 46,
      pointerEvents: "none",
      opacity: visible ? 1 : 0,
      transition: "opacity 0.7s ease",
    }}
  >
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 3,
        fontFamily: "'Martian Mono', monospace",
        fontSize: 10.5,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: "rgba(255,255,255,0.64)",
        textShadow: "0 1px 11px rgba(0,0,0,0.9)",
      }}
    >
      <span>scroll to explore the system</span>
      <span style={{ fontSize: 13, animation: "stellarChevron 1.6s ease-in-out infinite" }}>↓</span>
    </div>
  </div>
);
