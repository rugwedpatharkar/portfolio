import { useEffect, useRef } from "react";

/*
 * PHASE 1D — arrival + HUD boot. The drop-out of hyperspace (an Interstellar-style
 * beat — original/safe): a bright exit FLASH as the tube collapses to points, an
 * edge vignette so the canopy reads against the bright Sol landing, then the canopy
 * frame + reticle draw themselves in (stroke-dashoffset, pathLength-normalised) and
 * a subtitle confirms the system. A drop-out chime fires; then it fades to the tour.
 */

const DUR_MS = 1800;
const C = "#bfe2ff";

const corner = (x, y, sx, sy) => `M ${x} ${y + sy * 9} L ${x} ${y} L ${x + sx * 9} ${y}`;

const HyperspaceArrival = ({ onDone }) => {
  const doneRef = useRef(false);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("stellar:sound:arrival"));
    const finish = () => {
      if (doneRef.current) return;
      doneRef.current = true;
      onDone?.();
    };
    const t = setTimeout(finish, DUR_MS);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 81, pointerEvents: "none", animation: `scArrFade ${DUR_MS}ms ease-out both` }}>
      <style>{`
        @keyframes scArrFade { 0% { opacity: 0 } 8% { opacity: 1 } 80% { opacity: 1 } 100% { opacity: 0 } }
        @keyframes scFlash { 0% { opacity: 0 } 6% { opacity: 0.95 } 100% { opacity: 0 } }
        @keyframes scDrawIn { from { stroke-dashoffset: 1 } to { stroke-dashoffset: 0 } }
        @keyframes scSubIn { 0% { opacity: 0; transform: translateY(8px) } 100% { opacity: 1; transform: translateY(0) } }
        .sc-draw { stroke-dasharray: 1; stroke-dashoffset: 1; animation: scDrawIn 0.95s cubic-bezier(0.2,0.7,0.2,1) 0.15s forwards; }
      `}</style>

      {/* hyperspace-exit flash */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 50%, #eaf4ff 0%, #9fd0ff 35%, rgba(120,170,255,0) 72%)", animation: "scFlash 0.6s ease-out both" }} />

      {/* edge vignette so the canopy + subtitle read against the bright landing */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 48%, rgba(0,0,0,0) 42%, rgba(2,4,10,0.55) 100%)" }} />

      {/* canopy frame — stretched to the viewport */}
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
        {[corner(5, 5, 1, 1), corner(95, 5, -1, 1), corner(5, 95, 1, -1), corner(95, 95, -1, -1)].map((d, i) => (
          <path key={i} className="sc-draw" pathLength="1" d={d} fill="none" stroke={C} strokeWidth="2" vectorEffect="non-scaling-stroke" opacity="0.95" />
        ))}
        <path className="sc-draw" pathLength="1" d="M 5 50 L 28 50 M 72 50 L 95 50" fill="none" stroke={C} strokeWidth="1.4" vectorEffect="non-scaling-stroke" opacity="0.7" />
      </svg>

      {/* centre reticle — fixed aspect */}
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg viewBox="0 0 120 120" width="190" height="190" style={{ filter: "drop-shadow(0 0 6px rgba(143,207,255,0.8))" }}>
          <circle className="sc-draw" pathLength="1" cx="60" cy="60" r="46" fill="none" stroke={C} strokeWidth="2" opacity="0.95" />
          <circle className="sc-draw" pathLength="1" cx="60" cy="60" r="7" fill="none" stroke={C} strokeWidth="2" opacity="1" />
          <line x1="60" y1="2" x2="60" y2="18" stroke={C} strokeWidth="2" opacity="0.9" />
          <line x1="60" y1="102" x2="60" y2="118" stroke={C} strokeWidth="2" opacity="0.9" />
          <line x1="2" y1="60" x2="18" y2="60" stroke={C} strokeWidth="2" opacity="0.9" />
          <line x1="102" y1="60" x2="118" y2="60" stroke={C} strokeWidth="2" opacity="0.9" />
        </svg>
      </div>

      {/* subtitle */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: "15vh", textAlign: "center", animation: "scSubIn 0.6s ease-out 0.55s both" }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 15, letterSpacing: "0.24em", color: "#eaf4ff", textShadow: "0 0 18px rgba(143,207,255,0.9), 0 2px 12px rgba(0,0,0,0.8)" }}>
          DROPPING&nbsp;OUT&nbsp;OF&nbsp;HYPERSPACE
        </div>
        <div style={{ fontFamily: "'Chakra Petch', sans-serif", fontSize: 13, letterSpacing: "0.34em", color: C, marginTop: 8, opacity: 0.9, paddingLeft: "0.34em" }}>
          SOL&nbsp;SYSTEM
        </div>
      </div>
    </div>
  );
};

export default HyperspaceArrival;
