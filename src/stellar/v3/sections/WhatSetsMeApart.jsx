/*
 * What Sets Me Apart (Pluto) — massive-numeral master-detail.
 *
 * Adapts the taste-stack table's "sticky-pin pillar reveal" to the
 * no-scroll rule: the huge pinned pillar numeral still carries the
 * signature moment, but it lives inside a master-detail interaction
 * instead of a scroll pin.
 *
 * Layout:
 *   - LEFT (~32%): 5-item pillar list. Each row = mono numeral +
 *     DM Serif Display title (2-line clamp so long pillars don't
 *     inflate their button). Active row picks up an accent left
 *     border, tint background, brighter title.
 *   - RIGHT (~68%): active pillar spread.
 *     - MASSIVE Fraunces numeral (~clamp(6rem, 12vw, 12rem)) at
 *       top-left, tabular-nums, tight tracking. Crossfades + slight
 *       y-slide on pillar switch via AnimatePresence mode="wait".
 *     - Pillar title in Fraunces below the numeral.
 *     - Body copy in Satoshi as an editorial column with drop-cap
 *       first-letter.
 *     - Proof chips at the bottom.
 */
import { useState, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { V3Frame, V3Scan, V3SectionHeader, V3Chip, masterCardStyle, useMasterListKeys } from "../primitives";
import { EASE } from "../anim";
import { pillars as PILLARS } from "../../../content";

const META = {
  sub: "What Sets Me Apart",
  heading: "Signals a Résumé Can't Show",
};

const NUMERAL_VARIANTS = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
  exit:   { opacity: 0, y: -18, transition: { duration: 0.2 } },
};
const BODY_VARIANTS = {
  hidden: { opacity: 0, y: 10 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.35, ease: EASE, delay: 0.12 } },
  exit:   { opacity: 0, transition: { duration: 0.12 } },
};

