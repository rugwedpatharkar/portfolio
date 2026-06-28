 
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
        stroke="rgba(47, 224, 176, 0.55)"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
};

const CockpitFrame = ({ enabled, speedRef }) => {
  const speedTextRef = useRef(null);

  /* Write the live pilot velocity straight to the DOM each frame — keeping it
     out of React state avoids ~60 reconciliations per second. */
  useEffect(() => {
    if (!enabled) return undefined;
    let shown = 0;
    let raf = 0;
    const tick = () => {
      const v = speedRef?.current ?? 0;
      shown = shown * 0.8 + v * 0.2;
      if (speedTextRef.current) speedTextRef.current.textContent = `VEL ${Math.round(shown * 10)} U/S`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [enabled, speedRef]);

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
        <circle cx="22" cy="22" r="3" stroke="rgba(47, 224, 176, 0.7)" strokeWidth="1" fill="none" />
        <line x1="22" y1="10" x2="22" y2="16" stroke="rgba(47, 224, 176, 0.55)" strokeWidth="1" />
        <line x1="22" y1="28" x2="22" y2="34" stroke="rgba(47, 224, 176, 0.55)" strokeWidth="1" />
        <line x1="10" y1="22" x2="16" y2="22" stroke="rgba(47, 224, 176, 0.55)" strokeWidth="1" />
        <line x1="28" y1="22" x2="34" y2="22" stroke="rgba(47, 224, 176, 0.55)" strokeWidth="1" />
      </svg>

      {/* Velocity gauge bottom centre */}
      <div
        style={{
          position: "fixed",
          bottom: 18,
          left: 76,
          padding: "5px 12px",
          background: "rgba(6, 9, 22, 0.6)",
          border: "1px solid rgba(47, 224, 176, 0.4)",
          borderRadius: 4,
          fontFamily: "'Martian Mono', monospace",
          fontSize: 9.5,
          color: "rgba(47, 224, 176, 0.9)",
          letterSpacing: "0.12em",
          pointerEvents: "none",
          zIndex: 35,
          display: "flex",
          gap: 14,
        }}
      >
        <span ref={speedTextRef}>VEL 0 U/S</span>
        <span style={{ opacity: 0.55 }}>·</span>
        <span>PILOT · ESC TO DOCK</span>
      </div>
    </>
  );
};

export default CockpitFrame;
