"use client";
/*
 * Education (Saturn) — 4 degree records, progress-ring per row.
 *
 * Correct planet per destinations config: destination 'notes' has label
 * 'Saturn' and section 'education', so the planet visible during this
 * section is Saturn (was mislabeled URANUS in the old file).
 *
 * Narrow-first per v3 rule: LEFT area spans grid col 1 only, maxWidth 50vw.
 * 4 rows stacked, distributed with justify-content: space-between so they
 * fill the LEFT column height instead of clustering at the top.
 *
 * Row structure:
 *   - Left rail (~110px): SVG progress ring showing degree score %.
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

const Ring = ({ pct = 0 }) => {
  const r = 26;
  const c = 2 * Math.PI * r;
  const dash = c * (pct / 100);
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" aria-hidden style={{ display: "block", flexShrink: 0 }}>
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
        style={{
          fill: "var(--v3-fg)",
          font: "400 13px var(--v3-font-mono)",
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
      gridTemplateColumns: "auto 1fr",
      gap: 18, alignItems: "flex-start",
      padding: "14px 4px",
      borderTop: i > 0 ? "1px solid var(--v3-line)" : "none",
      minWidth: 0,
    }}>
      <Ring pct={edu.percentage || 0} />
      <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
        <div style={{
          fontFamily: "var(--v3-font-mono)", fontWeight: 400, fontSize: 10,
          letterSpacing: ".22em", textTransform: "uppercase", color: "var(--v3-fg-mute)",
        }}>
          {edu.shortName || edu.level}{edu.year ? ` · ${edu.year}` : ""}
        </div>
        <h3 style={{
          fontFamily: "var(--v3-font-display)", fontWeight: 340,
          fontSize: "clamp(1.05rem, 1.25vw, 1.3rem)", fontOpticalSizing: "auto",
          lineHeight: 1.15, letterSpacing: "-.005em",
          color: "var(--v3-fg)", margin: 0,
        }}>
          {edu.degree}
        </h3>
        <div style={{
          fontFamily: "var(--v3-font-ui)", fontWeight: 300,
          fontSize: "clamp(.82rem, 0.9vw, .9rem)",
          color: "var(--v3-fg-dim)", lineHeight: 1.4,
        }}>{edu.name}</div>
        {edu.highlights?.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 4 }}>
            {edu.highlights.map((h, k) => (
              <span key={k} style={{
                fontFamily: "var(--v3-font-mono)", fontWeight: 400, fontSize: 9.5,
                letterSpacing: ".06em", color: "var(--v3-fg-dim)",
                border: "1px solid var(--v3-line-strong)", borderRadius: 999,
                padding: "1px 8px", whiteSpace: "nowrap",
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
      /* Narrow-first: 'left' spans col 1 only, maxWidth 50vw. 4 degrees
         stack vertically with justify-content: space-between so they fill
         the LEFT column instead of clustering at the top. */
      gridAreas={`"top top top" "left . ." "left . ." "bottom bottom bottom"`}
    >
      <div style={{ gridArea: "left", display: "flex", flexDirection: "column", gap: 16, minWidth: 0, overflow: "hidden", maxWidth: "50vw", height: "100%" }}>
        {/* Header */}
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
              fontSize: "clamp(1.9rem, 3vw, 2.4rem)", fontOpticalSizing: "auto",
              lineHeight: 1, letterSpacing: "-.02em", color: "var(--v3-fg)",
              margin: 0,
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
          padding: "4px 18px",
          flex: 1, minHeight: 0, overflow: "hidden",
        }}>
          {list.slice(0, 4).map((edu, i) => (
            <Row key={i} i={i} edu={edu} delay={0.15 + i * 0.06} />
          ))}
        </div>
      </div>
    </V3Frame>
  );
}
