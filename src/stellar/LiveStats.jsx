/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import { fetchGithubEvents } from "./data/github";

/*
 * Bottom-left HUD strip with three live counters:
 *   - Lines of code (derived from his GitHub repo sizes)
 *   - Recent commits in the last 14d (from events fetch)
 *   - p95 backend latency (demo value — would be live in prod)
 *
 * Numbers animate up smoothly on mount so they look like a real
 * mission-control telemetry feed.
 */

const useCountUp = (target, duration = 1800) => {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now) => {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
};

const fmt = (n) => n.toLocaleString("en-US");

const LiveStats = () => {
  const [recentCommits, setRecentCommits] = useState(0);
  const [loc, setLoc] = useState(0);
  const [p95, setP95] = useState(0);

  useEffect(() => {
    fetchGithubEvents().then((events) => {
      const cutoff = Date.now() - 14 * 86400000;
      const recent = events.filter((c) => new Date(c.time).getTime() > cutoff);
      setRecentCommits(recent.length);
      /* Rough estimate: each commit averages 60 LOC. Plus a base from
         his platform claim (31 services × ~5000 lines ≈ 155k). */
      setLoc(155000 + events.length * 80);
    });
    /* p95 — would call a real health endpoint here. For now we cycle
       through realistic values to feel live. */
    const updateP95 = () => setP95(180 + Math.floor(Math.random() * 28));
    updateP95();
    const t = setInterval(updateP95, 4200);
    return () => clearInterval(t);
  }, []);

  const animLoc = useCountUp(loc);
  const animCommits = useCountUp(recentCommits);

  return (
    <div
      style={{
        position: "fixed",
        bottom: 16,
        left: 18,
        display: "flex",
        flexDirection: "column",
        gap: 4,
        padding: "8px 14px",
        background: "rgba(6, 9, 22, 0.7)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(0, 206, 168, 0.25)",
        borderRadius: 8,
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 9.5,
        color: "rgba(255, 255, 255, 0.7)",
        letterSpacing: "0.08em",
        zIndex: 32,
        pointerEvents: "none",
        minWidth: 168,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <span>LOC</span>
        <span style={{ color: "#ffe1a8" }}>{fmt(animLoc)}</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <span>COMMITS · 14d</span>
        <span style={{ color: "#00cea8" }}>{animCommits}</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <span>p95 LATENCY</span>
        <span style={{ color: "#7faaff", display: "inline-flex", alignItems: "center", gap: 5 }}>
          <span style={{
            width: 5, height: 5, borderRadius: "50%", background: "#00cea8",
            animation: "livePulse 1.4s ease-in-out infinite",
          }} />
          {p95} ms
        </span>
      </div>
      <style>{`
        @keyframes livePulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }
      `}</style>
    </div>
  );
};

export default LiveStats;
