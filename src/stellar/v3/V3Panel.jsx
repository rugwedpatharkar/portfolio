/* eslint-disable jsx-a11y/anchor-has-content */
/*
 * V3Panel — the premium content surface for every résumé stop (Sun=about → Pluto=
 * contact). Info sits LEFT (matching the hero); the 3D body is centre/right. Radical-
 * minimal + editorial: a mono kicker, a Fraunces section title, the summary, a clean
 * pickable entry list, and a hairline "body telemetry" readout (the scientific facts,
 * FUI-style). Picking an entry reveals its full dossier in the same column. All from
 * the existing data (planetFacts, sectionItems, summaryFor); v3 tokens; motion/react.
 */
import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { PLANET_FACTS } from "../data/planetFacts";
import { summaryFor } from "../data/holoSummary";

const SECTION_TITLE = {
  about: "About", funfacts: "Fun facts", experience: "Experience", projects: "Projects",
  achievements: "Achievements", skills: "Skills", notes: "Writing", education: "Education",
  hobbies: "Hobbies", testimonials: "Testimonials", contact: "Contact",
};

/* the handful of facts worth surfacing, in order, as a mono telemetry readout */
const FACT_ROWS = [
  ["DIST", "distance"], ["DAY", "day"], ["YEAR", "year"], ["TEMP", "temp"],
];

const ease = [0.22, 1, 0.36, 1];

