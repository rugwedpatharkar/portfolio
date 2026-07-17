/*
 * Hobbies — hobby directory + featured hobby (redesign 2026-07).
 * No cards, no scroll — fits inside the fixed 906px `.stellar-dossier-frame`.
 *
 *   LEFT  — kicker · huge Saturn-tinted title · hobby directory
 *           (each row: index + icon + name). Click a row to feature it.
 *   RIGHT — meta line · huge planet-tinted hobby name · italic tagline ·
 *           detail prose · big stat readout · tag line.
 *
 * All hobbies[] entries rendered verbatim (src/content/index.js).
 */
import { memo, useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { hobbies, sectionMeta } from "../../../content";

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

  /* ---- LEFT ---- */
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
    fontSize: "clamp(34px, 3.6vw, 54px)",
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
    gridTemplateColumns: "26px 22px 1fr",
    gap: 10,
    alignItems: "baseline",
    padding: "10px 0",
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
  rowIcon: { fontSize: 15, lineHeight: 1 },
  rowName: (active) => ({
    fontFamily: "var(--v3-font-display)",
    fontWeight: active ? 600 : 500,
    fontSize: 14,
    letterSpacing: "-.005em",
    color: active ? "var(--v3-fg)" : "var(--v3-fg-dim)",
    transition: "color .18s ease, font-weight .18s ease",
  }),

  /* ---- RIGHT ---- */
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
  hobbyTitle: {
    marginTop: 18,
    fontFamily: "var(--v3-font-display)",
    fontWeight: 700,
    fontSize: "clamp(36px, 4vw, 64px)",
    lineHeight: 0.98,
    letterSpacing: "-.02em",
    color: "color-mix(in oklab, var(--v3-accent) 62%, #ffffff 38%)",
    margin: "18px 0 0",
  },
  tagline: {
    marginTop: 8,
    fontFamily: "var(--v3-font-display)",
    fontStyle: "italic",
    fontSize: "clamp(15px, 1.4vw, 19px)",
    color: "var(--v3-fg-dim)",
    lineHeight: 1.4,
    margin: "8px 0 0",
  },
  detail: {
    marginTop: 20,
    fontFamily: "var(--v3-font-ui)",
    fontSize: 15,
    lineHeight: 1.65,
    color: "var(--v3-fg-dim)",
    maxWidth: "62ch",
    margin: "20px 0 0",
  },
  statBox: {
    marginTop: 24,
    padding: "16px 20px",
    borderTop: "1px solid var(--v3-line-strong)",
    borderBottom: "1px solid var(--v3-line-strong)",
    display: "flex",
    alignItems: "baseline",
    gap: 16,
  },
  statN: {
    fontFamily: "var(--v3-font-display)",
    fontWeight: 700,
    fontSize: "clamp(30px, 3.2vw, 44px)",
    lineHeight: 1,
    letterSpacing: "-.02em",
    color: "color-mix(in oklab, var(--v3-accent) 62%, #ffffff 38%)",
  },
  statL: {
    fontFamily: "var(--v3-font-mono)",
    fontSize: 10,
    letterSpacing: ".22em",
    textTransform: "uppercase",
    color: "var(--v3-fg-mute)",
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
  },
  tagItem: { color: "var(--v3-fg)" },
  tagSep: { color: "rgba(255,255,255,.20)", margin: "0 6px" },
};

const HobbyRow = memo(function HobbyRow({ h, n, active, onSelect }) {
  return (
    <button type="button" data-cursor onClick={onSelect} aria-pressed={active} style={S.row(active)}>
      <span style={S.rowN}>{String(n).padStart(2, "0")}</span>
      <span style={S.rowIcon} aria-hidden>{h.icon}</span>
      <span style={S.rowName(active)}>{h.name}</span>
    </button>
  );
});

const Featured = memo(function Featured({ h, reduced }) {
  if (!h) return null;
  const tags = h.tags || [];
  return (
    <motion.div
      key={h.name}
      initial={reduced ? {} : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: CINE }}
      style={{ display: "flex", flexDirection: "column", height: "100%" }}
    >
      <div style={S.metaRow}>
        <span><span style={S.metaK}>Beyond the code</span></span>
        <span>· {h.icon} {h.name}</span>
      </div>

      <h1 style={S.hobbyTitle}>{h.name}</h1>
      {h.tagline && <p style={S.tagline}>{h.tagline}</p>}
      {h.detail && <p style={S.detail}>{h.detail}</p>}

      {h.stat && (
        <div style={S.statBox}>
          <span style={S.statN}>{h.stat.value}</span>
          <span style={S.statL}>{h.stat.label}</span>
        </div>
      )}

      {tags.length > 0 && (
        <div style={S.tagsWrap}>
          <div style={S.tagsLbl}>Tags</div>
          <div style={S.tagsRow}>
            {tags.map((it, i) => (
              <span key={i}>
                {i > 0 && <span style={S.tagSep}>·</span>}
                <span style={S.tagItem}>{it}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
});

export default function HobbiesSection({ bootNonce }) {
  const reduced = useReducedMotion();
  const meta = sectionMeta.hobbies || {};
  const list = hobbies || [];
  const [idx, setIdx] = useState(0);
  useEffect(() => { setIdx(0); }, [bootNonce]);
  const active = list[Math.min(idx, list.length - 1)];

  return (
    <div style={S.root}>
      {/* ================== LEFT ================== */}
      <div style={S.left}>
        <div style={S.kicker}>{meta.sub || "Beyond the Code"}</div>
        <motion.h1
          initial={reduced ? {} : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: CINE }}
          style={S.title}
        >
          {meta.heading || "Hobbies & Interests"}
        </motion.h1>
        <div style={S.dirLabel}>{String(list.length).padStart(2, "0")} interests</div>
        {list.map((h, i) => (
          <HobbyRow key={h.name} h={h} n={i + 1} active={i === idx} onSelect={() => setIdx(i)} />
        ))}
      </div>

      {/* ================== RIGHT ================== */}
      <div style={S.right}>
        <AnimatePresence mode="wait">
          <Featured key={active?.name || "empty"} h={active} reduced={reduced} />
        </AnimatePresence>
      </div>
    </div>
  );
}
