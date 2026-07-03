"use client";
/*
 * Achievements (Mars) — Hero + rundown (design experiment #1).
 *
 * The "cinematic-metric" and "constellation timeline" iterations both
 * read as flat lists. This layout gives one flagship achievement (Star
 * Performer of the Quarter — the most prestigious "award" type) the
 * full editorial hero treatment, then compresses the remaining 7 into
 * a compact chip grid rundown.
 *
 * Structure:
 *   - Header (kicker + h2)
 *   - Hero block: big Fraunces title + accent badge pill + prose
 *   - Chip grid: 7 remaining achievements as compact tiles
 *     (metric-or-icon glyph + 1-line title + mono year kicker).
 *
 * Signature moment: hero title uses a shutter clip-path reveal on
 * arrival (same tech as the Projects carousel), then chip grid
 * cascades in row-by-row (60 ms per chip).
 */
import { useMemo } from "react";
import { motion, useReducedMotion } from "motion/react";
import { achievements, sectionMeta } from "../../../content";
import { V3Frame, V3Scan, V3Ticker } from "../primitives";

const META = sectionMeta.achievements || {
  sub: "Milestones",
  heading: "Signals from the Wire",
};

const METRIC_RE = /^(\d+(?:\.\d+)?)([%+]?)[\s\-–—:·]*(.*)$/;
const parseMetric = (title = "") => {
  const m = String(title).match(METRIC_RE);
  if (!m) return null;
  return {
    value: Number(m[1]),
    suffix: m[2] || "",
    rest: (m[3] || "").trim() || String(title),
  };
};

/* Pick the flagship. Prefer explicit match by title, fall back to
   the first achievement if the data changes. */
const FLAGSHIP_TITLE_RE = /star performer/i;
const pickFlagship = (list) => {
  const idx = list.findIndex((a) => FLAGSHIP_TITLE_RE.test(a.title || ""));
  return idx >= 0 ? idx : 0;
};

/* Shutter reveal on the flagship title. Vertical inset is negative so
   descenders don't get shaved by the clip-path. Same technique as
   Projects. */
const SHUTTER_VARIANTS = {
  hidden: { clipPath: "inset(-0.2em 100% -0.3em 0)" },
  show:   { clipPath: "inset(-0.2em 0 -0.3em 0)", transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.15 } },
};

