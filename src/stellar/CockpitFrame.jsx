/* eslint-disable react/prop-types */
import { useEffect, useRef } from "react";

/*
 * Full-screen cockpit overlay — corner brackets, top crosshair,
 * a couple of HUD gauges. Pure SVG, GPU-cheap. Toggleable.
 *
 * Shows velocity gauge (driven by scroll-T delta) and a tiny
 * "SYSTEM NOMINAL" status badge.
 */

const Bracket = ({ corner }) => {
  const positions = {
    tl: { top: 18, left: 18, transform: "rotate(0deg)" },
    tr: { top: 18, right: 18, transform: "rotate(90deg)" },
    br: { bottom: 18, right: 18, transform: "rotate(180deg)" },
    bl: { bottom: 18, left: 18, transform: "rotate(270deg)" },
  };
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      style={{ position: "fixed", pointerEvents: "none", zIndex: 35, ...positions[corner] }}
    >
      <path
        d="M 4 24 L 4 4 L 24 4"
        stroke="rgba(0, 206, 168, 0.55)"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
};

const CockpitFrame = ({ enabled, scrollTRef }) => {
  const speedTextRef = useRef(null);

  /* Write velocity directly to the DOM each frame — keeping it out of
     React state avoids ~60 reconciliations per second. */
  useEffect(() => {
    if (!enabled) return;
    let last = scrollTRef.current ?? 0;
    let speed = 0;
    let raf = 0;
    const tick = () => {
      const t = scrollTRef.current ?? 0;
      const dt = Math.abs(t - last);
      last = t;
      speed = speed * 0.85 + dt * 9000;
      if (speedTextRef.current) speedTextRef.current.textContent = `VEL ${Math.round(speed)} U/S`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [enabled, scrollTRef]);

  if (!enabled) return null;

  return (
    <>
      <Bracket corner="tl" />
      <Bracket corner="tr" />
      <Bracket corner="br" />
      <Bracket corner="bl" />

      {/* Top centre crosshair */}
      <svg
        width="44"
        height="44"
        viewBox="0 0 44 44"
        style={{
          position: "fixed",
          top: 8,
          left: "50%",
          transform: "translateX(-50%)",
          pointerEvents: "none",
          zIndex: 35,
        }}
      >
        <circle cx="22" cy="22" r="3" stroke="rgba(0, 206, 168, 0.7)" strokeWidth="1" fill="none" />
        <line x1="22" y1="10" x2="22" y2="16" stroke="rgba(0, 206, 168, 0.55)" strokeWidth="1" />
        <line x1="22" y1="28" x2="22" y2="34" stroke="rgba(0, 206, 168, 0.55)" strokeWidth="1" />
        <line x1="10" y1="22" x2="16" y2="22" stroke="rgba(0, 206, 168, 0.55)" strokeWidth="1" />
        <line x1="28" y1="22" x2="34" y2="22" stroke="rgba(0, 206, 168, 0.55)" strokeWidth="1" />
      </svg>

      {/* Velocity gauge bottom centre */}
      <div
        style={{
          position: "fixed",
          bottom: 16,
          left: "50%",
          transform: "translateX(-50%)",
          padding: "5px 12px",
          background: "rgba(6, 9, 22, 0.6)",
          border: "1px solid rgba(0, 206, 168, 0.4)",
          borderRadius: 4,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 9.5,
          color: "rgba(0, 206, 168, 0.9)",
          letterSpacing: "0.12em",
          pointerEvents: "none",
          zIndex: 35,
          display: "flex",
          gap: 14,
        }}
      >
        <span ref={speedTextRef}>VEL 0 U/S</span>
        <span style={{ opacity: 0.55 }}>·</span>
        <span>SYSTEM NOMINAL</span>
      </div>
    </>
  );
};

export default CockpitFrame;
