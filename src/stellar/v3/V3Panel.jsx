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
import useViewport from "../useViewport";
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

/* Body telemetry — the scientific facts about the framed body. Docked as a HUD
   readout (bottom-right on desktop, inline on mobile) so it's clearly the
   PLANET's data, separate from the résumé reading column. */
function Telemetry({ facts }) {
  const rows = FACT_ROWS.filter(([, k]) => facts[k]);
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 15 }}>
        <span style={{ width: 16, height: 1, background: "var(--v3-accent)", opacity: 0.7 }} />
        <span style={{ font: `400 10px var(--v3-font-mono)`, letterSpacing: ".26em", textTransform: "uppercase", color: "var(--v3-fg-mute)" }}>Body telemetry</span>
      </div>
      {/* spec-sheet rows: label left, value right — one line each, no cramped wrap */}
      <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
        {rows.map(([label, k]) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 18 }}>
            <span style={{ flexShrink: 0, font: `400 10px var(--v3-font-mono)`, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--v3-fg-mute)" }}>{label}</span>
            <span style={{ font: `400 var(--v3-type-cap) var(--v3-font-mono)`, color: "var(--v3-fg)", textAlign: "right", lineHeight: 1.3 }}>{facts[k]}</span>
          </div>
        ))}
      </div>
      {facts.wow && (
        <div style={{ font: `300 var(--v3-type-cap) var(--v3-font-ui)`, color: "var(--v3-fg-dim)", lineHeight: 1.55, marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--v3-line)" }}>{facts.wow}</div>
      )}
    </>
  );
}

