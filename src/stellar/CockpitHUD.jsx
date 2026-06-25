/* eslint-disable react/prop-types */
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

const MONO = "'JetBrains Mono', monospace";
const DISP = "'Chakra Petch', sans-serif";

const CORNERS = {
  tl: { top: 14, left: 14, rot: 0 },
  tr: { top: 14, right: 14, rot: 90 },
  br: { bottom: 14, right: 14, rot: 180 },
  bl: { bottom: 14, left: 14, rot: 270 },
};

export default function CockpitHUD({ destination, activeIdx = 0, itemIdx = 0, items = [], onPlanet, onItem, onBoard }) {
  const { isMobile } = useViewport();
  const reduce = useReducedMotion();
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
        {!isMobile && <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: 12, letterSpacing: "0.22em", color: rgba(SC.blueInk, 0.7) }}>RUGWED SYSTEM — ORBITAL LANES</span>}
        <span style={{ fontSize: 11, color: SC.blueInk }}>LANE {String(activeIdx + 1).padStart(2, "0")}/{total}</span>
      </div>
      <div style={{ position: "absolute", top: 44, left: 46, right: 46, height: 1, background: rgba(SC.blue, 0.16) }} />

      {/* Slim section eyebrow (demoted from a big wordmark) */}
      <motion.div key={destination.id} {...boot} style={{ position: "absolute", top: 60, left: 46, maxWidth: "60vw" }}>
        <div style={{ fontFamily: DISP, fontWeight: 600, fontSize: isMobile ? 15 : 18, letterSpacing: "0.05em", color: SC.ink, textTransform: "uppercase", textShadow: "0 1px 12px rgba(0,0,0,.8)" }}>
          {destination.section || destination.label}
        </div>
        <div style={{ fontSize: 10.5, letterSpacing: "0.16em", color: SC.amberInk, marginTop: 2 }}>
          // {(destination.label || "").toUpperCase()} LANE{itemCount > 1 ? ` · ${itemCount} OBJECTS` : ""}
        </div>
      </motion.div>

      {/* System ladder (↑↓ = lanes) — right edge */}
      {!isMobile && (
        <div style={{ position: "absolute", top: "50%", right: 22, transform: "translateY(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 9, pointerEvents: "auto" }}>
          <span style={{ fontSize: 8.5, color: rgba(SC.blueInk, 0.6), marginBottom: 2 }}>↑</span>
          {DESTINATIONS.map((d, i) => {
            const active = i === activeIdx;
            return (
              <button
                key={d.id}
                onClick={() => onPlanet && onPlanet(i - activeIdx)}
                title={d.label}
                aria-label={`Go to ${d.label}`}
                style={{ pointerEvents: "auto", cursor: "pointer", background: "none", border: "none", padding: 0, display: "flex", alignItems: "center", gap: 7 }}
              >
                {active && <span style={{ fontFamily: MONO, fontSize: 9.5, color: SC.amberInk, letterSpacing: "0.08em", whiteSpace: "nowrap" }}>{(d.label || "").toUpperCase()}</span>}
                <span style={{ width: active ? 9 : 5, height: active ? 9 : 5, borderRadius: "50%", background: active ? SC.amber : rgba(SC.blueDim, 0.9), boxShadow: active ? `0 0 9px ${rgba(SC.amber, 0.7)}` : "none", animation: active ? "scPulse 1.6s ease-in-out infinite" : "none", transition: "all .25s" }} />
              </button>
            );
          })}
          <span style={{ fontSize: 8.5, color: rgba(SC.blueInk, 0.6), marginTop: 2 }}>↓</span>
        </div>
      )}

      {/* Item dial (←→ = objects on this lane) — bottom centre */}
      {itemCount > 0 && (
        <div style={{ position: "absolute", bottom: 30, left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => onItem && onItem(-1)} aria-label="Previous object" style={{ ...btn, width: 28, height: 28, fontSize: 14, opacity: itemCount > 1 ? 1 : 0.35 }}>←</button>
          <div style={{ textAlign: "center", minWidth: 140 }}>
            <div style={{ fontFamily: DISP, fontWeight: 700, fontSize: 16, color: SC.amber }}>{String(itemIdx + 1).padStart(2, "0")} / {String(itemCount).padStart(2, "0")}</div>
            <div style={{ fontSize: 10, color: rgba(SC.blueInk, 0.85), letterSpacing: "0.05em", marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 200 }}>{curItem ? curItem.label : "—"}</div>
          </div>
          <button onClick={() => onItem && onItem(1)} aria-label="Next object" style={{ ...btn, width: 28, height: 28, fontSize: 14, opacity: itemCount > 1 ? 1 : 0.35 }}>→</button>
        </div>
      )}

      {/* On-screen nav pad (touch/click parity) — bottom right */}
      <div style={{ position: "absolute", bottom: 22, right: 22, display: "grid", gridTemplateColumns: "repeat(3, 26px)", gridTemplateRows: "repeat(3, 26px)", gap: 4, pointerEvents: "auto" }}>
        <span />
        <button onClick={() => onPlanet && onPlanet(-1)} aria-label="Previous lane" style={{ ...btn, gridColumn: 2, fontSize: 12 }}>↑</button>
        <span />
        <button onClick={() => onItem && onItem(-1)} aria-label="Previous object" style={{ ...btn, gridColumn: 1, fontSize: 12 }}>←</button>
        <button onClick={() => onBoard && onBoard()} aria-label="Board" style={{ ...btn, gridColumn: 2, fontSize: 11, color: SC.amberInk, borderColor: rgba(SC.amber, 0.55) }}>↵</button>
        <button onClick={() => onItem && onItem(1)} aria-label="Next object" style={{ ...btn, gridColumn: 3, fontSize: 12 }}>→</button>
        <span />
        <button onClick={() => onPlanet && onPlanet(1)} aria-label="Next lane" style={{ ...btn, gridColumn: 2, fontSize: 12 }}>↓</button>
        <span />
      </div>

      {/* Co-pilot line — bottom left */}
      <div style={{ position: "absolute", bottom: 24, left: 46, maxWidth: "44vw", fontSize: 10, color: SC.amberInk, opacity: 0.9, textShadow: "0 1px 10px rgba(0,0,0,.85)" }}>
        ▸ CO-PILOT — {copilot}
      </div>

      {/* Hint line — bottom centre, under the dial */}
      {!isMobile && (
        <div style={{ position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)", fontSize: 8.5, color: rgba(SC.blueInk, 0.55), letterSpacing: "0.04em", whiteSpace: "nowrap" }}>
          ↑↓ lanes &nbsp;·&nbsp; ←→ objects &nbsp;·&nbsp; ↵ board &nbsp;·&nbsp; ⊙ click an object
        </div>
      )}
    </div>
  );
}
