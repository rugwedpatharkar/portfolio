"use client";
/*
 * Fun facts (Mercury) — the numbers dossier.
 *
 * User feedback: 'redesign it — even if the screen size increases or
 * decreases the content should never cut or clamp.'
 *
 * Redesign approach:
 *   - LEFT area spans grid cols 1+2 (wider) so 4 stats can sit side-by-side.
 *   - Grid: 4 cols × 2 rows for the 8 stats. `min-content` rows so cells size
 *     to their natural content (no clamps, no line-clamp, full detail shown).
 *   - Header (kicker + heading + optional lede) sits on top spanning full
 *     width and does NOT compete for vertical space with the stats.
 *   - Description clamps + WebkitLineClamp REMOVED. If the viewport can't fit
 *     everything, the LEFT container's overflow: auto gives a v3 scrollbar,
 *     but nothing is truncated or clipped mid-word.
 *   - Card content: emoji + big serif number stacked, mono label, full detail
 *     paragraph. All fluid clamps for scalability without upper caps that
 *     force cut-off.
 */
import { motion, useReducedMotion } from "motion/react";
import { funFacts, sectionMeta } from "../../../content";
import { V3Frame, V3Scan, V3Ticker } from "../primitives";

const META = sectionMeta.funFacts;

/*
 * GaugeArc — the signature moment for FunFacts.
 *
 * Renders a semicircle "instrument dial" behind the stat: an accent-colored
 * ∩-shaped arc with hairline tick marks radiating outward every 15°. On
 * scroll-into-view the arc's pathLength animates 0→1 (~600 ms, ease-smooth),
 * then ticks fade in staggered — reads as a cockpit gauge powering up.
 * Reduced motion → gauge appears in its rest state instantly.
 *
 * Positioned absolutely at the top of the parent cell; consumers must give
 * their card `position: relative`. Height caps at ~48 % of the cell so
 * emoji + number + label stack cleanly beneath the arc without overlap.
 */
const GAUGE_TICKS = Array.from({ length: 11 }, (_, i) => -75 + i * 15);
const GaugeArc = ({ delay = 0, reduce }) => (
  <svg aria-hidden viewBox="0 0 200 110" preserveAspectRatio="xMidYMax meet"
    style={{
      position: "absolute", top: 0, left: 0,
      width: "100%", height: "48%",
      pointerEvents: "none", zIndex: 0,
    }}>
    <motion.path
      d="M 15.4 100 A 90 90 0 0 1 184.6 100"
      fill="none" stroke="var(--v3-accent)" strokeWidth="0.6"
      strokeLinecap="round" opacity="0.55"
      initial={reduce ? { pathLength: 1 } : { pathLength: 0 }}
      whileInView={{ pathLength: 1 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay }}
    />
    {GAUGE_TICKS.map((deg, k) => {
      const rad = (deg * Math.PI) / 180;
      const inner = 90, outer = 96;
      const x1 = 100 + inner * Math.sin(rad);
      const y1 = 100 - inner * Math.cos(rad);
      const x2 = 100 + outer * Math.sin(rad);
      const y2 = 100 - outer * Math.cos(rad);
      return (
        <motion.line key={k}
          x1={x1} y1={y1} x2={x2} y2={y2}
          stroke="var(--v3-fg-mute)" strokeWidth="0.5"
          initial={reduce ? { opacity: 0.6 } : { opacity: 0 }}
          whileInView={{ opacity: 0.6 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.3, ease: "easeOut", delay: delay + 0.35 + k * 0.02 }}
        />
      );
    })}
  </svg>
);

