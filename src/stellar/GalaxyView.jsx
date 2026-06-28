/* eslint-disable react/no-unknown-property */
/*
 * Phase 6 v1 — Galaxy overview. A full-screen "you are here" map of the Milky Way:
 * the solar system is one of ~400 billion stars on the Orion Arm. Toggle with the
 * launcher chip or the G key; Esc / click-away to close. Pure DOM/SVG overlay — it
 * never touches the locked tour camera, the canvas, or the post pass. Mouse-parallax
 * tilt (desktop), frozen on reduced-motion.
 *
 * (The 3D continuous "Powers of Ten" pull-out is the documented refinement; this is
 * the safe, complete v1.)
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { FONT } from "./ui/skin";

/* Logarithmic spiral arm → SVG path. r = a·e^(bθ), centred at 100,100 in a 0..200 box. */
const arm = (offset, { a = 9, b = 0.34, turns = 1.18, steps = 80 } = {}) => {
  let d = "";
  for (let i = 0; i <= steps; i++) {
    const th = (i / steps) * turns * Math.PI * 2;
    const r = a * Math.exp(b * th);
    if (r > 96) break;
    const x = 100 + r * Math.cos(th + offset);
    const y = 100 + r * Math.sin(th + offset);
    d += `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)} `;
  }
  return d;
};

