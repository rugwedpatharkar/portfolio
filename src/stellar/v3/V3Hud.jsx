/*
 * V3Hud — the minimal FUI chrome for the v3 tour (sci-fi restraint: hairlines, mono
 * data, one accent, no fuigetry). A thin inset frame with corner ticks, a wordmark +
 * live stop counter, and a right-edge system rail (one tick per stop, active = accent,
 * clickable to jump). Pointer-transparent except the rail. Per-body accent via
 * --v3-accent. Hidden during the reveal-on-arrival flight fade is handled by opacity.
 */
import { motion, useReducedMotion } from "motion/react";
import useViewport from "../useViewport";

const Corner = ({ pos }) => {
  const base = { position: "absolute", width: 14, height: 14, borderColor: "var(--v3-line-strong)", borderStyle: "solid", borderWidth: 0 };
  const map = {
    tl: { top: -1, left: -1, borderTopWidth: 1, borderLeftWidth: 1 },
    tr: { top: -1, right: -1, borderTopWidth: 1, borderRightWidth: 1 },
    bl: { bottom: -1, left: -1, borderBottomWidth: 1, borderLeftWidth: 1 },
    br: { bottom: -1, right: -1, borderBottomWidth: 1, borderRightWidth: 1 },
  };
  return <i style={{ ...base, ...map[pos] }} />;
};

export default function V3Hud({ stops = [], activeIdx = 0, section = "", onJump }) {
  const { isCompact } = useViewport();
  const reduce = useReducedMotion();

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 44, pointerEvents: "none", fontFamily: "var(--v3-font-mono)" }}>
      {/* hairline frame + corner ticks */}
      <div style={{ position: "absolute", inset: 20, border: "1px solid var(--v3-line)", borderRadius: 11 }}>
        <Corner pos="tl" /><Corner pos="tr" /><Corner pos="bl" /><Corner pos="br" />
      </div>

      {/* section-arrival scan-sweep — a subtle per-body accent line crossing the
          frame on each stop arrival; keyed on activeIdx to replay, off under
          reduced motion. */}
      {!reduce && (
        <div key={activeIdx} aria-hidden style={{ position: "absolute", inset: 20, overflow: "hidden", borderRadius: 11, pointerEvents: "none" }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 2, background: "linear-gradient(90deg, transparent, var(--v3-accent), transparent)", opacity: 0, boxShadow: "0 0 22px var(--v3-accent)", animation: "v3ArrivalSweep 620ms cubic-bezier(.22,1,.36,1) forwards" }} />
        </div>
      )}
      <style>{`
        @keyframes v3ArrivalSweep{0%{transform:translateY(0);opacity:0}14%{opacity:.4}100%{transform:translateY(calc(100vh - 42px));opacity:0}}
        .v3-rail-tick{transition:transform 140ms cubic-bezier(.22,1,.36,1)}
        .v3-rail-tick:hover .v3-rail-label{opacity:.6!important}
        .v3-rail-tick:active{transform:scale(0.86)}
        @media (prefers-reduced-motion: reduce){.v3-rail-tick{transition:none}.v3-rail-tick:active{transform:none}}
      `}</style>

      {/* Top-left wordmark + top-right stop counter removed per the decluttered
          layout — the right-edge system rail still conveys position, and the
          per-body Planet Information card carries the planet name. */}

      {/* right-edge system rail — one tick per stop, clickable (desktop/tablet only;
          on compact the touch-scroll + counter cover navigation) */}
      {!isCompact && (
        <div style={{ position: "absolute", top: "50%", right: 34, transform: "translateY(-50%)", display: "flex", flexDirection: "column", gap: 9, pointerEvents: "auto" }}>
        {stops.map((s, i) => {
          const on = i === activeIdx;
          return (
            <button
              key={s.id || i}
              onClick={() => onJump?.(i)}
              title={s.label}
              aria-label={`Go to ${s.label}`}
              data-cursor
              className="v3-rail-tick"
              style={{ all: "unset", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8, height: 12 }}
            >
              <span className="v3-rail-label" style={{ fontSize: ".6rem", letterSpacing: ".1em", color: "var(--v3-accent)", opacity: on ? 1 : 0, transition: "opacity .25s", textTransform: "uppercase" }}>{s.label}</span>
              <motion.span
                animate={{ width: on ? 22 : 10, backgroundColor: on ? "var(--v3-accent)" : "rgba(255,255,255,0.28)" }}
                transition={{ type: "spring", stiffness: 320, damping: 26 }}
                style={{ height: 2, borderRadius: 2, display: "block" }}
              />
            </button>
          );
        })}
        </div>
      )}
    </div>
  );
}
