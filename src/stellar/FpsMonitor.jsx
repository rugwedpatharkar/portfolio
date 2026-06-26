 
import { useEffect, useRef, useState } from "react";

/*
 * Tiny FPS monitor — toggleable. Samples requestAnimationFrame timing.
 * Bottom-left under LiveStats. Hidden by default; expose via a key
 * combo (Shift+F) or via the cockpit row toggle.
 */

const FpsMonitor = () => {
  const [visible, setVisible] = useState(false);
  const [fps, setFps] = useState(0);
  const [min, setMin] = useState(60);
  const lastRef = useRef(performance.now());
  const framesRef = useRef(0);
  const accRef = useRef(0);

  useEffect(() => {
    const onKey = (e) => {
      if (e.shiftKey && (e.key === "F" || e.key === "f")) setVisible((v) => !v);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!visible) return;
    let raf = 0;
    const tick = (now) => {
      const dt = now - lastRef.current;
      lastRef.current = now;
      accRef.current += dt;
      framesRef.current++;
      if (accRef.current > 500) {
        const next = Math.round((framesRef.current / accRef.current) * 1000);
        setFps(next);
        setMin((m) => Math.min(m, next));
        framesRef.current = 0;
        accRef.current = 0;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [visible]);

  if (!visible) return null;
  const color = fps > 55 ? "#2fe0b0" : fps > 45 ? "#ffe066" : "#ff6b6b";
  return (
    <div
      style={{
        position: "fixed",
        bottom: 92, left: 18,
        padding: "5px 10px",
        background: "rgba(6, 9, 22, 0.75)",
        backdropFilter: "blur(8px)",
        border: "1px solid rgba(255, 255, 255, 0.18)",
        borderRadius: 6,
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 10,
        color: "rgba(255,255,255,0.75)",
        letterSpacing: "0.08em",
        zIndex: 32,
        pointerEvents: "none",
        display: "flex",
        gap: 10,
      }}
    >
      <span style={{ color }}>{fps} FPS</span>
      <span style={{ opacity: 0.55 }}>min {min}</span>
      <span style={{ opacity: 0.4, fontSize: 8 }}>SHIFT+F</span>
    </div>
  );
};

export default FpsMonitor;
