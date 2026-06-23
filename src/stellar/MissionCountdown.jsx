/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";

/*
 * Mission-control countdown overlay shown during boot after the typed
 * log dismisses. A T-minus 5 → 0 launch sequence (700ms each tick)
 * before the boot transitions away. Adds the "you are about to enter
 * a mission" feel.
 *
 * Skips automatically on reduced-motion users.
 */

const MissionCountdown = ({ onComplete }) => {
  const [n, setN] = useState(5);

  useEffect(() => {
    const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      onComplete?.();
      return;
    }
    if (n < 0) {
      const t = setTimeout(() => onComplete?.(), 280);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setN(n - 1), 620);
    return () => clearTimeout(t);
  }, [n, onComplete]);

  /* Keep rendering (showing GO) once n<0 instead of returning null — the
     parent unmounts us when the countdown completes, so the opaque cover
     never lifts early and the scene stays hidden until the warp. */

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        /* Fully opaque — no part of the solar system is visible until the
           countdown finishes (then the warp fly-in reveals it). */
        background: "radial-gradient(ellipse at center, #0b1126 0%, #03050d 78%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        zIndex: 250,
        pointerEvents: "none",
        fontFamily: "'JetBrains Mono', monospace",
        color: "white",
      }}
    >
      <div style={{ fontSize: 10, letterSpacing: "0.32em", color: "rgba(255, 184, 107, 0.8)" }}>
        STELLAR · TRANSIT INITIATED
      </div>
      <div
        key={Math.max(n, 0)}
        style={{
          fontSize: "clamp(72px, 14vw, 140px)",
          fontWeight: 800,
          lineHeight: 1,
          fontFamily: "'Sora', sans-serif",
          color: n <= 0 ? "#00cea8" : "#ffb86b",
          textShadow: `0 0 38px ${n <= 0 ? "#00cea899" : "#ffb86b88"}`,
          animation: "countdownPop 600ms cubic-bezier(0.25, 1.4, 0.5, 1)",
        }}
      >
        {n <= 0 ? "GO" : `T-${n}`}
      </div>
      <div style={{ fontSize: 9, letterSpacing: "0.18em", color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
        ENGAGING NAV · 12 DESTINATIONS PLOTTED · 49 AU TO EDGE BEACON
      </div>
      <style>{`
        @keyframes countdownPop {
          0% { opacity: 0; transform: scale(1.4); filter: blur(10px); }
          30% { opacity: 1; filter: blur(0); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default MissionCountdown;
