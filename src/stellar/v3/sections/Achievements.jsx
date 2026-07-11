/*
 * Achievements (Mars) — Hero + rundown, interactive.
 *
 * Design #1 (hero flagship + chip rundown) with a swap interaction:
 * every chip is clickable — clicking any chip promotes it to the hero
 * card. All 8 achievements stay visible in the chip grid; the active
 * chip gets an accent border + tinted background so it's clear which
 * one is currently featured.
 *
 * Signature moment: hero content (title + description) crossfades on
 * swap via AnimatePresence + shutter clip-path reveal, same technique
 * as Projects. Keyboard nav (ArrowLeft/Right or H/L) advances the
 * active chip.
 */
import { useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { achievements, sectionMeta } from "../../../content";
import { V3Frame, V3Scan, V3Ticker, V3SectionHeader } from "../primitives";
import { EASE, shutterVariants } from "../anim";

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

/* Pick the initial flagship — Star Performer if present, else list[0]. */
const FLAGSHIP_TITLE_RE = /star performer/i;
const pickFlagship = (list) => {
  const idx = list.findIndex((a) => FLAGSHIP_TITLE_RE.test(a.title || ""));
  return idx >= 0 ? idx : 0;
};

/* Shutter reveal on the flagship title. Vertical inset is negative so
   descenders don't get shaved by the clip-path. Same technique as
   Projects. */
const SHUTTER_VARIANTS = shutterVariants(0.08);

/* Hero body crossfade on active-index change. */
const HERO_BODY_VARIANTS = {
  hidden: { opacity: 0, y: 6 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.3, ease: EASE } },
  exit:   { opacity: 0, transition: { duration: 0.15 } },
};

