"use client";
/*
 * Education (Saturn) — 4 degree records, progress-ring per row.
 *
 * Correct planet per destinations config: destination 'notes' has label
 * 'Saturn' and section 'education', so the planet visible during this
 * section is Saturn (was mislabeled URANUS in the old file).
 *
 * Narrow-first per v3 rule: LEFT area spans grid col 1 only, maxWidth min(50vw,780px)
 * so the column stays capped on wide monitors instead of ballooning. 4 rows
 * stacked, distributed with justify-content: space-between so they fill the
 * LEFT column height instead of clustering at the top.
 *
 * Responsive tuning (viewport 1280..2560 + zoom 75..125%):
 *   - SVG ring uses clamp() width/height with a fixed viewBox=64 → the ring
 *     geometry (r=26, strokeWidth=2, score text) scales linearly with the
 *     container instead of staying pinned at 64px. Bigger on 2560, smaller
 *     on 1280 / zoomed-in.
 *   - Type, gaps, and chip padding all use clamp() so nothing snaps between
 *     breakpoints.
 *   - overflow-wrap: anywhere on degree title + school prevents long
 *     institution names from forcing horizontal overflow at small widths.
 *
 * Row structure:
 *   - Left rail: SVG progress ring showing degree score % (fluid size).
 *   - Right column: mono kicker (level · year), DM Serif Display degree +
 *     school, hairline chip list of highlights.
 * Hairline divider between rows.
 * Scan direction: circuit (rows wire in progressively).
 */
import { educations, sectionMeta } from "../../../content";
import { V3Frame, V3Scan } from "../primitives";

const META = sectionMeta.education || {
  sub: "Formation",
  heading: "Academic Track",
};

/* Ring uses a fixed viewBox but fluid outer width/height, so every stroke,
   radius, and the % text scale together with the container. Font-size is
   set in SVG units (viewBox coordinates) so the browser scales it as the
   container grows — CSS font-size on <text> would NOT scale with the
   container. */
const Ring = ({ pct = 0 }) => {
  const r = 26;
  const c = 2 * Math.PI * r;
  const dash = c * (pct / 100);
  const size = "clamp(48px, 4vw + 30px, 80px)";
  return (
    <svg
      viewBox="0 0 64 64"
      aria-hidden
      style={{ display: "block", flexShrink: 0, width: size, height: size }}
    >
      <circle cx="32" cy="32" r={r} stroke="var(--v3-line)" strokeWidth="2" fill="none" />
      <circle
        cx="32" cy="32" r={r}
        stroke="var(--v3-accent)" strokeWidth="2" fill="none"
        strokeDasharray={`${dash} ${c - dash}`}
        strokeDashoffset={c / 4}
        strokeLinecap="round"
        style={{ transformOrigin: "center", transform: "rotate(-90deg)" }}
      />
      <text
        x="32" y="36" textAnchor="middle"
        fontSize="13"
        style={{
          fill: "var(--v3-fg)",
          fontFamily: "var(--v3-font-mono)",
          fontWeight: 400,
          letterSpacing: ".02em",
        }}
      >{Math.round(pct)}%</text>
    </svg>
  );
};

