 
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { SC, rgba } from "./ui/tokens";
import useViewport from "./useViewport";
import { DESTINATIONS } from "./config/destinations";

/*
 * Stellar Command — the diegetic cockpit HUD shell (M1). Always-on chrome over
 * the tour: canopy corner ticks, a top status strip, a vertical system ladder
 * (↑↓ = lanes/planets), an item dial (←→ = objects on this lane), an on-screen
 * nav pad (touch/click parity), a co-pilot line and a hint line.
 *
 * Pure chrome — no per-frame state. The container is pointer-events:none so the
 * scene keeps the mouse; only the ladder, dial arrows and nav pad opt back in.
 */

const COPILOT = {
  hero: "Sol — centre of mass. Welcome aboard, pilot.",
  about: "Origin world. Where the system starts.",
  funfacts: "Receipts on this lane — the numbers hold up.",
  experience: "Career record on this lane. Solid numbers.",
  projects: "Probes in orbit — things built and shipped.",
  achievements: "Milestones charted. Crown of the belt.",
  skills: "Nine moons of skill around the giant.",
  notes: "Logs and writings here. Worth a read.",
  education: "Knowledge accumulated — the tilted world.",
  hobbies: "Beyond the code. The blue abyss.",
  testimonials: "Voices from afar on this lane.",
  contact: "Edge beacon. Open a channel.",
};

const MONO = "'Martian Mono', monospace";
const DISP = "'Chakra Petch', sans-serif";

const CORNERS = {
  tl: { top: 14, left: 14, rot: 0 },
  tr: { top: 14, right: 14, rot: 90 },
  br: { bottom: 14, right: 14, rot: 180 },
  bl: { bottom: 14, left: 14, rot: 270 },
};

export default function CockpitHUD({ destination, activeIdx = 0, itemIdx = 0, items = [], onItem }) {
  const { isMobile } = useViewport();
  const reduce = useReducedMotion();
  /* Brief HYPERDRIVE transit state on every nav (≈ the warp-jump duration). */
  const [transit, setTransit] = useState(false);
  useEffect(() => {
    if (reduce) return undefined;
    setTransit(true);
    const t = setTimeout(() => setTransit(false), 1700);
    return () => clearTimeout(t);
  }, [destination?.id, itemIdx, reduce]);
  /* PHASE 3A — reactive co-pilot quip (dispatched by CoPilot); overrides the
     static section line for a few seconds, then reverts. */
  const [quip, setQuip] = useState(null);
  useEffect(() => {
    let timer = null;
    const onQuip = (e) => {
      setQuip(e?.detail?.line || null);
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => setQuip(null), 5500);
    };
    window.addEventListener("stellar:copilot", onQuip);
    return () => { window.removeEventListener("stellar:copilot", onQuip); if (timer) clearTimeout(timer); };
  }, []);
  if (!destination) return null;

  const total = DESTINATIONS.length;
  const itemCount = items.length;
  const curItem = items[Math.min(itemIdx, Math.max(0, itemCount - 1))];
  const copilot = COPILOT[destination.section] || COPILOT[destination.id] || "Holding station, pilot.";

  const boot = reduce
    ? {}
    : {
        initial: { opacity: 0, filter: "blur(6px)" },
        animate: { opacity: 1, filter: "blur(0px)" },
        transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
      };

  const btn = {
    pointerEvents: "auto",
    cursor: "pointer",
    background: rgba(SC.bg, 0.55),
    border: `1px solid ${rgba(SC.blueDim, 0.6)}`,
    color: SC.blueInk,
    fontFamily: MONO,
    borderRadius: 4,
    backdropFilter: "blur(6px)",
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 44, pointerEvents: "none", fontFamily: MONO, color: SC.blueInk }}>
      <style>{`@keyframes scPulse{0%,100%{opacity:1}50%{opacity:.45}}`}</style>

      {/* Canopy corner ticks */}
      {Object.entries(CORNERS).map(([k, c]) => (
        <svg key={k} width="44" height="44" viewBox="0 0 44 44" style={{ position: "absolute", top: c.top, left: c.left, right: c.right, bottom: c.bottom, transform: `rotate(${c.rot}deg)`, opacity: 0.7 }} aria-hidden>
          <path d="M3 23 L3 3 L23 3" fill="none" stroke={SC.blue} strokeWidth="1.4" strokeLinecap="round" />
          <line x1="3" y1="3" x2="3" y2="11" stroke={SC.blue} strokeWidth="3" opacity="0.5" />
        </svg>
      ))}

      {/* Top status strip */}
      <div style={{ position: "absolute", top: 18, left: 46, right: 46, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: DISP, fontWeight: 700, fontSize: 13, letterSpacing: "0.22em", color: SC.blue }}>STELLAR COMMAND</span>
        {!isMobile && <span style={{ fontFamily: "'Saira', sans-serif", fontSize: 12, letterSpacing: "0.22em", color: rgba(SC.blueInk, 0.7) }}>RUGWED SYSTEM — ORBITAL LANES</span>}
        <span style={{ fontSize: 11, color: SC.blueInk }}>
          {transit ? (
            <span style={{ color: SC.amber, fontWeight: 700, letterSpacing: "0.14em" }}>⟢ HYPERDRIVE</span>
          ) : (
            `LANE ${String(activeIdx + 1).padStart(2, "0")}/${total}`
          )}
        </span>
      </div>
      <div style={{ position: "absolute", top: 44, left: 46, right: 46, height: 1, background: rgba(SC.blue, 0.16) }} />

      {/* Slim section eyebrow (demoted from a big wordmark) */}
      <motion.div key={destination.id} {...boot} style={{ position: "absolute", top: 60, left: 46, maxWidth: "60vw" }}>
        <div style={{ fontFamily: DISP, fontWeight: 600, fontSize: isMobile ? 15 : 18, letterSpacing: "0.05em", color: SC.ink, textTransform: "uppercase", textShadow: "0 1px 12px rgba(0,0,0,.8)" }}>
          {destination.section || destination.label}
        </div>
        <div style={{ fontSize: 10.5, letterSpacing: "0.16em", color: SC.amberInk, marginTop: 2 }}>
          {"// "}{(destination.label || "").toUpperCase()} LANE{itemCount > 1 ? ` · ${itemCount} OBJECTS` : ""}
        </div>
      </motion.div>


      {/* item dial removed — the Holo-Bridge dossier cluster handles objects (minimal UI) */}


      {/* Co-pilot line — bottom left */}
      <div style={{ position: "absolute", bottom: 24, left: 46, maxWidth: "44vw", fontSize: 10, color: transit || quip ? SC.amber : SC.amberInk, opacity: 0.9, textShadow: "0 1px 10px rgba(0,0,0,.85)" }}>
        {transit
          ? `▸ HYPERDRIVE — jump to ${itemIdx >= 0 && curItem ? curItem.label : destination.label}`
          : quip
            ? `◉ CO-PILOT — ${quip}`
            : `▸ CO-PILOT — ${copilot}`}
      </div>

      {/* hint line removed — minimal UI */}
    </div>
  );
}
