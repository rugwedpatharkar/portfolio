"use client";
/*
 * Achievements (Mars) — constellation timeline per the taste-stack table.
 *
 *   "Connecting line draws in as each node scrolls into view (pathLength
 *    motion); years engraved on a vertical rule; big-metric nodes render
 *    as circled numerals."
 *
 * Design principles (iteration 2 — after the "not looking good" note):
 *   - EVERY node is a same-size circled numeral. Metric titles render
 *     their metric (`96%`, `5`, `6+`, `3+`, `99.9%`); non-metric titles
 *     render the row index (`01`, `04`, `06`, …). No small orphan dots
 *     next to big circles.
 *   - Metric circles: filled accent tint, brighter foreground.
 *     Non-metric circles: outlined only. Subtle hierarchy without
 *     jarring size mismatch.
 *   - Rule: dim, thin — supports the constellation without dominating.
 *   - Rows pack tightly on a real gap, not `space-between` — no dead
 *     vertical voids. Timeline reads as a compact log, not a scattered
 *     dot grid.
 *   - Titles keep their original text (no metric stripping) so
 *     "5-Iteration AI Agent" stays intact.
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

const Marker = ({ value, isMetric, reduce, delay = 0 }) => (
  <motion.div
    initial={reduce ? false : { scale: 0.6, opacity: 0 }}
    whileInView={{ scale: 1, opacity: 1 }}
    viewport={{ once: true, amount: 0.3 }}
    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay }}
    style={{
      width: "clamp(34px, 3vw, 44px)", height: "clamp(34px, 3vw, 44px)",
      borderRadius: "50%",
      border: `1.5px solid ${isMetric ? "var(--v3-accent)" : "var(--v3-line-strong)"}`,
      background: isMetric
        ? "color-mix(in oklab, var(--v3-accent) 18%, var(--v3-bg-void))"
        : "var(--v3-bg-void)",
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: isMetric
        ? "0 0 14px color-mix(in oklab, var(--v3-accent) 28%, transparent)"
        : "none",
      flexShrink: 0,
    }}
  >
    <span style={{
      fontFamily: isMetric ? "var(--v3-font-display)" : "var(--v3-font-mono)",
      fontWeight: isMetric ? 340 : 400,
      fontSize: isMetric
        ? "clamp(0.75rem, 0.5vw + 0.4rem, 1rem)"
        : "clamp(0.62rem, 0.3vw + 0.4rem, 0.78rem)",
      lineHeight: 1, letterSpacing: isMetric ? "-.01em" : ".14em",
      color: isMetric ? "var(--v3-fg)" : "var(--v3-fg-mute)",
      fontOpticalSizing: "auto",
      fontVariantNumeric: "tabular-nums",
    }}>{value}</span>
  </motion.div>
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
            gridTemplateColumns: "minmax(44px, auto) auto minmax(0, 1fr)",
            columnGap: "clamp(14px, 1.5vw, 22px)",
            rowGap: "clamp(10px, 1.1vw, 18px)",
            alignContent: "start",
            padding: "clamp(4px, 0.5vw, 8px) 0",
            minWidth: 0, minHeight: 0,
          }}>
            {/* Constellation rule — SVG hairline down the marker column's
                center. `pathLength` animates 0 → 1 across ~1.6 s on view.
                Only spans from the FIRST marker's center to the LAST
                marker's center (not the whole grid height) so the rule
                doesn't dangle past the top or bottom of the timeline.
                Uses a fixed height % based on the row count — 100% at 0
                items, `((N-1) / N) * 100%` for the actual span. */}
            <svg aria-hidden viewBox="0 0 2 100" preserveAspectRatio="none"
              style={{
                position: "absolute",
                /* Top and bottom offsets center the rule between the first
                   and last marker rather than spanning the whole grid box. */
                top: "clamp(17px, 1.5vw, 22px)",
                bottom: "clamp(17px, 1.5vw, 22px)",
                left: "calc(clamp(44px, 5.5vw, 60px) + clamp(14px, 1.5vw, 22px) / 2)",
                width: 2,
                pointerEvents: "none",
                transform: "translateX(-1px)",
              }}>
              <motion.line
                x1="1" y1="0" x2="1" y2="100"
                stroke="var(--v3-line-strong)" strokeWidth="0.6"
                initial={reduce ? { pathLength: 1 } : { pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
              />
            </svg>

            {list.map((a, i) => {
              const metric = extractMetric(a.title);
              const nodeDelay = 0.35 + i * 0.07;
              const displayValue = metric || String(i + 1).padStart(2, "0");
              return (
                <div key={i} style={{ display: "contents" }}>
                  {/* Year rail */}
                  <div style={{
                    fontFamily: "var(--v3-font-mono)", fontWeight: 400,
                    fontSize: "clamp(9px, 0.3vw + 6px, 11px)",
                    letterSpacing: ".22em", color: "var(--v3-fg-mute)",
                    fontVariantNumeric: "tabular-nums",
                    display: "flex", alignItems: "center",
                    justifyContent: "flex-end", textAlign: "right",
                    minWidth: 0,
                  }}>{a.year || ""}</div>
                  {/* Marker */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1 }}>
                    <Marker value={displayValue} isMetric={!!metric} reduce={reduce} delay={nodeDelay} />
                  </div>
                  {/* Body */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0, alignSelf: "center", paddingRight: "clamp(8px, 1vw, 20px)" }}>
                    <span style={{
                      fontFamily: "var(--v3-font-display)", fontWeight: 340,
                      fontSize: "clamp(0.98rem, 0.5vw + 0.6rem, 1.25rem)",
                      lineHeight: 1.2, letterSpacing: "-.005em",
                      color: "var(--v3-fg)", fontOpticalSizing: "auto",
                      overflowWrap: "anywhere",
                    }}>{a.title}</span>
                    {a.description && (
                      <span style={{
                        fontFamily: "var(--v3-font-ui)", fontWeight: 300,
                        fontSize: "clamp(0.78rem, 0.3vw + 0.55rem, 0.9rem)",
                        color: "var(--v3-fg-dim)", lineHeight: 1.5,
                        maxWidth: "min(58ch, 100%)",
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