export default function GalaxyView({ enabled = true, reducedMotion = false }) {
  const [open, setOpen] = useState(false);
  const tiltRef = useRef(null);

  /* G toggles, Esc closes. */
  useEffect(() => {
    const onKey = (e) => {
      const k = e.key.toLowerCase();
      if (k === "g" && enabled) { e.preventDefault(); setOpen((v) => !v); }
      else if (k === "escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enabled]);

  /* Mouse-parallax tilt of the disc (desktop). */
  useEffect(() => {
    if (!open || reducedMotion) return undefined;
    const el = tiltRef.current;
    if (!el) return undefined;
    const onMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      el.style.transform = `perspective(1100px) rotateX(${(-y * 7 - 8).toFixed(2)}deg) rotateY(${(x * 9).toFixed(2)}deg)`;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [open, reducedMotion]);

  const arms = useMemo(() => [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((o) => arm(o)), []);
  const dots = useMemo(() => Array.from({ length: 90 }, (_, i) => {
    const a = (i * 2.39996) % (Math.PI * 2);
    const r = 10 + ((i * 53) % 88);
    return { x: 100 + r * Math.cos(a), y: 100 + r * Math.sin(a), o: 0.1 + ((i * 31) % 34) / 100, s: 0.4 + ((i * 17) % 10) / 14 };
  }), []);
  const sun = { x: 134, y: 84 }; // Orion Arm, ~55% out
  const rings = [{ r: 34, ly: "10k" }, { r: 62, ly: "20k" }, { r: 90, ly: "30k" }];

  if (!enabled) return null;

  return (
    <>
      {/* launcher chip */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open galaxy overview"
          style={{ position: "fixed", left: 18, bottom: 18, zIndex: 70, display: "flex", alignItems: "center", gap: 7, cursor: "pointer", background: "rgba(6,10,22,0.6)", color: "#aebfff", border: "1px solid rgba(140,160,255,0.4)", borderRadius: 8, padding: "7px 12px", font: `400 11px ${FONT.mono}`, letterSpacing: "0.12em", textTransform: "uppercase", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }}
        >
          <span style={{ fontSize: 13 }}>◹</span> Galaxy <span style={{ opacity: 0.5 }}>· G</span>
        </button>
      )}

      {/* full-screen overview */}
      <div
        onClick={() => setOpen(false)}
        style={{
          position: "fixed", inset: 0, zIndex: 96,
          background: "radial-gradient(ellipse at center, rgba(6,10,26,0.86) 0%, rgba(2,4,12,0.97) 70%)",
          display: "grid", placeItems: "center",
          opacity: open ? 1 : 0, visibility: open ? "visible" : "hidden",
          transition: "opacity 520ms ease, visibility 520ms",
          backdropFilter: "blur(3px)", WebkitBackdropFilter: "blur(3px)",
        }}
      >
        {/* header */}
        <div style={{ position: "fixed", top: "4vh", left: 0, right: 0, textAlign: "center", pointerEvents: "none" }}>
          <div style={{ font: `600 clamp(18px,2.4vw,30px) ${FONT.display}`, color: "#dfe7ff", letterSpacing: "0.18em", textTransform: "uppercase" }}>Milky Way</div>
          <div style={{ font: `400 11px ${FONT.mono}`, color: "rgba(174,200,255,0.7)", letterSpacing: "0.22em", textTransform: "uppercase", marginTop: 5 }}>Galactic overview · you are here</div>
        </div>
        <button type="button" onClick={(e) => { e.stopPropagation(); setOpen(false); }} aria-label="Close galaxy overview"
          style={{ position: "fixed", top: 18, right: 18, zIndex: 97, cursor: "pointer", background: "rgba(6,10,22,0.6)", color: "rgba(200,214,245,0.85)", border: "1px solid rgba(140,160,255,0.35)", borderRadius: 8, padding: "6px 11px", font: `400 11px ${FONT.mono}`, letterSpacing: "0.1em" }}>ESC ✕</button>

        {/* the disc */}
        <div ref={tiltRef} onClick={(e) => e.stopPropagation()} style={{ width: "min(78vh, 78vw)", height: "min(78vh, 78vw)", transition: "transform 240ms ease", transform: "perspective(1100px) rotateX(-8deg)" }}>
          <svg viewBox="0 0 200 200" width="100%" height="100%" style={{ display: "block", filter: "drop-shadow(0 0 26px rgba(120,150,255,0.3))" }}>
            <defs>
              <radialGradient id="gv-disc" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#cdd9ff" stopOpacity="0.42" />
                <stop offset="30%" stopColor="#8ea0e0" stopOpacity="0.14" />
                <stop offset="72%" stopColor="#6678c0" stopOpacity="0.05" />
                <stop offset="100%" stopColor="#000010" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="gv-core" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fff7e6" stopOpacity="1" />
                <stop offset="45%" stopColor="#ffe7b0" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#ffcaa0" stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx="100" cy="100" r="98" fill="url(#gv-disc)" />
            {/* scale rings */}
            {rings.map((rg) => (
              <g key={rg.r}>
                <circle cx="100" cy="100" r={rg.r} fill="none" stroke="rgba(150,170,255,0.18)" strokeWidth="0.4" strokeDasharray="1.5 2.5" />
                <text x="100" y={100 - rg.r - 1.5} textAnchor="middle" fill="rgba(160,185,255,0.5)" style={{ font: `400 4px ${FONT.mono}`, letterSpacing: "0.5px" }}>{rg.ly} ly</text>
              </g>
            ))}
            {dots.map((d, i) => <circle key={i} cx={d.x.toFixed(1)} cy={d.y.toFixed(1)} r={d.s.toFixed(2)} fill="#cfe0ff" opacity={d.o} />)}
            {arms.map((d, i) => <path key={i} d={d} fill="none" stroke="#aebfff" strokeWidth={i % 2 ? 2.6 : 3.6} strokeLinecap="round" opacity={i % 2 ? 0.26 : 0.4} />)}
            <circle cx="100" cy="100" r="27" fill="url(#gv-core)" />
            {/* you-are-here */}
            <circle cx={sun.x} cy={sun.y} r="9" fill="none" stroke="#9be7ff" strokeWidth="1" opacity="0.55">
              {!reducedMotion && <animate attributeName="r" values="4;12;4" dur="2.8s" repeatCount="indefinite" />}
              {!reducedMotion && <animate attributeName="opacity" values="0.75;0;0.75" dur="2.8s" repeatCount="indefinite" />}
            </circle>
            <circle cx={sun.x} cy={sun.y} r="2.8" fill="#aef0ff" stroke="#fff" strokeWidth="0.6" />
            <line x1={sun.x} y1={sun.y} x2="176" y2="58" stroke="rgba(155,231,255,0.5)" strokeWidth="0.5" />
            <text x="177" y="57" fill="#cdecff" style={{ font: `400 5px ${FONT.mono}`, letterSpacing: "0.5px" }}>SOL · ORION ARM</text>
          </svg>
        </div>

        {/* footer scale note */}
        <div style={{ position: "fixed", bottom: "4.5vh", left: 0, right: 0, textAlign: "center", pointerEvents: "none", font: `400 11px ${FONT.body}`, color: "rgba(200,214,245,0.7)", letterSpacing: "0.04em" }}>
          The solar system you've been touring is <span style={{ color: "#9be7ff" }}>one of ~400 billion stars</span> · ~26,000 light-years from the galactic core
        </div>
      </div>
    </>
  );
}
