 
import { useEffect, useRef, useState } from "react";

/*
 * Gravitational-hazard warning, driven by the shared clock's `danger` level
 * (written by DangerField as the pilot nears Gargantua). Polls via rAF and only
 * re-renders on meaningful steps to avoid per-frame reconciliation.
 */
const HazardBanner = ({ clock }) => {
  const [danger, setDanger] = useState(0);
  const shownRef = useRef(0);

  useEffect(() => {
    let raf;
    const tick = () => {
      const d = clock?.danger ?? 0;
      if (Math.abs(d - shownRef.current) > 0.04) { shownRef.current = d; setDanger(d); }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [clock]);

  if (danger < 0.25) return null;
  return (
    <div style={{
      position: "fixed", top: "20%", left: "50%", transform: "translateX(-50%)",
      zIndex: 58, pointerEvents: "none", textAlign: "center",
      padding: "10px 24px", borderRadius: 10,
      background: `rgba(40,6,6,${0.35 + danger * 0.4})`,
      border: `1px solid rgba(255,80,60,${0.4 + danger * 0.5})`,
      boxShadow: `0 0 ${20 + danger * 50}px rgba(255,60,40,${danger * 0.55})`,
      opacity: Math.min(1, danger * 1.3),
    }}>
      <div style={{ fontFamily: "'Martian Mono', monospace", fontSize: 12, letterSpacing: "0.2em", color: "#ff6b5a", fontWeight: 600 }}>⚠ GRAVITATIONAL HAZARD</div>
      <div style={{ fontFamily: "'Martian Mono', monospace", fontSize: 9, color: "rgba(255,185,175,0.85)", marginTop: 3 }}>
        {danger > 0.85 ? "TIDAL FORCES CRITICAL — PULL UP" : "approaching the event horizon"}
      </div>
    </div>
  );
};

export default HazardBanner;