const Row = ({ i, edu, delay }) => (
  <V3Scan variant="circuit" delay={delay}>
    <div style={{
      display: "grid",
      gridTemplateColumns: "auto minmax(0, 1fr)",
      gap: "clamp(12px, 1.2vw, 22px)",
      alignItems: "flex-start",
      padding: "clamp(6px, 0.8vw, 12px) 4px",
      borderTop: i > 0 ? "1px solid var(--v3-line)" : "none",
      minWidth: 0,
    }}>
      <Ring pct={edu.percentage || 0} />
      <div style={{ display: "flex", flexDirection: "column", gap: "clamp(4px, 0.4vw, 8px)", minWidth: 0 }}>
        <div style={{
          fontFamily: "var(--v3-font-mono)", fontWeight: 400,
          fontSize: "clamp(9.5px, 0.45vw + 6px, 12px)",
          letterSpacing: ".22em", textTransform: "uppercase", color: "var(--v3-fg-mute)",
        }}>
          {edu.shortName || edu.level}{edu.year ? ` · ${edu.year}` : ""}
        </div>
        <h3 style={{
          fontFamily: "var(--v3-font-display)", fontWeight: 340,
          fontSize: "clamp(1rem, 0.8vw + 0.4rem, 1.4rem)", fontOpticalSizing: "auto",
          lineHeight: 1.15, letterSpacing: "-.005em",
          color: "var(--v3-fg)", margin: 0,
          overflowWrap: "anywhere",
        }}>
          {edu.degree}
        </h3>
        <div style={{
          fontFamily: "var(--v3-font-ui)", fontWeight: 300,
          fontSize: "clamp(0.8rem, 0.5vw + 0.4rem, .88rem)",
          color: "var(--v3-fg-dim)", lineHeight: 1.4,
          overflowWrap: "anywhere",
        }}>{edu.name}</div>
        {edu.highlights?.length > 0 && (
          <div style={{
            display: "flex", flexWrap: "wrap",
            gap: "clamp(3px, 0.3vw, 6px)",
            marginTop: "clamp(2px, 0.3vw, 6px)",
            minWidth: 0,
          }}>
            {edu.highlights.map((h, k) => (
              <span key={k} style={{
                fontFamily: "var(--v3-font-mono)", fontWeight: 400,
                fontSize: "clamp(9px, 0.35vw + 6px, 11px)",
                letterSpacing: ".06em", color: "var(--v3-fg-dim)",
                border: "1px solid var(--v3-line-strong)", borderRadius: 999,
                padding: "clamp(1px, 0.15vw, 2px) clamp(5px, 0.5vw, 10px)",
                whiteSpace: "nowrap",
              }}>{h}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  </V3Scan>
);

export default function EducationSection({ index, bootNonce }) {
  const list = educations || [];
  return (
    <V3Frame
      section="Education"
      planet="SATURN"
      index={index}
      scanDir="circuit"
      scanKey={bootNonce}
      /* Narrow-first: 'left' spans col 1 only, maxWidth min(50vw, 780px). 4
         degrees stack vertically with justify-content: space-between so they
         fill the LEFT column instead of clustering at the top. */
      gridAreas={`"top top top" "left . ." "left . ." "bottom bottom bottom"`}
    >
      <div style={{
        gridArea: "left", display: "flex", flexDirection: "column",
        gap: "clamp(10px, 1.2vw, 20px)",
        minWidth: 0, overflow: "auto",
        maxWidth: "min(50vw, 780px)", height: "100%",
      }}>
        {/* Header */}
        <V3Scan variant="horizontal" delay={0.05}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
              <span style={{ width: 22, height: 1, background: "var(--v3-accent)" }} />
              <span style={{
                fontFamily: "var(--v3-font-mono)", fontWeight: 400,
                fontSize: "clamp(9.5px, 0.45vw + 6px, 12px)",
                letterSpacing: ".28em", textTransform: "uppercase", color: "var(--v3-fg-mute)",
              }}>{META.sub}</span>
            </div>
            <h2 style={{
              fontFamily: "var(--v3-font-display)", fontWeight: 340,
              fontSize: "clamp(1.75rem, 1.4vw + 1rem, 2.8rem)", fontOpticalSizing: "auto",
              lineHeight: 1, letterSpacing: "-.02em", color: "var(--v3-fg)",
              margin: 0,
              overflowWrap: "anywhere",
            }}>
              {META.heading}
            </h2>
          </div>
        </V3Scan>

        {/* 4 degree rows */}
        <div style={{
          display: "flex", flexDirection: "column",
          justifyContent: "space-between",
          border: "1px solid var(--v3-line)",
          borderRadius: 6,
          background: "color-mix(in oklab, var(--v3-bg-void) 50%, transparent)",
          padding: "4px clamp(10px, 1.2vw, 22px)",
          flex: 1, minHeight: 0, overflow: "visible",
          minWidth: 0,
        }}>
          {list.slice(0, 4).map((edu, i) => (
            <Row key={i} i={i} edu={edu} delay={0.15 + i * 0.06} />
          ))}
        </div>
      </div>
    </V3Frame>
  );
}
