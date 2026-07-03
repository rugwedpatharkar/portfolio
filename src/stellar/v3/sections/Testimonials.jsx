"use client";
/*
 * Testimonials (Neptune) — dual auto-marquee per the taste-stack table.
 *
 *   "Two rows scrolling opposite directions, cards are portrait-oriented
 *    like collectible cards, hover pauses BOTH rows; huge pull-quote
 *    glyphs on each card."
 *
 * Layout:
 *   - Header (kicker + h2).
 *   - Row A: cards scroll LEFT via CSS keyframes (translateX 0 → -50%).
 *   - Row B: cards scroll RIGHT via CSS keyframes (translateX -50% → 0).
 *   - Content in each row is duplicated 2× so the loop is seamless — the
 *     second copy takes over at the moment the first exits.
 *   - Row order in B is reversed so the two rows never move in visual
 *     lockstep even though they share the same 3 quotes.
 *
 * Interaction:
 *   - Hovering ANY row pauses BOTH rows via a shared CSS variable
 *     (`--v3-marquee-state`) set to `paused` on the section container.
 *   - Reduced motion → animation permanently paused, all cards static.
 *
 * Cards (portrait, collectible-card ratio ~3:4):
 *   - Huge Instrument Serif italic ❝ glyph accent, top-left, offset up
 *     into the corner.
 *   - Quote body (Satoshi, 3-line clamp).
 *   - Star rating dots + period kicker.
 *   - Attribution: name (DM Serif Display) + role · company (mono).
 *   - Endorsement chip cloud.
 */
import { useMemo } from "react";
import { useReducedMotion } from "motion/react";
import { testimonials, sectionMeta } from "../../../content";
import { V3Frame, V3Scan } from "../primitives";

const META = sectionMeta.testimonials || {
  sub: "What Others Say",
  heading: "Testimonials",
};

const TestimonialCard = ({ t }) => (
  <article style={{
    flexShrink: 0,
    display: "flex", flexDirection: "column",
    justifyContent: "space-between",
    gap: "clamp(10px, 1vw, 16px)",
    /* Portrait — width narrower than height. clamp keeps it responsive. */
    width: "clamp(240px, 22vw, 320px)",
    height: "100%",
    padding: "clamp(18px, 1.6vw, 28px) clamp(16px, 1.5vw, 24px)",
    border: "1px solid var(--v3-line)",
    borderRadius: 8,
    background: "color-mix(in oklab, var(--v3-bg-void) 60%, transparent)",
    position: "relative",
    overflow: "hidden",
    boxShadow: "inset 0 0 0 1px color-mix(in oklab, var(--v3-fg) 3%, transparent)",
  }}>
    {/* Huge pull-quote glyph — Instrument Serif italic accent, offset
        into the top-left corner. Sits behind the quote body. */}
    <span aria-hidden style={{
      position: "absolute",
      top: "clamp(-8px, -0.5vw, -4px)",
      left: "clamp(8px, 0.8vw, 14px)",
      fontFamily: "var(--v3-font-serif)",
      fontStyle: "italic",
      fontSize: "clamp(4rem, 6vw, 7rem)",
      lineHeight: 0.85,
      color: "var(--v3-accent)",
      opacity: 0.7,
      pointerEvents: "none",
      userSelect: "none",
      textShadow: "0 0 30px color-mix(in oklab, var(--v3-accent) 35%, transparent)",
    }}>&ldquo;</span>

    {/* Quote body — sits below the glyph */}
    <p style={{
      fontFamily: "var(--v3-font-ui)", fontWeight: 300,
      fontSize: "clamp(0.85rem, 0.4vw + 0.55rem, 1rem)",
      color: "var(--v3-fg)", lineHeight: 1.6, margin: 0,
      marginTop: "clamp(24px, 2vw, 40px)",
      overflowWrap: "break-word",
      display: "-webkit-box", WebkitLineClamp: 6, WebkitBoxOrient: "vertical", overflow: "hidden",
      zIndex: 1, position: "relative",
    }}>{t.quote}</p>

    {/* Meta footer */}
    <div style={{ display: "flex", flexDirection: "column", gap: "clamp(8px, 0.8vw, 14px)", minWidth: 0 }}>
      {/* Rating dots + period kicker */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, minWidth: 0 }}>
        <div aria-label={`${t.rating}/5 rating`} style={{ display: "flex", gap: 3 }}>
          {Array.from({ length: 5 }, (_, i) => (
            <span key={i} aria-hidden style={{
              width: 6, height: 6, borderRadius: "50%",
              background: i < (t.rating || 0) ? "var(--v3-accent)" : "var(--v3-line-strong)",
              boxShadow: i < (t.rating || 0) ? "0 0 6px color-mix(in oklab, var(--v3-accent) 60%, transparent)" : "none",
            }} />
          ))}
        </div>
        {t.context?.period && (
          <span style={{
            fontFamily: "var(--v3-font-mono)", fontWeight: 400,
            fontSize: "clamp(8.5px, 0.25vw + 6px, 10px)",
            letterSpacing: ".18em", textTransform: "uppercase",
            color: "var(--v3-fg-mute)",
            fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap",
            overflow: "hidden", textOverflow: "ellipsis",
          }}>{t.context.period}</span>
        )}
      </div>
      {/* Attribution — hairline lead + name + role · company */}
      <div style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span aria-hidden style={{ width: 12, height: 1, background: "var(--v3-accent)" }} />
          <span style={{
            fontFamily: "var(--v3-font-display)", fontWeight: 340,
            fontSize: "clamp(0.9rem, 0.4vw + 0.5rem, 1.05rem)",
            lineHeight: 1.15, letterSpacing: "-.005em",
            color: "var(--v3-fg)", fontOpticalSizing: "auto",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            minWidth: 0,
          }}>{t.name}</span>
        </div>
        <span style={{
          fontFamily: "var(--v3-font-mono)", fontWeight: 400,
          fontSize: "clamp(8.5px, 0.25vw + 6px, 10px)",
          letterSpacing: ".22em", textTransform: "uppercase",
          color: "var(--v3-fg-mute)",
          paddingLeft: 20,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          minWidth: 0,
        }}>{[t.role, t.company].filter(Boolean).join(" · ")}</span>
      </div>
      {/* Endorsements */}
      {(t.endorsements || []).length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
          {(t.endorsements || []).slice(0, 4).map((e, k) => (
            <span key={k} style={{
              fontFamily: "var(--v3-font-mono)", fontWeight: 400,
              fontSize: "clamp(7.5px, 0.22vw + 5.5px, 9px)",
              letterSpacing: ".08em", textTransform: "uppercase",
              color: "var(--v3-fg-dim)",
              border: "1px solid var(--v3-line-strong)", borderRadius: 999,
              padding: "1px clamp(5px, 0.5vw, 8px)",
              whiteSpace: "nowrap",
            }}>{e}</span>
          ))}
        </div>
      )}
    </div>
  </article>
);

