/* eslint-disable react/prop-types */
import { motion, AnimatePresence, useReducedMotion } from "motion/react";

/*
 * The UNIFORM "scan" readout — one mechanic for revealing EVERY body's detail
 * (planets, moons, dwarfs, exotics, probes, easter eggs, and the résumé bodies).
 * On focusing an object: a sci-fi "scanning" sweep, then a staggered facts grid
 * + a highlighted "wow" + the blurb, from getBodyContent(). Prev/next cycle
 * within the body's category. Reduced-motion → instant, no sweep.
 */

const FACT_LABELS = {
  distance: "Distance", diameter: "Diameter", day: "Day", year: "Year",
  gravity: "Gravity", temp: "Temp", moons: "Moons", atmosphere: "Atmosphere",
  mass: "Mass", missions: "Missions", discovered: "Discovered", orbit: "Orbit",
};

const navBtn = {
  all: "unset", cursor: "pointer", display: "grid", placeItems: "center",
  width: 30, height: 30, borderRadius: 999, border: "1px solid rgba(255,255,255,0.22)",
  color: "rgba(255,255,255,0.85)", fontSize: 15, lineHeight: 1,
};

const ScanReadout = ({ content, onBack, onPrev, onNext }) => {
  const reduce = useReducedMotion();
  if (!content) return null;
  const color = content.color || "#cfd6ff";
  const facts = content.facts || {};
  const grid = Object.entries(facts).filter(([k, v]) => k !== "wow" && k !== "body" && typeof v !== "object");
  const wow = facts.wow;

  const container = { hidden: {}, show: { transition: { staggerChildren: reduce ? 0 : 0.05, delayChildren: reduce ? 0 : 0.35 } } };
  const item = {
    hidden: { opacity: 0, y: reduce ? 0 : 8, filter: reduce ? "blur(0px)" : "blur(4px)" },
    show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <div
      style={{
        position: "fixed", bottom: 58, left: "50%", transform: "translateX(-50%)", zIndex: 50,
        width: "min(500px, 90vw)",
        background: "rgba(8,11,24,0.86)", backdropFilter: "blur(14px) saturate(1.2)", WebkitBackdropFilter: "blur(14px) saturate(1.2)",
        border: `1px solid ${color}66`, borderRadius: 13, padding: "14px 18px 12px",
        boxShadow: `0 18px 54px rgba(0,0,0,0.55), 0 0 0 1px ${color}14`, textAlign: "left", overflow: "hidden",
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={content.id}
          initial={{ opacity: 0, filter: reduce ? "blur(0px)" : "blur(8px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, filter: reduce ? "blur(0px)" : "blur(8px)" }}
          transition={{ duration: 0.25 }}
        >
          {/* scanning header + sweep */}
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, letterSpacing: "0.14em", textTransform: "uppercase", color }}>◈ Scan · {content.category}</span>
            {typeof content.score === "number" && <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "rgba(255,255,255,0.45)" }}>+{content.score}</span>}
          </div>
          <div style={{ position: "relative", height: 2, margin: "7px 0 9px", background: "rgba(255,255,255,0.08)", borderRadius: 2, overflow: "hidden" }}>
            <motion.div
              initial={{ x: reduce ? "0%" : "-100%" }}
              animate={{ x: reduce ? "0%" : "100%" }}
              transition={{ duration: reduce ? 0 : 0.7, ease: [0.4, 0, 0.2, 1] }}
              style={{ position: "absolute", inset: 0, background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
            />
          </div>
          <div style={{ fontFamily: "'Michroma', sans-serif", fontSize: 17, color: "white", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 10 }}>{content.label}</div>

          {grid.length > 0 && (
            <motion.div variants={container} initial="hidden" animate="show" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 18px", marginBottom: 10 }}>
              {grid.map(([k, v]) => (
                <motion.div key={k} variants={item}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8.5, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{FACT_LABELS[k] || k}</div>
                  <div style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 13, color: "rgba(255,255,255,0.92)", marginTop: 1 }}>{String(v)}</div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {wow && (
            <motion.div variants={item} initial="hidden" animate="show" style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 12.5, fontStyle: "italic", color, lineHeight: 1.45, margin: "0 0 8px", paddingLeft: 14, position: "relative" }}>
              <span style={{ position: "absolute", left: 0 }}>★</span>{wow}
            </motion.div>
          )}

          {content.info && (
            <div style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 12.5, color: "rgba(255,255,255,0.8)", lineHeight: 1.5 }}>{content.info}</div>
          )}
        </motion.div>
      </AnimatePresence>

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
        <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }} onClick={onPrev} aria-label="Previous in category" style={navBtn}>‹</motion.button>
        <motion.button
          whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }} onClick={onBack}
          style={{ all: "unset", cursor: "pointer", flex: 1, textAlign: "center", fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.85)", border: "1px solid rgba(255,255,255,0.22)", borderRadius: 999, padding: "8px 14px" }}
        >← Back to map · Esc</motion.button>
        <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }} onClick={onNext} aria-label="Next in category" style={navBtn}>›</motion.button>
      </div>
    </div>
  );
};

export default ScanReadout;