export default function AchievementsSection({ index, bootNonce }) {
  const list = achievements || [];
  const reduce = useReducedMotion();

  const { hero, others } = useMemo(() => {
    if (!list.length) return { hero: null, others: [] };
    const idx = pickFlagship(list);
    const hero = list[idx];
    const others = list.filter((_, i) => i !== idx);
    return { hero, others };
  }, [list]);

  const heroMetric = hero ? parseMetric(hero.title) : null;
  const heroTitle = heroMetric?.rest || hero?.title || "";

  return (
    <V3Frame
      section="Achievements"
      planet="MARS"
      index={index}
      scanDir="circuit"
      scanKey={bootNonce}
      gridAreas={`"top top top" "left left ." "left left ." "left left ."`}
    >
      <div style={{
        gridArea: "left", display: "flex", flexDirection: "column",
        gap: "clamp(14px, 1.4vw, 22px)",
        minWidth: 0, minHeight: 0, overflow: "hidden",
        maxWidth: "min(60vw, 1200px)",
        height: "100%",
      }}>
        {/* Header */}
        <V3Scan variant="horizontal" delay={0.05}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <span style={{ width: 22, height: 1, background: "var(--v3-accent)" }} />
              <span style={{
                fontFamily: "var(--v3-font-mono)", fontWeight: 400, fontSize: 10,
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
        </V3Scan>

        {/* Hero flagship */}
        {hero && (
          <V3Scan variant="horizontal" delay={0.15} style={{ minWidth: 0 }}>
            <div style={{
              display: "grid",
              gridTemplateColumns: "auto minmax(0, 1fr)",
              columnGap: "clamp(18px, 2vw, 32px)",
              alignItems: "start",
              padding: "clamp(16px, 1.6vw, 26px) clamp(18px, 1.8vw, 28px)",
              border: "1px solid var(--v3-accent)",
              borderRadius: 8,
              background: "color-mix(in oklab, var(--v3-accent) 8%, transparent)",
              boxShadow: "0 0 32px color-mix(in oklab, var(--v3-accent) 18%, transparent)",
              minWidth: 0,
            }}>
              {/* Emblem — big icon glyph, accent-tinted */}
              <div style={{
                fontSize: "clamp(2.4rem, 2.4vw + 1rem, 3.8rem)",
                lineHeight: 1,
                filter: "drop-shadow(0 0 12px color-mix(in oklab, var(--v3-accent) 42%, transparent))",
                flexShrink: 0,
              }}>{hero.icon || "★"}</div>

              {/* Body */}
              <div style={{ display: "flex", flexDirection: "column", gap: "clamp(6px, 0.8vw, 14px)", minWidth: 0 }}>
                {/* Badge pill + year */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    padding: "clamp(4px, 0.4vw, 6px) clamp(10px, 0.9vw, 14px)",
                    border: "1px solid var(--v3-accent)",
                    borderRadius: 999,
                    background: "color-mix(in oklab, var(--v3-accent) 14%, transparent)",
                    fontFamily: "var(--v3-font-mono)", fontWeight: 400,
                    fontSize: "clamp(9px, 0.3vw + 7px, 11px)",
                    letterSpacing: ".22em", textTransform: "uppercase",
                    color: "var(--v3-fg)",
                  }}>
                    <span aria-hidden style={{
                      width: 6, height: 6, borderRadius: "50%",
                      background: "var(--v3-accent)",
                      boxShadow: "0 0 8px var(--v3-accent)",
                    }} />
                    Featured milestone
                  </span>
                  {hero.year && (
                    <span style={{
                      fontFamily: "var(--v3-font-mono)", fontWeight: 400,
                      fontSize: "clamp(9px, 0.3vw + 7px, 11px)",
                      letterSpacing: ".26em", textTransform: "uppercase",
                      color: "var(--v3-fg-mute)",
                      fontVariantNumeric: "tabular-nums",
                    }}>Logged {hero.year}</span>
                  )}
                </div>

                {/* Shutter-revealed title */}
                <motion.h3
                  variants={reduce ? undefined : SHUTTER_VARIANTS}
                  initial={reduce ? false : "hidden"}
                  animate="show"
                  style={{
                    fontFamily: "var(--v3-font-display)", fontWeight: 340,
                    fontSize: "clamp(1.5rem, 1.2vw + 0.9rem, 2.6rem)",
                    lineHeight: 1.15, letterSpacing: "-.015em",
                    color: "var(--v3-fg)", margin: 0, fontOpticalSizing: "auto",
                    overflowWrap: "anywhere",
                    paddingBottom: "0.05em",
                  }}>{heroTitle}</motion.h3>

                {hero.description && (
                  <p style={{
                    fontFamily: "var(--v3-font-ui)", fontWeight: 300,
                    fontSize: "clamp(0.88rem, 0.35vw + 0.6rem, 1.02rem)",
                    color: "var(--v3-fg-dim)", lineHeight: 1.6, margin: 0,
                    maxWidth: "min(64ch, 100%)",
                    overflowWrap: "break-word",
                  }}>{hero.description}</p>
                )}
              </div>
            </div>
          </V3Scan>
        )}

        {/* Rundown chip grid */}
        {others.length > 0 && (
          <V3Scan variant="circuit" delay={0.28} style={{ minWidth: 0, flex: 1, minHeight: 0, display: "flex" }}>
            <div style={{
              width: "100%", height: "100%",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(clamp(180px, 18vw, 240px), 1fr))",
              gap: "clamp(10px, 1vw, 16px)",
              alignContent: "start",
              minWidth: 0, minHeight: 0,
            }}>
              {others.map((a, i) => {
                const metric = parseMetric(a.title);
                const title = metric?.rest || a.title;
                const delay = 0.35 + i * 0.06;
                return (
                  <motion.div
                    key={i}
                    initial={reduce ? false : { opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay }}
                    style={{
                      display: "flex", flexDirection: "column",
                      gap: "clamp(4px, 0.4vw, 8px)",
                      padding: "clamp(10px, 1vw, 16px) clamp(12px, 1.1vw, 18px)",
                      border: "1px solid var(--v3-line)",
                      borderRadius: 6,
                      background: "color-mix(in oklab, var(--v3-bg-void) 40%, transparent)",
                      minWidth: 0,
                    }}
                  >
                    {/* Row 1: metric or icon + year */}
                    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
                      {metric ? (
                        <span style={{
                          fontFamily: "var(--v3-font-display)", fontWeight: 340,
                          fontSize: "clamp(1.5rem, 1vw + 0.7rem, 2rem)",
                          lineHeight: 1, letterSpacing: "-.02em",
                          color: "var(--v3-fg)", fontOpticalSizing: "auto",
                          fontVariantNumeric: "tabular-nums",
                        }}>
                          <V3Ticker
                            value={metric.value}
                            suffix={metric.suffix}
                            decimals={Number.isInteger(metric.value) ? 0 : 1}
                          />
                        </span>
                      ) : (
                        <span aria-hidden style={{
                          fontSize: "clamp(1.3rem, 0.9vw + 0.6rem, 1.7rem)",
                          lineHeight: 1,
                        }}>{a.icon}</span>
                      )}
                      {a.year && (
                        <span style={{
                          fontFamily: "var(--v3-font-mono)", fontWeight: 400,
                          fontSize: "clamp(8.5px, 0.25vw + 6px, 10px)",
                          letterSpacing: ".22em", color: "var(--v3-fg-mute)",
                          fontVariantNumeric: "tabular-nums",
                          whiteSpace: "nowrap",
                        }}>{a.year}</span>
                      )}
                    </div>
                    {/* Row 2: title */}
                    <span style={{
                      fontFamily: "var(--v3-font-display)", fontWeight: 340,
                      fontSize: "clamp(0.88rem, 0.35vw + 0.55rem, 1.02rem)",
                      lineHeight: 1.2, letterSpacing: "-.005em",
                      color: "var(--v3-fg)", fontOpticalSizing: "auto",
                      overflowWrap: "anywhere",
                    }}>{title}</span>
                  </motion.div>
                );
              })}
            </div>
          </V3Scan>
        )}
      </div>
    </V3Frame>
  );
}
