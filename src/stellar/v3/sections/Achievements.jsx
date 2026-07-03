"use client";
/*
 * Achievements (Mars) — Bento asymmetric grid (design experiment #3).
 *
 * Mixed cell sizes. Two hero achievements (Star Performer of the
 * Quarter and 96% API Latency Reduction — one emotional, one metric)
 * occupy 2×2 cells with full accent framing. The rest render as
 * smaller supporting cells with muted framing. Hierarchy comes from
 * cell size + accent framing, not typography alone.
 *
 * Grid template (4 columns × 4 rows):
 *   "h1 h1 h2 h2"
 *   "h1 h1 h2 h2"
 *   "c1 c2 c3 c4"
 *   "c5 c5 c6 c6"
 *
 * Signature moment: hero cells fade in first (350 ms), then the
 * supporting cells cascade top-left → bottom-right in a wave.
 * Metric-driven cells (heroes or chips) tick their numeric value up
 * via V3Ticker.
 */
import { useMemo } from "react";
import { motion, useReducedMotion } from "motion/react";
import { achievements, sectionMeta } from "../../../content";
import { V3Frame, V3Scan, V3Ticker } from "../primitives";

const META = sectionMeta.achievements || {
  sub: "Milestones",
  heading: "Signals from the Wire",
};

const METRIC_RE = /^(\d+(?:\.\d+)?)([%+]?)[\s\-–—:·]*(.*)$/;
const parseMetric = (title = "") => {
  const m = String(title).match(METRIC_RE);
  if (!m) return null;
  return {
    value: Number(m[1]),
    suffix: m[2] || "",
    rest: (m[3] || "").trim() || String(title),
  };
};

const HERO_HITS = [/star performer/i, /latency reduction|96%/i];

/* Enumerate the layout areas we can fill. Order = display order.
   `type` distinguishes hero (2×2 accent) from support (1×1 muted).
   c5 and c6 are 2×1 wider supports; c1-c4 are 1×1 chips. */
const AREAS = [
  { area: "h1", type: "hero" },
  { area: "h2", type: "hero" },
  { area: "c1", type: "chip" },
  { area: "c2", type: "chip" },
  { area: "c3", type: "chip" },
  { area: "c4", type: "chip" },
  { area: "c5", type: "wide" },
  { area: "c6", type: "wide" },
];

const HeroCell = ({ a, metric, delay, reduce }) => {
  const title = metric?.rest || a.title;
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay }}
      style={{
        gridArea: a.area,
        display: "flex", flexDirection: "column",
        gap: "clamp(8px, 0.9vw, 16px)",
        padding: "clamp(16px, 1.5vw, 26px) clamp(16px, 1.6vw, 26px)",
        border: "1px solid var(--v3-accent)",
        borderRadius: 8,
        background: "color-mix(in oklab, var(--v3-accent) 8%, transparent)",
        boxShadow: "0 0 28px color-mix(in oklab, var(--v3-accent) 14%, transparent)",
        minWidth: 0, minHeight: 0, overflow: "hidden",
      }}
    >
      {/* Top row: metric-or-emoji + year */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, minWidth: 0 }}>
        {metric ? (
          <span style={{
            fontFamily: "var(--v3-font-display)", fontWeight: 340,
            fontSize: "clamp(2.6rem, 2.4vw + 1rem, 4rem)",
            lineHeight: 0.95, letterSpacing: "-.03em",
            color: "var(--v3-fg)", fontOpticalSizing: "auto",
            fontVariantNumeric: "tabular-nums",
            display: "inline-flex", alignItems: "baseline",
          }}>
            <V3Ticker
              value={metric.value}
              suffix={metric.suffix}
              decimals={Number.isInteger(metric.value) ? 0 : 1}
            />
          </span>
        ) : (
          <span aria-hidden style={{
            fontSize: "clamp(2.2rem, 2vw + 0.8rem, 3.2rem)",
            lineHeight: 1,
            filter: "drop-shadow(0 0 10px color-mix(in oklab, var(--v3-accent) 32%, transparent))",
          }}>{a.icon}</span>
        )}
        {a.year && (
          <span style={{
            fontFamily: "var(--v3-font-mono)", fontWeight: 400,
            fontSize: "clamp(9px, 0.3vw + 7px, 11px)",
            letterSpacing: ".26em", textTransform: "uppercase",
            color: "var(--v3-fg-mute)",
            fontVariantNumeric: "tabular-nums",
            whiteSpace: "nowrap",
          }}>Logged {a.year}</span>
        )}
      </div>

      {/* Title */}
      <h3 style={{
        fontFamily: "var(--v3-font-display)", fontWeight: 340,
        fontSize: "clamp(1.15rem, 0.8vw + 0.6rem, 1.65rem)",
        lineHeight: 1.15, letterSpacing: "-.01em",
        color: "var(--v3-fg)", margin: 0, fontOpticalSizing: "auto",
        overflowWrap: "anywhere",
      }}>{title}</h3>

      {/* Description */}
      {a.description && (
        <p style={{
          fontFamily: "var(--v3-font-ui)", fontWeight: 300,
          fontSize: "clamp(0.82rem, 0.3vw + 0.55rem, 0.95rem)",
          color: "var(--v3-fg-dim)", lineHeight: 1.55, margin: 0,
          maxWidth: "min(50ch, 100%)",
          overflowWrap: "break-word",
        }}>{a.description}</p>
      )}
    </motion.div>
  );
};

