"use client";
/*
 * Testimonials (Neptune) — editorial triptych.
 *
 * Dual-marquee was overkill for 3 testimonials — a marquee needs a
 * stream of content to feel like a wall of praise. With 3, each row
 * just cycled the same short loop, which read as thin and repetitive.
 *
 * Replaced with a static 3-column triptych. Each card gets full
 * editorial treatment: huge Instrument Serif italic pull-quote glyph
 * as a background element, big Fraunces name at the top, italic
 * role · company below, prose quote in Satoshi, star rating dots,
 * endorsement chip cloud, period kicker in mono.
 *
 * Cards fill the section as an even 3-col grid consuming 88 vh. No
 * scroll, no marquee — just three panels of praise sitting side by
 * side like a magazine spread.
 *
 * Motion: each card fades + y-slides in on view with a 100 ms
 * stagger. Reduced motion → static.
 */
import { motion, useReducedMotion } from "motion/react";
import { testimonials, sectionMeta } from "../../../content";
import { V3Frame, V3Scan, V3SectionHeader, V3Chip } from "../primitives";
import { EASE } from "../anim";

const META = sectionMeta.testimonials || {
  sub: "What Others Say",
  heading: "Testimonials",
};

const TestimonialCard = ({ t, index, reduce }) => {
  const delay = 0.15 + index * 0.1;
  return (
    <motion.article
      initial={reduce ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, ease: EASE, delay }}
      style={{
        position: "relative",
        display: "flex", flexDirection: "column",
        justifyContent: "space-between",
        gap: "clamp(14px, 1.4vw, 22px)",
        padding: "clamp(22px, 2vw, 34px) clamp(20px, 1.8vw, 30px)",
        border: "1px solid var(--v3-line)",
        borderRadius: 8,
        background: "color-mix(in oklab, var(--v3-bg-void) 55%, transparent)",
        boxShadow: "inset 0 0 0 1px color-mix(in oklab, var(--v3-fg) 3%, transparent)",
        overflow: "hidden",
        minWidth: 0, minHeight: 0,
      }}
    >
      {/* Enormous pull-quote glyph — background element, offset up and
          to the left. Sits behind everything with a low opacity. */}
      <span aria-hidden style={{
        position: "absolute",
        top: "clamp(-32px, -3vw, -18px)",
        left: "clamp(-8px, -0.5vw, -2px)",
        fontFamily: "var(--v3-font-serif)",
        fontStyle: "italic",
        fontSize: "clamp(9rem, 12vw, 18rem)",
        lineHeight: 0.75,
        color: "var(--v3-accent)",
        opacity: 0.22,
        pointerEvents: "none",
        userSelect: "none",
        textShadow: "0 0 40px color-mix(in oklab, var(--v3-accent) 22%, transparent)",
        zIndex: 0,
      }}>&ldquo;</span>

      {/* Header: attribution — name in Fraunces, role · company in italic serif */}
      <header style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <span aria-hidden style={{ width: 16, height: 1, background: "var(--v3-accent)", flexShrink: 0 }} />
          <h3 style={{
            fontFamily: "var(--v3-font-display)", fontWeight: 340,
            fontSize: "clamp(1.05rem, 0.6vw + 0.55rem, 1.4rem)",
            lineHeight: 1.15, letterSpacing: "-.01em",
            color: "var(--v3-fg)", margin: 0, fontOpticalSizing: "auto",
            overflowWrap: "anywhere",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            minWidth: 0,
          }}>{t.name}</h3>
        </div>
        <span style={{
          fontFamily: "var(--v3-font-serif)", fontStyle: "italic",
          fontWeight: 400,
          fontSize: "clamp(0.82rem, 0.35vw + 0.55rem, 0.98rem)",
          lineHeight: 1.3,
          color: "var(--v3-fg-dim)",
          paddingLeft: 26,
          overflowWrap: "anywhere",
        }}>{[t.role, t.company].filter(Boolean).join(" · ")}</span>
      </header>

      {/* Quote body — the editorial voice */}
      <blockquote style={{
        position: "relative", zIndex: 1,
        margin: 0, padding: 0,
        fontFamily: "var(--v3-font-ui)", fontWeight: 300,
        fontSize: "clamp(0.9rem, 0.4vw + 0.6rem, 1.05rem)",
        color: "var(--v3-fg)", lineHeight: 1.65,
        maxWidth: "min(38ch, 100%)",
        overflowWrap: "break-word",
        display: "-webkit-box", WebkitLineClamp: 8, WebkitBoxOrient: "vertical", overflow: "hidden",
      }}>{t.quote}</blockquote>

      {/* Footer: rating + period + endorsements */}
      <footer style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: "clamp(10px, 1vw, 16px)", minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, minWidth: 0, flexWrap: "wrap" }}>
          <div aria-label={`${t.rating}/5 rating`} style={{ display: "flex", gap: 4 }}>
            {Array.from({ length: 5 }, (_, i) => (
              <span key={i} aria-hidden style={{
                width: 7, height: 7, borderRadius: "50%",
                background: i < (t.rating || 0) ? "var(--v3-accent)" : "var(--v3-line-strong)",
                boxShadow: i < (t.rating || 0) ? "0 0 8px color-mix(in oklab, var(--v3-accent) 60%, transparent)" : "none",
              }} />
            ))}
          </div>
          {t.context?.period && (
            <span style={{
              fontFamily: "var(--v3-font-mono)", fontWeight: 400,
              fontSize: "clamp(9px, 0.3vw + 6px, 10.5px)",
              letterSpacing: ".2em", textTransform: "uppercase",
              color: "var(--v3-fg-mute)",
              fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap",
            }}>{t.context.period}</span>
          )}
        </div>
        {(t.endorsements || []).length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {(t.endorsements || []).map((e, k) => (
              <V3Chip key={k} size="clamp(8.5px, 0.25vw + 6px, 10px)" pad="1px clamp(6px, 0.55vw, 10px)">{e}</V3Chip>
            ))}
          </div>
        )}
      </footer>
    </motion.article>
  );
};

export default function TestimonialsSection({ index, bootNonce }) {
  const list = testimonials || [];
  const reduce = useReducedMotion();

  return (
    <V3Frame
      section="Testimonials"
      planet="NEPTUNE"
      index={index}
      scanDir="horizontal"
      scanKey={bootNonce}
      gridAreas={`"top top top" "left left ." "left left ." "left left ."`}
    >
      <div style={{
        gridArea: "left", display: "flex", flexDirection: "column",
        gap: "clamp(12px, 1.2vw, 20px)",
        minWidth: 0, minHeight: 0, overflow: "hidden",
        maxWidth: "min(60vw, 1200px)", height: "100%",
      }}>
        {/* Header */}
        <V3SectionHeader sub={META.sub} heading={META.heading} />

        {/* Triptych — 3 cards in a static row, each taking the full remaining
            vertical. Uses grid rather than flex so all cards land at
            identical widths without needing per-card flex sizing. */}
        <V3Scan variant="horizontal" delay={0.12} style={{ minWidth: 0, flex: 1, minHeight: 0, display: "flex" }}>
          <div style={{
            width: "100%", height: "100%",
            display: "grid",
            gridTemplateColumns: `repeat(${Math.min(list.length, 3)}, minmax(0, 1fr))`,
            gap: "clamp(12px, 1.2vw, 20px)",
            minWidth: 0, minHeight: 0,
          }}>
            {list.map((t, i) => (
              <TestimonialCard key={i} t={t} index={i} reduce={reduce} />
            ))}
          </div>
        </V3Scan>
      </div>
    </V3Frame>
  );
}
