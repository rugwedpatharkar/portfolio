import { useEffect, useRef, useState } from "react";

/*
 * PHASE 1D — the navicomputer countdown (a jump-drive nod — original/safe). Sits
 * over the establishing shot: a bracket reticle locks on, coordinates confirm, and
 * the navicomputer counts 3 · 2 · 1 before the punch to lightspeed. Each tick fires
 * stellar:sound:beep; completion fires stellar:sound:jump, then hands to the warp.
 */

const TICK_MS = 850;

const NavicomputerCountdown = ({ onComplete }) => {
  const [n, setN] = useState(3);
  const doneRef = useRef(false);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("stellar:sound:beep")); // first tick (3)
    let cur = 3;
    const id = setInterval(() => {
      cur -= 1;
      if (cur >= 1) {
        setN(cur);
        window.dispatchEvent(new CustomEvent("stellar:sound:beep"));
      } else {
        clearInterval(id);
        if (doneRef.current) return;
        doneRef.current = true;
        onComplete?.(); // → warp beat fires stellar:sound:jump (the punch)
      }
    }, TICK_MS);
    return () => clearInterval(id);
  }, [onComplete]);

  const C = "#8fcfff";
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 81, pointerEvents: "none", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18 }}>
      <style>{`
        @keyframes scTick { 0% { transform: scale(1.6); opacity: 0 } 30% { opacity: 1 } 100% { transform: scale(1); opacity: 0.96 } }
        @keyframes scReticle { from { opacity: 0; transform: scale(1.15) } to { opacity: 1; transform: scale(1) } }
        @keyframes scLockBlink { 0%,100% { opacity: 1 } 50% { opacity: 0.4 } }
      `}</style>

      <div style={{ fontFamily: "'Martian Mono', monospace", fontSize: 12, letterSpacing: "0.34em", color: C, opacity: 0.85, paddingLeft: "0.34em", textShadow: "0 0 14px rgba(143,207,255,0.6)" }}>
        HYPERSPACE&nbsp;JUMP&nbsp;IN
      </div>

      {/* reticle + number */}
      <div style={{ position: "relative", width: 220, height: 220, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg viewBox="0 0 220 220" width="220" height="220" style={{ position: "absolute", inset: 0, animation: "scReticle 0.5s ease-out both" }}>
          {/* four corner brackets */}
          {[[18, 18, 1, 1], [202, 18, -1, 1], [18, 202, 1, -1], [202, 202, -1, -1]].map(([x, y, sx, sy], i) => (
            <path key={i} d={`M ${x} ${y + sy * 34} L ${x} ${y} L ${x + sx * 34} ${y}`} fill="none" stroke={C} strokeWidth="2" opacity="0.9" />
          ))}
          <circle cx="110" cy="110" r="92" fill="none" stroke={C} strokeWidth="1" strokeDasharray="3 9" opacity="0.45" />
          <line x1="110" y1="6" x2="110" y2="26" stroke={C} strokeWidth="1.5" opacity="0.7" />
          <line x1="110" y1="194" x2="110" y2="214" stroke={C} strokeWidth="1.5" opacity="0.7" />
          <line x1="6" y1="110" x2="26" y2="110" stroke={C} strokeWidth="1.5" opacity="0.7" />
          <line x1="194" y1="110" x2="214" y2="110" stroke={C} strokeWidth="1.5" opacity="0.7" />
        </svg>
        <div key={n} style={{ fontFamily: "'Chakra Petch', sans-serif", fontSize: 116, fontWeight: 700, color: "#eaf4ff", textShadow: `0 0 40px ${C}`, animation: "scTick 0.8s ease-out both", lineHeight: 1 }}>
          {n}
        </div>
      </div>

      <div style={{ fontFamily: "'Martian Mono', monospace", fontSize: 11, letterSpacing: "0.2em", color: C, opacity: 0.8, animation: "scLockBlink 1.1s ease-in-out infinite" }}>
        ◢ COORDINATES&nbsp;LOCKED · SOL&nbsp;SYSTEM ◣
      </div>
    </div>
  );
};

export default NavicomputerCountdown;