export default function V3Panel({ destination, section, items, bootNonce }) {
  const reduce = useReducedMotion();
  const [picked, setPicked] = useState(-1);
  useEffect(() => { setPicked(-1); }, [section, bootNonce]);

  const facts = destination && PLANET_FACTS[destination.id];
  const title = SECTION_TITLE[section] || destination?.label || "";
  const planet = (facts?.body || destination?.label || "").split("—")[0].trim();

  const stagger = { hidden: {}, show: { transition: { staggerChildren: reduce ? 0 : 0.055, delayChildren: reduce ? 0 : 0.08 } } };
  const rise = {
    hidden: { opacity: 0, y: reduce ? 0 : 14 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
  };

  const wrap = {
    pointerEvents: "auto",
    maxWidth: "min(46ch, 42vw)",
    maxHeight: "82vh",
    overflowY: "auto",
    overflowX: "hidden",
  };

  /* ---- item detail view ---- */
  if (picked >= 0 && items?.[picked]?.dossier) {
    const d = items[picked].dossier;
    return (
      <div style={wrap} className="stellar-content-left">
        <AnimatePresence mode="wait">
          <motion.div key={items[picked].id} initial={{ opacity: 0, y: reduce ? 0 : 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reduce ? 0 : -12 }} transition={{ duration: 0.4, ease }}>
            <button onClick={() => setPicked(-1)} style={{ all: "unset", cursor: "pointer", font: `400 var(--v3-type-cap) var(--v3-font-mono)`, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--v3-fg-mute)" }}>‹ back</button>
            <div style={{ font: `400 var(--v3-type-cap) var(--v3-font-mono)`, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--v3-accent)", marginTop: 20 }}>{d.eyebrow}</div>
            <h2 style={{ font: `400 var(--v3-type-s2) var(--v3-font-serif)`, color: "var(--v3-fg)", lineHeight: 1.08, letterSpacing: "-.01em", margin: ".28em 0 .1em" }}>{d.title}</h2>
            {d.subtitle && <div style={{ font: `400 var(--v3-type-cap) var(--v3-font-mono)`, color: "var(--v3-fg-dim)", letterSpacing: ".04em" }}>{d.subtitle}</div>}
            {d.accent && <div style={{ font: `300 var(--v3-type-body) var(--v3-font-ui)`, color: "var(--v3-accent)", marginTop: 12 }}>{d.accent}</div>}

            {d.meta?.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 22, margin: "20px 0 4px" }}>
                {d.meta.map((m, i) => (
                  <div key={i}>
                    <div style={{ font: `400 1.35rem var(--v3-font-mono)`, color: "var(--v3-fg)", lineHeight: 1 }}>{m.value}</div>
                    <div style={{ font: `400 var(--v3-type-cap) var(--v3-font-mono)`, color: "var(--v3-fg-mute)", textTransform: "uppercase", letterSpacing: ".08em", marginTop: 5 }}>{m.label}</div>
                  </div>
                ))}
              </div>
            )}

            {d.body?.length > 0 && (
              <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 14 }}>
                {d.body.map((b, i) => typeof b === "string" ? (
                  <p key={i} style={{ font: `300 var(--v3-type-body) var(--v3-font-ui)`, lineHeight: 1.62, color: "var(--v3-fg-dim)", margin: 0 }}>{b}</p>
                ) : (
                  <div key={i}>
                    <div style={{ font: `400 var(--v3-type-cap) var(--v3-font-mono)`, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--v3-fg-mute)", marginBottom: 8 }}>{b.head}</div>
                    <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 7 }}>
                      {(b.points || []).map((p, j) => (
                        <li key={j} style={{ font: `300 var(--v3-type-body) var(--v3-font-ui)`, lineHeight: 1.55, color: "var(--v3-fg-dim)", paddingLeft: 18, position: "relative" }}>
                          <span style={{ position: "absolute", left: 0, color: "var(--v3-accent)" }}>—</span>{p}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {d.tags?.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 18 }}>
                {d.tags.map((t, i) => (
                  <span key={i} style={{ font: `400 var(--v3-type-cap) var(--v3-font-mono)`, color: "var(--v3-fg-dim)", border: "1px solid var(--v3-line-strong)", borderRadius: 999, padding: "3px 11px" }}>{t}</span>
                ))}
              </div>
            )}
            {d.href && (
              <a href={d.href} target="_blank" rel="noreferrer" style={{ display: "inline-block", marginTop: 18, font: `400 var(--v3-type-cap) var(--v3-font-mono)`, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--v3-bg-void)", background: "var(--v3-accent)", borderRadius: 6, padding: "9px 16px", textDecoration: "none" }}>Open channel →</a>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  /* ---- default section view ---- */
  return (
    <div style={wrap} className="stellar-content-left">
      <motion.div key={section} variants={stagger} initial="hidden" animate="show">
        <motion.div variants={rise} style={{ font: `400 var(--v3-type-cap) var(--v3-font-mono)`, letterSpacing: ".28em", textTransform: "uppercase", color: "var(--v3-fg-mute)", display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ width: 30, height: 1, background: "var(--v3-accent)" }} />{planet}
        </motion.div>
        <motion.h2 variants={rise} style={{ font: `400 var(--v3-type-s4) var(--v3-font-serif)`, color: "var(--v3-fg)", lineHeight: 1.02, letterSpacing: "-.02em", margin: ".12em 0 .2em" }}>
          {title}
        </motion.h2>
        <motion.p variants={rise} style={{ font: `300 var(--v3-type-body) var(--v3-font-ui)`, color: "var(--v3-fg-dim)", lineHeight: 1.55, margin: 0, maxWidth: "40ch" }}>
          {summaryFor(section)}
        </motion.p>

        {items?.length > 0 && (
          <motion.ul variants={rise} style={{ listStyle: "none", margin: "26px 0 0", padding: 0, borderTop: "1px solid var(--v3-line)" }}>
            {items.map((it, i) => (
              <li key={it.id || i}>
                <button
                  onClick={() => setPicked(i)}
                  style={{ all: "unset", cursor: "pointer", display: "flex", alignItems: "baseline", gap: 14, width: "100%", boxSizing: "border-box", padding: "13px 4px", borderBottom: "1px solid var(--v3-line)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.paddingLeft = "12px"; e.currentTarget.querySelector("[data-t]").style.color = "var(--v3-accent)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.paddingLeft = "4px"; e.currentTarget.querySelector("[data-t]").style.color = "var(--v3-fg)"; }}
                >
                  <span style={{ font: `400 var(--v3-type-cap) var(--v3-font-mono)`, color: "var(--v3-fg-mute)" }}>{String(i + 1).padStart(2, "0")}</span>
                  <span data-t style={{ flex: 1, font: `400 1.05rem var(--v3-font-ui)`, color: "var(--v3-fg)", transition: "color .2s" }}>{it.dossier?.title || it.label}</span>
                  <span style={{ font: `400 var(--v3-type-cap) var(--v3-font-mono)`, color: "var(--v3-fg-mute)" }}>→</span>
                </button>
              </li>
            ))}
          </motion.ul>
        )}

        {/* body telemetry — the scientific facts, hairline FUI readout */}
        {facts && (
          <motion.div variants={rise} style={{ marginTop: 30, borderTop: "1px solid var(--v3-line)", paddingTop: 16 }}>
            <div style={{ font: `400 var(--v3-type-cap) var(--v3-font-mono)`, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--v3-fg-mute)", marginBottom: 12 }}>◦ Body telemetry</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px" }}>
              {FACT_ROWS.filter(([, k]) => facts[k]).map(([label, k]) => (
                <div key={k} style={{ minWidth: 0 }}>
                  <div style={{ font: `400 10px var(--v3-font-mono)`, letterSpacing: ".1em", color: "var(--v3-fg-mute)" }}>{label}</div>
                  <div style={{ font: `400 var(--v3-type-cap) var(--v3-font-mono)`, color: "var(--v3-fg-dim)", marginTop: 2 }}>{facts[k]}</div>
                </div>
              ))}
            </div>
            {facts.wow && (
              <div style={{ font: `300 var(--v3-type-cap) var(--v3-font-ui)`, color: "var(--v3-fg-dim)", lineHeight: 1.5, marginTop: 14, paddingLeft: 14, borderLeft: "2px solid var(--v3-accent)" }}>{facts.wow}</div>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
