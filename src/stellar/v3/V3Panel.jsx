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
import V3ContactForm from "./V3ContactForm";
import useViewport from "../useViewport";
import heroPhoto from "../../assets/hero-photo-1024.webp";
import AboutSection from "./sections/About";
import FunFactsSection from "./sections/FunFacts";
import ExperienceSection from "./sections/Experience";
import SkillsSection from "./sections/Skills";
import ProjectsSection from "./sections/Projects";
import NotesSection from "./sections/Notes";
import AchievementsSection from "./sections/Achievements";
import EducationSection from "./sections/Education";
import HobbiesSection from "./sections/Hobbies";
import TestimonialsSection from "./sections/Testimonials";
import ContactSection from "./sections/Contact";
import WhatSetsMeApartSection from "./sections/WhatSetsMeApart";

/* Planetary Dossier — one bespoke composition per résumé stop. See
   plans/changes-we-want-to-crispy-pebble.md for the design system.
   The legacy accordion path is kept behind ?accordion=1 as a safety valve. */
const SECTION_COMPONENT = {
  about: AboutSection,
  funfacts: FunFactsSection,
  experience: ExperienceSection,
  skills: SkillsSection,
  projects: ProjectsSection,
  notes: NotesSection,
  achievements: AchievementsSection,
  education: EducationSection,
  hobbies: HobbiesSection,
  testimonials: TestimonialsSection,
  whatsetsmeapart: WhatSetsMeApartSection,
  contact: ContactSection,
};
const useAccordionFallback = () => {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("accordion") === "1";
};

const SECTION_TITLE = {
  about: "About", funfacts: "Fun facts", experience: "Experience", projects: "Projects",
  achievements: "Achievements", skills: "Skills", notes: "Writing", education: "Education",
  hobbies: "Hobbies", testimonials: "Testimonials",
  whatsetsmeapart: "What Sets Me Apart", contact: "Contact",
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
        <a className="v3-press" href={d.href} target="_blank" rel="noreferrer" style={{ display: "inline-block", marginTop: 16, font: `400 var(--v3-type-cap) var(--v3-font-mono)`, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--v3-bg-void)", background: "var(--v3-accent)", borderRadius: 6, padding: "9px 16px", textDecoration: "none" }}>Open channel →</a>
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
  const isContact = section === "contact";

  const stagger = { hidden: {}, show: { transition: { staggerChildren: reduce ? 0 : 0.055, delayChildren: reduce ? 0 : 0.08 } } };
  const rise = { hidden: { opacity: 0, y: reduce ? 0 : 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease } } };
  const wrap = { pointerEvents: "auto", maxWidth: isCompact ? "100%" : "min(66ch, 54vw)", maxHeight: isCompact ? "60vh" : "84vh", overflowY: "auto", overflowX: "hidden" };

  /* Cosmic-epilogue inline branch retired — the sole cosmic stop (blackhole)
     now carries the Contact section, which renders via the normal
     SECTION_COMPONENT dispatch below. COSMIC_BY_ID is kept for scene rendering
     (accent, position, radius) but no longer intercepts content. */

  /* ---- Planetary Dossier route — bespoke per-section composition ----
     Any résumé stop with a registered section component renders through the
     new dossier system. The legacy accordion path stays available behind
     ?accordion=1 for one release as a safety valve. The stop number is derived
     from the destination id; V3Frame formats "SECTION · 03/13" itself. */
  const Section = SECTION_COMPONENT[section];
  const idxOfStop = (() => {
    if (typeof window === "undefined") return "01/13";
    const total = 13; /* matches DESTINATIONS.length */
    /* infer from hash for accuracy without importing DESTINATIONS here */
    const hash = window.location.hash;
    /* if we can't infer, show a generic placeholder — V3Frame accepts any string */
    return hash?.match(/\/(\d+)/)?.[1] ? `${hash.match(/\/(\d+)/)[1]}/${total}` : "";
  })();
  if (Section && !useAccordionFallback()) {
    return (
      <>
        {/* pointerEvents:none on the dossier wrapper so pointer-move events pass
            through to the 3D canvas below — MouseParallax reads canvas pointer,
            without this the sun never sways. Section content opts back in with
            pointerEvents:auto on its own child columns. */}
        {/* Top padding trimmed (was clamp(70,8vh,110)) now that the frame's top
            label strip is gone — the section kicker + heading rise toward the top. */}
        <div style={{ pointerEvents: "none", position: "fixed", inset: 0, padding: "clamp(42px, 5vh, 66px) clamp(24px, 4vw, 60px) clamp(48px, 6vh, 74px)", zIndex: 40, display: "flex", overflow: "hidden" }} className="stellar-dossier-frame">
          <Section index={idxOfStop} bootNonce={bootNonce} />
        </div>
        {/* Body-telemetry facts are now merged into the single Planet Information
            card (V3Editorial, docked bottom-right, mounted from StellarApp). The
            separate V3PlanetCard is retired on desktop. Mobile sections still
            inline their own compact facts. */}
      </>
    );
  }

  /* ---- résumé stop — inline accordion ---- */
  const fade = "linear-gradient(to bottom, #000 calc(100% - 46px), transparent)";
  return (
    <>
    {/* Emil-style press feedback: rows get a subtle scale + accent wash on :active,
        the CTA a firmer scale. Native :active (no JS), reduced-motion no-op. */}
    <style>{`
      .v3-row { transition: transform 150ms cubic-bezier(.22,1,.36,1), background-color 160ms ease; border-radius: 6px; }
      .v3-row:active { transform: scale(0.994); background-color: color-mix(in oklab, var(--v3-accent) 8%, transparent); }
      .v3-press { transition: transform 150ms cubic-bezier(.22,1,.36,1); }
      .v3-press:active { transform: scale(0.96); }
      @media (prefers-reduced-motion: reduce) { .v3-row, .v3-press { transition: none; } .v3-row:active, .v3-press:active { transform: none; } }
    `}</style>
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

        {/* Contact stop: real EmailJS-powered send-a-message form ABOVE the outbound
            links (Email / Calendar / GitHub / LinkedIn / Resume in the accordion). */}
        {isContact && <V3ContactForm />}

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
                    className="v3-row"
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