export default function AchievementsSection({ bootNonce }) {
  const list = useMemo(() => achievements || [], []);
  const reduce = useReducedMotion();

  const initialIdx = useMemo(() => pickFlagship(list), [list]);
  const [active, setActive] = useState(initialIdx);

  const hero = list[active] || list[0];
  const heroMetric = hero ? parseMetric(hero.title) : null;
  const heroTitle = heroMetric?.rest || hero?.title || "";

  const goto = useCallback((i) => {
    if (i < 0 || i >= list.length || i === active) return;
    setActive(i);
  }, [active, list.length]);

  return (
    <V3Frame
      section="Achievements"
      planet="MARS"

      scanDir="circuit"
      scanKey={bootNonce}
      gridAreas={`"top top top" "left left ." "left left ." "left left ."`}
    >
      <div style={{
        gridArea: "left", display: "flex", flexDirection: "column",
        gap: "clamp(14px, 1.4vw, 22px)",
        minWidth: 0, minHeight: 0, overflow: "hidden",
        maxWidth: "min(60vw, 1200px)",
        height: "100%",
      }}>
        {/* Header */}
        <V3SectionHeader sub={META.sub} heading={META.heading} />

        {/* Hero card — content swaps via AnimatePresence when active changes */}
        {hero && (
          <V3Scan variant="horizontal" delay={0.15} style={{ minWidth: 0 }}>
            <div
              role="region"
              aria-live="polite"
              aria-label="Featured milestone"
              style={{
                display: "grid",
                gridTemplateColumns: "auto minmax(0, 1fr)",
                columnGap: "clamp(18px, 2vw, 32px)",
                alignItems: "start",
                padding: "clamp(16px, 1.6vw, 26px) clamp(18px, 1.8vw, 28px)",
                border: "1px solid var(--v3-accent)",
                borderRadius: 8,
                background: "color-mix(in oklab, var(--v3-accent) 8%, transparent)",
                boxShadow: "0 0 32px color-mix(in oklab, var(--v3-accent) 18%, transparent)",
                minWidth: 0,
                /* Fixed height — card never reflows when descriptions differ
                   in line count. Clamp keeps it fluid across viewports. */
                height: "clamp(180px, 14vw, 230px)",
                overflow: "hidden",
              }}
            >
              {/* Emblem — swaps with the active achievement */}
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={`emblem-${active}`}
                  initial={reduce ? false : { opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, transition: { duration: 0.12 } }}
                  transition={{ duration: 0.3, ease: EASE }}
                  style={{
                    fontSize: "clamp(2.4rem, 2.4vw + 1rem, 3.8rem)",
                    lineHeight: 1,
                    filter: "drop-shadow(0 0 12px color-mix(in oklab, var(--v3-accent) 42%, transparent))",
                    flexShrink: 0,
                    minHeight: "clamp(2.4rem, 2.4vw + 1rem, 3.8rem)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    minWidth: "clamp(2.4rem, 2.4vw + 1rem, 3.8rem)",
                  }}
                >{hero.icon || "★"}</motion.div>
              </AnimatePresence>

              {/* Body — badge + year (static) + swappable title + description */}
              <div style={{ display: "flex", flexDirection: "column", gap: "clamp(6px, 0.8vw, 14px)", minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    padding: "clamp(4px, 0.4vw, 6px) clamp(10px, 0.9vw, 14px)",
                    border: "1px solid var(--v3-accent)",
                    borderRadius: 999,
                    background: "color-mix(in oklab, var(--v3-accent) 14%, transparent)",
                    fontFamily: "var(--v3-font-mono)", fontWeight: 400,
                    fontSize: "clamp(9px, 0.3vw + 7px, 11px)",
                    letterSpacing: ".22em", textTransform: "uppercase",
                    color: "var(--v3-fg)",
                  }}>
                    <span aria-hidden style={{
                      width: 6, height: 6, borderRadius: "50%",
                      background: "var(--v3-accent)",
                      boxShadow: "0 0 8px var(--v3-accent)",
                    }} />
                    Featured milestone
                  </span>
                  {hero.year && (
                    <span style={{
                      fontFamily: "var(--v3-font-mono)", fontWeight: 400,
                      fontSize: "clamp(9px, 0.3vw + 7px, 11px)",
                      letterSpacing: ".26em", textTransform: "uppercase",
                      color: "var(--v3-fg-mute)",
                      fontVariantNumeric: "tabular-nums",
                    }}>Logged {hero.year}</span>
                  )}
                </div>

                {/* Title + description swap block */}
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={`body-${active}`}
                    variants={HERO_BODY_VARIANTS}
                    initial={reduce ? false : "hidden"}
                    animate="show"
                    exit="exit"
                    style={{ display: "flex", flexDirection: "column", gap: "clamp(6px, 0.7vw, 12px)", minWidth: 0 }}
                  >
                    <motion.h3
                      variants={reduce ? undefined : SHUTTER_VARIANTS}
                      style={{
                        fontFamily: "var(--v3-font-display)", fontWeight: 340,
                        fontSize: "clamp(1.5rem, 1.2vw + 0.9rem, 2.6rem)",
                        lineHeight: 1.15, letterSpacing: "-.015em",
                        color: "var(--v3-fg)", margin: 0, fontOpticalSizing: "auto",
                        overflowWrap: "anywhere",
                        paddingBottom: "0.05em",
                      }}>{heroTitle}</motion.h3>
                    {hero.description && (
                      <p style={{
                        fontFamily: "var(--v3-font-ui)", fontWeight: 300,
                        fontSize: "clamp(0.88rem, 0.35vw + 0.6rem, 1.02rem)",
                        color: "var(--v3-fg-dim)", lineHeight: 1.6, margin: 0,
                        maxWidth: "min(64ch, 100%)",
                        overflowWrap: "break-word",
                        /* Clamp to 2 lines so the card's fixed height stays
                           consistent regardless of description length. */
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}>{hero.description}</p>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </V3Scan>
        )}

        {/* Chip rundown — all 8 achievements, clickable */}
        {list.length > 0 && (
          <V3Scan variant="circuit" delay={0.28} style={{ minWidth: 0, flex: 1, minHeight: 0, display: "flex" }}>
            <div
              role="tablist"
              aria-label="Milestones"
              onKeyDown={(e) => {
                if (e.key === "ArrowRight" || e.key === "l") { goto((active + 1) % list.length); e.preventDefault(); }
                if (e.key === "ArrowLeft"  || e.key === "h") { goto((active - 1 + list.length) % list.length); e.preventDefault(); }
              }}
              style={{
                width: "100%", height: "100%",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(clamp(180px, 18vw, 240px), 1fr))",
                gap: "clamp(10px, 1vw, 16px)",
                alignContent: "start",
                minWidth: 0, minHeight: 0,
              }}
            >
              {list.map((a, i) => {
                const metric = parseMetric(a.title);
                const title = metric?.rest || a.title;
                const isActive = i === active;
                const delay = 0.35 + i * 0.06;
                return (
                  <motion.button
                    key={i}
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => goto(i)}
                    initial={reduce ? false : { opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.4, ease: EASE, delay }}
                    style={{
                      all: "unset", cursor: "pointer",
                      display: "flex", flexDirection: "column",
                      gap: "clamp(4px, 0.4vw, 8px)",
                      padding: "clamp(10px, 1vw, 16px) clamp(12px, 1.1vw, 18px)",
                      border: `1px solid ${isActive ? "var(--v3-accent)" : "var(--v3-line)"}`,
                      borderRadius: 6,
                      background: isActive
                        ? "color-mix(in oklab, var(--v3-accent) 10%, transparent)"
                        : "color-mix(in oklab, var(--v3-bg-void) 40%, transparent)",
                      boxShadow: isActive
                        ? "0 0 14px color-mix(in oklab, var(--v3-accent) 20%, transparent)"
                        : "none",
                      transition: "border-color .2s, background .2s, box-shadow .2s",
                      minWidth: 0,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
                      {metric ? (
                        <span style={{
                          fontFamily: "var(--v3-font-display)", fontWeight: 340,
                          fontSize: "clamp(1.5rem, 1vw + 0.7rem, 2rem)",
                          lineHeight: 1, letterSpacing: "-.02em",
                          color: isActive ? "var(--v3-accent)" : "var(--v3-fg)",
                          fontOpticalSizing: "auto",
                          fontVariantNumeric: "tabular-nums",
                          transition: "color .2s",
                        }}>
                          <V3Ticker
                            value={metric.value}
                            suffix={metric.suffix}
                            decimals={Number.isInteger(metric.value) ? 0 : 1}
                          />
                        </span>
                      ) : (
                        <span aria-hidden style={{
                          fontSize: "clamp(1.3rem, 0.9vw + 0.6rem, 1.7rem)",
                          lineHeight: 1,
                        }}>{a.icon}</span>
                      )}
                      {a.year && (
                        <span style={{
                          fontFamily: "var(--v3-font-mono)", fontWeight: 400,
                          fontSize: "clamp(8.5px, 0.25vw + 6px, 10px)",
                          letterSpacing: ".22em",
                          color: isActive ? "var(--v3-accent)" : "var(--v3-fg-mute)",
                          fontVariantNumeric: "tabular-nums",
                          whiteSpace: "nowrap",
                          transition: "color .2s",
                        }}>{a.year}</span>
                      )}
                    </div>
                    <span style={{
                      fontFamily: "var(--v3-font-display)", fontWeight: 340,
                      fontSize: "clamp(0.88rem, 0.35vw + 0.55rem, 1.02rem)",
                      lineHeight: 1.2, letterSpacing: "-.005em",
                      color: isActive ? "var(--v3-fg)" : "var(--v3-fg-dim)",
                      fontOpticalSizing: "auto",
                      overflowWrap: "anywhere",
                      transition: "color .2s",
                    }}>{title}</span>
                  </motion.button>
                );
              })}
            </div>
          </V3Scan>
        )}
      </div>
    </V3Frame>
  );
}
