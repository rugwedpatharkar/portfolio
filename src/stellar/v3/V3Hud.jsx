"use client";
/*
 * V3Hud — the minimal FUI chrome for the v3 tour (sci-fi restraint: hairlines, mono
 * data, one accent, no fuigetry). A thin inset frame with corner ticks, a wordmark +
 * live stop counter, and a right-edge system rail (one tick per stop, active = accent,
 * clickable to jump). Pointer-transparent except the rail. Per-body accent via
 * --v3-accent. Hidden during the reveal-on-arrival flight fade is handled by opacity.
 */
import { motion } from "motion/react";
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

export default function V3Hud({ stops = [], activeIdx = 0, label = "", section = "", onJump }) {
  const { isCompact } = useViewport();
  const total = stops.length;
  const num = (n) => String(n + 1).padStart(2, "0");

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 44, pointerEvents: "none", fontFamily: "var(--v3-font-mono)" }}>
      {/* hairline frame + corner ticks */}
      <div style={{ position: "absolute", inset: 20, border: "1px solid var(--v3-line)", borderRadius: 11 }}>
        <Corner pos="tl" /><Corner pos="tr" /><Corner pos="bl" /><Corner pos="br" />
      </div>

      {/* top-left wordmark (hidden on compact — the counter carries context) */}
      {!isCompact && (
        <div style={{ position: "absolute", top: 34, left: 40, fontSize: ".72rem", letterSpacing: ".24em", textTransform: "uppercase", color: "var(--v3-fg-mute)", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--v3-accent)", boxShadow: "0 0 8px var(--v3-accent)" }} />
          Stellar · System Tour
        </div>
      )}

      {/* top-right live stop counter */}
      <div style={{ position: "absolute", top: 34, right: 40, fontSize: ".72rem", letterSpacing: ".18em", textTransform: "uppercase", color: "var(--v3-fg-mute)", textAlign: "right" }}>
        <span style={{ color: "var(--v3-accent)" }}>{num(activeIdx)}</span> / {num(total - 1)} · {label}
      </div>

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
              style={{ all: "unset", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8, height: 12 }}
            >
              <span style={{ fontSize: ".6rem", letterSpacing: ".1em", color: "var(--v3-accent)", opacity: on ? 1 : 0, transition: "opacity .25s", textTransform: "uppercase" }}>{s.label}</span>
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
