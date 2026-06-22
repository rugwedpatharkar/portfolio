/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";

/*
 * Top-level cinematic overlays — separated so they're easy to enable
 * or disable as a set.
 *
 *   1. Film grain — animated SVG noise at very low opacity. Costs
 *      nothing because the SVG is a static filter; just the <div> on
 *      top with mix-blend-mode.
 *   2. Letterbox bars — animated in/out on destination change to give
 *      a moment a "shot" feel.
 *   3. Title card — short label that slides in mid-letterbox.
 *
 * Listens to 'stellar:destination' events for sync.
 */

const CinematicLayer = ({ getDestinationLabel }) => {
  const [activeShot, setActiveShot] = useState(null);
  const timerRef = useRef(0);

  useEffect(() => {
    const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const onDest = (e) => {
      const id = e.detail?.id;
      const idx = e.detail?.idx;
      if (id == null) return;
      const label = getDestinationLabel?.(id, idx) || id.toUpperCase();
      const seg = idx === 0 ? "ORIGIN" : idx < 5 ? `INNER · ${idx + 1} / 12` : idx < 11 ? `OUTER · ${idx + 1} / 12` : `EDGE · ${idx + 1} / 12`;
      setActiveShot({ label, seg, key: Date.now() });
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setActiveShot(null), 1600);
    };

    window.addEventListener("stellar:destination", onDest);
    return () => {
      window.removeEventListener("stellar:destination", onDest);
      clearTimeout(timerRef.current);
    };
  }, [getDestinationLabel]);

  return (
    <>
      {/* Film grain — fixed noise overlay, screen blend mode. SVG
          filter is GPU-accelerated; the div above just animates a
          repeating background-position to keep grain "alive". */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 26,
          mixBlendMode: "overlay",
          opacity: 0.15,
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.5 0 0 0 0 0.5 0 0 0 0 0.5 0 0 0 1 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
          backgroundSize: "160px 160px",
          animation: "stellarFilmGrain 1.4s steps(8) infinite",
        }}
      />

      {/* Letterbox + title card on destination change */}
      {activeShot && (
        <>
          <div className="stellar-letterbox stellar-letterbox-top" />
          <div className="stellar-letterbox stellar-letterbox-bottom" />
          <div className="stellar-title-card" key={activeShot.key}>
            <div className="stellar-title-seg">{activeShot.seg}</div>
            <div className="stellar-title-label">{activeShot.label}</div>
          </div>
        </>
      )}

      <style>{`
        @keyframes stellarFilmGrain {
          0% { background-position: 0 0; }
          25% { background-position: -40px 20px; }
          50% { background-position: 80px -10px; }
          75% { background-position: -20px 40px; }
          100% { background-position: 0 0; }
        }
        .stellar-letterbox {
          position: fixed;
          left: 0; right: 0;
          height: 56px;
          background: #000;
          z-index: 60;
          pointer-events: none;
          animation: stellarBarIn 360ms cubic-bezier(0.16, 1, 0.3, 1),
                     stellarBarOut 540ms cubic-bezier(0.7, 0, 0.84, 0) 1100ms forwards;
        }
        .stellar-letterbox-top { top: 0; transform-origin: top; }
        .stellar-letterbox-bottom { bottom: 0; transform-origin: bottom; }
        @keyframes stellarBarIn {
          from { transform: scaleY(0); }
          to { transform: scaleY(1); }
        }
        @keyframes stellarBarOut {
          to { transform: scaleY(0); }
        }
        .stellar-title-card {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          padding: 12px 24px;
          z-index: 61;
          pointer-events: none;
          font-family: 'JetBrains Mono', monospace;
          color: white;
          text-align: center;
          animation: stellarTitleIn 700ms cubic-bezier(0.16, 1, 0.3, 1) 80ms backwards,
                     stellarTitleOut 540ms cubic-bezier(0.7, 0, 0.84, 0) 980ms forwards;
        }
        .stellar-title-seg {
          font-size: 9px;
          color: rgba(0, 206, 168, 0.85);
          letter-spacing: 0.32em;
        }
        .stellar-title-label {
          font-family: 'Sora', sans-serif;
          font-size: clamp(28px, 4.4vw, 48px);
          font-weight: 700;
          letter-spacing: -0.01em;
          margin-top: 4px;
          text-shadow: 0 2px 24px rgba(0,0,0,0.6);
        }
        @keyframes stellarTitleIn {
          from { opacity: 0; transform: translate(-50%, calc(-50% + 16px)); letter-spacing: 0.4em; }
          to { opacity: 1; transform: translate(-50%, -50%); }
        }
        @keyframes stellarTitleOut {
          to { opacity: 0; }
        }
      `}</style>
    </>
  );
};

export default CinematicLayer;
