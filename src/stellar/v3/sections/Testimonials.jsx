/*
 * Testimonials — source directory + featured quote (redesign 2026-07).
 * No cards, no scroll — fits inside the fixed 906px `.stellar-dossier-frame`.
 *
 *   LEFT  — kicker · huge Uranus-tinted title · source directory
 *           (each row: index + role + company). Click a row to feature it.
 *   RIGHT — mono attribution meta · giant Syne pull-quote glyph · quote body
 *           in Fraunces-italic-style (Syne italic-effect via slant) · attribution
 *           block · endorsements + related projects (hairline hairlines).
 *
 * All 3 testimonials[] entries rendered verbatim (src/content/index.js).
 */
import { memo, useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { testimonials, sectionMeta } from "../../../content";

const CINE = [0.25, 0.1, 0.25, 1];

const S = {
  root: {
    width: "min(100%, clamp(880px, 72vw, 1240px))",
    height: "100%",
    display: "grid",
    gridTemplateColumns: "minmax(300px, 360px) 1fr",
    gap: "clamp(40px, 5vw, 72px)",
    pointerEvents: "auto",
    color: "var(--v3-fg)",
    fontFamily: "var(--v3-font-ui)",
    minHeight: 0,
    alignItems: "start",
  },

  /* ---- LEFT (masthead + source list) ---- */
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
    paddingBottom: 4,
  },
  row: (active) => ({
    all: "unset",
    cursor: "pointer",
    display: "grid",
    gridTemplateColumns: "28px 1fr",
    gap: 10,
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
    paddingTop: 4,
  },
  rowRole: (active) => ({
    fontFamily: "var(--v3-font-display)",
    fontWeight: active ? 600 : 500,
    fontSize: 14,
    letterSpacing: "-.005em",
    color: active ? "var(--v3-fg)" : "var(--v3-fg-dim)",
    lineHeight: 1.25,
    transition: "color .18s ease, font-weight .18s ease",
  }),
  rowCo: {
    fontFamily: "var(--v3-font-mono)",
    fontSize: 10,
    letterSpacing: ".14em",
    color: "var(--v3-fg-mute)",
    marginTop: 4,
    display: "block",
  },

  /* ---- RIGHT (featured quote) ---- */
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
  quoteRow: {
    display: "grid",
    gridTemplateColumns: "64px 1fr",
    gap: 20,
    marginTop: 24,
  },
  quoteGlyph: {
    fontFamily: "var(--v3-font-display)",
    fontStyle: "italic",
    fontSize: "clamp(72px, 8vw, 120px)",
    lineHeight: 0.7,
    color: "color-mix(in oklab, var(--v3-accent) 62%, #ffffff 38%)",
    userSelect: "none",
  },
  quote: {
    fontFamily: "var(--v3-font-display)",
    fontStyle: "italic",
    fontWeight: 500,
    fontSize: "clamp(19px, 1.8vw, 26px)",
    lineHeight: 1.4,
    letterSpacing: "-.005em",
    color: "var(--v3-fg)",
    margin: 0,
    maxWidth: "58ch",
  },
  attribution: {
    marginTop: 22,
    paddingTop: 16,
    borderTop: "1px solid var(--v3-line)",
    display: "flex",
    flexWrap: "wrap",
    gap: "8px 24px",
    alignItems: "baseline",
  },
  attribName: {
    fontFamily: "var(--v3-font-display)",
    fontSize: 16,
    fontWeight: 600,
    letterSpacing: "-.005em",
    color: "color-mix(in oklab, var(--v3-accent) 62%, #ffffff 38%)",
  },
  attribRole: {
    fontFamily: "var(--v3-font-ui)",
    fontSize: 13,
    color: "var(--v3-fg-dim)",
  },
  rating: {
    marginLeft: "auto",
    fontFamily: "var(--v3-font-mono)",
    fontSize: 12,
    letterSpacing: ".2em",
    color: "var(--v3-accent)",
  },
  endorseWrap: {
    marginTop: 20,
    paddingTop: 14,
    borderTop: "1px solid var(--v3-line-strong)",
    display: "grid",
    gridTemplateColumns: "120px 1fr",
    gap: 20,
    alignItems: "baseline",
  },
  endorseLbl: {
    fontFamily: "var(--v3-font-mono)",
    fontSize: 10,
    letterSpacing: ".24em",
    textTransform: "uppercase",
    color: "var(--v3-fg-mute)",
  },
  endorseRow: {
    color: "var(--v3-fg-dim)",
    fontSize: 13,
    lineHeight: 1.9,
  },
  endorseItem: { color: "var(--v3-fg)" },
  endorseSep: { color: "rgba(255,255,255,.20)", margin: "0 6px" },
  ctxWrap: {
    marginTop: 14,
    paddingTop: 14,
    borderTop: "1px solid var(--v3-line)",
    display: "grid",
    gridTemplateColumns: "120px 1fr",
    gap: 20,
    alignItems: "baseline",
  },
};

const SourceRow = memo(function SourceRow({ t, n, active, onSelect }) {
  return (
    <button type="button" data-cursor onClick={onSelect} aria-pressed={active} style={S.row(active)}>
      <span style={S.rowN}>{String(n).padStart(2, "0")}</span>
      <span>
        <span style={S.rowRole(active)}>{t.role}</span>
        <span style={S.rowCo}>{t.company}</span>
      </span>
    </button>
  );
});

const Featured = memo(function Featured({ t, reduced }) {
  if (!t) return null;
  const projects = t.context?.projects || [];
  return (
    <motion.div
      key={t.name}
      initial={reduced ? {} : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: CINE }}
      style={{ display: "flex", flexDirection: "column", height: "100%" }}
    >
      <div style={S.metaRow}>
        <span><span style={S.metaK}>Endorsement</span></span>
        {t.context?.period && <span>· {t.context.period}</span>}
        <span>· via {t.company}</span>
      </div>

      <div style={S.quoteRow}>
        <span aria-hidden style={S.quoteGlyph}>&ldquo;</span>
        <p style={S.quote}>{t.quote}</p>
      </div>

      <div style={S.attribution}>
        <span style={S.attribName}>— {t.name}</span>
        <span style={S.attribRole}>{t.role}</span>
        {typeof t.rating === "number" && (
          <span style={S.rating} aria-label={`${t.rating} out of 5`}>
            {"★".repeat(t.rating)}
            <span style={{ color: "rgba(255,255,255,.20)" }}>{"★".repeat(Math.max(0, 5 - t.rating))}</span>
          </span>
        )}
      </div>

      {(t.endorsements || []).length > 0 && (
        <div style={S.endorseWrap}>
          <div style={S.endorseLbl}>Endorsed</div>
          <div style={S.endorseRow}>
            {t.endorsements.map((e, i) => (
              <span key={i}>
                {i > 0 && <span style={S.endorseSep}>·</span>}
                <span style={S.endorseItem}>{e}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {projects.length > 0 && (
        <div style={S.ctxWrap}>
          <div style={S.endorseLbl}>Projects</div>
          <div style={S.endorseRow}>
            {projects.map((p, i) => (
              <span key={i}>
                {i > 0 && <span style={S.endorseSep}>·</span>}
                <span style={S.endorseItem}>{p}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
});

export default function TestimonialsSection({ bootNonce }) {
  const reduced = useReducedMotion();
  const meta = sectionMeta.testimonials || {};
  const list = testimonials || [];
  const [idx, setIdx] = useState(0);
  useEffect(() => { setIdx(0); }, [bootNonce]);
  const active = list[Math.min(idx, list.length - 1)];

  return (
    <div style={S.root}>
      {/* ================== LEFT ================== */}
      <div style={S.left}>
        <div style={S.kicker}>{meta.sub || "What others say"}</div>
        <motion.h1
          initial={reduced ? {} : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: CINE }}
          style={S.title}
        >
          {meta.heading || "Testimonials"}
        </motion.h1>
        <div style={S.dirLabel}>{String(list.length).padStart(2, "0")} endorsements</div>
        {list.map((t, i) => (
          <SourceRow key={t.name} t={t} n={i + 1} active={i === idx} onSelect={() => setIdx(i)} />
        ))}
      </div>

      {/* ================== RIGHT ================== */}
      <div style={S.right}>
        <AnimatePresence mode="wait">
          <Featured key={active?.name || "empty"} t={active} reduced={reduced} />
        </AnimatePresence>
      </div>
    </div>
  );
}
