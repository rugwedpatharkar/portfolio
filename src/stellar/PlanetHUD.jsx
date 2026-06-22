/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";

/*
 * Holographic data card pinned to the top-left when a destination is
 * active. Reads as the spaceship cockpit's HUD overlay — scan lines,
 * monospace metadata, animated reticle ring, distance + classification.
 *
 * Updates whenever the active destination changes; data comes from the
 * destination registry. Pure CSS animations, no per-frame JS.
 */

const PLANET_FACTS = {
  sol: { class: "G2V Yellow Dwarf", dist: "0 AU", diameter: "1,391,400 km", note: "Stage. Centre of mass." },
  about: { class: "M-class Terrestrial", dist: "0.39 AU", diameter: "4,879 km", note: "Origin. Where the system starts." },
  funfacts: { class: "M-class Terrestrial", dist: "0.72 AU", diameter: "12,104 km", note: "Surface 462 °C. Receipts only." },
  experience: { class: "M-class Terrestrial · Cradle", dist: "1.00 AU", diameter: "12,742 km", note: "Where it all gets shipped." },
  projects: { class: "M-class Terrestrial", dist: "1.52 AU", diameter: "6,779 km", note: "Iron oxide. Things I built." },
  achievements: { class: "C/S/M Spectral Mix", dist: "2.7 AU", diameter: "~600 km Ø", note: "Milestones in formation." },
  skills: { class: "Gas Giant · Class I", dist: "5.2 AU", diameter: "139,820 km", note: "Galaxy of skills. 9 categories." },
  notes: { class: "Gas Giant · Ringed", dist: "9.5 AU", diameter: "116,460 km", note: "Notes you'd write home about." },
  education: { class: "Ice Giant · Tilted 98°", dist: "19.2 AU", diameter: "50,724 km", note: "Knowledge accumulated." },
  hobbies: { class: "Ice Giant · Methane Blue", dist: "30.1 AU", diameter: "49,244 km", note: "Beyond the code." },
  testimonials: { class: "Trans-Neptunian Belt", dist: "30-50 AU", diameter: "~100 km Ø", note: "Voices from afar." },
  contact: { class: "Edge Beacon", dist: "49 AU", diameter: "~ø transmitter", note: "Reach out. Signal back." },
};

const Typed = ({ text, speed = 18, deps = [] }) => {
  const [shown, setShown] = useState("");
  useEffect(() => {
    let i = 0;
    let cancelled = false;
    setShown("");
    const tick = () => {
      if (cancelled) return;
      i++;
      setShown(text.slice(0, i));
      if (i < text.length) setTimeout(tick, speed);
    };
    setTimeout(tick, 60);
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, speed, ...deps]);
  return <span>{shown}</span>;
};

const PlanetHUD = ({ destination }) => {
  const facts = useMemo(() => PLANET_FACTS[destination?.id] || null, [destination]);
  if (!destination || !facts) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 16,
        left: 16,
        padding: "12px 16px 14px",
        width: 268,
        background: "rgba(6, 9, 22, 0.7)",
        backdropFilter: "blur(14px) saturate(1.2)",
        WebkitBackdropFilter: "blur(14px) saturate(1.2)",
        border: `1px solid ${destination.color}55`,
        borderRadius: 10,
        color: "white",
        fontFamily: "'JetBrains Mono', monospace",
        zIndex: 45,
        pointerEvents: "none",
        boxShadow: `0 18px 50px rgba(0, 0, 0, 0.55), inset 0 0 60px ${destination.color}10`,
        overflow: "hidden",
      }}
    >
      {/* Scan line overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 50%, transparent 50%)",
          backgroundSize: "100% 4px",
          pointerEvents: "none",
        }}
      />
      {/* Top row: target indicator */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 9.5, color: destination.color, letterSpacing: "0.12em" }}>
          <span style={{ display: "inline-block", width: 6, height: 6, background: destination.color, borderRadius: "50%", animation: "hudpulse 1.4s ease-in-out infinite" }} />
          <span>TARGET ACQUIRED</span>
        </div>
        <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>{destination.id.toUpperCase()}</span>
      </div>
      {/* Big label */}
      <div style={{ fontSize: 22, fontWeight: 700, color: "white", marginBottom: 2, fontFamily: "'Sora', sans-serif" }}>
        <Typed text={destination.label || destination.id} speed={28} deps={[destination.id]} />
      </div>
      <div style={{ fontSize: 9.5, color: destination.color, letterSpacing: "0.12em", marginBottom: 10, textTransform: "uppercase" }}>
        {facts.class}
      </div>
      {/* Data rows */}
      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "3px 12px", fontSize: 10.5, color: "rgba(255,255,255,0.72)" }}>
        <span style={{ color: "rgba(255,255,255,0.4)" }}>DISTANCE</span><span>{facts.dist}</span>
        <span style={{ color: "rgba(255,255,255,0.4)" }}>DIAMETER</span><span>{facts.diameter}</span>
        <span style={{ color: "rgba(255,255,255,0.4)" }}>SECTION</span><span style={{ color: destination.color }}>{destination.section}</span>
      </div>
      {/* Note */}
      <div style={{ marginTop: 9, paddingTop: 8, borderTop: `1px dashed ${destination.color}33`, fontSize: 10, color: "rgba(255,255,255,0.55)", fontStyle: "italic" }}>
        {facts.note}
      </div>
      <style>{`
        @keyframes hudpulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 0 0 currentColor; }
          50% { opacity: 0.6; box-shadow: 0 0 0 4px transparent; }
        }
      `}</style>
    </div>
  );
};

export default PlanetHUD;