const SupportCell = ({ a, metric, area, wide, delay, reduce }) => {
  const title = metric?.rest || a.title;
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay }}
      style={{
        gridArea: area,
        display: "flex", flexDirection: "column",
        gap: "clamp(4px, 0.5vw, 10px)",
        padding: "clamp(10px, 1vw, 16px) clamp(12px, 1.1vw, 18px)",
        border: "1px solid var(--v3-line)",
        borderRadius: 6,
        background: "color-mix(in oklab, var(--v3-bg-void) 40%, transparent)",
        minWidth: 0, minHeight: 0, overflow: "hidden",
      }}
    >
      {/* Top: metric or icon + year */}
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
        {metric ? (
          <span style={{
            fontFamily: "var(--v3-font-display)", fontWeight: 340,
            fontSize: "clamp(1.3rem, 0.9vw + 0.6rem, 1.9rem)",
            lineHeight: 1, letterSpacing: "-.02em",
            color: "var(--v3-accent)", fontOpticalSizing: "auto",
            fontVariantNumeric: "tabular-nums",
          }}>
            <V3Ticker
              value={metric.value}
              suffix={metric.suffix}
              decimals={Number.isInteger(metric.value) ? 0 : 1}
            />
          </span>
        ) : (
          <span aria-hidden style={{
            fontSize: "clamp(1.2rem, 0.7vw + 0.6rem, 1.55rem)",
            lineHeight: 1,
          }}>{a.icon}</span>
        )}
        {a.year && (
          <span style={{
            fontFamily: "var(--v3-font-mono)", fontWeight: 400,
            fontSize: "clamp(8.5px, 0.25vw + 6px, 10px)",
            letterSpacing: ".22em", color: "var(--v3-fg-mute)",
            fontVariantNumeric: "tabular-nums",
            whiteSpace: "nowrap",
          }}>{a.year}</span>
        )}
      </div>

      {/* Title */}
      <span style={{
        fontFamily: "var(--v3-font-display)", fontWeight: 340,
        fontSize: "clamp(0.88rem, 0.35vw + 0.55rem, 1.05rem)",
        lineHeight: 1.2, letterSpacing: "-.005em",
        color: "var(--v3-fg)", fontOpticalSizing: "auto",
        overflowWrap: "anywhere",
      }}>{title}</span>

      {/* Description shown only in wide cells where there's room */}
      {wide && a.description && (
        <span style={{
          fontFamily: "var(--v3-font-ui)", fontWeight: 300,
          fontSize: "clamp(0.72rem, 0.22vw + 0.55rem, 0.82rem)",
          color: "var(--v3-fg-dim)", lineHeight: 1.5,
          overflowWrap: "break-word",
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}>{a.description}</span>
      )}
    </motion.div>
  );
};

