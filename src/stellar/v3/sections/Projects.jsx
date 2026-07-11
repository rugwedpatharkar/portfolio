/*
 * Projects (Earth) — cinematic carousel per the taste-stack table.
 *
 * Full-panel horizontal swipe. Each project occupies the whole LEFT
 * content area; prev/next controls (arrow keys or buttons) advance
 * between them. On project change:
 *   - The exiting panel slides left + fades out.
 *   - The entering panel slides in from the right.
 *   - The project name h3 uses a shutter clip-path reveal
 *     (inset(0 100% 0 0) → inset(0 0 0 0)) that sweeps L→R over 400 ms
 *     after the panel arrives.
 *   - A page number ("03 / 06") lives in the top-right corner, mono.
 *
 * Professional / Personal filter tabs sit on the same row as the h2
 * (compact segmented pill, matches Experience's role switcher). Active
 * pool is what the carousel scrolls through.
 */
import { useMemo, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { projects, sectionMeta } from "../../../content";
import { V3Frame, V3Scan, V3Chip } from "../primitives";
import { EASE, shutterVariants } from "../anim";

const META = sectionMeta.projects;

/* Panel entrance / exit — slide + fade in the reading direction so
   rapid nav feels like flipping through a physical dossier. */
const PANEL_VARIANTS = {
  enter: (dir) => ({ opacity: 0, x: dir > 0 ? 60 : -60 }),
  center: { opacity: 1, x: 0, transition: { duration: 0.4, ease: EASE } },
  exit:  (dir) => ({ opacity: 0, x: dir > 0 ? -60 : 60, transition: { duration: 0.25, ease: EASE } }),
};
/* Shutter reveal on the project name — clip-path mask sweeps L→R.
   Vertical inset is negative so the reveal region extends beyond the box
   at top and bottom — descenders (`g`, `j`, `p`, `y`) and cap ascenders
   never get shaved by the clip. The horizontal inset does all the
   masking work. */
const SHUTTER_VARIANTS = shutterVariants();

export default function ProjectsSection({ bootNonce }) {
  const [tab, setTab] = useState("professional");
  const [active, setActive] = useState(0);
  const [dir, setDir] = useState(1);
  const reduce = useReducedMotion();

  const { professional, personal } = useMemo(() => ({
    professional: (projects || []).filter(p => p.type === "professional"),
    personal: (projects || []).filter(p => p.type === "personal"),
  }), []);

  const list = tab === "professional" ? professional : personal;
  const p = list[active] || list[0];
  const tags = (p?.tags || []).map(t => t.name || t);
  const stat = p?.highlight || p?.stats?.[0] || null;

  // Reset active + direction when switching tabs
  useEffect(() => { setActive(0); setDir(1); }, [tab]);

  const goto = useCallback((i) => {
    if (i === active || i < 0 || i >= list.length) return;
    setDir(i > active ? 1 : -1);
    setActive(i);
  }, [active, list.length]);

  const next = useCallback(() => goto((active + 1) % list.length), [active, list.length, goto]);
  const prev = useCallback(() => goto((active - 1 + list.length) % list.length), [active, list.length, goto]);

  return (
    <V3Frame
      section="Projects"
      planet="EARTH"

      scanDir="plot"
      scanKey={bootNonce}
      gridAreas={`"top top top" "left left ." "left left ." "left left ."`}
    >
      <div style={{
        gridArea: "left",
        display: "flex", flexDirection: "column",
        gap: "clamp(10px, 1vw, 16px)",
        minWidth: 0, minHeight: 0, overflow: "hidden",
        maxWidth: "min(60vw, 1200px)", height: "100%",
      }}>
        {/* Header row — kicker + h2 on the left, filter pills + page indicator + carousel arrows on the right. */}
        <V3Scan variant="horizontal" delay={0.05}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "clamp(12px, 1.4vw, 24px)", flexWrap: "wrap", minWidth: 0 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <span style={{ width: 22, height: 1, background: "var(--v3-accent)" }} />
                <span style={{
                  fontFamily: "var(--v3-font-mono)", fontWeight: 400, fontSize: "clamp(9px, 0.3vw + 7px, 11px)",
                  letterSpacing: ".28em", textTransform: "uppercase", color: "var(--v3-fg-mute)",
                }}>{META.sub}</span>
              </div>
              <h2 style={{
                fontFamily: "var(--v3-font-display)", fontWeight: 340,
                fontSize: "clamp(1.5rem, 1.1vw + 0.9rem, 2.3rem)", fontOpticalSizing: "auto",
                lineHeight: 1, letterSpacing: "-.02em", color: "var(--v3-fg)",
                margin: 0,
              }}>
                {META.heading}
              </h2>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "clamp(8px, 1vw, 14px)", flexWrap: "wrap" }}>
              {/* Filter pills */}
              <div role="tablist" style={{
                display: "inline-flex", gap: 4, padding: 4,
                border: "1px solid var(--v3-line)", borderRadius: 999,
                background: "color-mix(in oklab, var(--v3-bg-void) 50%, transparent)",
              }}>
                {[
                  { key: "professional", label: "Professional", count: professional.length },
                  { key: "personal", label: "Personal", count: personal.length },
                ].map(t => {
                  const isActive = t.key === tab;
                  return (
                    <button
                      key={t.key}
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setTab(t.key)}
                      style={{
                        all: "unset", cursor: "pointer",
                        display: "inline-flex", alignItems: "center", gap: 8,
                        padding: "clamp(5px, 0.55vw, 8px) clamp(10px, 1vw, 14px)",
                        borderRadius: 999,
                        border: `1px solid ${isActive ? "var(--v3-accent)" : "transparent"}`,
                        background: isActive ? "color-mix(in oklab, var(--v3-accent) 12%, transparent)" : "transparent",
                        transition: "background .2s, border-color .2s",
                      }}
                    >
                      <span style={{
                        fontFamily: "var(--v3-font-display)", fontWeight: 340,
                        fontSize: "clamp(0.82rem, 0.4vw + 0.5rem, 0.95rem)",
                        color: isActive ? "var(--v3-fg)" : "var(--v3-fg-dim)",
                        letterSpacing: "-.005em",
                      }}>{t.label}</span>
                      <span style={{
                        fontFamily: "var(--v3-font-mono)", fontWeight: 400, fontSize: 10,
                        letterSpacing: ".18em",
                        color: isActive ? "var(--v3-accent)" : "var(--v3-fg-mute)",
                        fontVariantNumeric: "tabular-nums",
                      }}>{String(t.count).padStart(2, "0")}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </V3Scan>

        {/* Carousel body — full-panel horizontal swipe. Frame wraps a
            single active panel that AnimatePresence swaps in/out. */}
        <V3Scan variant="plot" delay={0.15} style={{ minWidth: 0, flex: 1, minHeight: 0, display: "flex" }}>
          <div
            role="group"
            aria-roledescription="carousel"
            aria-label={`${META.heading} ${active + 1} of ${list.length}`}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight" || e.key === "l") { next(); e.preventDefault(); }
              if (e.key === "ArrowLeft"  || e.key === "h") { prev(); e.preventDefault(); }
            }}
            style={{
              position: "relative",
              width: "100%", height: "100%",
              border: "1px solid var(--v3-line)",
              borderRadius: 6,
              background: "color-mix(in oklab, var(--v3-bg-void) 50%, transparent)",
              padding: "clamp(14px, 1.4vw, 24px) clamp(16px, 1.6vw, 28px)",
              overflow: "hidden",
              minWidth: 0, minHeight: 0,
              display: "flex", flexDirection: "column",
            }}
          >
            {/* Page indicator + carousel arrows — top-right corner. */}
            <div aria-hidden={false} style={{
              position: "absolute", top: "clamp(12px, 1.2vw, 20px)", right: "clamp(14px, 1.4vw, 24px)",
              display: "flex", alignItems: "center", gap: "clamp(8px, 0.8vw, 12px)",
              zIndex: 2,
            }}>
              <button
                type="button" aria-label="Previous project" onClick={prev}
                className="v3-press"
                style={{
                  all: "unset", cursor: "pointer",
                  width: "clamp(24px, 2.2vw, 30px)", height: "clamp(24px, 2.2vw, 30px)",
                  borderRadius: "50%",
                  border: "1px solid var(--v3-line-strong)",
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--v3-font-mono)", fontSize: 12,
                  color: "var(--v3-fg-dim)",
                  transition: "border-color .2s, color .2s",
                }}
              >←</button>
              <span style={{
                fontFamily: "var(--v3-font-mono)", fontWeight: 400,
                fontSize: "clamp(10px, 0.35vw + 7px, 12px)",
                letterSpacing: ".22em",
                color: "var(--v3-fg-mute)",
                fontVariantNumeric: "tabular-nums",
              }}>{String(active + 1).padStart(2, "0")} / {String(list.length).padStart(2, "0")}</span>
              <button
                type="button" aria-label="Next project" onClick={next}
                className="v3-press"
                style={{
                  all: "unset", cursor: "pointer",
                  width: "clamp(24px, 2.2vw, 30px)", height: "clamp(24px, 2.2vw, 30px)",
                  borderRadius: "50%",
                  border: "1px solid var(--v3-line-strong)",
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--v3-font-mono)", fontSize: 12,
                  color: "var(--v3-fg-dim)",
                  transition: "border-color .2s, color .2s",
                }}
              >→</button>
            </div>

            {/* Active panel — full detail. AnimatePresence swaps on
                (tab, active) key with custom direction so the entering
                panel slides in from the reading side. */}
            <AnimatePresence mode="wait" custom={dir} initial={false}>
              <motion.div
                key={`${tab}-${active}`}
                custom={dir}
                variants={PANEL_VARIANTS}
                initial={reduce ? false : "enter"}
                animate="center"
                exit="exit"
                style={{
                  display: "flex", flexDirection: "column",
                  gap: "clamp(14px, 1.4vw, 22px)",
                  minWidth: 0, minHeight: 0, flex: 1,
                  /* Long projects were silently clipped — scroll instead (the v3
                     scrollbar is styled). Reserve less right gutter for the arrows. */
                  overflowY: "auto", overflowX: "hidden",
                  paddingRight: "clamp(52px, 5vw, 92px)",
                }}
              >
                {/* kicker: status · year · team */}
                <div style={{
                  fontFamily: "var(--v3-font-mono)", fontWeight: 400, fontSize: "clamp(9px, 0.3vw + 6px, 11px)",
                  letterSpacing: ".22em", textTransform: "uppercase", color: "var(--v3-fg-mute)",
                }}>
                  {[p?.status, p?.year, p?.team].filter(Boolean).join(" · ")}
                </div>

                {/* name — shutter reveal via clip-path mask. Line-height
                    bumped from 1.1 → 1.25 so descenders sit inside the
                    box; the negative clip-path inset also gives cover for
                    the edges. Bigger size + heavier presence — this is
                    the panel's editorial anchor. */}
                <motion.h3
                  variants={reduce ? undefined : SHUTTER_VARIANTS}
                  initial={reduce ? false : "hidden"}
                  animate="show"
                  style={{
                    fontFamily: "var(--v3-font-display)", fontWeight: 340,
                    fontSize: "clamp(1.8rem, 1.5vw + 1rem, 3rem)",
                    lineHeight: 1.25, letterSpacing: "-.015em",
                    color: "var(--v3-fg)", margin: 0, fontOpticalSizing: "auto",
                    overflowWrap: "anywhere",
                    paddingBottom: "0.05em",
                  }}>{p?.name}</motion.h3>

                {p?.description && (
                  <p style={{
                    fontFamily: "var(--v3-font-ui)", fontWeight: 300,
                    fontSize: "clamp(0.92rem, 0.4vw + 0.65rem, 1.1rem)",
                    color: "var(--v3-fg-dim)", lineHeight: 1.65, margin: 0,
                    maxWidth: "min(72ch, 100%)",
                    overflowWrap: "break-word", hyphens: "auto",
                  }}>{p.description}</p>
                )}

                {p?.features?.length > 0 && (
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "clamp(6px, 0.55vw, 10px)" }}>
                    {p.features.map((f, k) => (
                      <li key={k} style={{
                        fontFamily: "var(--v3-font-ui)", fontWeight: 300,
                        fontSize: "clamp(0.85rem, 0.35vw + 0.6rem, 1rem)",
                        color: "var(--v3-fg-dim)", lineHeight: 1.55,
                        paddingLeft: 18, position: "relative",
                        overflowWrap: "anywhere",
                      }}>
                        <span aria-hidden style={{
                          position: "absolute", left: 0, top: "0.7em",
                          width: 10, height: 1, background: "var(--v3-line-strong)",
                        }} />
                        {f}
                      </li>
                    ))}
                  </ul>
                )}

                {tags.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: "clamp(4px, 0.4vw, 8px)" }}>
                    {tags.map((t, k) => (
                      <V3Chip key={k}>{t}</V3Chip>
                    ))}
                  </div>
                )}

                {/* stat + open link footer */}
                {(stat || p?.github) && (
                  <div style={{
                    display: "flex", justifyContent: "space-between", alignItems: "flex-end",
                    gap: 12, flexWrap: "wrap",
                    marginTop: "auto", paddingTop: "clamp(8px, 0.8vw, 12px)",
                    borderTop: "1px solid var(--v3-line)",
                  }}>
                    {stat && (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 2 }}>
                        <span style={{
                          fontFamily: "var(--v3-font-display)", fontWeight: 340,
                          fontSize: "clamp(1rem, 0.6vw + 0.55rem, 1.35rem)", lineHeight: 1,
                          color: "var(--v3-fg)", fontOpticalSizing: "auto",
                        }}>{stat.value}</span>
                        <span style={{
                          fontFamily: "var(--v3-font-mono)", fontWeight: 400, fontSize: 9,
                          letterSpacing: ".18em", textTransform: "uppercase", color: "var(--v3-fg-mute)",
                        }}>{stat.label}</span>
                      </div>
                    )}
                    {p?.github && (
                      <a href={p.github} target="_blank" rel="noreferrer" style={{
                        fontFamily: "var(--v3-font-mono)", fontWeight: 400,
                        fontSize: "clamp(9px, 0.4vw + 6px, 11px)",
                        letterSpacing: ".14em", textTransform: "uppercase",
                        color: "var(--v3-accent)", textDecoration: "none",
                        pointerEvents: "auto", cursor: "pointer",
                        whiteSpace: "nowrap",
                      }}>Open →</a>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </V3Scan>
      </div>
    </V3Frame>
  );
}
