/*
 * What Sets Me Apart — pillar directory + featured pillar (redesign 2026-07).
 * No cards, no scroll — fits inside the fixed 906px `.stellar-dossier-frame`.
 *
 *   LEFT  — kicker · huge Neptune-tinted title · pillar directory
 *           (each row: big index + pillar title). Click a row to feature it.
 *   RIGHT — meta · huge planet-tinted pillar title · body prose · proof
 *           receipts (hairline chip row).
 *
 * All pillars[] entries rendered verbatim (src/content/index.js).
 */
import { memo, useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { pillars, sectionMeta } from "../../../content";

const CINE = [0.25, 0.1, 0.25, 1];

const S = {
  root: {
    width: "min(100%, clamp(880px, 72vw, 1240px))",
    height: "100%",
    display: "grid",
    gridTemplateColumns: "minmax(320px, 380px) 1fr",
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
    fontSize: "clamp(34px, 3.5vw, 52px)",
    lineHeight: 0.92,
    letterSpacing: "-.02em",
    color: "color-mix(in oklab, var(--v3-accent) 62%, #ffffff 38%)",
    margin: 0,
    overflowWrap: "normal",
    wordBreak: "keep-all",
    hyphens: "none",
    maxWidth: "18ch",
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
    gridTemplateColumns: "44px 1fr",
    gap: 12,
    alignItems: "baseline",
    padding: "11px 0",
    borderBottom: "1px solid var(--v3-line)",
    width: "100%",
    transition: "background .15s ease",
    background: active ? "color-mix(in oklab, var(--v3-accent) 8%, transparent)" : "transparent",
  }),
  rowN: {
    fontFamily: "var(--v3-font-mono)",
    fontSize: 11,
    letterSpacing: ".14em",
    color: "var(--v3-accent)",
  },
  rowTitle: (active) => ({
    fontFamily: "var(--v3-font-display)",
    fontWeight: active ? 600 : 500,
    fontSize: 14,
    letterSpacing: "-.005em",
    color: active ? "var(--v3-fg)" : "var(--v3-fg-dim)",
    lineHeight: 1.28,
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
  pillarTitle: {
    marginTop: 20,
    fontFamily: "var(--v3-font-display)",
    fontWeight: 700,
    fontSize: "clamp(30px, 3.2vw, 46px)",
    lineHeight: 1.02,
    letterSpacing: "-.02em",
    color: "color-mix(in oklab, var(--v3-accent) 62%, #ffffff 38%)",
    margin: "20px 0 0",
    maxWidth: "22ch",
  },
  body: {
    marginTop: 20,
    fontFamily: "var(--v3-font-ui)",
    fontSize: 15,
    lineHeight: 1.68,
    color: "var(--v3-fg-dim)",
    maxWidth: "68ch",
    margin: "20px 0 0",
  },
  proofWrap: { marginTop: "auto", paddingTop: 22 },
  proofLbl: {
    fontFamily: "var(--v3-font-mono)",
    fontSize: 10,
    letterSpacing: ".24em",
    textTransform: "uppercase",
    color: "var(--v3-fg-mute)",
    marginBottom: 10,
  },
  proofRow: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },
  proofChip: {
    fontFamily: "var(--v3-font-mono)",
    fontSize: 11,
    letterSpacing: ".12em",
    color: "var(--v3-fg)",
    padding: "6px 12px",
    border: "1px solid var(--v3-line-strong)",
    borderRadius: 3,
    background: "color-mix(in oklab, var(--v3-accent) 6%, transparent)",
  },
};

const PillarRow = memo(function PillarRow({ p, n, active, onSelect }) {
  return (
    <button type="button" data-cursor onClick={onSelect} aria-pressed={active} style={S.row(active)}>
      <span style={S.rowN}>{String(n).padStart(2, "0")}</span>
      <span style={S.rowTitle(active)}>{p.title}</span>
    </button>
  );
});

const Featured = memo(function Featured({ p, n, total, reduced }) {
  if (!p) return null;
  const proofs = p.proof || [];
  return (
    <motion.div
      key={p.title}
      initial={reduced ? {} : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: CINE }}
      style={{ display: "flex", flexDirection: "column", height: "100%" }}
    >
      <div style={S.metaRow}>
        <span><span style={S.metaK}>Pillar</span></span>
        <span>· {String(n).padStart(2, "0")} / {String(total).padStart(2, "0")}</span>
      </div>

      <h1 style={S.pillarTitle}>{p.title}</h1>

      {p.body && <p style={S.body}>{p.body}</p>}

      {proofs.length > 0 && (
        <div style={S.proofWrap}>
          <div style={S.proofLbl}>Receipts</div>
          <div style={S.proofRow}>
            {proofs.map((r, i) => <span key={i} style={S.proofChip}>{r}</span>)}
          </div>
        </div>
      )}
    </motion.div>
  );
});

export default function WhatSetsMeApartSection({ bootNonce }) {
  const reduced = useReducedMotion();
  const meta = sectionMeta.whatsetsmeapart || sectionMeta.whatSetsMeApart || {};
  const list = pillars || [];
  const [idx, setIdx] = useState(0);
  useEffect(() => { setIdx(0); }, [bootNonce]);
  const active = list[Math.min(idx, list.length - 1)];

  return (
    <div style={S.root}>
      {/* ================== LEFT ================== */}
      <div style={S.left}>
        <div style={S.kicker}>{meta.sub || "What sets me apart"}</div>
        <motion.h1
          initial={reduced ? {} : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: CINE }}
          style={S.title}
        >
          {meta.heading || "What Sets Me Apart"}
        </motion.h1>
        <div style={S.dirLabel}>{String(list.length).padStart(2, "0")} pillars</div>
        {list.map((p, i) => (
          <PillarRow key={p.title} p={p} n={i + 1} active={i === idx} onSelect={() => setIdx(i)} />
        ))}
      </div>

      {/* ================== RIGHT ================== */}
      <div style={S.right}>
        <AnimatePresence mode="wait">
          <Featured key={active?.title || "empty"} p={active} n={idx + 1} total={list.length} reduced={reduced} />
        </AnimatePresence>
      </div>
    </div>
  );
}
