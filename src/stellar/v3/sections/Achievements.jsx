/*
 * Achievements — milestone directory + featured milestone (redesign 2026-07 v2).
 * No cards, no scroll — matches the directory/detail pattern used by Testimonials,
 * Notes, Hobbies, WhatSetsMeApart, Education, Projects. Fits inside the fixed
 * 906px `.stellar-dossier-frame`.
 *
 *   LEFT  — kicker · huge Earth-tinted title · milestone directory grouped by
 *           year (year header, hairline; each row: index + icon + title + year).
 *           Click a row to feature it.
 *   RIGHT — meta line (year · index) · huge planet-tinted milestone title ·
 *           long-form description prose · icon badge for identity.
 *
 * All achievements[] entries rendered verbatim (src/content/index.js).
 */
import { memo, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { achievements, sectionMeta } from "../../../content";

const CINE = [0.25, 0.1, 0.25, 1];

const S = {
  root: {
    width: "min(100%, clamp(880px, 72vw, 1240px))",
    height: "100%",
    display: "grid",
    gridTemplateColumns: "minmax(320px, 400px) 1fr",
    gap: "clamp(40px, 5vw, 72px)",
    pointerEvents: "auto",
    color: "var(--v3-fg)",
    fontFamily: "var(--v3-font-ui)",
    minHeight: 0,
    alignItems: "start",
  },

  /* ---- LEFT (masthead + directory) ---- */
  left: { display: "flex", flexDirection: "column", gap: 16, minHeight: 0 },
  kicker: {
    fontFamily: "var(--v3-font-mono)",
    fontSize: 11,
    letterSpacing: ".28em",
    textTransform: "uppercase",
    color: "var(--v3-fg-mute)",
  },
  title: {
    fontFamily: "var(--v3-font-display)",
    fontWeight: 700,
    fontSize: "clamp(34px, 3.6vw, 54px)",
    lineHeight: 0.92,
    letterSpacing: "-.02em",
    color: "color-mix(in oklab, var(--v3-accent) 62%, #ffffff 38%)",
    margin: 0,
    overflowWrap: "normal",
    wordBreak: "keep-all",
    hyphens: "none",
  },
  count: {
    marginTop: 4,
    fontFamily: "var(--v3-font-mono)",
    fontSize: 10,
    letterSpacing: ".24em",
    textTransform: "uppercase",
    color: "var(--v3-accent)",
  },

  yearHead: {
    marginTop: 12,
    paddingBottom: 6,
    borderBottom: "1px solid var(--v3-line-strong)",
    fontFamily: "var(--v3-font-mono)",
    fontSize: 10,
    letterSpacing: ".24em",
    textTransform: "uppercase",
    color: "var(--v3-fg-mute)",
  },
  row: (active) => ({
    all: "unset",
    cursor: "pointer",
    display: "grid",
    gridTemplateColumns: "26px 22px 1fr auto",
    gap: 10,
    alignItems: "baseline",
    padding: "9px 0",
    borderBottom: "1px solid var(--v3-line)",
    width: "100%",
    transition: "background .15s ease",
    background: active ? "color-mix(in oklab, var(--v3-accent) 8%, transparent)" : "transparent",
  }),
  rowN: {
    fontFamily: "var(--v3-font-mono)",
    fontSize: 10,
    letterSpacing: ".14em",
    color: "var(--v3-accent)",
  },
  rowIcon: { fontSize: 14, lineHeight: 1 },
  rowTitle: (active) => ({
    fontFamily: "var(--v3-font-display)",
    fontWeight: active ? 600 : 500,
    fontSize: 13.5,
    letterSpacing: "-.005em",
    color: active ? "var(--v3-fg)" : "var(--v3-fg-dim)",
    lineHeight: 1.25,
    transition: "color .18s ease, font-weight .18s ease",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  }),
  rowYear: {
    fontFamily: "var(--v3-font-mono)",
    fontSize: 10,
    letterSpacing: ".14em",
    color: "rgba(255,255,255,.28)",
  },

  /* ---- RIGHT (featured milestone) ---- */
  right: { display: "flex", flexDirection: "column", minHeight: 0 },
  metaRow: {
    display: "flex",
    gap: 24,
    flexWrap: "wrap",
    paddingBottom: 14,
    borderBottom: "1px solid var(--v3-line)",
    fontFamily: "var(--v3-font-mono)",
    fontSize: 10,
    letterSpacing: ".22em",
    textTransform: "uppercase",
    color: "var(--v3-fg-mute)",
  },
  metaK: { color: "var(--v3-fg)", fontWeight: 500 },
  featureHead: {
    marginTop: 24,
    display: "grid",
    gridTemplateColumns: "auto 1fr",
    gap: 20,
    alignItems: "start",
  },
  iconBadge: {
    fontSize: "clamp(48px, 5vw, 72px)",
    lineHeight: 1,
    paddingTop: 4,
  },
  featureTitle: {
    fontFamily: "var(--v3-font-display)",
    fontWeight: 700,
    fontSize: "clamp(28px, 3vw, 44px)",
    lineHeight: 1.02,
    letterSpacing: "-.02em",
    color: "color-mix(in oklab, var(--v3-accent) 62%, #ffffff 38%)",
    margin: 0,
  },
  desc: {
    marginTop: 24,
    fontFamily: "var(--v3-font-ui)",
    fontSize: 15,
    lineHeight: 1.65,
    color: "var(--v3-fg-dim)",
    maxWidth: "62ch",
    margin: "24px 0 0",
    paddingTop: 20,
    borderTop: "1px solid var(--v3-line-strong)",
  },
  navRow: {
    marginTop: "auto",
    paddingTop: 22,
    borderTop: "1px solid var(--v3-line)",
    display: "flex",
    gap: 24,
    fontFamily: "var(--v3-font-mono)",
    fontSize: 10,
    letterSpacing: ".22em",
    textTransform: "uppercase",
    color: "var(--v3-fg-mute)",
  },
  navK: { color: "var(--v3-fg)", fontWeight: 500 },
};

const MilestoneRow = memo(function MilestoneRow({ a, n, active, onSelect }) {
  return (
    <button type="button" data-cursor onClick={onSelect} aria-pressed={active} style={S.row(active)} title={a.title}>
      <span style={S.rowN}>{String(n).padStart(2, "0")}</span>
      <span style={S.rowIcon} aria-hidden>{a.icon}</span>
      <span style={S.rowTitle(active)}>{a.title}</span>
      <span style={S.rowYear}>{a.year}</span>
    </button>
  );
});

const Featured = memo(function Featured({ a, n, total, reduced }) {
  if (!a) return null;
  return (
    <motion.div
      key={a.title}
      initial={reduced ? {} : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: CINE }}
      style={{ display: "flex", flexDirection: "column", height: "100%" }}
    >
      <div style={S.metaRow}>
        <span><span style={S.metaK}>Milestone</span></span>
        <span>· {String(n).padStart(2, "0")} / {String(total).padStart(2, "0")}</span>
        {a.year && <span>· {a.year}</span>}
      </div>

      <div style={S.featureHead}>
        <span style={S.iconBadge} aria-hidden>{a.icon}</span>
        <h1 style={S.featureTitle}>{a.title}</h1>
      </div>

      {a.description && <p style={S.desc}>{a.description}</p>}

      <div style={S.navRow}>
        <span><span style={S.navK}>Click any milestone</span> to expand</span>
      </div>
    </motion.div>
  );
});