export default function WhatSetsMeApartSection({ bootNonce }) {
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  const p = PILLARS[active] || PILLARS[0];

  const goto = useCallback((i) => {
    if (i < 0 || i >= PILLARS.length || i === active) return;
    setActive(i);
  }, [active]);
  const onKeys = useMasterListKeys(active, goto, PILLARS.length);

  return (
    <V3Frame
      section="What Sets Me Apart"
      planet="PLUTO"

      scanDir="drill"
      scanKey={bootNonce}
      gridAreas={`"top top top" "left left ." "left left ." "left left ."`}
    >
      <div
        style={{
          gridArea: "left", display: "flex", flexDirection: "column",
          gap: "clamp(12px, 1.2vw, 20px)",
          minWidth: 0, minHeight: 0, overflow: "hidden",
          maxWidth: "min(60vw, 1200px)", height: "100%",
        }}
        onKeyDown={onKeys}
      >
        {/* Header */}
        <V3SectionHeader sub={META.sub} heading={META.heading} />

        {/* Master-detail card */}
        <V3Scan variant="drill" delay={0.15} style={{ minWidth: 0, flex: 1, minHeight: 0, display: "flex" }}>
          <div
            role="tablist"
            aria-label="Differentiators"
            style={masterCardStyle({ cols: "minmax(240px, 32%) 1fr", gap: "clamp(18px, 1.8vw, 32px)", padding: "clamp(14px, 1.3vw, 22px) clamp(16px, 1.5vw, 26px)" })}
          >
            {/* Master */}
            <div style={{
              display: "flex", flexDirection: "column",
              justifyContent: "space-between", gap: "clamp(4px, 0.4vw, 8px)",
              minWidth: 0, alignSelf: "stretch", height: "100%",
            }}>
              {PILLARS.map((pillar, i) => {
                const isActive = i === active;
                return (
                  <button
                    key={i}
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => goto(i)}
                    style={{
                      all: "unset", cursor: "pointer",
                      display: "grid", gridTemplateColumns: "auto minmax(0, 1fr)",
                      alignItems: "baseline", gap: 10,
                      padding: "clamp(8px, 0.8vw, 12px) clamp(10px, 1vw, 14px)",
                      borderLeft: isActive ? "2px solid var(--v3-accent)" : "2px solid transparent",
                      background: isActive ? "color-mix(in oklab, var(--v3-accent) 10%, transparent)" : "transparent",
                      borderRadius: "0 4px 4px 0",
                      transition: "background .2s, border-color .2s",
                      minWidth: 0,
                    }}
                  >
                    <span aria-hidden style={{
                      fontFamily: "var(--v3-font-mono)", fontWeight: 400,
                      fontSize: "clamp(9px, 0.3vw + 6px, 11px)",
                      color: isActive ? "var(--v3-accent)" : "var(--v3-fg-mute)",
                      letterSpacing: ".14em",
                      fontVariantNumeric: "tabular-nums",
                    }}>{String(i + 1).padStart(2, "0")}</span>
                    <span style={{
                      fontFamily: "var(--v3-font-display)", fontWeight: 340,
                      fontSize: "clamp(0.88rem, 0.4vw + 0.55rem, 1.05rem)",
                      lineHeight: 1.2, letterSpacing: "-.005em",
                      color: isActive ? "var(--v3-fg)" : "var(--v3-fg-dim)",
                      fontOpticalSizing: "auto",
                      overflowWrap: "anywhere",
                      display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                    }}>{pillar.title}</span>
                  </button>
                );
              })}
            </div>

            {/* Detail — massive numeral + spread */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "auto minmax(0, 1fr)",
              columnGap: "clamp(20px, 2vw, 36px)",
              alignItems: "start",
              minWidth: 0, minHeight: 0,
              position: "relative",
            }}>
              {/* MASSIVE numeral — crossfades + slides on active change */}
              <div style={{
                display: "flex", alignItems: "flex-start", justifyContent: "flex-start",
                minWidth: 0, minHeight: 0,
                position: "relative",
                paddingTop: "clamp(4px, 0.4vw, 8px)",
              }}>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={`num-${active}`}
                    variants={NUMERAL_VARIANTS}
                    initial={reduce ? false : "hidden"}
                    animate="show"
                    exit="exit"
                    style={{
                      display: "block",
                      fontFamily: "var(--v3-font-display)", fontWeight: 340,
                      fontSize: "clamp(6rem, 12vw, 12rem)",
                      lineHeight: 0.85, letterSpacing: "-.04em",
                      color: "var(--v3-fg)", fontOpticalSizing: "auto",
                      fontVariantNumeric: "tabular-nums",
                      textShadow: "0 0 40px color-mix(in oklab, var(--v3-accent) 22%, transparent)",
                    }}
                  >{String(active + 1).padStart(2, "0")}</motion.span>
                </AnimatePresence>
              </div>

              {/* Body block — title + prose + proof chips */}
              <div style={{
                display: "flex", flexDirection: "column",
                gap: "clamp(10px, 1vw, 18px)",
                minWidth: 0, minHeight: 0,
              }}>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={`body-${active}`}
                    variants={BODY_VARIANTS}
                    initial={reduce ? false : "hidden"}
                    animate="show"
                    exit="exit"
                    style={{
                      display: "flex", flexDirection: "column",
                      gap: "clamp(10px, 1vw, 18px)",
                      minWidth: 0, minHeight: 0,
                    }}
                  >
                    {/* Kicker: "Differentiator N / 5" */}
                    <span style={{
                      fontFamily: "var(--v3-font-mono)", fontWeight: 400,
                      fontSize: "clamp(9px, 0.3vw + 6px, 11px)",
                      letterSpacing: ".24em", textTransform: "uppercase",
                      color: "var(--v3-fg-mute)",
                      fontVariantNumeric: "tabular-nums",
                    }}>Differentiator {String(active + 1).padStart(2, "0")} / {String(PILLARS.length).padStart(2, "0")}</span>

                    {/* Title */}
                    <h3 style={{
                      fontFamily: "var(--v3-font-display)", fontWeight: 340,
                      fontSize: "clamp(1.35rem, 1.1vw + 0.7rem, 2.1rem)",
                      lineHeight: 1.15, letterSpacing: "-.015em",
                      color: "var(--v3-fg)", margin: 0, fontOpticalSizing: "auto",
                      overflowWrap: "anywhere",
                    }}>{p.title}</h3>

                    {/* Body prose with drop-cap */}
                    <p className="v3-pillar-lede" style={{
                      fontFamily: "var(--v3-font-ui)", fontWeight: 300,
                      fontSize: "clamp(0.92rem, 0.4vw + 0.6rem, 1.05rem)",
                      color: "var(--v3-fg-dim)", lineHeight: 1.7, margin: 0,
                      maxWidth: "min(60ch, 100%)",
                      overflowWrap: "break-word", hyphens: "auto",
                    }}>{p.body}</p>
                    <style>{`
                      .v3-pillar-lede::first-letter {
                        font-family: var(--v3-font-display);
                        font-weight: 340;
                        font-size: 3em;
                        line-height: 0.85;
                        float: left;
                        padding: 0.06em 0.14em 0 0;
                        margin-right: 0.02em;
                        color: var(--v3-fg);
                        font-optical-sizing: auto;
                        letter-spacing: -0.02em;
                      }
                    `}</style>

                    {/* Proof chips */}
                    {(p.proof || []).length > 0 && (
                      <div style={{
                        display: "flex", flexDirection: "column",
                        gap: "clamp(6px, 0.6vw, 10px)",
                        marginTop: "auto",
                        paddingTop: "clamp(8px, 0.8vw, 14px)",
                        borderTop: "1px solid var(--v3-line)",
                        minWidth: 0,
                      }}>
                        <span style={{
                          fontFamily: "var(--v3-font-mono)", fontWeight: 400,
                          fontSize: "clamp(9px, 0.3vw + 6px, 11px)",
                          letterSpacing: ".22em", textTransform: "uppercase", color: "var(--v3-fg-mute)",
                        }}>Receipts</span>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, minWidth: 0 }}>
                          {(p.proof || []).map((pr, k) => (
                            <V3Chip key={k}>{pr}</V3Chip>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </V3Scan>
      </div>
    </V3Frame>
  );
}
