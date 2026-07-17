/*
 * BootLoader — "systems online" telemetry boot (redesign 2026-07).
 *
 * Full-viewport mission-control screen shown from the first paint that STAYS
 * up until the whole experience has settled: textures loaded (drei useProgress
 * on the default loading manager), the solar-system tour mounted + GPU-prewarmed
 * (`warmed`, driven by extrasPhase reaching its last tier), and a minimum
 * on-screen time elapsed so it never flashes. Then it fades out to reveal an
 * already-settled homepage — hiding every boot hitch (texture decode, VBO
 * upload, the intro fly-in) behind one clean screen.
 *
 * Composition (Syne · Sora · Space Mono):
 *   - Corner telemetry (mono): mission id · timestamp · portfolio version · transit
 *   - Center: mono kicker "SYSTEMS ONLINE" · huge Sol-tinted Syne name reveal ·
 *     4 checkpoint lines that "come online" as real progress passes their thresholds
 *     (STAR CATALOG → EPHEMERIDES → SHADERS COMPILED → TOUR WARMED)
 *   - Hairline progress bar + mono percent
 * Progress bar is max(real asset %, time %) — always advances, still reflects
 * real load. Capped at 99% until truly ready. MAX_MS failsafe lifts even if
 * a load hangs. Reduced-motion: instant, no reveals.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { useProgress } from "@react-three/drei";

const MIN_MS_FULL = 2400;
const MIN_MS_REDUCED = 1000;
const MAX_MS = 9000;

/* Checkpoints — pct thresholds when each one flips to "online". */
const CHECKPOINTS = [
  { label: "Star catalog", threshold: 22 },
  { label: "Ephemerides", threshold: 52 },
  { label: "Shaders compiled", threshold: 78 },
  { label: "Tour warmed", threshold: 99 },
];

const S = {
  root: {
    position: "fixed",
    inset: 0,
    zIndex: 9999,
    background: "radial-gradient(120% 90% at 50% 40%, #0a0e1a 0%, #050609 55%, #030409 100%)",
    color: "var(--v3-fg, #eef1f8)",
    display: "grid",
    gridTemplateRows: "auto 1fr auto",
    padding: "clamp(20px, 3vw, 40px)",
  },
  cornerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    fontFamily: "'Space Mono', ui-monospace, monospace",
    fontSize: 10,
    letterSpacing: ".24em",
    textTransform: "uppercase",
    color: "rgba(200, 210, 230, 0.5)",
    gap: 24,
    flexWrap: "wrap",
  },
  cornerK: { color: "var(--v3-accent, #e9c675)" },
  center: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: "clamp(18px, 2.4vh, 32px)",
    width: "min(560px, 88vw)",
    justifySelf: "center",
    textAlign: "center",
  },
  kicker: {
    fontFamily: "'Space Mono', ui-monospace, monospace",
    fontSize: 11,
    letterSpacing: ".34em",
    textTransform: "uppercase",
    color: "rgba(200, 210, 230, 0.5)",
    paddingLeft: ".34em",
  },
  name: {
    fontFamily: "'Syne', system-ui, sans-serif",
    fontWeight: 700,
    fontSize: "clamp(38px, 5.5vw, 76px)",
    lineHeight: 0.92,
    letterSpacing: "-.02em",
    color: "color-mix(in oklab, var(--v3-accent, #e9c675) 62%, #ffffff 38%)",
    margin: 0,
    transition: "opacity .6s ease, transform .6s cubic-bezier(0.25,0.1,0.25,1)",
    overflowWrap: "normal",
    wordBreak: "keep-all",
  },
  checklist: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    width: "min(340px, 84vw)",
    marginTop: 6,
  },
  cpRow: (online) => ({
    display: "grid",
    gridTemplateColumns: "18px 1fr auto",
    gap: 12,
    alignItems: "baseline",
    padding: "6px 0",
    borderBottom: "1px dotted rgba(255,255,255,.08)",
    fontFamily: "'Space Mono', ui-monospace, monospace",
    fontSize: 10.5,
    letterSpacing: ".18em",
    textTransform: "uppercase",
    color: online ? "var(--v3-fg, #eef1f8)" : "rgba(200, 210, 230, 0.35)",
    transition: "color .3s ease",
  }),
  cpMark: (online) => ({
    color: online ? "var(--v3-accent, #e9c675)" : "rgba(200, 210, 230, 0.25)",
    fontWeight: 700,
    transition: "color .3s ease",
  }),
  cpStatus: (online) => ({
    color: online ? "var(--v3-accent, #e9c675)" : "rgba(200, 210, 230, 0.35)",
    fontSize: 9,
    letterSpacing: ".22em",
    transition: "color .3s ease",
  }),
  progressWrap: {
    position: "relative",
    height: 1,
    width: "min(340px, 84vw)",
    background: "rgba(255, 255, 255, 0.08)",
    overflow: "hidden",
    marginTop: 4,
  },
  progressFill: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(90deg, color-mix(in oklab, var(--v3-accent, #e9c675) 30%, transparent), var(--v3-accent, #e9c675))",
    boxShadow: "0 0 8px color-mix(in oklab, var(--v3-accent, #e9c675) 60%, transparent)",
    transformOrigin: "left center",
    transition: "transform .12s linear",
    willChange: "transform",
  },
  pctRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    width: "min(340px, 84vw)",
    fontFamily: "'Space Mono', ui-monospace, monospace",
    fontSize: 10,
    letterSpacing: ".22em",
    textTransform: "uppercase",
    color: "rgba(200, 210, 230, 0.5)",
    marginTop: 2,
  },
  pctVal: {
    color: "var(--v3-accent, #e9c675)",
    fontVariantNumeric: "tabular-nums",
  },
};

