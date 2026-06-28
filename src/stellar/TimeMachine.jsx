/* eslint-disable react/no-unknown-property */
/*
 * Phase 7 — Time Machine. A top-down orrery showing the planets at their REAL
 * heliocentric positions (via astronomy-engine, VSOP87-accurate) for any date —
 * scrub the timeline or hit play to watch them wheel around the Sun; "Now" snaps to
 * the real sky this instant. Toggle with the launcher chip or the T key.
 *
 * Pure DOM/SVG overlay: it never touches the locked tour camera or the 3D orbit
 * engine. Orbits are schematically spaced (sqrt-AU) for readability; the ANGLES are
 * real, so conjunctions/oppositions/alignments show truthfully. Play is frozen under
 * reduced-motion (scrub still works).
 */
import { useEffect, useMemo, useRef, useState } from "react";
import * as Astronomy from "astronomy-engine";
import { FONT } from "./ui/skin";

const PLANETS = [
  { name: "Mercury", au: 0.39, color: "#b8a88f" },
  { name: "Venus", au: 0.72, color: "#e6c98a" },
  { name: "Earth", au: 1.0, color: "#6fb6ff" },
  { name: "Mars", au: 1.52, color: "#e07b4f" },
  { name: "Jupiter", au: 5.2, color: "#d9a66c" },
  { name: "Saturn", au: 9.54, color: "#e6d09a" },
  { name: "Uranus", au: 19.2, color: "#9fe0e6" },
  { name: "Neptune", au: 30.1, color: "#6f8fff" },
];
const RMIN = Math.sqrt(0.39), RMAX = Math.sqrt(30.1);
const rOf = (au) => 14 + ((Math.sqrt(au) - RMIN) / (RMAX - RMIN)) * 80;
const MIN = new Date("2000-01-01").getTime();
const MAX = new Date("2050-01-01").getTime();
const DAY = 86400000;
const fmt = (d) => d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

