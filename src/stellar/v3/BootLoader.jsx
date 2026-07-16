/*
 * BootLoader — the opening "systems calibrating" screen.
 *
 * A full-screen overlay shown from the first paint that STAYS up until the whole
 * experience has settled: textures loaded (drei useProgress on the default
 * loading manager), the solar-system tour mounted + GPU-prewarmed (`warmed`,
 * driven by extrasPhase reaching its last tier), and a minimum on-screen time
 * elapsed so it never flashes. Then it fades out to reveal an already-settled
 * homepage — hiding every boot hitch (texture decode, VBO upload, the intro
 * fly-in) behind one clean screen.
 *
 * Progress bar is max(real asset %, time %) so it always advances smoothly and
 * reflects real loading; capped at 99% until truly ready, then 100 + fade. A
 * MAX_MS failsafe lifts the screen even if an asset hangs.
 */
import { useEffect, useRef, useState } from "react";
import { useProgress } from "@react-three/drei";

const MIN_MS_FULL = 2400;   // deliberate settle window (covers the intro)
const MIN_MS_REDUCED = 1000;
const MAX_MS = 9000;        // failsafe — lift even if a load hangs

/* Cosmic status line, keyed to how far along the bar is. */
const phaseLabel = (pct) => {
  if (pct < 28) return "PLOTTING STELLAR COORDINATES";
  if (pct < 55) return "LOADING STAR CATALOGUE";
  if (pct < 80) return "WARMING THE ENGINES";
  if (pct < 100) return "ALIGNING THE MILKY WAY";
  return "ENTERING ORBIT";
};

const BootLoader = ({ warmed = false, reducedMotion = false, onDone }) => {
  const { progress, active } = useProgress();
  const [pct, setPct] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const t0 = useRef(performance.now());
  /* Keep the latest live values in refs so the rAF loop reads them without
     re-subscribing each frame. */
  const live = useRef({ progress, active, warmed });
  live.current = { progress, active, warmed };

  useEffect(() => {
    const MIN_MS = reducedMotion ? MIN_MS_REDUCED : MIN_MS_FULL;
    let raf;
    const tick = () => {
      const elapsed = performance.now() - t0.current;
      const { progress: p, active: a, warmed: w } = live.current;
      const timePct = Math.min(100, (elapsed / MIN_MS) * 100);
      const target = Math.max(p, timePct);
      const ready =
        (elapsed >= MIN_MS && w && !a && p >= 99) || elapsed >= MAX_MS;
      setPct((prev) => {
        const to = ready ? 100 : Math.min(99, target);
        return prev + (to - prev) * 0.12; // ease toward target
      });
      if (ready && !leaving) setLeaving(true);
      if (!ready || !leaving) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reducedMotion, leaving]);

  /* Failsafe — if the opacity transitionend is ever missed, still release the
     boot gate (otherwise scroll would stay locked). */
  useEffect(() => {
    if (!leaving) return undefined;
    const id = setTimeout(() => onDone?.(), 1100);
    return () => clearTimeout(id);
  }, [leaving, onDone]);

  const shown = Math.round(pct);
  return (
    <div
      role="status"
      aria-label="Loading the experience"
      onTransitionEnd={(e) => { if (e.propertyName === "opacity" && leaving) onDone?.(); }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#03050d",
        opacity: leaving ? 0 : 1,
        transition: "opacity 0.8s ease",
        pointerEvents: leaving ? "none" : "auto",
      }}
    >
      <div style={{ width: "min(340px, 74vw)", textAlign: "center" }}>
        <div
          style={{
            font: "500 11px/1 'Space Mono', monospace",
            letterSpacing: "0.34em",
            textTransform: "uppercase",
            color: "rgba(212, 220, 236, 0.5)",
            marginBottom: 18,
            paddingLeft: "0.34em",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {phaseLabel(shown)}
        </div>
        <div
          style={{
            position: "relative",
            height: 2,
            width: "100%",
            background: "rgba(255, 255, 255, 0.1)",
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              width: `${pct}%`,
              background:
                "linear-gradient(90deg, color-mix(in oklab, var(--v3-accent, #f5c96b) 55%, transparent), var(--v3-accent, #f5c96b))",
              boxShadow: "0 0 10px color-mix(in oklab, var(--v3-accent, #f5c96b) 60%, transparent)",
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 12,
            font: "500 11px/1 'Space Mono', monospace",
            letterSpacing: "0.2em",
            color: "rgba(212, 220, 236, 0.42)",
          }}
        >
          <span>STELLAR</span>
          <span style={{ color: "var(--v3-accent, #f5c96b)" }}>{shown}%</span>
        </div>
      </div>
    </div>
  );
};

export default BootLoader;
