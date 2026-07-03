"use client";
/*
 * Testimonials (Neptune) — 3 pull-quotes on record.
 *
 * Correct planet per destinations config: destination 'hobbies' has label
 * 'Neptune' and section 'testimonials', so Neptune is what's framed (was
 * 'PLUTO' — that's the next stop, Contact).
 *
 * Narrow-first per v3 rule: LEFT area spans grid col 1 only, maxWidth
 * min(50vw, 820px). 3 pull-quotes stacked vertically with
 * justify-content: space-between so they fill the LEFT column instead of
 * clustering at the top.
 *
 * Quote layout:
 *   - Serif " glyph accent at top-left of each row (wider clamp slope so
 *     it scales dramatically across viewports).
 *   - Quote text (Manrope, 4-line clamp).
 *   - Attribution row: hairline tick + author (DM Serif Display) +
 *     role · company (mono kicker).
 *   - Endorsement chip cloud below.
 * Hairline divider between quotes.
 * Scan direction: horizontal wipe.
 *
 * Responsive strategy:
 *   - maxWidth: min(50vw, 820px) — proportional at narrow, capped at wide
 *     (2560) so rows never grow past a comfortable reading measure and
 *     never sneak under the corner Body Telemetry card (78-96% x).
 *   - Type: clamp() with rem floors so browser zoom scales legibly at
 *     75/125% and vw slopes drive proportional scaling at 1x.
 *   - Quote glyph: wide clamp slope so it scales more dramatically.
 *   - Row padding + gap fluid so density breathes with the viewport.
 *   - Chip cloud: flex-wrap + min-width 0 + fluid padding so chips relayout
 *     under compression instead of overflowing.
 *   - overflow-wrap: anywhere on quote body / author defeats long-token
 *     overflow at high zoom.
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
      gap: "clamp(12px, 1.2vw, 22px)",
      alignItems: "flex-start",
      padding: "clamp(14px, 1.5vw, 24px) 4px",
      borderTop: i > 0 ? "1px solid var(--v3-line)" : "none",
      minWidth: 0,
    }}>
      {/* Serif quote-mark accent, aligned to the top of the row.
          Wider clamp slope so the glyph scales dramatically from 75% zoom
          up to 2560, matching the row's fluid padding + type. */}
      <span aria-hidden style={{
        fontFamily: "var(--v3-font-display)", fontStyle: "italic",
        fontSize: "clamp(2rem, 1.8vw + 0.8rem, 4rem)", lineHeight: 0.7,
        color: "var(--v3-accent)", opacity: 0.75, flexShrink: 0,
        userSelect: "none",
      }}>&ldquo;</span>

      <div style={{ display: "flex", flexDirection: "column", gap: "clamp(6px, 0.7vw, 12px)", minWidth: 0 }}>
        <p style={{
          fontFamily: "var(--v3-font-ui)", fontWeight: 300,
          /* Rem-anchored floor keeps quote legible at 75% zoom; vw scales
             at 1x; ceiling holds proportion at 2560. */
          fontSize: "clamp(0.85rem, 0.6vw + 0.45rem, 1.15rem)",
          color: "var(--v3-fg)", lineHeight: 1.5, margin: 0,
          display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical",
          overflow: "hidden",
          overflowWrap: "anywhere",
        }}>{t.quote}</p>

        {/* Attribution: hairline tick + author + role · company */}
        <div style={{ display: "flex", alignItems: "baseline", gap: "clamp(6px, 0.7vw, 12px)", flexWrap: "wrap", minWidth: 0 }}>
          <span aria-hidden style={{
            width: "clamp(12px, 1vw, 18px)", height: 1,
            background: "var(--v3-accent)", flexShrink: 0,
          }} />
          <span style={{
            fontFamily: "var(--v3-font-display)", fontWeight: 340,
            fontSize: "clamp(0.92rem, 0.7vw + 0.4rem, 1.3rem)", lineHeight: 1.15,
            letterSpacing: "-.005em", color: "var(--v3-fg)", fontOpticalSizing: "auto",
            overflowWrap: "anywhere",
          }}>{t.name}</span>
          <span style={{
            fontFamily: "var(--v3-font-mono)", fontWeight: 400,
            fontSize: "clamp(9px, 0.4vw + 6px, 11px)",
            letterSpacing: ".18em", textTransform: "uppercase", color: "var(--v3-fg-mute)",
          }}>{[t.role, t.company].filter(Boolean).join(" · ")}</span>
        </div>

        {/* Endorsement chips — flex-wrap so tag cloud relayouts under
            compression instead of overflowing. */}
        {t.endorsements?.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "clamp(3px, 0.35vw, 6px)", minWidth: 0 }}>
            {t.endorsements.map((e, k) => (
              <span key={k} style={{
                fontFamily: "var(--v3-font-mono)", fontWeight: 400,
                fontSize: "clamp(9px, 0.4vw + 6px, 11px)",
                letterSpacing: ".06em", color: "var(--v3-fg-dim)",
                border: "1px solid var(--v3-line-strong)", borderRadius: 999,
                padding: "clamp(1px, 0.15vw, 2px) clamp(5px, 0.5vw, 10px)",
                whiteSpace: "nowrap",
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
      {/* maxWidth: min(50vw, 820px) — proportional at narrow, absolute cap
          on 2560 so rows never grow past a comfortable reading measure and
          never sneak under the corner Body Telemetry card (78-96% x). */}
      <div style={{
        gridArea: "left", display: "flex", flexDirection: "column",
        gap: "clamp(12px, 1.2vw, 18px)",
        minWidth: 0, overflow: "hidden",
        maxWidth: "min(50vw, 820px)", height: "100%",
      }}>
        {/* Header */}
        <V3Scan variant="horizontal" delay={0.05}>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
              <span style={{ width: 22, height: 1, background: "var(--v3-accent)" }} />
              <span style={{
                fontFamily: "var(--v3-font-mono)", fontWeight: 400,
                fontSize: "clamp(9px, 0.4vw + 6px, 11px)",
                letterSpacing: ".28em", textTransform: "uppercase", color: "var(--v3-fg-mute)",
              }}>{META.sub}</span>
            </div>
            <h2 style={{
              fontFamily: "var(--v3-font-display)", fontWeight: 340,
              /* Zoom-aware: rem floor keeps heading legible at high zoom,
                 vw scale keeps proportional to viewport at 1x. */
              fontSize: "clamp(1.6rem, 1.8vw + 0.6rem, 2.6rem)", fontOpticalSizing: "auto",
              lineHeight: 1, letterSpacing: "-.02em", color: "var(--v3-fg)",
              margin: 0,
              overflowWrap: "anywhere",
            }}>
              {META.heading}
            </h2>
          </div>
        </V3Scan>

        {/* Quotes stack — fills remaining vertical space via flex: 1 +
            justifyContent: space-between so the 3 pull-quotes spread evenly
            to consume empty space instead of clustering at the top. */}
        <div style={{
          display: "flex", flexDirection: "column",
          justifyContent: "space-between",
          border: "1px solid var(--v3-line)",
          borderRadius: 6,
          background: "color-mix(in oklab, var(--v3-bg-void) 50%, transparent)",
          padding: "4px clamp(12px, 1.2vw, 22px)",
          flex: 1, minHeight: 0, overflow: "hidden", minWidth: 0,
        }}>
          {list.map((t, i) => (
            <QuoteRow key={i} i={i} t={t} delay={0.15 + i * 0.08} />
          ))}
        </div>
      </div>
    </V3Frame>
  );
}
