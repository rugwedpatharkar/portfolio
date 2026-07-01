/* eslint-disable jsx-a11y/anchor-has-content */
/*
 * V3Panel — the premium content surface for every résumé stop (Sun=about → Pluto=
 * contact). Info sits LEFT (matching the hero); the 3D body is centre/right. Radical-
 * minimal + editorial: a mono kicker, a Fraunces section title, the summary, and a
 * clean INLINE-ACCORDION entry list — clicking a row expands its full dossier in place
 * (single-open, spring reveal, no back button), then a hairline "body telemetry" facts
 * readout. All from existing data (planetFacts, sectionItems, summaryFor); v3 tokens.
 */
import { useState, useEffect, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { PLANET_FACTS } from "../data/planetFacts";
import { summaryFor } from "../data/holoSummary";
import { COSMIC_BY_ID } from "./cosmicStops";
import heroPhoto from "../../assets/hero-photo-1024.webp";

const SECTION_TITLE = {
  about: "About", funfacts: "Fun facts", experience: "Experience", projects: "Projects",
  achievements: "Achievements", skills: "Skills", notes: "Writing", education: "Education",
  hobbies: "Hobbies", testimonials: "Testimonials", contact: "Contact",
};

const FACT_ROWS = [["DIST", "distance"], ["DAY", "day"], ["YEAR", "year"], ["TEMP", "temp"]];
const ease = [0.22, 1, 0.36, 1];
const CSS_EASE = "cubic-bezier(.22,1,.36,1)";

/* The expanded dossier body (shown inline when a row is open). */
function Dossier({ d }) {
  return (
    <>
      {d.subtitle && <div style={{ font: `400 var(--v3-type-cap) var(--v3-font-mono)`, color: "var(--v3-fg-dim)", letterSpacing: ".04em" }}>{d.subtitle}</div>}
      {d.accent && <div style={{ font: `300 var(--v3-type-body) var(--v3-font-ui)`, color: "var(--v3-accent)", marginTop: 10 }}>{d.accent}</div>}
      {d.meta?.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 22, margin: "16px 0 4px" }}>
          {d.meta.map((m, i) => (
            <div key={i}>
              <div style={{ font: `400 1.25rem var(--v3-font-mono)`, color: "var(--v3-fg)", lineHeight: 1 }}>{m.value}</div>
              <div style={{ font: `400 var(--v3-type-cap) var(--v3-font-mono)`, color: "var(--v3-fg-mute)", textTransform: "uppercase", letterSpacing: ".08em", marginTop: 5 }}>{m.label}</div>
            </div>
          ))}
        </div>
      )}
      {d.body?.length > 0 && (
        <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 12 }}>
          {d.body.map((b, i) => typeof b === "string" ? (
            <p key={i} style={{ font: `300 var(--v3-type-body) var(--v3-font-ui)`, lineHeight: 1.6, color: "var(--v3-fg-dim)", margin: 0 }}>{b}</p>
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
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 16 }}>
          {d.tags.map((t, i) => (
            <span key={i} style={{ font: `400 var(--v3-type-cap) var(--v3-font-mono)`, color: "var(--v3-fg-dim)", border: "1px solid var(--v3-line-strong)", borderRadius: 999, padding: "3px 11px" }}>{t}</span>
          ))}
        </div>
      )}
      {d.href && (
        <a href={d.href} target="_blank" rel="noreferrer" style={{ display: "inline-block", marginTop: 16, font: `400 var(--v3-type-cap) var(--v3-font-mono)`, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--v3-bg-void)", background: "var(--v3-accent)", borderRadius: 6, padding: "9px 16px", textDecoration: "none" }}>Open channel →</a>
      )}
    </>
  );
}