const StatCard = ({ f, i, cols }) => {
  const row = Math.floor(i / cols);
  const col = i % cols;
  const isFloat = !Number.isInteger(f.value);
  const reduce = useReducedMotion();
  /* Stagger the gauge draw so 8 gauges don't all animate simultaneously —
     reads as instruments powering up in sequence, not a batch reveal. */
  const gaugeDelay = 0.05 + (row + col) * 0.06;
  return (
    <V3Scan variant="radial" delay={0.15 + (row + col) * 0.05}>
      <div style={{
        position: "relative",
        display: "flex", flexDirection: "column",
        gap: "clamp(6px, 0.55vw, 10px)",
        padding: "clamp(12px, 1.1vw, 18px) clamp(12px, 1.15vw, 20px)",
        borderTop: row > 0 ? "1px solid var(--v3-line)" : "none",
        borderLeft: col > 0 ? "1px solid var(--v3-line)" : "none",
        minWidth: 0, height: "100%", minHeight: 0,
      }}>
        <GaugeArc delay={gaugeDelay} reduce={reduce} />
        {/* emoji + big number inline — z-index 1 keeps them above the gauge SVG */}
        <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "baseline", gap: "clamp(6px, 0.6vw, 10px)", flexWrap: "wrap" }}>
          <span aria-hidden style={{
            fontSize: "clamp(1rem, 0.6vw + 0.5rem, 1.35rem)",
            opacity: 0.85, flexShrink: 0,
          }}>{f.icon}</span>
          <span style={{
            fontFamily: "var(--v3-font-display)", fontWeight: 340,
            fontSize: "clamp(1.4rem, 0.6vw + 1rem, 2.2rem)",
            lineHeight: 1, letterSpacing: "-.02em",
            color: "var(--v3-fg)", fontOpticalSizing: "auto",
            overflowWrap: "anywhere",
          }}>
            <V3Ticker value={f.value} suffix={f.suffix || ""} decimals={isFloat ? 1 : 0} />
          </span>
        </div>
        {/* mono label */}
        <div style={{
          fontFamily: "var(--v3-font-mono)", fontWeight: 400,
          fontSize: "clamp(9px, 0.35vw + 6px, 11px)",
          letterSpacing: ".18em", textTransform: "uppercase",
          color: "var(--v3-fg-mute)",
          overflowWrap: "anywhere",
        }}>{f.label}</div>
        {/* detail — no clamp, full text visible */}
        <p style={{
          fontFamily: "var(--v3-font-ui)", fontWeight: 300,
          fontSize: "clamp(.72rem, 0.3vw + 0.55rem, .82rem)",
          color: "var(--v3-fg-dim)", lineHeight: 1.45, margin: 0,
          overflowWrap: "break-word", hyphens: "auto",
        }}>{f.detail}</p>
      </div>
    </V3Scan>
  );
};

export default function FunFactsSection({ index, bootNonce }) {
  const cols = 4; // 4-col grid so 8 stats fit as 4×2
  return (
    <V3Frame
      section="Fun facts"
      planet="MERCURY"
      index={index}
      scanDir="radial"
      scanKey={bootNonce}
      /* LEFT area spans grid cols 1+2 (full frame height) so the 4-col grid
         + header have real horizontal room. Col 3 stays empty for Mercury +
         corner telemetry card. */
      gridAreas={`"top top top" "left left ." "left left ." "left left ."`}
    >
      <div style={{
        gridArea: "left",
        display: "flex", flexDirection: "column",
        gap: "clamp(14px, 1.4vw, 22px)",
        minWidth: 0, minHeight: 0, overflow: "auto",
        maxWidth: "min(72vw, 1200px)", height: "100%",
      }}>
        {/* Header */}
        <V3Scan variant="horizontal" delay={0.05}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10, flexWrap: "wrap", minWidth: 0 }}>
              <span style={{ width: 22, height: 1, background: "var(--v3-accent)", flexShrink: 0 }} />
              <span style={{
                fontFamily: "var(--v3-font-mono)", fontWeight: 400,
                fontSize: "clamp(9.5px, 0.2vw + 8px, 11px)",
                letterSpacing: ".28em", textTransform: "uppercase", color: "var(--v3-fg-mute)",
                overflowWrap: "anywhere",
              }}>{META.sub}</span>
            </div>
            <h2 style={{
              fontFamily: "var(--v3-font-display)", fontWeight: 340,
              fontSize: "clamp(1.6rem, 1.1vw + 1rem, 2.4rem)",
              fontOpticalSizing: "auto",
              lineHeight: 1, letterSpacing: "-.02em", color: "var(--v3-fg)",
              margin: "0 0 8px",
              overflowWrap: "anywhere",
            }}>
              {META.heading}
            </h2>
            <p style={{
              fontFamily: "var(--v3-font-ui)", fontWeight: 300,
              fontSize: "clamp(.8rem, 0.3vw + 0.65rem, .9rem)",
              color: "var(--v3-fg-dim)",
              lineHeight: 1.55, margin: 0,
              maxWidth: "min(72ch, 100%)",
              overflowWrap: "break-word",
            }}>
              {META.description}
            </p>
          </div>
        </V3Scan>

        {/* 4×2 stats grid — hairline dividers between rows AND columns.
            gridAutoRows: 1fr + flex:1 stretches cells to fill remaining height.
            No line clamps anywhere — content is never cut. If the viewport is
            genuinely too short for 8 stats, LEFT container's overflow: auto
            catches it and the elegant v3 scrollbar appears. */}
        <div style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          gridAutoRows: "1fr",
          border: "1px solid var(--v3-line)",
          borderRadius: 6,
          background: "color-mix(in oklab, var(--v3-bg-void) 50%, transparent)",
          flex: 1, minHeight: 0,
        }}>
          {funFacts.map((f, i) => (
            <StatCard key={i} f={f} i={i} cols={cols} />
          ))}
        </div>
      </div>
    </V3Frame>
  );
}