const BootLoader = ({ warmed = false, reducedMotion = false, onDone }) => {
  const { progress, active } = useProgress();
  const [pct, setPct] = useState(0);
  const [elapsed, setElapsed] = useState(0);
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
      const ms = performance.now() - t0.current;
      const { progress: p, active: a, warmed: w } = live.current;
      const timePct = Math.min(100, (ms / MIN_MS) * 100);
      const target = Math.max(p, timePct);
      const ready = (ms >= MIN_MS && w && !a && p >= 99) || ms >= MAX_MS;
      setPct((prev) => {
        const to = ready ? 100 : Math.min(99, target);
        return prev + (to - prev) * 0.12; // ease toward target
      });
      setElapsed(ms);
      if (ready && !leaving) setLeaving(true);
      if (!ready || !leaving) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reducedMotion, leaving]);

  /* Failsafe — release the boot gate even if opacity transitionend is missed. */
  useEffect(() => {
    if (!leaving) return undefined;
    const id = setTimeout(() => onDone?.(), 1100);
    return () => clearTimeout(id);
  }, [leaving, onDone]);

  const shown = Math.round(pct);
  const transit = (elapsed / 1000).toFixed(1);
  /* Name reveal beat — appears once we're past the shader/warm threshold, so it
     lands as the final "systems online" moment. Under reduced-motion, always on. */
  const nameOnline = reducedMotion || shown >= 60;

  /* Stable "MISSION ID" for the corner (deterministic per session, not per render). */
  const missionId = useMemo(() => {
    /* 4-char alnum from performance.now — no Math.random in this codebase's ethos. */
    const n = Math.floor(performance.now() * 1000) % (36 ** 4);
    return "MSN-" + n.toString(36).toUpperCase().padStart(4, "0");
  }, []);

  return (
    <div
      role="status"
      aria-label="Loading the experience"
      onTransitionEnd={(e) => { if (e.propertyName === "opacity" && leaving) onDone?.(); }}
      style={{
        ...S.root,
        opacity: leaving ? 0 : 1,
        transition: "opacity 0.8s ease",
        pointerEvents: leaving ? "none" : "auto",
      }}
    >
      {/* ---- top corners: mission id · systems check ---- */}
      <div style={S.cornerRow}>
        <span>
          <span style={S.cornerK}>Stellar</span> · <span>{missionId}</span>
        </span>
        <span>Systems check · Portfolio v3</span>
      </div>

      {/* ---- center reveal ---- */}
      <div style={S.center}>
        <div style={S.kicker}>Systems online</div>
        <h1
          style={{
            ...S.name,
            opacity: nameOnline ? 1 : 0,
            transform: nameOnline ? "translateY(0)" : "translateY(10px)",
          }}
        >
          Rugwed Patharkar
        </h1>

        <div style={S.checklist}>
          {CHECKPOINTS.map((c) => {
            const online = shown >= c.threshold;
            return (
              <div key={c.label} style={S.cpRow(online)}>
                <span style={S.cpMark(online)}>{online ? "✓" : "·"}</span>
                <span style={{ textAlign: "left" }}>{c.label}</span>
                <span style={S.cpStatus(online)}>{online ? "online" : "…"}</span>
              </div>
            );
          })}
        </div>

        <div style={S.progressWrap} aria-hidden>
          <div style={{ ...S.progressFill, transform: `scaleX(${pct / 100})` }} />
        </div>

        <div style={S.pctRow}>
          <span>Boot</span>
          <span style={S.pctVal}>{shown}%</span>
        </div>
      </div>

      {/* ---- bottom corners: elapsed · fallback label ---- */}
      <div style={S.cornerRow}>
        <span>Rugwed · <span style={S.cornerK}>Backend & Agentic AI</span></span>
        <span>Transit · <span style={S.cornerK}>{transit}s</span></span>
      </div>
    </div>
  );
};

export default BootLoader;
