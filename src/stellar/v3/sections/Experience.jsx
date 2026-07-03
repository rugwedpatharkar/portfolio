"use client";
/*
 * Experience (Earth) — role dossier, editorial voice.
 *
 * Same L-scaffold as About/FunFacts: all content stays LEFT (maxWidth 50vw),
 * planet + top-right corner Body Telemetry card own the right half.
 *
 * Layout (top→bottom in LEFT column):
 *   - Section header (mono kicker + DM Serif Display heading + Manrope lede)
 *   - Role tabs (2 buttons; active = accent border + fg text, inactive = muted)
 *   - Active role hero: title in DM Serif Display, company + date on a hairline row
 *   - Achievement pill (if present)
 *   - Metrics row: 4 stats, hairline-divided, same rhythm as About's bottom strip
 *   - Categories: single-column list — mono heading + up to 2 bullets each, muted
 *     "more" hint if the category has more points than we can show
 * BOTTOM strip: tech chip rail (mono, hairline chip borders)
 *
 * Density decision: showing ALL categories with 2 bullets each keeps the recruiter
 * scannable at a glance — the third+ bullet in each track lives in the résumé PDF,
 * not the dossier. This preserves the "one held page" cinematic principle from the
 * plan without cramming.
 */
import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { experiences, sectionMeta } from "../../../content";
import { V3Frame, V3Scan } from "../primitives";

const META = sectionMeta.experience;

/*
 * Signature moment — broadsheet stagger on category switch.
 *
 * When the active category changes, the detail column composes as if
 * a newspaper column is setting: track kicker slides in from top-left
 * (10px), h3 fades with a 6px slide, bullet list staggers left→right
 * at 40ms increments. AnimatePresence uses `mode="wait"` so rapid
 * arrow-key nav queues cleanly instead of interleaving.
 *
 * Reduced motion → sections appear in rest state instantly.
 */
const KICKER_VARIANTS = {
  hidden: { opacity: 0, x: -10, y: -6 },
  show:   { opacity: 1, x: 0, y: 0, transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] } },
  exit:   { opacity: 0, transition: { duration: 0.15 } },
};
const HEADING_VARIANTS = {
  hidden: { opacity: 0, y: 6 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1], delay: 0.05 } },
  exit:   { opacity: 0, transition: { duration: 0.15 } },
};
const LIST_VARIANTS = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.04, delayChildren: 0.1 } },
  exit:   { transition: { staggerChildren: 0.02, staggerDirection: -1 } },
};
const BULLET_VARIANTS = {
  hidden: { opacity: 0, x: -8 },
  show:   { opacity: 1, x: 0, transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] } },
  exit:   { opacity: 0, x: -4, transition: { duration: 0.12 } },
};

