"use client";
/*
 * Achievements (Mars) — Two-chapter awards (design experiment #2).
 *
 * Group by year, treat each year as a chapter with a massive Fraunces
 * heading. Reads like an awards-ceremony program: "The following
 * milestones were logged in 2024… …in 2023…"
 *
 * Structure:
 *   - Section header (kicker + h2).
 *   - Per year, DESC:
 *       - Chapter head: HUGE Fraunces year (clamp ~4-7rem) + mono
 *         "N MILESTONES" sub-count.
 *       - Row list: each achievement is a single grid row —
 *         [metric or icon] · [title in DM Serif] · [description in
 *         Satoshi]. Hairline separator between rows.
 *
 * Signature moment: each year heading has its own shutter clip-path
 * reveal on view; the rows beneath cascade in with a 60 ms per-row
 * stagger.
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

/* Shutter reveal on the massive year headings. Negative vertical
   inset so descenders in "2023" (none, but "2024" apex → belt and
   suspenders) never get shaved. */
const SHUTTER_VARIANTS = {
  hidden: { clipPath: "inset(-0.2em 100% -0.3em 0)" },
  show:   { clipPath: "inset(-0.2em 0 -0.3em 0)", transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.1 } },
};

export default function AchievementsSection({ index, bootNonce }) {
  const list = achievements || [];
  const reduce = useReducedMotion();

  /* Group by year, DESC. Preserve inter-year order from the source data
     so the recruiter reads the most recent chapter first. Nullish years
     get bucketed into "—" and appear last. */
  const chapters = useMemo(() => {
    const grouped = new Map();
    list.forEach((a) => {
      const key = a.year ?? "—";
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key).push(a);
    });
    return [...grouped.entries()].sort((a, b) => {
      if (a[0] === "—") return 1;
      if (b[0] === "—") return -1;
      return Number(b[0]) - Number(a[0]);
    });
  }, [list]);

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
        gap: "clamp(14px, 1.4vw, 24px)",
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

        {/* Chapters */}
        <div style={{
          flex: 1, minHeight: 0, minWidth: 0,
          display: "flex", flexDirection: "column",
          gap: "clamp(18px, 1.8vw, 32px)",
        }}>
          {chapters.map(([year, items], chapterIdx) => {
            const chapterDelay = 0.2 + chapterIdx * 0.15;
            return (
              <V3Scan
                key={year}
                variant="horizontal"
                delay={chapterDelay}
                style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: "clamp(10px, 1vw, 18px)" }}
              >
                {/* Chapter head — massive year + mono count */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "auto minmax(0, 1fr)",
                  columnGap: "clamp(16px, 1.8vw, 30px)",
                  alignItems: "baseline",
                  borderBottom: "1px solid var(--v3-line-strong)",
                  paddingBottom: "clamp(6px, 0.7vw, 12px)",
                  minWidth: 0,
                }}>
                  <motion.h3
                    variants={reduce ? undefined : SHUTTER_VARIANTS}
                    initial={reduce ? false : "hidden"}
                    animate="show"
                    style={{
                      fontFamily: "var(--v3-font-display)", fontWeight: 340,
                      fontSize: "clamp(3rem, 4vw + 1.5rem, 6rem)",
                      lineHeight: 0.9, letterSpacing: "-.03em",
                      color: "var(--v3-fg)", margin: 0, fontOpticalSizing: "auto",
                      fontVariantNumeric: "tabular-nums",
                      paddingBottom: "0.05em",
                    }}>{year}</motion.h3>
                  <div style={{
                    display: "flex", flexDirection: "column",
                    alignItems: "flex-end", justifyContent: "flex-end",
                    gap: 4, minWidth: 0,
                    paddingBottom: "clamp(6px, 0.7vw, 12px)",
                  }}>
                    <span style={{
                      fontFamily: "var(--v3-font-mono)", fontWeight: 400,
                      fontSize: "clamp(9.5px, 0.3vw + 7px, 11.5px)",
                      letterSpacing: ".28em", textTransform: "uppercase",
                      color: "var(--v3-fg-mute)",
                      fontVariantNumeric: "tabular-nums",
                    }}>{String(items.length).padStart(2, "0")} Milestones</span>
                  </div>
                </div>

                {/* Rows for this year */}
                <div style={{
                  display: "flex", flexDirection: "column",
                  minWidth: 0,
                }}>
                  {items.map((a, i) => {
                    const metric = parseMetric(a.title);
                    const title = metric?.rest || a.title;
                    const rowDelay = chapterDelay + 0.15 + i * 0.06;
                    return (
                      <motion.div
                        key={i}
                        initial={reduce ? false : { opacity: 0, x: -12 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: rowDelay }}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "clamp(58px, 6vw, 88px) minmax(0, auto) minmax(0, 1fr)",
                          columnGap: "clamp(12px, 1.3vw, 20px)",
                          alignItems: "baseline",
                          padding: "clamp(8px, 0.8vw, 14px) 0",
                          borderBottom: i < items.length - 1 ? "1px solid var(--v3-line)" : "none",
                          minWidth: 0,
                        }}
                      >
                        {/* Metric or icon */}
                        <div style={{
                          display: "flex", alignItems: "baseline", justifyContent: "flex-start",
                          minWidth: 0,
                        }}>
                          {metric ? (
                            <span style={{
                              fontFamily: "var(--v3-font-display)", fontWeight: 340,
                              fontSize: "clamp(1.4rem, 1vw + 0.7rem, 2.1rem)",
                              lineHeight: 1, letterSpacing: "-.02em",
                              color: "var(--v3-accent)", fontOpticalSizing: "auto",
                              fontVariantNumeric: "tabular-nums",
                              display: "inline-flex", alignItems: "baseline",
                            }}>
                              <V3Ticker
                                value={metric.value}
                                suffix={metric.suffix}
                                decimals={Number.isInteger(metric.value) ? 0 : 1}
                              />
                            </span>
                          ) : (
                            <span aria-hidden style={{
                              fontSize: "clamp(1.2rem, 0.8vw + 0.6rem, 1.6rem)",
                              lineHeight: 1,
                            }}>{a.icon}</span>
                          )}
                        </div>

                        {/* Title */}
                        <span style={{
                          fontFamily: "var(--v3-font-display)", fontWeight: 340,
                          fontSize: "clamp(0.95rem, 0.4vw + 0.6rem, 1.15rem)",
                          lineHeight: 1.2, letterSpacing: "-.005em",
                          color: "var(--v3-fg)", fontOpticalSizing: "auto",
                          overflowWrap: "anywhere",
                          alignSelf: "center",
                          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                        }}>{title}</span>

                        {/* Description */}
                        <span style={{
                          fontFamily: "var(--v3-font-ui)", fontWeight: 300,
                          fontSize: "clamp(0.78rem, 0.28vw + 0.55rem, 0.9rem)",
                          color: "var(--v3-fg-dim)", lineHeight: 1.5,
                          overflowWrap: "break-word",
                          alignSelf: "center",
                        }}>{a.description}</span>
                      </motion.div>
                    );
                  })}
                </div>
              </V3Scan>
            );
          })}
        </div>
      </div>
    </V3Frame>
  );
}
