/*
 * Notes / Writing — post directory + featured note (redesign 2026-07).
 * No cards, no scroll — fits inside the fixed 906px `.stellar-dossier-frame`.
 *
 *   LEFT  — kicker · huge Ceres-tinted title · post directory
 *           (each row: index + title + date). Click a row to feature it.
 *   RIGHT — meta row (date · tag list) · huge planet-tinted post title ·
 *           full description prose · tags line · optional read-link.
 *
 * All blogPosts[] entries rendered verbatim (src/content/index.js).
 */
import { memo, useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { blogPosts, sectionMeta } from "../../../content";

const CINE = [0.25, 0.1, 0.25, 1];

const S = {
  root: {
    width: "min(100%, clamp(880px, 72vw, 1240px))",
    height: "100%",
    display: "grid",
    gridTemplateColumns: "minmax(300px, 380px) 1fr",
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
    fontSize: "clamp(36px, 3.8vw, 56px)",
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
    paddingBottom: 4,
  },
  row: (active) => ({
    all: "unset",
    cursor: "pointer",
    display: "grid",
    gridTemplateColumns: "28px 1fr auto",
    gap: 10,
    alignItems: "start",
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
    paddingTop: 3,
  },
  rowTitle: (active) => ({
    fontFamily: "var(--v3-font-display)",
    fontWeight: active ? 600 : 500,
    fontSize: 14,
    letterSpacing: "-.005em",
    color: active ? "var(--v3-fg)" : "var(--v3-fg-dim)",
    lineHeight: 1.25,
    transition: "color .18s ease, font-weight .18s ease",
  }),
  rowDate: {
    fontFamily: "var(--v3-font-mono)",
    fontSize: 10,
    letterSpacing: ".14em",
    color: "rgba(255,255,255,.28)",
    paddingTop: 3,
  },

  /* ---- RIGHT (featured note) ---- */
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
  noteTitle: {
    marginTop: 20,
    fontFamily: "var(--v3-font-display)",
    fontWeight: 700,
    fontSize: "clamp(28px, 3vw, 42px)",
    lineHeight: 1.05,
    letterSpacing: "-.02em",
    color: "color-mix(in oklab, var(--v3-accent) 62%, #ffffff 38%)",
    margin: "20px 0 0",
    maxWidth: "22ch",
  },
  desc: {
    marginTop: 20,
    fontFamily: "var(--v3-font-ui)",
    fontSize: 15,
    lineHeight: 1.68,
    color: "var(--v3-fg-dim)",
    maxWidth: "70ch",
    margin: "20px 0 0",
  },
  tagsWrap: { marginTop: "auto", paddingTop: 22 },
  tagsLbl: {
    fontFamily: "var(--v3-font-mono)",
    fontSize: 10,
    letterSpacing: ".24em",
    textTransform: "uppercase",
    color: "var(--v3-fg-mute)",
    marginBottom: 8,
  },
  tagsRow: {
    color: "var(--v3-fg-dim)",
    fontSize: 13,
    lineHeight: 1.9,
    letterSpacing: ".01em",
  },
  tagItem: { color: "var(--v3-fg)" },
  tagSep: { color: "rgba(255,255,255,.20)", margin: "0 6px" },
  readLink: {
    marginTop: 12,
    fontFamily: "var(--v3-font-mono)",
    fontSize: 11,
    letterSpacing: ".14em",
    color: "var(--v3-accent)",
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    pointerEvents: "auto",
  },
};

const NoteRow = memo(function NoteRow({ p, n, active, onSelect }) {
  return (
    <button type="button" data-cursor onClick={onSelect} aria-pressed={active} style={S.row(active)} title={p.title}>
      <span style={S.rowN}>{String(n).padStart(2, "0")}</span>
      <span style={S.rowTitle(active)}>{p.title}</span>
      <span style={S.rowDate}>{p.date}</span>
    </button>
  );
});

const Featured = memo(function Featured({ p, reduced }) {
  if (!p) return null;
  const tags = p.tags || [];
  return (
    <motion.div
      key={p.title}
      initial={reduced ? {} : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: CINE }}
      style={{ display: "flex", flexDirection: "column", height: "100%" }}
    >
      <div style={S.metaRow}>
        <span><span style={S.metaK}>Working notes</span></span>
        {p.date && <span>· {p.date}</span>}
        {tags.length > 0 && <span>· {tags.length} tag{tags.length === 1 ? "" : "s"}</span>}
      </div>

      <h1 style={S.noteTitle}>{p.title}</h1>

      {p.description && <p style={S.desc}>{p.description}</p>}

      <div style={S.tagsWrap}>
        {tags.length > 0 && (
          <>
            <div style={S.tagsLbl}>Tags</div>
            <div style={S.tagsRow}>
              {tags.map((it, i) => (
                <span key={i}>
                  {i > 0 && <span style={S.tagSep}>·</span>}
                  <span style={S.tagItem}>{it}</span>
                </span>
              ))}
            </div>
          </>
        )}
        {p.link && p.link !== "#" && (
          <a href={p.link} target="_blank" rel="noopener noreferrer" style={S.readLink} data-cursor>
            <span aria-hidden>↗</span> Read full note
          </a>
        )}
      </div>
    </motion.div>
  );
});

export default function NotesSection({ bootNonce }) {
  const reduced = useReducedMotion();
  const meta = sectionMeta.notes || {};
  const list = blogPosts || [];
  const [idx, setIdx] = useState(0);
  useEffect(() => { setIdx(0); }, [bootNonce]);
  const active = list[Math.min(idx, list.length - 1)];

  return (
    <div style={S.root}>
      {/* ================== LEFT ================== */}
      <div style={S.left}>
        <div style={S.kicker}>{meta.sub || "Working Notes"}</div>
        <motion.h1
          initial={reduced ? {} : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: CINE }}
          style={S.title}
        >
          {meta.heading || "Notes & Writing"}
        </motion.h1>
        <div style={S.dirLabel}>{String(list.length).padStart(2, "0")} notes · latest first</div>
        {list.map((p, i) => (
          <NoteRow key={p.title} p={p} n={i + 1} active={i === idx} onSelect={() => setIdx(i)} />
        ))}
      </div>

      {/* ================== RIGHT ================== */}
      <div style={S.right}>
        <AnimatePresence mode="wait">
          <Featured key={active?.title || "empty"} p={active} reduced={reduced} />
        </AnimatePresence>
      </div>
    </div>
  );
}