/* One marquee row. `dir="left"` scrolls left (translateX 0 → -50%);
   `dir="right"` scrolls right (translateX -50% → 0). Content duplicated
   2× so the loop appears seamless as the copy wraps around. */
const MarqueeRow = ({ items, dir = "left", duration = 40 }) => {
  const doubled = useMemo(() => [...items, ...items], [items]);
  const className = dir === "left" ? "v3-marquee-track v3-marquee-l" : "v3-marquee-track v3-marquee-r";
  return (
    <div style={{
      position: "relative",
      overflow: "hidden",
      flex: 1,
      minHeight: 0,
      /* Gradient mask on the horizontal edges so cards fade in/out at the
         boundary rather than snapping into view. */
      maskImage: "linear-gradient(to right, transparent 0, black 4%, black 96%, transparent 100%)",
      WebkitMaskImage: "linear-gradient(to right, transparent 0, black 4%, black 96%, transparent 100%)",
    }}>
      <div
        className={className}
        style={{
          display: "flex", gap: "clamp(12px, 1.2vw, 20px)",
          height: "100%",
          animationDuration: `${duration}s`,
          width: "max-content",
        }}
      >
        {doubled.map((t, i) => (
          <TestimonialCard key={i} t={t} />
        ))}
      </div>
    </div>
  );
};

export default function TestimonialsSection({ index, bootNonce }) {
  const list = testimonials || [];
  const reduce = useReducedMotion();

  /* Row A: original order, scrolls left.
     Row B: reversed order, scrolls right — different visual rhythm. */
  const rowA = list;
  const rowB = useMemo(() => [...list].reverse(), [list]);

  return (
    <V3Frame
      section="Testimonials"
      planet="NEPTUNE"
      index={index}
      scanDir="horizontal"
      scanKey={bootNonce}
      gridAreas={`"top top top" "left left ." "left left ." "left left ."`}
    >
      <div
        className={reduce ? "v3-marquee-scope v3-marquee-reduced" : "v3-marquee-scope"}
        style={{
          gridArea: "left", display: "flex", flexDirection: "column",
          gap: "clamp(12px, 1.2vw, 20px)",
          minWidth: 0, minHeight: 0, overflow: "hidden",
          maxWidth: "min(60vw, 1200px)",
          height: "100%",
        }}
      >
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

        {/* Two rows, opposite directions, hover-pause shared */}
        <div style={{
          flex: 1, minHeight: 0, minWidth: 0,
          display: "flex", flexDirection: "column",
          gap: "clamp(10px, 1vw, 18px)",
        }}>
          <MarqueeRow items={rowA} dir="left" duration={44} />
          <MarqueeRow items={rowB} dir="right" duration={52} />
        </div>

        {/* Marquee CSS — keyframes + hover-pause. `v3-marquee-scope:hover`
            sets `animation-play-state: paused` on ALL descendants of both
            rows so hovering EITHER row pauses BOTH. Reduced motion / the
            `.v3-marquee-reduced` class permanently pauses. */}
        <style>{`
          @keyframes v3-marquee-left {
            from { transform: translate3d(0, 0, 0); }
            to   { transform: translate3d(-50%, 0, 0); }
          }
          @keyframes v3-marquee-right {
            from { transform: translate3d(-50%, 0, 0); }
            to   { transform: translate3d(0, 0, 0); }
          }
          .v3-marquee-track {
            animation-iteration-count: infinite;
            animation-timing-function: linear;
            will-change: transform;
          }
          .v3-marquee-l { animation-name: v3-marquee-left; }
          .v3-marquee-r { animation-name: v3-marquee-right; }
          .v3-marquee-scope:hover .v3-marquee-track,
          .v3-marquee-reduced .v3-marquee-track {
            animation-play-state: paused;
          }
        `}</style>
      </div>
    </V3Frame>
  );
}
