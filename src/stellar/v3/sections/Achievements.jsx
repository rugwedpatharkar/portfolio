"use client";
/*
 * Achievements (Mars) — cinematic-metric hero list.
 *
 * User picked "cinematic-metric" over the constellation timeline. The
 * numbers do the talking:
 *   - Each row leads with a massive Fraunces metric (or the icon emoji
 *     if the title has no leading number).
 *   - Body: DM Serif Display title + Satoshi description.
 *   - Year sits in the top-right corner of each row in mono, tabular-nums.
 *   - Hairline separator between rows for editorial rhythm.
 *   - Signature moment: on section reveal, numeric metrics tick up via
 *     V3Ticker; icon rows scale in from 0.6. Row-by-row stagger.
 */
import { useMemo } from "react";
import { motion, useReducedMotion } from "motion/react";
import { achievements, sectionMeta } from "../../../content";
import { V3Frame, V3Scan, V3Ticker } from "../primitives";

const META = sectionMeta.achievements || {
  sub: "Milestones",
  heading: "Signals from the Wire",
};

/* Parse a metric prefix off an achievement title.
   - "96% API Latency Reduction" → { value: 96, suffix: "%", rest: "API Latency Reduction" }
   - "5-Iteration AI Agent"      → { value: 5,  suffix: "",  rest: "Iteration AI Agent" }
   - "6+ Enterprise Integrations"→ { value: 6,  suffix: "+", rest: "Enterprise Integrations" }
   - "99.9% Availability"        → { value: 99.9, suffix: "%", rest: "Availability" }
   - "Star Performer …"          → null
   Rest is what's shown as the title next to the huge metric. */
const METRIC_RE = /^(\d+(?:\.\d+)?)([%+]?)[\s\-–—:·]*(.*)$/;
const parseMetric = (title = "") => {
  const m = String(title).match(METRIC_RE);
  if (!m) return null;
  const value = Number(m[1]);
  const suffix = m[2] || "";
  const rest = (m[3] || "").trim();
  return { value, suffix, rest: rest || String(title) };
};

export default function AchievementsSection({ index, bootNonce }) {
  const list = achievements || [];
  const reduce = useReducedMotion();

  /* Precompute the parsed rows so the render stays clean. */
  const rows = useMemo(() =>
    list.map((a, i) => {
      const metric = parseMetric(a.title);
      return {
        i,
        metric,
        icon: a.icon,
        title: metric?.rest || a.title,
        description: a.description,
        year: a.year,
        raw: a,
      };
    }), [list]);

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

        {/* Row list */}
        <V3Scan variant="circuit" delay={0.15} style={{ minWidth: 0, flex: 1, minHeight: 0, display: "flex" }}>
          <div style={{
            width: "100%", height: "100%",
            display: "flex", flexDirection: "column",
            borderTop: "1px solid var(--v3-line)",
            minWidth: 0, minHeight: 0,
          }}>
            {rows.map(({ i, metric, icon, title, description, year }) => {
              const delay = 0.25 + i * 0.08;
              return (
                <motion.div
                  key={i}
                  initial={reduce ? false : { opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay }}
                  style={{
                    position: "relative",
                    display: "grid",
                    gridTemplateColumns: "clamp(90px, 9vw, 140px) minmax(0, 1fr) auto",
                    columnGap: "clamp(14px, 1.6vw, 26px)",
                    alignItems: "start",
                    padding: "clamp(10px, 1.1vw, 20px) 0",
                    borderBottom: "1px solid var(--v3-line)",
                    flex: 1, minHeight: 0,
                  }}
                >
                  {/* Metric column — huge Fraunces number, or scale-in emoji */}
                  <div style={{
                    display: "flex", alignItems: "baseline", justifyContent: "flex-start",
                    minWidth: 0,
                  }}>
                    {metric ? (
                      <span style={{
                        fontFamily: "var(--v3-font-display)", fontWeight: 340,
                        fontSize: "clamp(2.4rem, 2.4vw + 1rem, 4rem)",
                        lineHeight: 0.95, letterSpacing: "-.03em",
                        color: "var(--v3-fg)", fontOpticalSizing: "auto",
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
                      <motion.span aria-hidden
                        initial={reduce ? false : { scale: 0.55, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: delay + 0.05 }}
                        style={{
                          fontSize: "clamp(2rem, 2vw + 0.8rem, 3rem)",
                          lineHeight: 1,
                          display: "inline-block", transformOrigin: "left center",
                        }}>{icon}</motion.span>
                    )}
                  </div>

                  {/* Body — title + description */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "clamp(4px, 0.4vw, 8px)", minWidth: 0, paddingTop: "clamp(4px, 0.5vw, 10px)" }}>
                    <h3 style={{
                      fontFamily: "var(--v3-font-display)", fontWeight: 340,
                      fontSize: "clamp(1.05rem, 0.55vw + 0.65rem, 1.4rem)",
                      lineHeight: 1.2, letterSpacing: "-.005em",
                      color: "var(--v3-fg)", margin: 0, fontOpticalSizing: "auto",
                      overflowWrap: "anywhere",
                    }}>{title}</h3>
                    {description && (
                      <p style={{
                        fontFamily: "var(--v3-font-ui)", fontWeight: 300,
                        fontSize: "clamp(0.78rem, 0.3vw + 0.55rem, 0.9rem)",
                        color: "var(--v3-fg-dim)", lineHeight: 1.55, margin: 0,
                        maxWidth: "min(60ch, 100%)",
                        overflowWrap: "break-word",
                      }}>{description}</p>
                    )}
                  </div>

                  {/* Year column — mono kicker, top-right */}
                  <div style={{
                    fontFamily: "var(--v3-font-mono)", fontWeight: 400,
                    fontSize: "clamp(9px, 0.3vw + 7px, 11px)",
                    letterSpacing: ".26em", textTransform: "uppercase",
                    color: "var(--v3-fg-mute)",
                    fontVariantNumeric: "tabular-nums",
                    paddingTop: "clamp(4px, 0.5vw, 10px)",
                    whiteSpace: "nowrap",
                  }}>{year ? `Logged ${year}` : ""}</div>
                </motion.div>
              );
            })}
          </div>
        </V3Scan>
      </div>
    </V3Frame>
  );
}
