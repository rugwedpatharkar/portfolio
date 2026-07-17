/*
 * Education — degree directory + detail spread (redesign 2026-07).
 * Same directory/detail pattern as Projects/Experience, adapted for 4 education
 * levels. Fits inside the fixed 906px `.stellar-dossier-frame` with no scroll.
 *
 *   LEFT  — kicker · huge Jupiter-tinted title · degree directory (SSC → MSc,
 *           latest-first, each row: index + shortName + year).
 *   RIGHT — meta line (level · duration) · huge planet-tinted degree title ·
 *           institution · grade big-number · Highlights list (hairline rows).
 *
 * All educations[] entries rendered verbatim (src/content/index.js).
 */
import { memo, useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { educations, sectionMeta } from "../../../content";

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

  /* ---- LEFT (masthead + directory) ---- */
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
    fontSize: "clamp(36px, 4vw, 60px)",
    lineHeight: 0.92,
    letterSpacing: "-.02em",
    color: "color-mix(in oklab, var(--v3-accent) 62%, #ffffff 38%)",
    margin: 0,
    overflowWrap: "normal",
    wordBreak: "keep-all",
    hyphens: "none",
  },
  dirLabel: {
    marginTop: 8,
    paddingTop: 14,
    borderTop: "1px solid var(--v3-line-strong)",
    fontFamily: "var(--v3-font-mono)",
    fontSize: 10,
    letterSpacing: ".24em",
    textTransform: "uppercase",
    color: "var(--v3-accent)",
    paddingBottom: 8,
  },
  row: (active) => ({
    all: "unset",
    cursor: "pointer",
    display: "grid",
    gridTemplateColumns: "28px 1fr auto",
    gap: 10,
    alignItems: "baseline",
    padding: "12px 0",
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
  rowName: (active) => ({
    fontFamily: "var(--v3-font-display)",
    fontWeight: active ? 600 : 500,
    fontSize: 15,
    letterSpacing: "-.005em",
    color: active ? "var(--v3-fg)" : "var(--v3-fg-dim)",
    transition: "color .18s ease, font-weight .18s ease",
  }),
  rowYear: {
    fontFamily: "var(--v3-font-mono)",
    fontSize: 10,
    letterSpacing: ".14em",
    color: "rgba(255,255,255,.30)",
  },

  /* ---- RIGHT (detail) ---- */
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
  degreeTitle: {
    marginTop: 18,
    fontFamily: "var(--v3-font-display)",
    fontWeight: 700,
    fontSize: "clamp(30px, 3.2vw, 46px)",
    lineHeight: 0.98,
    letterSpacing: "-.02em",
    color: "color-mix(in oklab, var(--v3-accent) 62%, #ffffff 38%)",
    margin: "18px 0 0",
  },
  institution: {
    marginTop: 10,
    fontFamily: "var(--v3-font-ui)",
    fontSize: 15,
    fontStyle: "italic",
    color: "var(--v3-fg-dim)",
  },
  gradeRow: {
    marginTop: 22,
    padding: "16px 0",
    borderTop: "1px solid var(--v3-line-strong)",
    borderBottom: "1px solid var(--v3-line)",
    display: "flex",
    alignItems: "baseline",
    gap: 12,
  },
  gradeN: {
    fontFamily: "var(--v3-font-display)",
    fontWeight: 700,
    fontSize: "clamp(38px, 3.6vw, 52px)",
    lineHeight: 1,
    letterSpacing: "-.02em",
    color: "color-mix(in oklab, var(--v3-accent) 62%, #ffffff 38%)",
  },
  gradeSuffix: {
    color: "var(--v3-accent)",
    fontFamily: "var(--v3-font-display)",
    fontWeight: 700,
    fontSize: "clamp(24px, 2.2vw, 32px)",
  },
  gradeL: {
    fontFamily: "var(--v3-font-mono)",
    fontSize: 10,
    letterSpacing: ".22em",
    textTransform: "uppercase",
    color: "var(--v3-fg-mute)",
    marginLeft: "auto",
  },
  highlightsWrap: { marginTop: 22 },
  highlightsLbl: {
    fontFamily: "var(--v3-font-mono)",
    fontSize: 10,
    letterSpacing: ".24em",
    textTransform: "uppercase",
    color: "var(--v3-fg-mute)",
    borderTop: "1px solid var(--v3-line-strong)",
    padding: "12px 0 6px",
  },
  hlRow: {
    display: "grid",
    gridTemplateColumns: "20px 1fr",
    gap: 12,
    padding: "8px 0",
    borderBottom: "1px solid var(--v3-line)",
    alignItems: "baseline",
  },
  hlDot: {
    color: "var(--v3-accent)",
    fontFamily: "var(--v3-font-mono)",
    fontSize: 12,
  },
  hlText: {
    fontSize: 13.5,
    lineHeight: 1.55,
    color: "var(--v3-fg-dim)",
  },
};

const DirectoryRow = memo(function DirectoryRow({ e, n, active, onSelect }) {
  return (
    <button
      type="button"
      data-cursor
      onClick={onSelect}
      aria-pressed={active}
      style={S.row(active)}
    >
      <span style={S.rowN}>{String(n).padStart(2, "0")}</span>
      <span style={S.rowName(active)}>{e.shortName || e.degree}</span>
      <span style={S.rowYear}>{e.year}</span>
    </button>
  );
});

const Detail = memo(function Detail({ e, reduced }) {
  if (!e) return null;
  return (
    <motion.div
      key={e.degree}
      initial={reduced ? {} : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: CINE }}
      style={{ display: "flex", flexDirection: "column", height: "100%" }}
    >
      <div style={S.metaRow}>
        {e.level && <span><span style={S.metaK}>{e.level}</span></span>}
        {e.year && <span>· {e.year}</span>}
        {e.duration && <span>· {e.duration}</span>}
      </div>

      <h1 style={S.degreeTitle}>{e.degree}</h1>

      {e.name && <p style={S.institution}>{e.name}</p>}

      {typeof e.percentage === "number" && (
        <div style={S.gradeRow}>
          <span style={S.gradeN}>{e.percentage}</span>
          <span style={S.gradeSuffix}>%</span>
          <span style={S.gradeL}>Grade</span>
        </div>
      )}

      {(e.highlights || []).length > 0 && (
        <div style={S.highlightsWrap}>
          <div style={S.highlightsLbl}>Focus areas</div>
          {e.highlights.map((h, i) => (
            <div key={i} style={S.hlRow}>
              <span style={S.hlDot}>›</span>
              <span style={S.hlText}>{h}</span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
});

export default function EducationSection({ bootNonce }) {
  const reduced = useReducedMotion();
  const meta = sectionMeta.education || {};
  const list = educations || [];
  const [idx, setIdx] = useState(0);
  useEffect(() => { setIdx(0); }, [bootNonce]);
  const active = list[Math.min(idx, list.length - 1)];

  return (
    <div style={S.root}>
      {/* ================== LEFT ================== */}
      <div style={S.left}>
        <div style={S.kicker}>{meta.sub || "Academic Journey"}</div>
        <motion.h1
          initial={reduced ? {} : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: CINE }}
          style={S.title}
        >
          {meta.heading || "Education"}
        </motion.h1>
        <div style={S.dirLabel}>{String(list.length).padStart(2, "0")} milestones · latest first</div>
        {list.map((e, i) => (
          <DirectoryRow
            key={e.degree}
            e={e}
            n={i + 1}
            active={i === idx}
            onSelect={() => setIdx(i)}
          />
        ))}
      </div>

      {/* ================== RIGHT ================== */}
      <div style={S.right}>
        <AnimatePresence mode="wait">
          <Detail key={active?.degree || "empty"} e={active} reduced={reduced} />
        </AnimatePresence>
      </div>
    </div>
  );
}