export default function V3Panel({ destination, section, items, bootNonce }) {
  const reduce = useReducedMotion();
  const { isCompact } = useViewport();
  const [open, setOpen] = useState(-1); // single-open accordion; -1 = all collapsed
  const [overflow, setOverflow] = useState(false); // is the column taller than its box?
  const wrapRef = useRef(null);
  const openRef = useRef(-1); // synchronous mirror of `open` for the keyboard stepper
  /* Open the first entry by default so content is visible without a click. */
  useEffect(() => { const v = items?.length ? 0 : -1; openRef.current = v; setOpen(v); }, [section, bootNonce, items?.length]);

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

  /* Float an opened row to the top of the column, so its dossier reads downward
     instead of leaving the reader mid-scroll. Scroll AFTER the 300ms grid reveal
     settles (offsetTop is only final post-layout). Index-based so both click and
     keyboard use it. */
  const floatRow = (i) => {
    const el = wrapRef.current;
    const li = el?.querySelectorAll("li")[i];
    if (!el || !li) return;
    setTimeout(() => {
      el.scrollTo({ top: Math.max(0, li.offsetTop - 8), behavior: reduce ? "auto" : "smooth" });
    }, reduce ? 0 : 320);
  };
  const toggle = (i) => {
    const next = open === i ? -1 : i;
    openRef.current = next;
    setOpen(next);
    if (next >= 0) floatRow(i);
  };
  /* ←/→ step the accordion — dispatched by StellarApp in v3 so the arrow keys
     navigate CONTENT (not the camera). Opens from the first/last when nothing is
     open; clamps at the ends. No-op on stops without a résumé list. */
  useEffect(() => {
    const onStep = (e) => {
      const n = items?.length || 0;
      if (!n) return;
      const dir = e.detail?.dir || 0;
      const o = openRef.current;
      const next = o < 0 ? (dir > 0 ? 0 : n - 1) : Math.max(0, Math.min(n - 1, o + dir));
      openRef.current = next;
      setOpen(next);
      floatRow(next);
    };
    window.addEventListener("v3:accordion", onStep);
    return () => window.removeEventListener("v3:accordion", onStep);
  }, [items?.length, reduce]);

  const facts = destination && PLANET_FACTS[destination.id];
  const title = SECTION_TITLE[section] || destination?.label || "";
  const planet = (facts?.body || destination?.label || "").split("—")[0].trim();
  const isAbout = section === "about";

  const stagger = { hidden: {}, show: { transition: { staggerChildren: reduce ? 0 : 0.055, delayChildren: reduce ? 0 : 0.08 } } };
  const rise = { hidden: { opacity: 0, y: reduce ? 0 : 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease } } };
  const wrap = { pointerEvents: "auto", maxWidth: isCompact ? "100%" : "min(66ch, 54vw)", maxHeight: isCompact ? "60vh" : "84vh", overflowY: "auto", overflowX: "hidden" };

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
    <>
    <div
      ref={wrapRef}
      style={{ ...wrap, position: "relative", maskImage: overflow ? fade : "none", WebkitMaskImage: overflow ? fade : "none" }}
      className="stellar-content-left"
    >
      <motion.div key={section} variants={stagger} initial="hidden" animate="show">
        <motion.div variants={rise} style={{ font: `400 var(--v3-type-cap) var(--v3-font-mono)`, letterSpacing: ".28em", textTransform: "uppercase", color: "var(--v3-fg-mute)", display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ width: 30, height: 1, background: "var(--v3-accent)" }} />{planet}
        </motion.div>

        {/* About stop — the personal header with photo. The source is a portrait
            cutout with the subject right-of-centre over transparency, so a plain
            square objectFit:cover shows the empty left + a torso-heavy, tiny face.
            Frame it as a background cropped to a head-and-shoulders square centred
            on the face (≈x[13–80%], y[3–48%]): headroom above the hair, eyes on the
            upper third, shoulders at the base. */}
        {isAbout ? (
          <motion.div variants={rise} style={{ display: "flex", gap: 22, alignItems: "center", margin: ".2em 0 .1em" }}>
            <div
              role="img"
              aria-label={destination?.label || "Portrait"}
              style={{
                width: 106, height: 106, flexShrink: 0, borderRadius: 16,
                backgroundImage: `url(${heroPhoto})`,
                backgroundSize: "150% auto",
                backgroundPosition: "39% 6%",
                backgroundRepeat: "no-repeat",
                backgroundColor: "rgba(255,255,255,0.03)",
                border: "1px solid var(--v3-accent)",
                boxShadow: "0 0 26px color-mix(in oklab, var(--v3-accent) 30%, transparent)",
              }}
            />
            <h2 style={{ font: `400 var(--v3-type-s4) var(--v3-font-serif)`, color: "var(--v3-fg)", lineHeight: 1.0, letterSpacing: "-.02em", margin: 0 }}>{title}</h2>
          </motion.div>
        ) : (
          <motion.h2 variants={rise} style={{ font: `400 var(--v3-type-s4) var(--v3-font-serif)`, color: "var(--v3-fg)", lineHeight: 1.02, letterSpacing: "-.02em", margin: ".12em 0 .2em" }}>{title}</motion.h2>
        )}

        <motion.p variants={rise} style={{ font: `300 var(--v3-type-body) var(--v3-font-ui)`, color: "var(--v3-fg-dim)", lineHeight: 1.55, margin: 0, maxWidth: "58ch" }}>
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
                    onClick={() => toggle(i)}
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

        {/* Body telemetry inline ONLY on compact (mobile); desktop docks it
            bottom-right (below) so the reading column stays pure résumé. */}
        {isCompact && facts && (
          <motion.div variants={rise} style={{ marginTop: 28, borderTop: "1px solid var(--v3-line)", paddingTop: 16 }}>
            <Telemetry facts={facts} />
          </motion.div>
        )}
      </motion.div>
    </div>
    {/* desktop: dock telemetry bottom-right as a scanner data panel near the body,
        on its own dark backing so it reads over the planet. */}
    {!isCompact && facts && (
      <motion.div
        key={`tel-${section}`}
        initial={reduce ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease, delay: 0.15 }}
        style={{ position: "fixed", right: "clamp(30px, 4vw, 92px)", bottom: "clamp(26px, 6vh, 62px)", width: "min(360px, 30vw)", zIndex: 41, pointerEvents: "none", padding: "24px 30px" }}
      >
        {/* feathered dark backing — dissolves at the edges (no boxy card/border) so
            the readout floats over the planet; a separate layer, so the text on top
            is never masked/faded. */}
        <div aria-hidden style={{ position: "absolute", inset: 0, background: "rgba(4,5,9,0.6)", WebkitMaskImage: "radial-gradient(125% 120% at 82% 55%, #000 48%, transparent 100%)", maskImage: "radial-gradient(125% 120% at 82% 55%, #000 48%, transparent 100%)" }} />
        <div style={{ position: "relative" }}>
          <Telemetry facts={facts} />
        </div>
      </motion.div>
    )}
    </>
  );
}
