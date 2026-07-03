"use client";
/*
 * Skills (Ceres) — radar-chart dossier.
 *
 * Master-detail structure kept: 9 categories on the LEFT as a clickable
 * index, active category's skills on the RIGHT as a data-viz radar
 * chart. Every skill in the active category shows as an axis on the
 * polygon — the whole category is legible at a glance without any
 * scrolling.
 *
 * Chart geometry (400×400 viewBox):
 *   - Center at (200, 200), max radius 150.
 *   - N axes at even angles starting from 12 o'clock, clockwise.
 *   - Concentric hairline rings at 25/50/75/100% of max radius.
 *   - Filled polygon at each skill's proficiency, accent-tinted.
 *   - Dot at each polygon vertex.
 *   - Skill name label floats at 175 radius (outside the ring).
 *
 * Signature moment: on category switch the polygon + vertex dots
 * cross-fade + scale-in from 0.85 (via key={activeName}); the static
 * scaffold (rings, ticks) stays put — reads as a chart re-computing,
 * not a full re-render.
 */
import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { skills, sectionMeta } from "../../../content";
import { V3Frame, V3Scan } from "../primitives";

const META = sectionMeta.skills || { sub: "What I Bring", heading: "Technical Skills" };

/* Chart constants */
const CX = 200;
const CY = 200;
const R = 150;                    // max radius (100%)
const LABEL_R = 178;               // label placement radius
const RING_LEVELS = [0.25, 0.5, 0.75, 1];

/* Compute (x, y) on the circle at (angle, radius). Angle 0 = 12 o'clock,
   positive = clockwise (standard radar orientation). */
const polar = (angle, radius) => ({
  x: CX + radius * Math.sin(angle),
  y: CY - radius * Math.cos(angle),
});

