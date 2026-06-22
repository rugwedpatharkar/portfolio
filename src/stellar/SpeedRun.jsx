/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";
import { DESTINATIONS } from "./config/destinations";

/*
 * Speed-run mode. Toggle on → stopwatch starts when activeIdx changes
 * from sol; visited set accumulates; once all 12 destinations are
 * visited, stops the clock and stores best time to localStorage.
 *
 * Fires "stellar:speedrun" with {seconds} on completion (the
 * Achievements panel listens for sub-60s).
 */

const KEY = "stellar:speedrun:best";

const fmt = (ms) => {
  const s = Math.floor(ms / 1000);
  const cs = Math.floor((ms % 1000) / 10);
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}.${String(cs).padStart(2, "0")}`;
};

const SpeedRun = ({ activeIdx }) => {
  const [enabled, setEnabled] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [done, setDone] = useState(false);
  const [best, setBest] = useState(() => {
    if (typeof window === "undefined") return null;
    const v = localStorage.getItem(KEY);
    return v ? Number(v) : null;
  });
  const startRef = useRef(0);
  const visitedRef = useRef(new Set());

  /* Reset on enable */
  useEffect(() => {
    if (!enabled) return;
    visitedRef.current = new Set();
    startRef.current = 0;
    setElapsed(0);
    setDone(false);
  }, [enabled]);

  /* Track visits */
  useEffect(() => {
    if (!enabled || done) return;
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
  }, [activeIdx, enabled, done, best]);

  /* Tick the clock */
  useEffect(() => {
    if (!enabled || done || startRef.current === 0) return;
    let raf = 0;
    const tick = () => {
      setElapsed(performance.now() - startRef.current);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [enabled, done]);

  return (
    <div
      style={{
        position: "fixed",
        top: 16,
        left: 290,
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "6px 12px",
        background: enabled ? "rgba(255, 224, 102, 0.12)" : "rgba(6, 9, 22, 0.7)",
        backdropFilter: "blur(10px)",
        border: enabled ? "1px solid rgba(255, 224, 102, 0.5)" : "1px solid rgba(255, 255, 255, 0.12)",
        borderRadius: 6,
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 10,
        color: enabled ? "#ffe066" : "rgba(255, 255, 255, 0.55)",
        zIndex: 35,
        cursor: "pointer",
        userSelect: "none",
      }}
      onClick={() => setEnabled((v) => !v)}
      title={enabled ? "Click to disable speed run" : "Toggle speed run — race all 12 destinations"}
    >
      <span style={{ fontSize: 13 }}>⚡</span>
      <span style={{ letterSpacing: "0.1em" }}>SPEED RUN</span>
      {enabled && (
        <span style={{ color: done ? "#00cea8" : "#ffe066", fontWeight: 600, marginLeft: 4 }}>
          {fmt(elapsed)}
        </span>
      )}
      {best != null && (
        <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 9 }}>
          BEST {fmt(best)}
        </span>
      )}
    </div>
  );
};

export default SpeedRun;
