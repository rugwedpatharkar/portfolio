/*
 * Achievements — masthead + chronological milestone rows (redesign 2026-07).
 * No cards, no scroll — fits inside the fixed 906px `.stellar-dossier-frame`.
 *
 *   LEFT  — kicker · huge Earth-tinted title · short lede · milestone count.
 *   RIGHT — milestones grouped by year (year header, mono, hairline top);
 *           each entry: icon + title (Syne) + description (Sora). Hairline
 *           separators between rows.
 *
 * All 8 achievements[] entries rendered verbatim (src/content/index.js).
 */
import { memo, useMemo } from "react";
import { motion, useReducedMotion } from "motion/react";
import { achievements, sectionMeta } from "../../../content";

const CINE = [0.25, 0.1, 0.25, 1];

const S = {
  root: {
    width: "min(100%, clamp(880px, 72vw, 1240px))",
    height: "100%",
    display: "grid",
    gridTemplateColumns: "minmax(280px, 340px) 1fr",
    gap: "clamp(40px, 5vw, 72px)",
    pointerEvents: "auto",
    color: "var(--v3-fg)",
    fontFamily: "var(--v3-font-ui)",
    minHeight: 0,
    alignItems: "start",
  },

  /* ---- LEFT (masthead) ---- */
  left: { display: "flex", flexDirection: "column", gap: 18, minHeight: 0 },
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
    fontSize: "clamp(36px, 3.8vw, 60px)",
    lineHeight: 0.92,
    letterSpacing: "-.02em",
    color: "color-mix(in oklab, var(--v3-accent) 62%, #ffffff 38%)",
    margin: 0,
    overflowWrap: "normal",
    wordBreak: "keep-all",
    hyphens: "none",
  },
  lede: {
    fontFamily: "var(--v3-font-ui)",
    fontSize: 14,
    lineHeight: 1.55,
    color: "var(--v3-fg-dim)",
    maxWidth: "36ch",
    margin: 0,
  },
  count: {
    marginTop: 6,
    paddingTop: 14,
    borderTop: "1px solid var(--v3-line)",
    fontFamily: "var(--v3-font-mono)",
    fontSize: 10,
    letterSpacing: ".24em",
    textTransform: "uppercase",
    color: "var(--v3-accent)",
  },

  /* ---- RIGHT (year-grouped list) ---- */
  right: { display: "flex", flexDirection: "column", gap: 0, minHeight: 0 },
  yearHead: {
    fontFamily: "var(--v3-font-mono)",
    fontSize: 10,
    letterSpacing: ".24em",
    textTransform: "uppercase",
    color: "var(--v3-accent)",
    padding: "14px 0 8px",
    borderBottom: "1px solid var(--v3-line-strong)",
  },
  yearHeadFirst: { paddingTop: 0 },
  row: {
    display: "grid",
    gridTemplateColumns: "36px 1fr",
    gap: 16,
    padding: "14px 0",
    borderBottom: "1px solid var(--v3-line)",
    alignItems: "start",
  },
  icon: {
    fontSize: 20,
    lineHeight: 1,
    paddingTop: 2,
  },
  entryTitle: {
    fontFamily: "var(--v3-font-display)",
    fontWeight: 600,
    fontSize: "clamp(15px, 1.35vw, 18px)",
    letterSpacing: "-.005em",
    color: "var(--v3-fg)",
    lineHeight: 1.25,
    margin: 0,
    marginBottom: 5,
  },
  entryDesc: {
    fontSize: 13,
    lineHeight: 1.55,
    color: "var(--v3-fg-dim)",
    margin: 0,
    maxWidth: "70ch",
  },
};

const Row = memo(function Row({ a, i, reduced }) {
  return (
    <motion.div
      initial={reduced ? {} : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.04 * i, ease: CINE }}
      style={S.row}
    >
      <span style={S.icon} aria-hidden>{a.icon}</span>
      <div>
        <h3 style={S.entryTitle}>{a.title}</h3>
        <p style={S.entryDesc}>{a.description}</p>
      </div>
    </motion.div>
  );
});

export default function AchievementsSection({ bootNonce }) {
  const reduced = useReducedMotion();
  const meta = sectionMeta.achievements || {};

  /* Group by year, sorted latest-first, preserving authored order within each year. */
  const grouped = useMemo(() => {
    const map = new Map();
    (achievements || []).forEach((a) => {
      const y = String(a.year || "—");
      if (!map.has(y)) map.set(y, []);
      map.get(y).push(a);
    });
    return [...map.entries()].sort(([a], [b]) => (a > b ? -1 : a < b ? 1 : 0));
  }, []);

  const total = (achievements || []).length;
  let entryIdx = 0;

  return (
    <div key={bootNonce} style={S.root}>
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
        {meta.description && <p style={S.lede}>{meta.description}</p>}
        <div style={S.count}>{String(total).padStart(2, "0")} milestones</div>
      </div>

      {/* ================== RIGHT ================== */}
      <div style={S.right}>
        {grouped.map(([year, list], gi) => (
          <div key={year}>
            <div style={gi === 0 ? { ...S.yearHead, ...S.yearHeadFirst } : S.yearHead}>{year}</div>
            {list.map((a) => {
              const i = entryIdx++;
              return <Row key={a.title} a={a} i={i} reduced={reduced} />;
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
