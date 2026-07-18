/*
 * V3ArrivalBeat — a mission-control ping that briefly announces the tour's new
 * stop as the camera lands there. A single Space Mono line fades in top-right
 * for ~2s and dissolves. Extends the BootLoader's "systems online" vocabulary
 * to every planet arrival, and grounds the tour in real per-body facts
 * (distance / classification / label) that the DESTINATIONS registry already
 * knows. Under reduced-motion the beat renders instantly (no slide) and
 * dissolves without the sliding transform.
 */
import { memo, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import useViewport from "../useViewport";

const CINE = [0.25, 0.1, 0.25, 1];

function V3ArrivalBeat({ stops = [], activeIdx = 0, hidden = false }) {
  const { isCompact } = useViewport();
  const reduce = useReducedMotion();
  const [visible, setVisible] = useState(null);

  useEffect(() => {
    const stop = stops[activeIdx];
    if (!stop) return undefined;
    /* Show for ~2.4s from arrival, then dissolve. Keyed on activeIdx via state
       replacement so a rapid nav sequence always shows the LATEST beat. */
    setVisible({ id: stop.id, label: stop.label || stop.id, kind: stop.kind, seq: activeIdx });
    const id = setTimeout(() => setVisible((v) => (v && v.seq === activeIdx ? null : v)), 2400);
    return () => clearTimeout(id);
  }, [activeIdx, stops]);

  if (isCompact) return null;

  const stop = stops[activeIdx];
  const kindTag = stop?.kind === "star" ? "Star" : stop?.kind === "planet" ? "Planet" : stop?.kind === "overview" ? "Vista" : "Signal";

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        top: 34,
        right: "calc(34px + 60px)", // clear the V3Hud rail on the right
        zIndex: 43,
        pointerEvents: "none",
        fontFamily: "var(--v3-font-mono)",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: 4,
        opacity: hidden ? 0 : 1,
        transition: "opacity .3s ease",
      }}
    >
      <AnimatePresence mode="wait">
        {visible && (
          <motion.div
            key={visible.seq}
            initial={reduce ? { opacity: 0 } : { opacity: 0, x: 12 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, x: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, x: 12 }}
            transition={{ duration: 0.35, ease: CINE }}
            style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3 }}
          >
            <span style={{ fontSize: 9, letterSpacing: ".28em", textTransform: "uppercase", color: "var(--v3-accent)" }}>
              ● Signal Lock
            </span>
            <span style={{ fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", color: "var(--v3-fg)" }}>
              {kindTag} · <span style={{ color: "var(--v3-accent)" }}>{String(visible.label).toUpperCase()}</span> · Online
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default memo(V3ArrivalBeat);
