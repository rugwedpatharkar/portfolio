/*
 * Education (Saturn) — concentric orbital rings per the taste-stack table.
 *
 *   "Concentric rings around a center node; hover a ring, it lifts
 *    (z + brighten), degree flies in from the right on a horizontal
 *    line; ring stroke width encodes score."
 *
 * Layout:
 *   - LEFT (~48%): SVG orbital chart. Center emblem + N concentric
 *     rings (one per education entry). Inner ring = most recent
 *     (MSc), outer ring = oldest (SSC). Each ring's stroke width
 *     encodes its percentage (thicker = higher score). A dot marker
 *     sits at 12 o'clock on each ring. The active ring is
 *     accent-colored and thicker; inactive rings are muted. Rings
 *     draw in (pathLength 0 → 1) on section reveal, staggered.
 *   - RIGHT (~52%): active degree's detail. Kicker + degree name +
 *     school + duration/year + highlight chip cloud. Content
 *     "flies in from the right on a horizontal line" via AnimatePresence
 *     — a hairline horizontal rule draws in first, then the block
 *     x-slides + fades in.
 *
 * Interactions:
 *   - Click a ring OR a small "01/02/03/04" numeric tab below the
 *     chart to switch active education.
 *   - Keyboard: ArrowUp/Down or J/K cycles through educations.
 */
import { useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { educations, sectionMeta } from "../../../content";
import { V3Frame, V3Scan, V3SectionHeader, V3Chip, masterCardStyle } from "../primitives";
import { EASE } from "../anim";

const META = sectionMeta.education || {
  sub: "Formation",
  heading: "Academic Track",
};

/* Chart constants — 400×400 viewBox. Rings spaced evenly between
   min and max radius. Inner ring = index 0 (most recent). */
const CX = 200;
const CY = 200;
const RING_MIN = 60;
const RING_MAX = 175;
const DOT_R = 6;

const strokeForPct = (pct) => 1.5 + (Math.max(0, Math.min(100, pct)) / 100) * 3.5;

export default function EducationSection({ bootNonce }) {
  const list = useMemo(() => educations || [], []);
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  const item = list[active] || list[0];

  const rings = useMemo(() => {
    const n = list.length;
    if (!n) return [];
    return list.map((e, i) => {
      /* Evenly space radii from RING_MIN (inner) to RING_MAX (outer). */
      const t = n === 1 ? 0 : i / (n - 1);
      const radius = RING_MIN + t * (RING_MAX - RING_MIN);
      return {
        e,
        i,
        radius,
        strokeWidth: strokeForPct(e.percentage),
        dot: { x: CX, y: CY - radius },  // 12 o'clock
      };
    });
  }, [list]);

  const goto = useCallback((i) => {
    if (i < 0 || i >= list.length || i === active) return;
    setActive(i);
  }, [active, list.length]);

  return (
    <V3Frame
      section="Education"
      planet="SATURN"

      scanDir="orbit"
      scanKey={bootNonce}
      gridAreas={`"top top top" "left left ." "left left ." "left left ."`}
    >
      <div
        style={{
          gridArea: "left", display: "flex", flexDirection: "column",
          gap: "clamp(12px, 1.2vw, 20px)",
          minWidth: 0, minHeight: 0, overflow: "hidden",
          maxWidth: "min(60vw, 1200px)", height: "100%",
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "j") { goto((active + 1) % list.length); e.preventDefault(); }
          if (e.key === "ArrowUp"   || e.key === "k") { goto((active - 1 + list.length) % list.length); e.preventDefault(); }
        }}
      >
        {/* Header */}
        <V3SectionHeader sub={META.sub} heading={META.heading} />

        {/* Chart + detail card */}
        <V3Scan variant="orbit" delay={0.15} style={{ minWidth: 0, flex: 1, minHeight: 0, display: "flex" }}>
          <div style={masterCardStyle({ cols: "minmax(280px, 45%) 1fr", gap: "clamp(14px, 1.5vw, 28px)", padding: "clamp(12px, 1.2vw, 20px) clamp(14px, 1.4vw, 22px)" })}>
            {/* LEFT — orbital chart */}
            <div style={{
              display: "flex", flexDirection: "column",
              minWidth: 0, minHeight: 0, position: "relative",
            }}>
              <div style={{
                flex: 1, minWidth: 0, minHeight: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                position: "relative",
              }}>
                <svg
                  viewBox="0 0 400 400"
                  preserveAspectRatio="xMidYMid meet"
                  role="tablist"
                  aria-label="Education orbital chart"
                  style={{
                    width: "100%", height: "100%",
                    maxWidth: "min(100%, 460px)", maxHeight: "100%",
                    overflow: "visible",
                  }}
                >
                  {/* Rings — outer to inner drawn order so the active
                      ring reliably renders above the muted ones. */}
                  {rings.slice().reverse().map(({ e, i, radius, strokeWidth }) => {
                    const isActive = i === active;
                    return (
                      <motion.circle
                        key={`ring-${i}`}
                        role="tab"
                        aria-selected={isActive}
                        aria-label={`${e.shortName || e.degree} · ${e.year}`}
                        cx={CX} cy={CY} r={radius}
                        fill="none"
                        stroke={isActive ? "var(--v3-accent)" : "var(--v3-line-strong)"}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        style={{
                          cursor: "pointer",
                          filter: isActive ? "drop-shadow(0 0 6px color-mix(in oklab, var(--v3-accent) 60%, transparent))" : "none",
                          opacity: isActive ? 1 : 0.55,
                          transition: "opacity .25s, stroke .25s, filter .25s",
                          pointerEvents: "stroke",
                        }}
                        initial={reduce ? { pathLength: 1, opacity: isActive ? 1 : 0.55 } : { pathLength: 0, opacity: 0 }}
                        whileInView={{ pathLength: 1, opacity: isActive ? 1 : 0.55 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.9, ease: EASE, delay: 0.15 + i * 0.08 }}
                        onClick={() => goto(i)}
                      />
                    );
                  })}

                  {/* Dot markers at 12 o'clock on each ring */}
                  {rings.map(({ e, i, dot }) => {
                    const isActive = i === active;
                    return (
                      <motion.g
                        key={`dot-${i}`}
                        initial={reduce ? false : { opacity: 0, scale: 0.6 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.35, ease: EASE, delay: 0.9 + i * 0.06 }}
                      >
                        <circle
                          cx={dot.x} cy={dot.y}
                          r={isActive ? DOT_R : DOT_R * 0.65}
                          fill={isActive ? "var(--v3-accent)" : "var(--v3-bg-void)"}
                          stroke="var(--v3-accent)"
                          strokeWidth={1.5}
                          onClick={() => goto(i)}
                          style={{
                            cursor: "pointer",
                            filter: isActive ? "drop-shadow(0 0 8px color-mix(in oklab, var(--v3-accent) 70%, transparent))" : "none",
                            transition: "r .25s, fill .25s, filter .25s",
                          }}
                        />
                        {/* Compact shortName label above the dot */}
                        <text
                          x={dot.x}
                          y={dot.y - 12}
                          textAnchor="middle"
                          fontFamily="var(--v3-font-mono)"
                          fontSize={10.5}
                          letterSpacing=".14em"
                          fill={isActive ? "var(--v3-fg)" : "var(--v3-fg-mute)"}
                          style={{ pointerEvents: "none", transition: "fill .25s" }}
                        >{e.shortName || ""}</text>
                      </motion.g>
                    );
                  })}

                  {/* Center emblem — pulses subtly, shows current shortName */}
                  <motion.circle
                    cx={CX} cy={CY} r={22}
                    fill="var(--v3-bg-void)"
                    stroke="var(--v3-accent)"
                    strokeWidth={1.5}
                    animate={reduce ? {} : { scale: [1, 1.06, 1] }}
                    transition={{ duration: 3.2, ease: "easeInOut", repeat: Infinity }}
                    style={{ transformOrigin: `${CX}px ${CY}px`, filter: "drop-shadow(0 0 10px color-mix(in oklab, var(--v3-accent) 50%, transparent))" }}
                  />
                  <text
                    x={CX} y={CY + 4}
                    textAnchor="middle"
                    fontFamily="var(--v3-font-display)"
                    fontSize={13}
                    fill="var(--v3-fg)"
                    letterSpacing="-.02em"
                    style={{ pointerEvents: "none", fontOpticalSizing: "auto" }}
                  >EDU</text>
                </svg>
              </div>

              {/* Small numeric tab strip beneath the chart — quick nav */}
              <div role="none" style={{
                display: "flex", justifyContent: "center", gap: 6,
                marginTop: "clamp(6px, 0.7vw, 12px)",
              }}>
                {list.map((e, i) => {
                  const isActive = i === active;
                  return (
                    <button
                      key={i}
                      type="button"
                      aria-label={`Select ${e.shortName || e.degree}`}
                      onClick={() => goto(i)}
                      style={{
                        all: "unset", cursor: "pointer",
                        padding: "clamp(4px, 0.35vw, 6px) clamp(9px, 0.8vw, 14px)",
                        border: `1px solid ${isActive ? "var(--v3-accent)" : "var(--v3-line)"}`,
                        borderRadius: 999,
                        background: isActive ? "color-mix(in oklab, var(--v3-accent) 12%, transparent)" : "transparent",
                        fontFamily: "var(--v3-font-mono)", fontWeight: 400,
                        fontSize: "clamp(9px, 0.3vw + 6px, 11px)",
                        letterSpacing: ".18em",
                        color: isActive ? "var(--v3-accent)" : "var(--v3-fg-mute)",
                        fontVariantNumeric: "tabular-nums",
                        transition: "background .2s, border-color .2s, color .2s",
                      }}
                    >{String(i + 1).padStart(2, "0")}</button>
                  );
                })}
              </div>
            </div>

            {/* RIGHT — degree detail, flies in from the right */}
            <div style={{
              display: "flex", flexDirection: "column",
              gap: "clamp(8px, 0.9vw, 14px)",
              minWidth: 0, minHeight: 0, position: "relative",
            }}>
              {/* Animated horizontal rule that "carries" the block */}
              <motion.div
                key={`rule-${active}`}
                aria-hidden
                initial={reduce ? { scaleX: 1 } : { scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.45, ease: EASE }}
                style={{
                  height: 1, background: "var(--v3-accent)",
                  transformOrigin: "left",
                  boxShadow: "0 0 8px color-mix(in oklab, var(--v3-accent) 55%, transparent)",
                }}
              />
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={`detail-${active}`}
                  initial={reduce ? false : { opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, transition: { duration: 0.15 } }}
                  transition={{ duration: 0.4, ease: EASE, delay: 0.1 }}
                  style={{
                    display: "flex", flexDirection: "column",
                    gap: "clamp(8px, 0.9vw, 14px)",
                    minWidth: 0, flex: 1,
                  }}
                >
                  {/* Kicker: LEVEL · YEAR · DURATION */}
                  <div style={{
                    display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap",
                    fontFamily: "var(--v3-font-mono)", fontWeight: 400,
                    fontSize: "clamp(9px, 0.3vw + 6px, 11px)",
                    letterSpacing: ".22em", textTransform: "uppercase", color: "var(--v3-fg-mute)",
                    fontVariantNumeric: "tabular-nums",
                  }}>
                    <span>{item?.level}</span>
                    {item?.year && <><span aria-hidden style={{ opacity: 0.4 }}>·</span><span>{item.year}</span></>}
                    {item?.duration && <><span aria-hidden style={{ opacity: 0.4 }}>·</span><span>{item.duration}</span></>}
                  </div>

                  {/* Degree title */}
                  <h3 style={{
                    fontFamily: "var(--v3-font-display)", fontWeight: 340,
                    fontSize: "clamp(1.35rem, 1vw + 0.7rem, 2rem)",
                    lineHeight: 1.15, letterSpacing: "-.015em",
                    color: "var(--v3-fg)", margin: 0, fontOpticalSizing: "auto",
                    overflowWrap: "anywhere",
                  }}>{item?.degree}</h3>

                  {/* School */}
                  <p style={{
                    fontFamily: "var(--v3-font-ui)", fontWeight: 300,
                    fontSize: "clamp(0.85rem, 0.35vw + 0.55rem, 0.95rem)",
                    color: "var(--v3-fg-dim)", lineHeight: 1.5, margin: 0,
                    fontStyle: "italic",
                  }}>{item?.name}</p>

                  {/* Percentage — big display */}
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                    <span style={{
                      fontFamily: "var(--v3-font-display)", fontWeight: 340,
                      fontSize: "clamp(2rem, 1.6vw + 1rem, 3.2rem)",
                      lineHeight: 1, letterSpacing: "-.03em",
                      color: "var(--v3-accent)", fontOpticalSizing: "auto",
                      fontVariantNumeric: "tabular-nums",
                    }}>{item?.percentage}</span>
                    <span style={{
                      fontFamily: "var(--v3-font-mono)", fontWeight: 400,
                      fontSize: "clamp(9px, 0.3vw + 6px, 11px)",
                      letterSpacing: ".22em", textTransform: "uppercase",
                      color: "var(--v3-fg-mute)",
                    }}>%   Grade</span>
                  </div>

                  {/* Highlights */}
                  {(item?.highlights || []).length > 0 && (
                    <div style={{
                      display: "flex", flexDirection: "column", gap: "clamp(4px, 0.4vw, 8px)",
                      marginTop: "auto",
                      paddingTop: "clamp(8px, 0.8vw, 12px)",
                      borderTop: "1px solid var(--v3-line)",
                      minWidth: 0,
                    }}>
                      <span style={{
                        fontFamily: "var(--v3-font-mono)", fontWeight: 400,
                        fontSize: "clamp(9px, 0.3vw + 6px, 11px)",
                        letterSpacing: ".22em", textTransform: "uppercase", color: "var(--v3-fg-mute)",
                      }}>Focus areas</span>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, minWidth: 0 }}>
                        {(item.highlights || []).map((h, k) => (
                          <V3Chip key={k}>{h}</V3Chip>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </V3Scan>
      </div>
    </V3Frame>
  );
}