export default function SkillsSection({ index, bootNonce }) {
  const cats = Object.entries(skills);
  const [active, setActive] = useState(0);
  const [activeName, activeList] = cats[active] || cats[0];
  const reduce = useReducedMotion();

  /* Precompute axis geometry per skill in the active category. */
  const geometry = useMemo(() => {
    const n = activeList.length;
    if (!n) return { axes: [], polygonPoints: "", avg: 0 };
    const axes = activeList.map((s, i) => {
      const angle = (i * 2 * Math.PI) / n;
      const outer = polar(angle, R);
      const label = polar(angle, LABEL_R);
      const vertex = polar(angle, (s.level / 100) * R);
      return {
        skill: s,
        angle,
        outer,
        label,
        vertex,
        /* Horizontal anchor for the label — snap left/center/right based on
           which quadrant it sits in so text never runs off-canvas. */
        anchor: Math.abs(Math.sin(angle)) < 0.15 ? "middle" : Math.sin(angle) > 0 ? "start" : "end",
        vAlign: Math.abs(Math.cos(angle)) < 0.15 ? "central" : Math.cos(angle) > 0 ? "text-after-edge" : "hanging",
      };
    });
    const polygonPoints = axes.map((a) => `${a.vertex.x},${a.vertex.y}`).join(" ");
    const avg = Math.round(activeList.reduce((sum, s) => sum + s.level, 0) / n);
    return { axes, polygonPoints, avg };
  }, [activeList]);

  return (
    <V3Frame
      section="Skills"
      planet="CERES"
      index={index}
      scanDir="orbit"
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

        {/* Master-detail: index LEFT (~30%), radar chart RIGHT (~70%). */}
        <V3Scan variant="orbit" delay={0.15} style={{ minWidth: 0, flex: 1, minHeight: 0, display: "flex" }}>
          <div style={{
            width: "100%", height: "100%",
            display: "grid",
            gridTemplateColumns: "minmax(220px, 30%) 1fr",
            gridTemplateRows: "1fr",
            gap: "clamp(14px, 1.5vw, 24px)",
            border: "1px solid var(--v3-line)",
            borderRadius: 6,
            background: "color-mix(in oklab, var(--v3-bg-void) 50%, transparent)",
            padding: "clamp(10px, 1vw, 18px) clamp(12px, 1.3vw, 22px)",
            minWidth: 0, minHeight: 0, alignItems: "stretch",
          }}>
            {/* Master column */}
            <div
              role="tablist"
              aria-label="Skill categories"
              style={{
                display: "flex", flexDirection: "column",
                justifyContent: "space-between", gap: 2,
                minWidth: 0, alignSelf: "stretch", height: "100%",
              }}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown" || e.key === "j") { setActive(a => Math.min(cats.length - 1, a + 1)); e.preventDefault(); }
                if (e.key === "ArrowUp"   || e.key === "k") { setActive(a => Math.max(0, a - 1)); e.preventDefault(); }
              }}
            >
              {cats.map(([cat, list], i) => {
                const isActive = i === active;
                return (
                  <button
                    key={cat}
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActive(i)}
                    style={{
                      all: "unset", cursor: "pointer",
                      display: "grid", gridTemplateColumns: "auto minmax(0, 1fr) auto",
                      alignItems: "baseline", gap: "clamp(6px, 0.6vw, 10px)",
                      padding: "clamp(5px, 0.5vw, 8px) clamp(8px, 0.9vw, 12px)",
                      borderLeft: isActive ? "2px solid var(--v3-accent)" : "2px solid transparent",
                      background: isActive ? "color-mix(in oklab, var(--v3-accent) 8%, transparent)" : "transparent",
                      borderRadius: "0 4px 4px 0",
                      transition: "background .2s, border-color .2s",
                      minWidth: 0,
                    }}
                  >
                    <span aria-hidden style={{
                      fontFamily: "var(--v3-font-mono)", fontWeight: 400,
                      fontSize: "clamp(9px, 0.3vw + 6px, 11px)",
                      color: isActive ? "var(--v3-accent)" : "var(--v3-fg-mute)",
                      letterSpacing: ".14em",
                      fontVariantNumeric: "tabular-nums",
                    }}>{String(i + 1).padStart(2, "0")}</span>
                    <span style={{
                      fontFamily: "var(--v3-font-display)", fontWeight: 340,
                      fontSize: "clamp(0.88rem, 0.4vw + 0.55rem, 1.05rem)", lineHeight: 1.2,
                      letterSpacing: "-.005em",
                      color: isActive ? "var(--v3-fg)" : "var(--v3-fg-dim)",
                      fontOpticalSizing: "auto",
                      minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>{cat}</span>
                    <span style={{
                      fontFamily: "var(--v3-font-mono)", fontWeight: 400,
                      fontSize: "clamp(9px, 0.3vw + 6px, 11px)",
                      letterSpacing: ".18em",
                      color: isActive ? "var(--v3-accent)" : "var(--v3-fg-mute)",
                      fontVariantNumeric: "tabular-nums", flexShrink: 0,
                    }}>{String(list.length).padStart(2, "0")}</span>
                  </button>
                );
              })}
            </div>

            {/* Detail column — radar chart */}
            <div style={{
              display: "flex", flexDirection: "column",
              gap: "clamp(8px, 0.8vw, 14px)",
              minWidth: 0, minHeight: 0,
            }}>
              {/* Detail header — track kicker + average % */}
              <div style={{
                display: "flex", alignItems: "baseline", justifyContent: "space-between",
                gap: 12,
              }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 10, minWidth: 0 }}>
                  <span aria-hidden style={{ width: 14, height: 1, background: "var(--v3-accent)", alignSelf: "center" }} />
                  <span style={{
                    fontFamily: "var(--v3-font-mono)", fontWeight: 400,
                    fontSize: "clamp(9px, 0.3vw + 6px, 11px)",
                    letterSpacing: ".24em", textTransform: "uppercase", color: "var(--v3-fg-mute)",
                    fontVariantNumeric: "tabular-nums",
                  }}>{activeName} · {geometry.axes.length}</span>
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                  <span style={{
                    fontFamily: "var(--v3-font-mono)", fontWeight: 400,
                    fontSize: "clamp(9px, 0.3vw + 6px, 11px)",
                    letterSpacing: ".22em", textTransform: "uppercase", color: "var(--v3-fg-mute)",
                  }}>Average</span>
                  <span style={{
                    fontFamily: "var(--v3-font-display)", fontWeight: 340,
                    fontSize: "clamp(1.05rem, 0.5vw + 0.6rem, 1.4rem)",
                    lineHeight: 1, letterSpacing: "-.01em",
                    color: "var(--v3-accent)", fontOpticalSizing: "auto",
                    fontVariantNumeric: "tabular-nums",
                  }}>{geometry.avg}%</span>
                </div>
              </div>

              {/* Chart — fixed-aspect square SVG, centered in the column. */}
              <div style={{
                flex: 1, minWidth: 0, minHeight: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                position: "relative",
              }}>
                <svg
                  viewBox="0 0 400 400"
                  preserveAspectRatio="xMidYMid meet"
                  style={{
                    width: "100%", height: "100%",
                    maxWidth: "min(100%, 520px)",
                    maxHeight: "100%",
                    overflow: "visible",
                  }}
                >
                  {/* Concentric hairline rings — 25/50/75/100% */}
                  {RING_LEVELS.map((frac, i) => (
                    <circle
                      key={i}
                      cx={CX} cy={CY} r={R * frac}
                      fill="none"
                      stroke="var(--v3-line)"
                      strokeWidth={frac === 1 ? 0.8 : 0.5}
                      opacity={frac === 1 ? 0.7 : 0.35}
                    />
                  ))}

                  {/* Ring tick labels — small mono figures at 3 o'clock */}
                  {RING_LEVELS.slice(0, -1).map((frac) => (
                    <text
                      key={`tick-${frac}`}
                      x={CX + R * frac + 4} y={CY - 2}
                      fontFamily="var(--v3-font-mono)"
                      fontSize={9}
                      fill="var(--v3-fg-mute)"
                      opacity={0.5}
                      letterSpacing=".08em"
                    >{Math.round(frac * 100)}</text>
                  ))}

                  {/* Axis rays */}
                  {geometry.axes.map((a, i) => (
                    <line
                      key={`ax-${activeName}-${i}`}
                      x1={CX} y1={CY} x2={a.outer.x} y2={a.outer.y}
                      stroke="var(--v3-line-strong)"
                      strokeWidth={0.5}
                      opacity={0.6}
                    />
                  ))}

                  {/* Filled polygon — cross-fade + scale-in on category change */}
                  {geometry.polygonPoints && (
                    <motion.polygon
                      key={`poly-${activeName}`}
                      points={geometry.polygonPoints}
                      fill="var(--v3-accent)"
                      fillOpacity={0.18}
                      stroke="var(--v3-accent)"
                      strokeWidth={1.2}
                      strokeLinejoin="round"
                      initial={reduce ? false : { opacity: 0, scale: 0.85, transformOrigin: `${CX}px ${CY}px` }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                      style={{ transformOrigin: `${CX}px ${CY}px` }}
                    />
                  )}

                  {/* Vertex dots + skill labels */}
                  {geometry.axes.map((a, i) => (
                    <motion.g
                      key={`v-${activeName}-${i}`}
                      initial={reduce ? false : { opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1], delay: 0.15 + i * 0.03 }}
                    >
                      {/* Vertex dot */}
                      <circle
                        cx={a.vertex.x} cy={a.vertex.y} r={3}
                        fill="var(--v3-accent)"
                        stroke="var(--v3-bg-void)"
                        strokeWidth={1.5}
                      />
                      {/* Skill name */}
                      <text
                        x={a.label.x} y={a.label.y}
                        textAnchor={a.anchor}
                        dominantBaseline={a.vAlign}
                        fontFamily="var(--v3-font-mono)"
                        fontSize={10.5}
                        fill="var(--v3-fg)"
                        letterSpacing=".04em"
                      >{a.skill.name}</text>
                      {/* Proficiency number, small, below the name */}
                      <text
                        x={a.label.x} y={a.label.y + (a.vAlign === "hanging" ? 12 : a.vAlign === "text-after-edge" ? -12 : 12)}
                        textAnchor={a.anchor}
                        dominantBaseline={a.vAlign}
                        fontFamily="var(--v3-font-mono)"
                        fontSize={9}
                        fill="var(--v3-accent)"
                        letterSpacing=".08em"
                        style={{ fontVariantNumeric: "tabular-nums" }}
                      >{a.skill.level}</text>
                    </motion.g>
                  ))}
                </svg>
              </div>
            </div>
          </div>
        </V3Scan>
      </div>
    </V3Frame>
  );
}