export default function ExperienceSection({ index, bootNonce }) {
  const [active, setActive] = useState(0);
  const [activeCat, setActiveCat] = useState(0);
  const exp = experiences[active] || experiences[0];
  const cats = exp.categories || [];
  const cat = cats[activeCat] || cats[0];
  const reduce = useReducedMotion();

  // Reset category selection when switching roles
  useEffect(() => { setActiveCat(0); }, [active]);

  return (
    <V3Frame
      section="Experience"
      planet="VENUS"
      index={index}
      scanDir="drill"
      scanKey={bootNonce}
      /* User asked to never cut or clamp: retire BOTTOM row so LEFT gets full
         88vh, tech chip rail moves inside LEFT at bottom of the scroll area. */
      gridAreas={`"top top top" "left left ." "left left ." "left left ."`}
    >
      {/* LEFT — full-height wrapper. overflow: auto lets the elegant v3
          scrollbar catch anything Upswing's density can't fit — no data is
          hidden or truncated. */}
      <div style={{
        gridArea: "left",
        display: "flex", flexDirection: "column",
        gap: "clamp(12px, 1.2vw, 18px)",
        minWidth: 0, minHeight: 0, overflow: "hidden",
        maxWidth: "min(60vw, 1200px)", height: "100%",
      }}>
        {/* Section header — same voice as About + FunFacts */}
        <V3Scan variant="horizontal" delay={0.05}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
              <span style={{ width: 22, height: 1, background: "var(--v3-accent)" }} />
              <span style={{
                fontFamily: "var(--v3-font-mono)", fontWeight: 400, fontSize: 10,
                letterSpacing: ".28em", textTransform: "uppercase", color: "var(--v3-fg-mute)",
              }}>{META.sub}</span>
            </div>
            <h2 style={{
              fontFamily: "var(--v3-font-display)", fontWeight: 340,
              fontSize: "clamp(1.7rem, 1.4vw + 1rem, 2.8rem)", fontOpticalSizing: "auto",
              lineHeight: 1, letterSpacing: "-.02em", color: "var(--v3-fg)",
              margin: 0,
            }}>
              {META.heading}
            </h2>
          </div>
        </V3Scan>

        {/* Role tabs — 2 buttons, active gets accent underline + fg text.
            flexWrap allows tabs to stack on ultra-narrow / high-zoom viewports
            instead of overflowing the container. */}
        <V3Scan variant="horizontal" delay={0.12}>
          <div role="tablist" style={{ display: "flex", flexWrap: "wrap", gap: 0, borderBottom: "1px solid var(--v3-line)", minWidth: 0 }}>
            {experiences.map((e, i) => {
              const isActive = i === active;
              return (
                <button
                  key={i}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActive(i)}
                  style={{
                    all: "unset", cursor: "pointer",
                    padding: "clamp(8px, 0.7vw, 12px) clamp(12px, 1.2vw, 22px) clamp(10px, 0.9vw, 14px)",
                    borderBottom: isActive ? "2px solid var(--v3-accent)" : "2px solid transparent",
                    marginBottom: -1,
                    display: "flex", flexDirection: "column", gap: 4,
                    transition: "border-color .2s",
                    minWidth: 0,
                  }}
                >
                  <span style={{
                    fontFamily: "var(--v3-font-mono)", fontWeight: 400, fontSize: 9,
                    letterSpacing: ".2em", textTransform: "uppercase",
                    color: isActive ? "var(--v3-accent)" : "var(--v3-fg-mute)",
                  }}>{e.date}</span>
                  <span style={{
                    fontFamily: "var(--v3-font-display)", fontWeight: 340,
                    fontSize: "clamp(0.95rem, 0.6vw + 0.6rem, 1.3rem)",
                    color: isActive ? "var(--v3-fg)" : "var(--v3-fg-dim)",
                    letterSpacing: "-.005em", lineHeight: 1.15,
                    fontOpticalSizing: "auto",
                  }}>{e.companyName.split(" ")[0]}</span>
                </button>
              );
            })}
          </div>
        </V3Scan>

        {/* Active role hero — title + company on one line, achievement pill inline
            beside them to save vertical footprint (Experience is the densest section).
            flexWrap already handled; minWidth: 0 on children lets them shrink under
            zoom so the pill can rewrap to a new line before overflowing. */}
        <V3Scan variant="horizontal" delay={0.18} key={`role-${active}`}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "clamp(10px, 1vw, 18px)", flexWrap: "wrap", minWidth: 0 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{
                fontFamily: "var(--v3-font-mono)", fontWeight: 400, fontSize: "clamp(10px, 0.4vw + 8px, 13px)",
                letterSpacing: ".22em", textTransform: "uppercase", color: "var(--v3-fg-dim)",
                marginBottom: 4, overflowWrap: "anywhere",
              }}>
                {exp.title}
              </div>
              <div style={{
                fontFamily: "var(--v3-font-display)", fontWeight: 340,
                fontSize: "clamp(1.2rem, 1vw + 0.7rem, 2rem)", fontOpticalSizing: "auto",
                lineHeight: 1.05, letterSpacing: "-.015em", color: "var(--v3-fg)",
                overflowWrap: "anywhere",
              }}>
                at <span style={{ fontStyle: "italic", color: "var(--v3-accent)" }}>{exp.companyName}</span>
              </div>
            </div>
            {exp.achievement && (
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                marginBottom: 4,
                padding: "clamp(4px, 0.4vw, 6px) clamp(10px, 0.9vw, 14px)",
                border: "1px solid var(--v3-accent)",
                borderRadius: 999,
                background: "color-mix(in oklab, var(--v3-accent) 10%, transparent)",
                fontFamily: "var(--v3-font-mono)", fontWeight: 400, fontSize: "clamp(9px, 0.3vw + 8px, 11px)",
                letterSpacing: ".14em", textTransform: "uppercase",
                color: "var(--v3-fg)",
                maxWidth: "100%",
              }}>
                <span aria-hidden style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--v3-accent)", boxShadow: "0 0 8px var(--v3-accent)", flexShrink: 0 }} />
                {exp.achievement.replace(/^Awarded\s+/i, "")}
              </div>
            )}
          </div>
        </V3Scan>

        {/* Metrics row — 4 stats, hairline dividers. auto-fit minmax lets metrics
            reflow to fewer columns under heavy zoom / narrower viewports instead
            of squishing all 4 into one row where numbers would overlap labels. */}
        {exp.metrics?.length > 0 && (
          <V3Scan variant="horizontal" delay={0.24} key={`metrics-${active}`}>
            <div style={{
              display: "grid",
              gridTemplateColumns: `repeat(auto-fit, minmax(clamp(110px, 12vw, 150px), 1fr))`,
              gap: 0, borderTop: "1px solid var(--v3-line)", borderBottom: "1px solid var(--v3-line)",
              padding: "clamp(10px, 1vw, 16px) 0",
            }}>
              {exp.metrics.map((m, i) => (
                <div key={i} style={{
                  paddingLeft: i > 0 ? "clamp(10px, 1vw, 18px)" : 0,
                  paddingRight: "clamp(10px, 1vw, 18px)",
                  borderLeft: i > 0 ? "1px solid var(--v3-line)" : "none",
                  display: "flex", flexDirection: "column", gap: 6,
                  minWidth: 0,
                }}>
                  <span style={{
                    fontFamily: "var(--v3-font-display)", fontWeight: 340,
                    fontSize: "clamp(1rem, 0.9vw + 0.5rem, 1.7rem)", lineHeight: 1,
                    letterSpacing: "-.015em", color: "var(--v3-fg)", fontOpticalSizing: "auto",
                    fontVariantNumeric: "tabular-nums",
                    overflowWrap: "anywhere",
                  }}>{m.value}</span>
                  <span style={{
                    fontFamily: "var(--v3-font-mono)", fontWeight: 400, fontSize: "clamp(8px, 0.3vw + 7px, 10px)",
                    letterSpacing: ".16em", textTransform: "uppercase", color: "var(--v3-fg-mute)",
                    lineHeight: 1.3,
                    overflowWrap: "anywhere",
                  }}>{m.label}</span>
                </div>
              ))}
            </div>
          </V3Scan>
        )}

        {/* Categories — master-detail like Skills/Projects.
            LEFT (30%): clickable category index. Numeral + category name
              (DM Serif) + bullet count. Active row: 2px accent left-border
              + soft accent tint.
            RIGHT (70%): active category's ALL bullets — hairline-tick list,
              no clamp, no "+N more".
            Keyboard nav: ArrowUp/Down + J/K, same as Skills. */}
        {cats.length > 0 && (
          <V3Scan variant="horizontal" delay={0.3} key={`cats-${active}`} style={{ minWidth: 0 }}>
            <div style={{
              display: "grid",
              gridTemplateColumns: "minmax(220px, 30%) 1fr",
              gap: "clamp(16px, 1.6vw, 26px)",
              border: "1px solid var(--v3-line)",
              borderRadius: 6,
              background: "color-mix(in oklab, var(--v3-bg-void) 50%, transparent)",
              padding: "clamp(12px, 1.2vw, 20px) clamp(14px, 1.4vw, 22px)",
              minWidth: 0,
            }}>
              {/* Master: category index */}
              <div
                role="tablist"
                aria-label="Experience categories"
                style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown" || e.key === "j") { setActiveCat(a => Math.min(cats.length - 1, a + 1)); e.preventDefault(); }
                  if (e.key === "ArrowUp"   || e.key === "k") { setActiveCat(a => Math.max(0, a - 1)); e.preventDefault(); }
                }}
              >
                {cats.map((c, i) => {
                  const isActive = i === activeCat;
                  const count = (c.points || []).length;
                  return (
                    <button
                      key={c.name + i}
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setActiveCat(i)}
                      style={{
                        all: "unset", cursor: "pointer",
                        display: "grid", gridTemplateColumns: "auto minmax(0, 1fr) auto",
                        alignItems: "center", gap: 10,
                        padding: "clamp(8px, 0.8vw, 12px) clamp(8px, 0.9vw, 12px)",
                        borderLeft: isActive ? "2px solid var(--v3-accent)" : "2px solid transparent",
                        background: isActive ? "color-mix(in oklab, var(--v3-accent) 8%, transparent)" : "transparent",
                        borderRadius: "0 4px 4px 0",
                        transition: "background .2s, border-color .2s",
                        minWidth: 0,
                      }}
                    >
                      <motion.span aria-hidden
                        /* Pulse briefly on activation — accent color reads
                           as "selected", scale bump reads as focus lock. */
                        animate={isActive && !reduce ? { scale: [1, 1.18, 1] } : { scale: 1 }}
                        transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
                        style={{
                          fontFamily: "var(--v3-font-mono)", fontWeight: 400,
                          fontSize: "clamp(9px, 0.3vw + 6px, 11px)",
                          color: isActive ? "var(--v3-accent)" : "var(--v3-fg-mute)",
                          letterSpacing: ".14em",
                          fontVariantNumeric: "tabular-nums",
                          display: "inline-block", transformOrigin: "center",
                        }}>{String(i + 1).padStart(2, "0")}</motion.span>
                      <span style={{
                        fontFamily: "var(--v3-font-display)", fontWeight: 340,
                        fontSize: "clamp(0.88rem, 0.4vw + 0.55rem, 1.05rem)", lineHeight: 1.2,
                        letterSpacing: "-.005em",
                        color: isActive ? "var(--v3-fg)" : "var(--v3-fg-dim)",
                        fontOpticalSizing: "auto",
                        overflowWrap: "anywhere",
                      }}>{c.name}</span>
                      <span style={{
                        fontFamily: "var(--v3-font-mono)", fontWeight: 400, fontSize: 10,
                        letterSpacing: ".18em",
                        color: isActive ? "var(--v3-accent)" : "var(--v3-fg-mute)",
                        fontVariantNumeric: "tabular-nums", flexShrink: 0,
                      }}>{String(count).padStart(2, "0")}</span>
                    </button>
                  );
                })}
              </div>

              {/* Detail: active category — broadsheet stagger on switch.
                  AnimatePresence mode="wait" so rapid key/click swaps queue
                  cleanly instead of interleaving mid-animation. Kicker →
                  heading → bullets each stagger via their own variants;
                  bullets share LIST_VARIANTS.staggerChildren. Reduced motion
                  short-circuits into rest state via `initial={false}`. */}
              <div style={{ display: "flex", flexDirection: "column", gap: "clamp(10px, 1vw, 16px)", minWidth: 0, overflow: "hidden" }}>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={`cat-${active}-${activeCat}`}
                    style={{ display: "flex", flexDirection: "column", gap: "clamp(10px, 1vw, 16px)", minWidth: 0 }}
                    initial={reduce ? false : "hidden"}
                    animate="show"
                    exit="exit"
                  >
                    <motion.div variants={KICKER_VARIANTS} style={{
                      fontFamily: "var(--v3-font-mono)", fontWeight: 400, fontSize: "clamp(9px, 0.3vw + 6px, 11px)",
                      letterSpacing: ".22em", textTransform: "uppercase", color: "var(--v3-fg-mute)",
                    }}>Track · {String(activeCat + 1).padStart(2, "0")}</motion.div>
                    <motion.h3 variants={HEADING_VARIANTS} style={{
                      fontFamily: "var(--v3-font-display)", fontWeight: 340,
                      fontSize: "clamp(1.1rem, 0.7vw + 0.6rem, 1.6rem)",
                      lineHeight: 1.15, letterSpacing: "-.005em",
                      color: "var(--v3-fg)", margin: 0, fontOpticalSizing: "auto",
                      overflowWrap: "anywhere",
                    }}>{cat?.name}</motion.h3>
                    <motion.ul variants={LIST_VARIANTS} style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "clamp(6px, 0.6vw, 10px)", minWidth: 0 }}>
                      {(cat?.points || []).map((p, k) => (
                        <motion.li key={k} variants={BULLET_VARIANTS} style={{
                          fontFamily: "var(--v3-font-ui)", fontWeight: 300,
                          fontSize: "clamp(0.78rem, 0.3vw + 0.55rem, 0.92rem)",
                          color: "var(--v3-fg-dim)", lineHeight: 1.5,
                          paddingLeft: 16, position: "relative",
                          overflowWrap: "anywhere",
                        }}>
                          <span aria-hidden style={{
                            position: "absolute", left: 0, top: "0.65em",
                            width: 8, height: 1, background: "var(--v3-line-strong)",
                          }} />
                          {p}
                        </motion.li>
                      ))}
                    </motion.ul>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </V3Scan>
        )}

        {/* Tech chip rail — moved inside LEFT since we retired the BOTTOM row.
            Sits below categories inside the scrollable LEFT column. */}
        {exp.tech?.length > 0 && (
          <V3Scan variant="horizontal" delay={0.36} key={`tech-${active}`} style={{ minWidth: 0 }}>
            <div style={{
              display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center",
              paddingTop: "clamp(10px, 1vw, 16px)", borderTop: "1px solid var(--v3-line)",
              minWidth: 0,
            }}>
              <span style={{
                fontFamily: "var(--v3-font-mono)", fontWeight: 400, fontSize: "clamp(9px, 0.3vw + 7px, 11px)",
                letterSpacing: ".24em", textTransform: "uppercase", color: "var(--v3-fg-mute)",
                marginRight: 10,
              }}>Stack</span>
              {exp.tech.map((t, i) => (
                <span key={i} style={{
                  fontFamily: "var(--v3-font-mono)", fontWeight: 400, fontSize: "clamp(9px, 0.3vw + 7px, 11px)",
                  letterSpacing: ".06em", color: "var(--v3-fg-dim)",
                  border: "1px solid var(--v3-line-strong)", borderRadius: 999,
                  padding: "clamp(2px, 0.2vw, 4px) clamp(8px, 0.7vw, 12px)",
                  maxWidth: "100%", overflowWrap: "anywhere",
                }}>{t}</span>
              ))}
            </div>
          </V3Scan>
        )}
      </div>
    </V3Frame>
  );
}
