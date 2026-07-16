/*
 * FunFacts / Impact in Production — masthead + big-number tile grid (redesign 2026-07).
 * No cards, no scroll — fits inside the fixed 906px `.stellar-dossier-frame`.
 *
 *   LEFT  — kicker · huge Syne section title (planet-tinted) · short lede.
 *   RIGHT — 4×2 grid of big-number tiles. Each tile: index · Syne value with
 *           tinted suffix · mono label · Sora detail sentence.
 *
 * All fields from funFacts[] are rendered verbatim (src/content/index.js).
 * Every tile is a receipt — the detail line answers "why is this number impressive."
 */
import { memo, useMemo } from "react";
import { motion, useReducedMotion } from "motion/react";
import { funFacts, sectionMeta } from "../../../content";

const CINE = [0.25, 0.1, 0.25, 1];

const S = {
  root: {
    /* Kept narrower than Experience/Projects — Sun stop is `kind:"star"` and
       the camera pulls up close, so the Sun's disk + glow fills the right half
       of the viewport. Constraining the whole spread to the left ~55% keeps the
       tiles clear of it. */
    width: "min(100%, clamp(760px, 55vw, 980px))",
    height: "100%",
    display: "grid",
    gridTemplateColumns: "minmax(240px, 280px) 1fr",
    gap: "clamp(32px, 4vw, 56px)",
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
    fontSize: "clamp(32px, 3.4vw, 52px)",
    lineHeight: 0.94,
    letterSpacing: "-.02em",
    color: "color-mix(in oklab, var(--v3-accent) 62%, #ffffff 38%)",
    margin: 0,
    /* Prevent mid-word hyphenation ("Producti-on") when the column is narrow. */
    overflowWrap: "normal",
    wordBreak: "keep-all",
    hyphens: "none",
  },
  lede: {
    fontFamily: "var(--v3-font-ui)",
    fontSize: 14.5,
    lineHeight: 1.55,
    color: "var(--v3-fg-dim)",
    maxWidth: "34ch",
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

  /* ---- RIGHT (tile grid) ---- */
  grid: {
    display: "grid",
    /* 2 columns × 4 rows keeps tiles wide enough to read the values + labels
       + a two-line detail, while stacking vertically to stay in the safe zone
       away from the Sun's disk on the right. */
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 0,
    borderTop: "1px solid var(--v3-line-strong)",
    borderLeft: "1px solid var(--v3-line-strong)",
    alignSelf: "stretch",
  },
  tile: {
    padding: "14px 18px 16px",
    borderRight: "1px solid var(--v3-line-strong)",
    borderBottom: "1px solid var(--v3-line-strong)",
    display: "flex",
    flexDirection: "column",
    gap: 4,
    minHeight: 0,
  },
  tileHead: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    fontFamily: "var(--v3-font-mono)",
    fontSize: 9,
    letterSpacing: ".22em",
    textTransform: "uppercase",
    color: "var(--v3-fg-mute)",
  },
  tileIdx: { color: "var(--v3-accent)" },
  tileValue: {
    fontFamily: "var(--v3-font-display)",
    fontWeight: 700,
    fontSize: "clamp(28px, 2.6vw, 40px)",
    lineHeight: 1,
    letterSpacing: "-.02em",
    color: "color-mix(in oklab, var(--v3-accent) 62%, #ffffff 38%)",
    margin: "2px 0 4px",
  },
  tileSuffix: { color: "var(--v3-accent)", fontStyle: "normal" },
  tileLabel: {
    fontFamily: "var(--v3-font-mono)",
    fontSize: 10,
    letterSpacing: ".22em",
    textTransform: "uppercase",
    color: "var(--v3-fg)",
    marginBottom: 4,
  },
  tileDetail: {
    fontSize: 12,
    lineHeight: 1.5,
    color: "var(--v3-fg-mute)",
    margin: 0,
  },
};

const Tile = memo(function Tile({ f, i, reduced }) {
  return (
    <motion.div
      initial={reduced ? {} : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.05 * i, ease: CINE }}
      style={S.tile}
    >
      <div style={S.tileHead}>
        <span style={S.tileIdx}>{String(i + 1).padStart(2, "0")}</span>
        {f.icon && <span aria-hidden style={{ fontSize: 14, letterSpacing: 0 }}>{f.icon}</span>}
      </div>
      <div style={S.tileValue}>
        {f.value}
        {f.suffix && <em style={S.tileSuffix}>{f.suffix}</em>}
      </div>
      <div style={S.tileLabel}>{f.label}</div>
      {f.detail && <p style={S.tileDetail}>{f.detail}</p>}
    </motion.div>
  );
});

export default function FunFactsSection({ bootNonce }) {
  const reduced = useReducedMotion();
  const meta = sectionMeta.funfacts || {};
  const facts = useMemo(() => funFacts || [], []);

  return (
    <div key={bootNonce} style={S.root}>
      {/* ================== LEFT ================== */}
      <div style={S.left}>
        <div style={S.kicker}>{meta.sub || "Numbers I've moved"}</div>
        <motion.h1
          initial={reduced ? {} : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: CINE }}
          style={S.title}
        >
          {meta.heading || "Impact in Production"}
        </motion.h1>
        {meta.description && <p style={S.lede}>{meta.description}</p>}
        <div style={S.count}>{String(facts.length).padStart(2, "0")} receipts</div>
      </div>

      {/* ================== RIGHT (tiles) ================== */}
      <div style={S.grid}>
        {facts.map((f, i) => (
          <Tile key={f.label} f={f} i={i} reduced={reduced} />
        ))}
      </div>
    </div>
  );
}