export default function AchievementsSection({ index, bootNonce }) {
  const list = achievements || [];
  const reduce = useReducedMotion();

  /* Split into heroes (up to 2 titles matching HERO_HITS) + supporting
     (everything else in source order). Fall back to source order if
     fewer than 2 hero matches. */
  const { heroes, supporting } = useMemo(() => {
    const heroIdxs = new Set();
    HERO_HITS.forEach((re) => {
      const idx = list.findIndex((a, i) => !heroIdxs.has(i) && re.test(a.title || ""));
      if (idx >= 0) heroIdxs.add(idx);
    });
    while (heroIdxs.size < 2 && heroIdxs.size < list.length) {
      const idx = list.findIndex((_, i) => !heroIdxs.has(i));
      if (idx < 0) break;
      heroIdxs.add(idx);
    }
    const heroes = [];
    const supporting = [];
    list.forEach((a, i) => {
      if (heroIdxs.has(i)) heroes.push(a); else supporting.push(a);
    });
    return { heroes, supporting };
  }, [list]);

  /* Combined render list: heroes fill h1/h2, supporting fills c1..c6
     in order. Slice supporting to 6 max so the grid doesn't overflow;
     any extras drop off gracefully. */
  const cells = useMemo(() => {
    const combined = [
      ...heroes.slice(0, 2).map((a, i) => ({ a, layout: AREAS[i] })),
      ...supporting.slice(0, 6).map((a, i) => ({ a, layout: AREAS[i + 2] })),
    ];
    return combined;
  }, [heroes, supporting]);

  return (
    <V3Frame
      section="Achievements"
      planet="MARS"
      index={index}
      scanDir="circuit"
      scanKey={bootNonce}
      gridAreas={`"top top top" "left left ." "left left ." "left left ."`}
    >
      <div style={{
        gridArea: "left", display: "flex", flexDirection: "column",
        gap: "clamp(12px, 1.2vw, 20px)",
        minWidth: 0, minHeight: 0, overflow: "hidden",
        maxWidth: "min(60vw, 1200px)",
        height: "100%",
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

        {/* Bento grid */}
        <V3Scan variant="circuit" delay={0.15} style={{ minWidth: 0, flex: 1, minHeight: 0, display: "flex" }}>
          <div style={{
            width: "100%", height: "100%",
            display: "grid",
            gridTemplateAreas: `
              "h1 h1 h2 h2"
              "h1 h1 h2 h2"
              "c1 c2 c3 c4"
              "c5 c5 c6 c6"
            `,
            gridTemplateColumns: "1fr 1fr 1fr 1fr",
            gridTemplateRows: "1fr 1fr 0.9fr 0.9fr",
            gap: "clamp(8px, 0.9vw, 14px)",
            minWidth: 0, minHeight: 0,
          }}>
            {cells.map(({ a, layout }, i) => {
              const metric = parseMetric(a.title);
              /* Diagonal wave — later rows/cols enter later. */
              const isHero = layout.type === "hero";
              const delay = isHero
                ? 0.25 + i * 0.1
                : 0.5 + (i - 2) * 0.07;
              return isHero
                ? <HeroCell key={layout.area} a={a} metric={metric} delay={delay} reduce={reduce} />
                : <SupportCell key={layout.area} a={a} metric={metric} area={layout.area} wide={layout.type === "wide"} delay={delay} reduce={reduce} />;
            })}
          </div>
        </V3Scan>
      </div>
    </V3Frame>
  );
}
