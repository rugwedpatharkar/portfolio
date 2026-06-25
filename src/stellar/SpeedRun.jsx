/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";
import { DESTINATIONS } from "./config/destinations";
import useViewport from "./useViewport";

/*
 * Opt-in speed-run mode (started from the command palette). While active, the
 * stopwatch starts when activeIdx leaves Sol; the visited set accumulates; once
 * all 12 destinations are visited it stops and stores the best time. Fires
 * "stellar:speedrun" with {seconds} on completion (Achievements listens for
 * sub-60s). Controlled via `active`; click the chip (or run the command again)
 * to stop. Desktop-only — racing 12 stops by scroll is awkward on a phone.
 */

const KEY = "stellar:speedrun:best";

const fmt = (ms) => {
  const s = Math.floor(ms / 1000);
  const cs = Math.floor((ms % 1000) / 10);
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}.${String(cs).padStart(2, "0")}`;
};

const SpeedRun = ({ activeIdx, active = false, onToggle }) => {
  const { isMobile } = useViewport();
  const [elapsed, setElapsed] = useState(0);
  const [done, setDone] = useState(false);
  const [best, setBest] = useState(() => {
    if (typeof window === "undefined") return null;
    const v = localStorage.getItem(KEY);
    return v ? Number(v) : null;
  });
  const startRef = useRef(0);
  const visitedRef = useRef(new Set());

  /* Reset on (re)activation */
  useEffect(() => {
    if (!active) return;
    visitedRef.current = new Set();
    startRef.current = 0;
    setElapsed(0);
    setDone(false);
  }, [active]);

  /* Track visits */
  useEffect(() => {
    if (!active || done) return;
    const dest = DESTINATIONS[activeIdx];
    if (!dest) return;
    if (startRef.current === 0 && dest.id !== "sol") {
      startRef.current = performance.now();
    }
    visitedRef.current.add(dest.id);
    if (DESTINATIONS.every((d) => visitedRef.current.has(d.id))) {
      const ms = performance.now() - startRef.current;
      setElapsed(ms);
      setDone(true);
      if (!best || ms < best) {
        setBest(ms);
        try { localStorage.setItem(KEY, String(ms)); } catch { /* ignore */ }
      }
      window.dispatchEvent(new CustomEvent("stellar:speedrun", { detail: { seconds: ms / 1000 } }));
    }
  }, [activeIdx, active, done, best]);

  /* Tick at ~10 Hz — the display only shows hundredths. */
  useEffect(() => {
    if (!active || done || startRef.current === 0) return undefined;
    const id = setInterval(() => setElapsed(performance.now() - startRef.current), 100);
    return () => clearInterval(id);
  }, [active, done]);

  if (isMobile || !active) return null;

  return (
    <div
      onClick={onToggle}
      title="Click to stop the speed run"
      style={{
        position: "fixed", top: 64, left: "50%", transform: "translateX(-50%)",
        display: "flex", alignItems: "center", gap: 10,
        padding: "6px 14px", borderRadius: 8,
        background: "rgba(255, 224, 102, 0.12)",
        backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 224, 102, 0.5)",
        fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
        color: "#ffe066", zIndex: 48, cursor: "pointer", userSelect: "none",
      }}
    >
      <span style={{ fontSize: 13 }}>⚡</span>
      <span style={{ letterSpacing: "0.12em" }}>SPEED RUN</span>
      <span style={{ color: done ? "#2fe0b0" : "#ffe066", fontWeight: 600 }}>{fmt(elapsed)}</span>
      {best != null && <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 9 }}>BEST {fmt(best)}</span>}
    </div>
  );
};

export default SpeedRun;