export default function V3Panel({ destination, section, items, bootNonce }) {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(-1); // single-open accordion; -1 = all collapsed
  const [overflow, setOverflow] = useState(false); // is the column taller than its box?
  const wrapRef = useRef(null);
  /* Open the first entry by default so content is visible without a click. */
  useEffect(() => { setOpen(items?.length ? 0 : -1); }, [section, bootNonce, items?.length]);

  /* Track overflow so the bottom edge-fade only appears when there's more below
     (re-measured after the accordion's 300ms reveal settles). */
  useEffect(() => {
    const measure = () => {
      const el = wrapRef.current;
      if (el) setOverflow(el.scrollHeight - el.clientHeight > 4);
    };
    measure();
    const id = setTimeout(measure, 360);
    return () => clearTimeout(id);
  }, [section, bootNonce, open, items?.length]);

  /* Open a row and float it to the top of the column, so its dossier reads
     downward from the top instead of leaving the reader mid-scroll. Scroll AFTER
     the collapse/expand reveal settles (offsetTop is only final post-layout). */
  const toggle = (i, li) => {
    const opening = open !== i;
    setOpen(opening ? i : -1);
    if (opening && li && wrapRef.current) {
      setTimeout(() => {
        wrapRef.current?.scrollTo({ top: Math.max(0, li.offsetTop - 8), behavior: reduce ? "auto" : "smooth" });
      }, reduce ? 0 : 320);
    }
  };

  const facts = destination && PLANET_FACTS[destination.id];
  const title = SECTION_TITLE[section] || destination?.label || "";
  const planet = (facts?.body || destination?.label || "").split("—")[0].trim();
  const isAbout = section === "about";

  const stagger = { hidden: {}, show: { transition: { staggerChildren: reduce ? 0 : 0.055, delayChildren: reduce ? 0 : 0.08 } } };
  const rise = { hidden: { opacity: 0, y: reduce ? 0 : 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease } } };
  const wrap = { pointerEvents: "auto", maxWidth: "min(46ch, 42vw)", maxHeight: "82vh", overflowY: "auto", overflowX: "hidden" };

  /* ---- cosmic epilogue stop (no résumé items — the phenomenon's facts + wow) ---- */
  const cosmic = destination && COSMIC_BY_ID[destination.id];
  if (cosmic) {
    return (
      <div style={wrap} className="stellar-content-left">
        <motion.div key={cosmic.id} variants={stagger} initial="hidden" animate="show">
          <motion.div variants={rise} style={{ font: `400 var(--v3-type-cap) var(--v3-font-mono)`, letterSpacing: ".28em", textTransform: "uppercase", color: "var(--v3-fg-mute)", display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ width: 30, height: 1, background: "var(--v3-accent)" }} />{cosmic.kicker}
          </motion.div>
          <motion.h2 variants={rise} style={{ font: `400 var(--v3-type-s4) var(--v3-font-serif)`, color: "var(--v3-fg)", lineHeight: 1.02, letterSpacing: "-.02em", margin: ".12em 0 .2em" }}>{cosmic.title}</motion.h2>
          <motion.p variants={rise} style={{ font: `300 var(--v3-type-body) var(--v3-font-ui)`, color: "var(--v3-fg-dim)", lineHeight: 1.55, margin: 0, maxWidth: "42ch" }}>{cosmic.summary}</motion.p>
          {cosmic.facts?.length > 0 && (
            <motion.div variants={rise} style={{ marginTop: 26, borderTop: "1px solid var(--v3-line)", paddingTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 24px" }}>
              {cosmic.facts.map(([label, value]) => (
                <div key={label} style={{ minWidth: 0 }}>
                  <div style={{ font: `400 10px var(--v3-font-mono)`, letterSpacing: ".1em", color: "var(--v3-fg-mute)" }}>{label}</div>
                  <div style={{ font: `400 var(--v3-type-cap) var(--v3-font-mono)`, color: "var(--v3-fg-dim)", marginTop: 2 }}>{value}</div>
                </div>
              ))}
            </motion.div>
          )}
          {cosmic.wow && (
            <motion.div variants={rise} style={{ font: `300 var(--v3-type-cap) var(--v3-font-ui)`, color: "var(--v3-fg-dim)", lineHeight: 1.55, marginTop: 18, paddingLeft: 14, borderLeft: "2px solid var(--v3-accent)" }}>{cosmic.wow}</motion.div>
          )}
        </motion.div>
      </div>
    );
  }

  /* ---- résumé stop — inline accordion ---- */
  const fade = "linear-gradient(to bottom, #000 calc(100% - 46px), transparent)";
  return (
    <div
      ref={wrapRef}
      style={{ ...wrap, position: "relative", maskImage: overflow ? fade : "none", WebkitMaskImage: overflow ? fade : "none" }}
      className="stellar-content-left"
    >
      <motion.div key={section} variants={stagger} initial="hidden" animate="show">
        <motion.div variants={rise} style={{ font: `400 var(--v3-type-cap) var(--v3-font-mono)`, letterSpacing: ".28em", textTransform: "uppercase", color: "var(--v3-fg-mute)", display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ width: 30, height: 1, background: "var(--v3-accent)" }} />{planet}
        </motion.div>

        {/* About stop — the personal header with photo */}
        {isAbout ? (
          <motion.div variants={rise} style={{ display: "flex", gap: 20, alignItems: "center", margin: ".2em 0 .1em" }}>
            <img src={heroPhoto} alt={destination?.label || "Portrait"} style={{ width: 96, height: 96, borderRadius: 14, objectFit: "cover", border: "1px solid var(--v3-accent)", boxShadow: "0 0 22px color-mix(in oklab, var(--v3-accent) 32%, transparent)", flexShrink: 0 }} />
            <h2 style={{ font: `400 var(--v3-type-s4) var(--v3-font-serif)`, color: "var(--v3-fg)", lineHeight: 1.0, letterSpacing: "-.02em", margin: 0 }}>{title}</h2>
          </motion.div>
        ) : (
          <motion.h2 variants={rise} style={{ font: `400 var(--v3-type-s4) var(--v3-font-serif)`, color: "var(--v3-fg)", lineHeight: 1.02, letterSpacing: "-.02em", margin: ".12em 0 .2em" }}>{title}</motion.h2>
        )}

        <motion.p variants={rise} style={{ font: `300 var(--v3-type-body) var(--v3-font-ui)`, color: "var(--v3-fg-dim)", lineHeight: 1.55, margin: 0, maxWidth: "40ch" }}>
          {summaryFor(section)}
        </motion.p>

        {items?.length > 0 && (
          <motion.ul variants={rise} style={{ listStyle: "none", margin: "24px 0 0", padding: 0, borderTop: "1px solid var(--v3-line)" }}>
            {items.map((it, i) => {
              const isOpen = open === i;
              const d = it.dossier;
              return (
                <li key={it.id || i} style={{ borderBottom: "1px solid var(--v3-line)" }}>
                  <button
                    onClick={(e) => toggle(i, e.currentTarget.parentElement)}
                    aria-expanded={isOpen}
                    style={{ all: "unset", cursor: "pointer", display: "flex", alignItems: "baseline", gap: 14, width: "100%", boxSizing: "border-box", padding: "13px 4px" }}
                    onMouseEnter={(e) => { const t = e.currentTarget.querySelector("[data-t]"); if (t) t.style.color = "var(--v3-accent)"; }}
                    onMouseLeave={(e) => { const t = e.currentTarget.querySelector("[data-t]"); if (t && !isOpen) t.style.color = "var(--v3-fg)"; }}
                  >
                    <span style={{ font: `400 var(--v3-type-cap) var(--v3-font-mono)`, color: isOpen ? "var(--v3-accent)" : "var(--v3-fg-mute)" }}>{String(i + 1).padStart(2, "0")}</span>
                    <span data-t style={{ flex: 1, font: `400 1.05rem var(--v3-font-ui)`, color: isOpen ? "var(--v3-accent)" : "var(--v3-fg)", transition: "color .2s" }}>{d?.title || it.label}</span>
                    <span style={{ font: `400 1rem var(--v3-font-ui)`, color: "var(--v3-fg-mute)", transform: isOpen ? "rotate(90deg)" : "none", transition: reduce ? "none" : `transform 260ms ${CSS_EASE}` }}>→</span>
                  </button>
                  {/* inline expand — grid-rows reveal (no back button, single-open) */}
                  {d && (
                    <div style={{ display: "grid", gridTemplateRows: isOpen ? "1fr" : "0fr", transition: reduce ? "none" : `grid-template-rows 300ms ${CSS_EASE}` }}>
                      <div style={{ overflow: "hidden" }}>
                        <div style={{ opacity: isOpen ? 1 : 0, transition: reduce ? "none" : "opacity 260ms ease", padding: "2px 0 18px 16px", marginLeft: 4, borderLeft: "2px solid var(--v3-accent)" }}>
                          <Dossier d={d} />
                        </div>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </motion.ul>
        )}

        {/* body telemetry — the scientific facts, hairline FUI readout */}
        {facts && (
          <motion.div variants={rise} style={{ marginTop: 28, borderTop: "1px solid var(--v3-line)", paddingTop: 16 }}>
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
