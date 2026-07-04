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
 * Two levels of "instrument-ness":
 *   • For percentage stats (suffix === "%"): the arc is DATA. A dim background
 *     rail draws the full ∩ semicircle first; then the accent-colored fill
 *     arc animates pathLength 0→(value/100). A small pin marker (filled dot)
 *     sits at the fill endpoint like a needle indicator. The gauge literally
 *     shows the metric.
 *   • For non-percentage stats (counts like 31, 7+): the arc is DECORATIVE.
 *     Full ∩ drawn in accent, no rail, no pin.
 *
 * Tick marks (11 hairlines every 15°) render on both paths, radiating
 * outward. On scroll-into-view the whole gauge powers up: rail → fill →
 * pin → ticks stagger. Reduced motion → rest state instantly.
 *
 * Positioned absolutely, height 55 % of the cell so it wraps the number
 * row without competing with the description underneath. Card must be
 * `position: relative`.
 */
const GAUGE_TICKS = Array.from({ length: 11 }, (_, i) => -75 + i * 15);
const GAUGE_PATH = "M 15.4 100 A 90 90 0 0 1 184.6 100";
/* pointOnArc(t) — t in [0,1] returns the (x, y) SVG coord along the ∩ arc.
   t=0 → left endpoint, t=0.5 → apex, t=1 → right endpoint. Used by the
   fill-endpoint pin for percentage gauges. */
const pointOnArc = (t) => {
  const theta = (1 - t) * Math.PI; // angle from x-axis, sweeping 180° → 0°
  return {
    x: 100 + 90 * Math.cos(theta),
    y: 100 - 90 * Math.sin(theta),
  };
};

const GaugeArc = ({ fillLevel = 1, showRail = false, showPin = false, delay = 0, reduce }) => {
  /* Needle-overshoot physics — the fill arc + pin sweep 3% past their rest
     value, then settle. Matches the taste-stack table's "needle overshoots
     by 3% then settles (spring)" call-out. Overshoot capped at 1.0 so a
     99.9% arc doesn't try to draw past the semicircle endpoint. */
  const overshoot = Math.min(fillLevel * 1.03, 1);
  const restPin = pointOnArc(fillLevel);
  const overshootPin = pointOnArc(overshoot);
  return (
    <svg aria-hidden viewBox="0 0 200 110" preserveAspectRatio="xMidYMax meet"
      style={{
        position: "absolute", top: 0, left: 0,
        width: "100%", height: "55%",
        pointerEvents: "none", zIndex: 0,
      }}>
      {/* Background rail — only for percentage gauges. Draws the "empty"
          portion of the semicircle so the fill arc reads as a partial value. */}
      {showRail && (
        <motion.path
          d={GAUGE_PATH}
          fill="none" stroke="var(--v3-line-strong)" strokeWidth="0.6"
          strokeLinecap="round" opacity="0.45"
          initial={reduce ? { pathLength: 1 } : { pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay }}
        />
      )}
      {/* Fill arc — accent, sweeps 0 → overshoot → fillLevel. Keyframes with
          `times` weight land 75% of the duration on the overshoot phase,
          25% on the settle-back. Reads as a needle physical response. */}
      <motion.path
        d={GAUGE_PATH}
        fill="none" stroke="var(--v3-accent)" strokeWidth="0.75"
        strokeLinecap="round" opacity="0.7"
        initial={reduce ? { pathLength: fillLevel } : { pathLength: 0 }}
        whileInView={reduce ? { pathLength: fillLevel } : { pathLength: [0, overshoot, fillLevel] }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1], times: [0, 0.75, 1], delay: delay + (showRail ? 0.15 : 0) }}
      />
      {/* Fill endpoint pin — travels along the arc to the overshoot point
          then settles back to fillLevel. Position animates cx/cy in the
          same keyframe rhythm as the fill arc. */}
      {showPin && (
        <motion.circle
          r={1.8}
          fill="var(--v3-accent)"
          initial={reduce ? { cx: restPin.x, cy: restPin.y, opacity: 1, scale: 1 } : { cx: pointOnArc(0).x, cy: pointOnArc(0).y, opacity: 0, scale: 0.4 }}
          whileInView={reduce ? { cx: restPin.x, cy: restPin.y, opacity: 1, scale: 1 } : { cx: [pointOnArc(0).x, overshootPin.x, restPin.x], cy: [pointOnArc(0).y, overshootPin.y, restPin.y], opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1], times: [0, 0.75, 1], delay: delay + (showRail ? 0.15 : 0) }}
        />
      )}
      {/* Tick marks — hairlines radiating outward every 15°. */}
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
};

const StatCard = ({ f, i, cols }) => {
  const row = Math.floor(i / cols);
  const col = i % cols;
  const isFloat = !Number.isInteger(f.value);
  const reduce = useReducedMotion();
  /* Percentage stats get a fill-to-value arc + background rail + endpoint pin —
     the gauge literally shows the metric. Non-percentage stats (counts like
     31, 7+) get a full decorative arc. Clamp 0..1 so extreme values don't
     draw past the arc endpoint. */
  const isPercent = f.suffix === "%";
  const fillLevel = isPercent ? Math.min(Math.max(f.value / 100, 0), 1) : 1;
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
        <GaugeArc
          fillLevel={fillLevel}
          showRail={isPercent}
          showPin={isPercent}
          delay={gaugeDelay}
          reduce={reduce}
        />
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
        minWidth: 0, minHeight: 0, overflow: "hidden",
        maxWidth: "min(60vw, 1200px)", height: "100%",
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
