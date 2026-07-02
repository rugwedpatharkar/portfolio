"use client";
/*
 * Testimonials (Neptune) — 3 pull-quotes on record.
 *
 * Correct planet per destinations config: destination 'hobbies' has label
 * 'Neptune' and section 'testimonials', so Neptune is what's framed (was
 * 'PLUTO' — that's the next stop, Contact).
 *
 * Narrow-first per v3 rule: LEFT area spans grid col 1 only, maxWidth 50vw.
 * 3 pull-quotes stacked vertically with justify-content: space-between so
 * they fill the LEFT column instead of clustering at the top.
 *
 * Quote layout:
 *   - Serif " glyph accent at top-left of each row.
 *   - Quote text (Manrope, italic-hinted with quote marks).
 *   - Attribution row: author (DM Serif Display) + role · company (mono
 *     kicker with accent tick).
 *   - Endorsement chip cloud below.
 * Hairline divider between quotes.
 * Scan direction: horizontal wipe.
 */
import { testimonials, sectionMeta } from "../../../content";
import { V3Frame, V3Scan } from "../primitives";

const META = sectionMeta.testimonials || {
  sub: "Voices on Record",
  heading: "What Teams Say",
};

const QuoteRow = ({ i, t, delay }) => (
  <V3Scan variant="horizontal" delay={delay}>
    <div style={{
      display: "grid",
      gridTemplateColumns: "auto 1fr",
      gap: 18, alignItems: "flex-start",
      padding: "18px 4px",
      borderTop: i > 0 ? "1px solid var(--v3-line)" : "none",
      minWidth: 0,
    }}>
      {/* Serif quote-mark accent, aligned to the top of the row */}
      <span aria-hidden style={{
        fontFamily: "var(--v3-font-display)", fontStyle: "italic",
        fontSize: "clamp(2.4rem, 3vw, 3.2rem)", lineHeight: 0.7,
        color: "var(--v3-accent)", opacity: 0.75, flexShrink: 0,
        userSelect: "none",
      }}>&ldquo;</span>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, minWidth: 0 }}>
        <p style={{
          fontFamily: "var(--v3-font-ui)", fontWeight: 300,
          fontSize: "clamp(.88rem, 0.98vw, 1.02rem)",
          color: "var(--v3-fg)", lineHeight: 1.5, margin: 0,
          display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}>{t.quote}</p>

        {/* Attribution: author + role · company */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
          <span aria-hidden style={{ width: 14, height: 1, background: "var(--v3-accent)" }} />
          <span style={{
            fontFamily: "var(--v3-font-display)", fontWeight: 340,
            fontSize: "clamp(.95rem, 1.1vw, 1.15rem)", lineHeight: 1.15,
            letterSpacing: "-.005em", color: "var(--v3-fg)", fontOpticalSizing: "auto",
          }}>{t.name}</span>
          <span style={{
            fontFamily: "var(--v3-font-mono)", fontWeight: 400, fontSize: 10,
            letterSpacing: ".18em", textTransform: "uppercase", color: "var(--v3-fg-mute)",
          }}>{[t.role, t.company].filter(Boolean).join(" · ")}</span>
        </div>

        {/* Endorsement chips */}
        {t.endorsements?.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {t.endorsements.map((e, k) => (
              <span key={k} style={{
                fontFamily: "var(--v3-font-mono)", fontWeight: 400, fontSize: 9.5,
                letterSpacing: ".06em", color: "var(--v3-fg-dim)",
                border: "1px solid var(--v3-line-strong)", borderRadius: 999,
                padding: "1px 8px", whiteSpace: "nowrap",
              }}>{e}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  </V3Scan>
);

export default function TestimonialsSection({ index, bootNonce }) {
  const list = (testimonials || []).slice(0, 3);
  return (
    <V3Frame
      section="Testimonials"
      planet="NEPTUNE"
      index={index}
      scanDir="horizontal"
      scanKey={bootNonce}
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

        {/* Quotes stack */}
        <div style={{
          display: "flex", flexDirection: "column",
          justifyContent: "space-between",
          border: "1px solid var(--v3-line)",
          borderRadius: 6,
          background: "color-mix(in oklab, var(--v3-bg-void) 50%, transparent)",
          padding: "4px 18px",
          flex: 1, minHeight: 0, overflow: "hidden",
        }}>
          {list.map((t, i) => (
            <QuoteRow key={i} i={i} t={t} delay={0.15 + i * 0.08} />
          ))}
        </div>
      </div>
    </V3Frame>
  );
}
