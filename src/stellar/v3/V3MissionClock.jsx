/*
 * V3MissionClock — ambient corner readout in Space Mono. Shows session TRANSIT
 * (elapsed since mount, mm:ss) plus the tour's active planet name. Reads like
 * a mission-control dashboard extending the BootLoader's "systems online"
 * vocabulary throughout the session. Fixed bottom-left, hidden on compact viewports.
 * Freezes under prefers-reduced-motion (still shows a static readout, no ticking).
 */
import { memo, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import useViewport from "../useViewport";

const formatTime = (ms) => {
  const s = Math.floor(ms / 1000);
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
};

function V3MissionClock({ stops = [], activeIdx = 0, hidden = false }) {
  const { isCompact } = useViewport();
  const reduce = useReducedMotion();
  const [now, setNow] = useState(0);
  const t0 = useRef(0);

  useEffect(() => {
    t0.current = performance.now();
    if (reduce) return undefined;
    /* Update once per second — the "TRANSIT" readout only needs mm:ss precision. */
    const id = setInterval(() => setNow(performance.now() - t0.current), 1000);
    return () => clearInterval(id);
  }, [reduce]);

  if (isCompact) return null;

  const active = stops[activeIdx];
  const label = active?.label || active?.id || "SOL";

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        left: 34,
        bottom: 22,
        zIndex: 43,
        pointerEvents: "none",
        fontFamily: "var(--v3-font-mono)",
        fontSize: 10,
        letterSpacing: ".22em",
        textTransform: "uppercase",
        color: "var(--v3-fg-mute)",
        display: "flex",
        gap: 22,
        alignItems: "baseline",
        opacity: hidden ? 0 : 0.9,
        transition: "opacity .35s ease",
      }}
    >
      <span>
        <span style={{ color: "var(--v3-accent)" }}>Transit</span> · <span style={{ color: "var(--v3-fg)", fontVariantNumeric: "tabular-nums" }}>{formatTime(now)}</span>
      </span>
      <span>
        <span style={{ color: "var(--v3-accent)" }}>Now</span> · <span style={{ color: "var(--v3-fg)" }}>{label}</span>
      </span>
      <span>
        <span style={{ color: "var(--v3-accent)" }}>Stop</span> · <span style={{ color: "var(--v3-fg)", fontVariantNumeric: "tabular-nums" }}>{String(activeIdx + 1).padStart(2, "0")} / {String(stops.length).padStart(2, "0")}</span>
      </span>
    </div>
  );
}

export default memo(V3MissionClock);
