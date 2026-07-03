"use client";
/*
 * Achievements (Mars) — constellation timeline per the taste-stack table.
 *
 *   "Connecting line draws in as each node scrolls into view (pathLength
 *    motion); years engraved on a vertical rule; big-metric nodes render
 *    as circled numerals."
 *
 * Layout:
 *   - Left rail: hairline vertical line (SVG). `pathLength` animates
 *     0 → 1 across ~1.6 s on section reveal — the "constellation line
 *     drawing in".
 *   - Along the rail: one node per achievement. If the title starts with
 *     a metric (`96%`, `5-Iteration`, `6+`, `3+`, `99.9%`), the node
 *     renders as a filled/circled numeral — Fraunces display, centered
 *     in an accent-outlined disc. Otherwise the node renders as a small
 *     accent dot with a subtle glow.
 *   - Left of each node: year "engraved" in mono, dim, tabular-nums.
 *   - Right of each node: title (DM Serif Display) + description
 *     (Satoshi) — no line clamp, prose is short per rule (a).
 *   - Whole timeline fits without scroll: 8 rows are distributed
 *     `space-between` inside a fixed-height column.
 */
import { motion, useReducedMotion } from "motion/react";
import { achievements, sectionMeta } from "../../../content";
import { V3Frame, V3Scan } from "../primitives";

const META = sectionMeta.achievements || {
  sub: "Milestones",
  heading: "Signals from the Wire",
};

/* Extract a metric prefix from an achievement title. Matches things
   like: "96%", "5", "6+", "3+", "99.9%", "31". Returns the extracted
   metric string (or null if the title doesn't start with a number). */
const METRIC_RE = /^(\d+(?:\.\d+)?%?\+?)/;
const extractMetric = (title = "") => {
  const m = String(title).match(METRIC_RE);
  return m ? m[1] : null;
};

const CircledNumeral = ({ value, active = true, reduce, delay = 0 }) => (
  <motion.div
    initial={reduce ? false : { scale: 0.6, opacity: 0 }}
    whileInView={{ scale: 1, opacity: 1 }}
    viewport={{ once: true, amount: 0.3 }}
    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay }}
    style={{
      width: "clamp(38px, 3.6vw, 54px)", height: "clamp(38px, 3.6vw, 54px)",
      borderRadius: "50%",
      border: "1.5px solid var(--v3-accent)",
      background: active ? "color-mix(in oklab, var(--v3-accent) 16%, var(--v3-bg-void))" : "var(--v3-bg-void)",
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: "0 0 16px color-mix(in oklab, var(--v3-accent) 32%, transparent)",
      flexShrink: 0,
    }}
  >
    <span style={{
      fontFamily: "var(--v3-font-display)", fontWeight: 340,
      fontSize: "clamp(0.85rem, 0.6vw + 0.4rem, 1.15rem)",
      lineHeight: 1, letterSpacing: "-.01em",
      color: "var(--v3-fg)", fontOpticalSizing: "auto",
      fontVariantNumeric: "tabular-nums",
    }}>{value}</span>
  </motion.div>
);

const Dot = ({ reduce, delay = 0 }) => (
  <motion.span aria-hidden
    initial={reduce ? false : { scale: 0.4, opacity: 0 }}
    whileInView={{ scale: 1, opacity: 1 }}
    viewport={{ once: true, amount: 0.3 }}
    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1], delay }}
    style={{
      width: 12, height: 12, borderRadius: "50%",
      background: "var(--v3-accent)",
      boxShadow: "0 0 10px var(--v3-accent)",
      flexShrink: 0,
    }}
  />
);

export default function AchievementsSection({ index, bootNonce }) {
  const list = achievements || [];
  const reduce = useReducedMotion();

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
        gap: "clamp(10px, 1vw, 18px)",
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

        {/* Timeline */}
        <V3Scan variant="circuit" delay={0.15} style={{ minWidth: 0, flex: 1, minHeight: 0, display: "flex" }}>
          <div style={{
            position: "relative",
            width: "100%", height: "100%",
            display: "grid",
            gridTemplateColumns: "minmax(48px, auto) auto minmax(0, 1fr)",
            columnGap: "clamp(14px, 1.5vw, 22px)",
            alignContent: "space-between",
            padding: "clamp(6px, 0.6vw, 10px) 0",
            minWidth: 0, minHeight: 0,
          }}>
            {/* Constellation rule — SVG hairline that spans the full timeline
                height. `pathLength` animates 0 → 1 so the line "draws in"
                as the section arrives. Positioned absolutely inside the
                grid; sits behind the nodes column, aligned to its center. */}
            <svg aria-hidden viewBox="0 0 2 100" preserveAspectRatio="none"
              style={{
                position: "absolute",
                top: 0, bottom: 0,
                left: "calc(clamp(48px, 6vw, 68px) + clamp(14px, 1.5vw, 22px) / 2)",
                width: 2, height: "100%",
                pointerEvents: "none",
                transform: "translateX(-1px)",
              }}>
              <motion.line
                x1="1" y1="0" x2="1" y2="100"
                stroke="var(--v3-accent)" strokeWidth="0.8" opacity="0.6"
                initial={reduce ? { pathLength: 1 } : { pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
              />
            </svg>

            {list.map((a, i) => {
              const metric = extractMetric(a.title);
              /* Title without the leading metric — reads cleaner next to
                 a circled numeral. E.g. "5-Iteration AI Agent" → "Iteration
                 AI Agent"; "96% API Latency Reduction" → "API Latency
                 Reduction". Keeps regular titles untouched. */
              const cleanTitle = metric
                ? a.title.replace(METRIC_RE, "").replace(/^[\s\-–—:·]+/, "").trim() || a.title
                : a.title;
              const nodeDelay = 0.35 + i * 0.08;

              return (
                <div key={i} style={{ display: "contents" }}>
                  {/* Year rail — engraved on the left */}
                  <div style={{
                    fontFamily: "var(--v3-font-mono)", fontWeight: 400,
                    fontSize: "clamp(9.5px, 0.35vw + 6px, 11.5px)",
                    letterSpacing: ".22em", color: "var(--v3-fg-mute)",
                    fontVariantNumeric: "tabular-nums",
                    display: "flex", alignItems: "center",
                    justifyContent: "flex-end", textAlign: "right",
                    minWidth: 0,
                  }}>{a.year || ""}</div>
                  {/* Node marker — circled numeral for metric titles, dot otherwise */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1 }}>
                    {metric
                      ? <CircledNumeral value={metric} reduce={reduce} delay={nodeDelay} />
                      : <Dot reduce={reduce} delay={nodeDelay} />}
                  </div>
                  {/* Body — title + description */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "clamp(2px, 0.25vw, 5px)", minWidth: 0, alignSelf: "center" }}>
                    <span style={{
                      fontFamily: "var(--v3-font-display)", fontWeight: 340,
                      fontSize: "clamp(0.95rem, 0.45vw + 0.6rem, 1.2rem)",
                      lineHeight: 1.2, letterSpacing: "-.005em",
                      color: "var(--v3-fg)", fontOpticalSizing: "auto",
                      overflowWrap: "anywhere",
                    }}>{cleanTitle}</span>
                    {a.description && (
                      <span style={{
                        fontFamily: "var(--v3-font-ui)", fontWeight: 300,
                        fontSize: "clamp(0.76rem, 0.25vw + 0.55rem, 0.88rem)",
                        color: "var(--v3-fg-dim)", lineHeight: 1.5,
                        overflowWrap: "break-word",
                      }}>{a.description}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </V3Scan>
      </div>
    </V3Frame>
  );
}
