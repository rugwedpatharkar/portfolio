/*
 * FunFacts / Impact — masthead + editorial metric rows (redesign 2026-07 v2).
 * No cards, no borders, no boxed grid — same typography-only ethos as Skills.
 * The Sun disk on the right stays fully visible; content sits on the left.
 *
 *   LEFT  (top)     — kicker · huge Sol-tinted title · lede · receipt count.
 *   LEFT  (bottom)  — 8 metric ROWS (index + big Syne value + mono label +
 *                     Sora detail sentence), separated only by dotted hairlines.
 *
 * All fields from funFacts[] rendered verbatim (src/content/index.js).
 */
import { memo, useMemo } from "react";
import { motion, useReducedMotion } from "motion/react";
import { funFacts, sectionMeta } from "../../../content";

const CINE = [0.25, 0.1, 0.25, 1];

const S = {
  root: {
    /* Sun stop — the disk owns the right ~40%, so content stays in the left ~55vw. */
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
    fontSize: "clamp(32px, 3.4vw, 52px)",
    lineHeight: 0.94,
    letterSpacing: "-.02em",
    color: "color-mix(in oklab, var(--v3-accent) 62%, #ffffff 38%)",
    margin: 0,
    overflowWrap: "normal",
    wordBreak: "keep-all",
    hyphens: "none",
  },
  lede: {
    fontFamily: "var(--v3-font-ui)",
    fontSize: 13.5,
    lineHeight: 1.55,
    color: "var(--v3-fg-dim)",
    maxWidth: "30ch",
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

  /* ---- RIGHT (metric rows, no boxes) ---- */
  list: {
    display: "flex",
    flexDirection: "column",
    minHeight: 0,
  },
  row: {
    /* Tight vertical rhythm so all 8 receipts fit inside the 906px frame. */
    padding: "3px 0",
    borderBottom: "1px dotted rgba(255,255,255,.08)",
  },
  rowHead: {
    display: "grid",
    /* [idx  value  label] — inline. Detail wraps below on its own row so it
       gets the full column width and doesn't squeeze against the Sun. */
    gridTemplateColumns: "24px auto 1fr",
    gap: 14,
    alignItems: "baseline",
  },
  rowN: {
    fontFamily: "var(--v3-font-mono)",
    fontSize: 10,
    letterSpacing: ".14em",
    color: "var(--v3-accent)",
    paddingTop: 6,
  },
  value: {
    fontFamily: "var(--v3-font-display)",
    fontWeight: 700,
    fontSize: "clamp(24px, 2.6vw, 34px)",
    lineHeight: 1,
    letterSpacing: "-.02em",
    color: "color-mix(in oklab, var(--v3-accent) 62%, #ffffff 38%)",
    whiteSpace: "nowrap",
  },
  valueSuffix: { color: "var(--v3-accent)", fontStyle: "normal" },
  label: {
    fontFamily: "var(--v3-font-mono)",
    fontSize: 10,
    letterSpacing: ".22em",
    textTransform: "uppercase",
    color: "var(--v3-fg)",
    paddingTop: 6,
    justifySelf: "start",
  },
  detail: {
    fontFamily: "var(--v3-font-ui)",
    fontSize: 11.5,
    lineHeight: 1.4,
    color: "var(--v3-fg-mute)",
    margin: "2px 0 0 38px",
    maxWidth: "58ch",
  },
};

const MetricRow = memo(function MetricRow({ f, i, reduced }) {
  return (
    <motion.div
      initial={reduced ? {} : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.03 * i, ease: CINE }}
      style={S.row}
    >
      <div style={S.rowHead}>
        <span style={S.rowN}>{String(i + 1).padStart(2, "0")}</span>
        <span style={S.value}>
          {f.value}
          {f.suffix && <em style={S.valueSuffix}>{f.suffix}</em>}
        </span>
        <span style={S.label}>{f.label}</span>
      </div>
      {f.detail && <p style={S.detail}>{f.detail}</p>}
    </motion.div>
  );
});

export default function FunFactsSection({ bootNonce }) {
  const reduced = useReducedMotion();
  const meta = sectionMeta.funfacts || {};
  const facts = useMemo(() => funFacts || [], []);

  return (
    <div key={bootNonce} style={S.root}>
      {/* ================== LEFT (masthead) ================== */}
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

      {/* ================== RIGHT (rows, no boxes) ================== */}
      <div style={S.list}>
        {facts.map((f, i) => (
          <MetricRow key={f.label} f={f} i={i} reduced={reduced} />
        ))}
      </div>
    </div>
  );
}