export default function TimeMachine({ enabled = true, reducedMotion = false }) {
  const [open, setOpen] = useState(false);
  const [ts, setTs] = useState(() => Date.now());
  const [playing, setPlaying] = useState(false);
  const raf = useRef(0);

  useEffect(() => {
    const onKey = (e) => {
      const k = e.key.toLowerCase();
      if (k === "t" && enabled) { e.preventDefault(); setOpen((v) => !v); }
      else if (k === "escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enabled]);

  useEffect(() => {
    if (!open || !playing || reducedMotion) return undefined;
    let last = performance.now();
    const tick = (now) => {
      const dms = now - last; last = now;
      setTs((t) => { const n = t + (dms / 1000) * 12 * DAY; return n > MAX ? MIN : n; }); // ~12 days/sec, loops
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [open, playing, reducedMotion]);

  const date = useMemo(() => new Date(ts), [ts]);
  const positions = useMemo(() => PLANETS.map((p) => {
    let lon = 0;
    try { const v = Astronomy.HelioVector(Astronomy.Body[p.name], date); lon = Math.atan2(v.y, v.x); } catch { /* ignore */ }
    const r = rOf(p.au);
    return { ...p, r, x: 100 + r * Math.cos(lon), y: 100 + r * Math.sin(lon) };
  }), [date]);

  if (!enabled) return null;

  return (
    <>
      {!open && (
        <button type="button" onClick={() => setOpen(true)} aria-label="Open the time-machine orrery"
          style={{ position: "fixed", left: 18, bottom: 58, zIndex: 70, display: "flex", alignItems: "center", gap: 7, cursor: "pointer", background: "rgba(6,10,22,0.6)", color: "#ffcf8a", border: "1px solid rgba(255,184,77,0.4)", borderRadius: 8, padding: "7px 12px", font: `400 11px ${FONT.mono}`, letterSpacing: "0.12em", textTransform: "uppercase", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }}>
          <span style={{ fontSize: 13 }}>◷</span> Orrery <span style={{ opacity: 0.5 }}>· T</span>
        </button>
      )}
      <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 96, background: "radial-gradient(ellipse at center, rgba(8,8,20,0.88), rgba(2,3,10,0.97) 72%)", display: "grid", placeItems: "center", opacity: open ? 1 : 0, visibility: open ? "visible" : "hidden", transition: "opacity 500ms ease, visibility 500ms", backdropFilter: "blur(3px)", WebkitBackdropFilter: "blur(3px)" }}>
        <div style={{ position: "fixed", top: "4vh", left: 0, right: 0, textAlign: "center", pointerEvents: "none" }}>
          <div style={{ font: `600 clamp(18px,2.4vw,30px) ${FONT.display}`, color: "#ffe9c8", letterSpacing: "0.18em", textTransform: "uppercase" }}>Orrery</div>
          <div style={{ font: `400 11px ${FONT.mono}`, color: "rgba(255,207,138,0.7)", letterSpacing: "0.22em", textTransform: "uppercase", marginTop: 5 }}>The real sky · {fmt(date)}</div>
        </div>
        <button type="button" onClick={(e) => { e.stopPropagation(); setOpen(false); }} aria-label="Close orrery" style={{ position: "fixed", top: 18, right: 18, zIndex: 97, cursor: "pointer", background: "rgba(6,10,22,0.6)", color: "rgba(255,224,180,0.85)", border: "1px solid rgba(255,184,77,0.35)", borderRadius: 8, padding: "6px 11px", font: `400 11px ${FONT.mono}` }}>ESC ✕</button>

        <div onClick={(e) => e.stopPropagation()} style={{ width: "min(70vh,70vw)", height: "min(70vh,70vw)" }}>
          <svg viewBox="0 0 200 200" width="100%" height="100%" style={{ display: "block", filter: "drop-shadow(0 0 24px rgba(255,200,120,0.16))" }}>
            {PLANETS.map((p) => <circle key={p.name} cx="100" cy="100" r={rOf(p.au).toFixed(2)} fill="none" stroke="rgba(180,190,230,0.14)" strokeWidth="0.3" />)}
            <circle cx="100" cy="100" r="9" fill="#ffd86a" opacity="0.22" />
            <circle cx="100" cy="100" r="4.5" fill="#ffd86a" />
            {positions.map((p) => (
              <g key={p.name}>
                <circle cx={p.x.toFixed(2)} cy={p.y.toFixed(2)} r={p.name === "Jupiter" || p.name === "Saturn" ? 2.6 : 1.7} fill={p.color} />
                <text x={p.x.toFixed(1)} y={(p.y - 3).toFixed(1)} textAnchor="middle" fill={p.color} style={{ font: `400 3.6px ${FONT.mono}`, letterSpacing: "0.3px", opacity: 0.9 }}>{p.name}</text>
              </g>
            ))}
          </svg>
        </div>

        <div onClick={(e) => e.stopPropagation()} style={{ position: "fixed", bottom: "5vh", left: "50%", transform: "translateX(-50%)", width: "min(560px, 88vw)", display: "flex", alignItems: "center", gap: 12, background: "rgba(6,10,22,0.72)", border: "1px solid rgba(255,184,77,0.25)", borderRadius: 10, padding: "10px 14px", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}>
          <button type="button" onClick={() => setPlaying((p) => !p)} aria-label={playing ? "Pause" : "Play"} style={{ cursor: "pointer", background: "none", border: "1px solid rgba(255,184,77,0.4)", color: "#ffcf8a", borderRadius: 6, padding: "4px 10px", font: `400 11px ${FONT.mono}` }}>{playing ? "❚❚" : "▶"}</button>
          <input type="range" min={MIN} max={MAX} step={DAY} value={ts} onChange={(e) => { setPlaying(false); setTs(Number(e.target.value)); }} style={{ flex: 1 }} />
          <span style={{ font: `400 11px ${FONT.mono}`, color: "#ffe9c8", minWidth: 96, textAlign: "right" }}>{fmt(date)}</span>
          <button type="button" onClick={() => { setPlaying(false); setTs(Date.now()); }} style={{ cursor: "pointer", background: "none", border: "1px solid rgba(255,184,77,0.4)", color: "#ffcf8a", borderRadius: 6, padding: "4px 9px", font: `400 10px ${FONT.mono}`, letterSpacing: "0.08em" }}>NOW</button>
        </div>
        <div style={{ position: "fixed", bottom: "1.8vh", left: 0, right: 0, textAlign: "center", pointerEvents: "none", font: `400 10px ${FONT.mono}`, color: "rgba(200,214,245,0.5)", letterSpacing: "0.06em" }}>Real heliocentric positions (VSOP87) · scrub or play to watch the planets move · orbits schematically spaced</div>
      </div>
    </>
  );
}