export default function AchievementsSection({ bootNonce }) {
  const reduced = useReducedMotion();
  const meta = sectionMeta.achievements || {};

  /* Group by year, latest-first, preserving authored order within each year. */
  const grouped = useMemo(() => {
    const map = new Map();
    (achievements || []).forEach((a) => {
      const y = String(a.year || "—");
      if (!map.has(y)) map.set(y, []);
      map.get(y).push(a);
    });
    return [...map.entries()].sort(([a], [b]) => (a > b ? -1 : a < b ? 1 : 0));
  }, []);

  /* Flat list — for indexing (active milestone) + total count. */
  const flat = useMemo(() => grouped.flatMap(([, list]) => list), [grouped]);
  const total = flat.length;

  const [idx, setIdx] = useState(0);
  useEffect(() => { setIdx(0); }, [bootNonce]);
  const active = flat[Math.min(idx, total - 1)];

  let running = 0;

  return (
    <div style={S.root}>
      {/* ================== LEFT ================== */}
      <div style={S.left}>
        <div style={S.kicker}>{meta.sub || "Milestones"}</div>
        <motion.h1
          initial={reduced ? {} : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: CINE }}
          style={S.title}
        >
          {meta.heading || "Achievements"}
        </motion.h1>
        <div style={S.count}>{String(total).padStart(2, "0")} milestones · latest first</div>

        {grouped.map(([year, list]) => (
          <div key={year}>
            <div style={S.yearHead}>{year}</div>
            {list.map((a) => {
              const n = ++running;
              const flatIdx = flat.indexOf(a);
              return (
                <MilestoneRow
                  key={a.title}
                  a={a}
                  n={n}
                  active={flatIdx === idx}
                  onSelect={() => setIdx(flatIdx)}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* ================== RIGHT ================== */}
      <div style={S.right}>
        <AnimatePresence mode="wait">
          <Featured key={active?.title || "empty"} a={active} n={idx + 1} total={total} reduced={reduced} />
        </AnimatePresence>
      </div>
    </div>
  );
}
