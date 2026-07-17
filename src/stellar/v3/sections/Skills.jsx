/*
 * Skills — category directory + RANKED LADDER (redesign 2026-07 v3).
 * Typography-only, no charts, no borders, no cards — the planet behind stays
 * fully visible. Each skill is a Syne word sized by its proficiency tier so
 * the hierarchy reads instantly. Scales cleanly from 7 to 15+ skills per
 * category (unlike the axis chart, which crowded at high density).
 *
 *   LEFT  — kicker · huge Mars-tinted title · 9 category rows
 *           (each: index + name + count). Click a row to swap the ladder.
 *   RIGHT — meta line · huge category title · ladder of skills sorted by
 *           level. 4 tiers by proficiency (t1 huge · t2 large · t3 medium ·
 *           t4 small) each with a subtle proficiency bar and mono level readout.
 *
 * All skills[] data rendered verbatim (src/content/index.js).
 */
import { memo, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { skills, sectionMeta } from "../../../content";

const CINE = [0.25, 0.1, 0.25, 1];

/* Proficiency tier — determines typographic weight/size in the ladder.
   Thresholds chosen so most categories get a good spread across tiers. */
const tierOf = (lvl) => {
  if (lvl >= 88) return 1; // t1 — HUGE
  if (lvl >= 82) return 2; // t2 — large
  if (lvl >= 75) return 3; // t3 — medium
  return 4;                // t4 — small
};

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
    gridTemplateColumns: "28px 1fr auto",
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
  rowName: (active) => ({
    fontFamily: "var(--v3-font-display)",
    fontWeight: active ? 600 : 500,
    fontSize: 13,
    letterSpacing: "-.005em",
    color: active ? "var(--v3-fg)" : "var(--v3-fg-dim)",
    transition: "color .18s ease, font-weight .18s ease",
  }),
  rowCount: {
    fontFamily: "var(--v3-font-mono)",
    fontSize: 10,
    letterSpacing: ".14em",
    color: "rgba(255,255,255,.30)",
  },

  /* ---- RIGHT ---- */
  right: { display: "flex", flexDirection: "column", minHeight: 0, gap: 16 },
  headRow: {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: 24,
    alignItems: "baseline",
    paddingBottom: 12,
    borderBottom: "1px solid var(--v3-line-strong)",
  },
  catTitle: {
    fontFamily: "var(--v3-font-display)",
    fontWeight: 700,
    fontSize: "clamp(28px, 3vw, 42px)",
    lineHeight: 1,
    letterSpacing: "-.02em",
    color: "color-mix(in oklab, var(--v3-accent) 62%, #ffffff 38%)",
    margin: 0,
    overflowWrap: "normal",
    wordBreak: "keep-all",
    hyphens: "none",
  },
  meta: {
    fontFamily: "var(--v3-font-mono)",
    fontSize: 10,
    letterSpacing: ".22em",
    textTransform: "uppercase",
    color: "var(--v3-fg-mute)",
    textAlign: "right",
  },
  metaK: { color: "var(--v3-fg)", fontWeight: 500 },

  /* The ladder — a scrollless stack of skill "rungs" sorted by level desc.
     Sized/weighted by tier so hierarchy is instant. No borders, no card. */
  ladder: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    paddingTop: 6,
  },
  rung: (tier) => {
    /* Sizes tuned so 15 skills fit the 906px frame: tier 1 ~26, drop through 4. */
    const sizes = { 1: 26, 2: 20, 3: 16, 4: 13 };
    const weights = { 1: 700, 2: 600, 3: 500, 4: 500 };
    const colors = {
      1: "color-mix(in oklab, var(--v3-accent) 62%, #ffffff 38%)",
      2: "var(--v3-fg)",
      3: "var(--v3-fg-dim)",
      4: "var(--v3-fg-mute)",
    };
    return {
      display: "grid",
      gridTemplateColumns: "30px 1fr auto 70px",
      gap: 14,
      alignItems: "baseline",
      padding: "3px 0",
      borderBottom: "1px dotted rgba(255,255,255,.06)",
      fontFamily: "var(--v3-font-display)",
      fontWeight: weights[tier],
      fontSize: sizes[tier],
      letterSpacing: "-.01em",
      lineHeight: 1.05,
      color: colors[tier],
      transition: "color .18s ease",
    };
  },
  rungIdx: {
    fontFamily: "var(--v3-font-mono)",
    fontWeight: 400,
    fontSize: 10,
    letterSpacing: ".14em",
    color: "rgba(255,255,255,.28)",
    fontVariantNumeric: "tabular-nums",
    paddingTop: 4,
  },
  rungName: { minWidth: 0, overflowWrap: "break-word" },
  rungLvl: {
    fontFamily: "var(--v3-font-mono)",
    fontWeight: 400,
    fontSize: 12,
    letterSpacing: ".08em",
    color: "var(--v3-accent)",
    fontVariantNumeric: "tabular-nums",
    paddingTop: 4,
  },
  rungBar: (tier, norm) => {
    /* Small hairline proficiency bar aligned on the far right. Higher tiers
       get a brighter, glowing bar; lower tiers a dimmer neutral one. */
    return {
      width: "100%",
      height: 1,
      background: "rgba(255,255,255,.08)",
      position: "relative",
      alignSelf: "center",
      marginTop: 4,
    };
  },
  rungBarFill: (tier, norm) => ({
    position: "absolute",
    inset: 0,
    width: `${Math.round(norm * 100)}%`,
    background: tier === 1
      ? "linear-gradient(90deg, color-mix(in oklab, var(--v3-accent) 30%, transparent), var(--v3-accent))"
      : "color-mix(in oklab, var(--v3-accent) 55%, transparent)",
    boxShadow: tier === 1 ? "0 0 6px color-mix(in oklab, var(--v3-accent) 60%, transparent)" : "none",
  }),
  legend: {
    marginTop: "auto",
    paddingTop: 14,
    borderTop: "1px solid var(--v3-line)",
    display: "flex",
    gap: 24,
    flexWrap: "wrap",
    fontFamily: "var(--v3-font-mono)",
    fontSize: 10,
    letterSpacing: ".18em",
    textTransform: "uppercase",
    color: "var(--v3-fg-mute)",
  },
  legendK: { color: "var(--v3-fg)" },
};

const CategoryRow = memo(function CategoryRow({ name, count, n, active, onSelect }) {
  return (
    <button type="button" data-cursor onClick={onSelect} aria-pressed={active} style={S.row(active)}>
      <span style={S.rowN}>{String(n).padStart(2, "0")}</span>
      <span style={S.rowName(active)}>{name}</span>
      <span style={S.rowCount}>{count}</span>
    </button>
  );
});

const Rung = memo(function Rung({ s, n }) {
  const tier = tierOf(s.level);
  const norm = Math.max(0, Math.min(1, (s.level - 60) / 40));
  return (
    <div style={S.rung(tier)}>
      <span style={S.rungIdx}>{String(n).padStart(2, "0")}</span>
      <span style={S.rungName}>{s.name}</span>
      <span style={S.rungLvl}>{s.level}</span>
      <span style={S.rungBar(tier, norm)}>
        <span style={S.rungBarFill(tier, norm)} />
      </span>
    </div>
  );
});

const Detail = memo(function Detail({ catName, list, n, total, reduced }) {
  const sorted = useMemo(() => [...(list || [])].sort((a, b) => (b.level || 0) - (a.level || 0)), [list]);
  const tierCount = useMemo(() => {
    const c = { 1: 0, 2: 0, 3: 0, 4: 0 };
    sorted.forEach((s) => { c[tierOf(s.level)]++; });
    return c;
  }, [sorted]);
  if (!list) return null;
  const peak = sorted[0];

  return (
    <motion.div
      key={catName}
      initial={reduced ? {} : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: CINE }}
      style={{ display: "flex", flexDirection: "column", height: "100%", gap: 14, minHeight: 0 }}
    >
      <div style={S.headRow}>
        <h2 style={S.catTitle}>{catName}</h2>
        <div style={S.meta}>
          <div><span style={S.metaK}>Constellation</span></div>
          <div>{String(n).padStart(2, "0")} / {String(total).padStart(2, "0")} · {list.length} skills{peak ? ` · Peak ${peak.level}` : ""}</div>
        </div>
      </div>

      <div style={S.ladder}>
        {sorted.map((s, i) => <Rung key={s.name} s={s} n={i + 1} />)}
      </div>

      <div style={S.legend}>
        <span><span style={S.legendK}>Tier 01</span> · daily · {tierCount[1]}</span>
        <span><span style={S.legendK}>Tier 02</span> · strong · {tierCount[2]}</span>
        <span><span style={S.legendK}>Tier 03</span> · working · {tierCount[3]}</span>
        <span><span style={S.legendK}>Tier 04</span> · exposure · {tierCount[4]}</span>
      </div>
    </motion.div>
  );
});

export default function SkillsSection({ bootNonce }) {
  const reduced = useReducedMotion();
  const meta = sectionMeta.skills || {};
  const categories = useMemo(() => Object.keys(skills || {}), []);
  const [idx, setIdx] = useState(0);
  useEffect(() => { setIdx(0); }, [bootNonce]);
  const activeCat = categories[Math.min(idx, categories.length - 1)];
  const activeList = (skills || {})[activeCat] || [];
  const total = categories.length;
  const totalSkills = useMemo(() => {
    return categories.reduce((acc, k) => acc + ((skills || {})[k] || []).length, 0);
  }, [categories]);

  return (
    <div style={S.root}>
      {/* ================== LEFT ================== */}
      <div style={S.left}>
        <div style={S.kicker}>{meta.sub || "What I Bring to the Table"}</div>
        <motion.h1
          initial={reduced ? {} : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: CINE }}
          style={S.title}
        >
          {meta.heading || "Technical Skills"}
        </motion.h1>
        <div style={S.dirLabel}>{String(total).padStart(2, "0")} constellations · {totalSkills} skills</div>
        {categories.map((c, i) => (
          <CategoryRow
            key={c}
            name={c}
            count={(skills[c] || []).length}
            n={i + 1}
            active={i === idx}
            onSelect={() => setIdx(i)}
          />
        ))}
      </div>

      {/* ================== RIGHT ================== */}
      <div style={S.right}>
        <AnimatePresence mode="wait">
          <Detail
            key={activeCat}
            catName={activeCat}
            list={activeList}
            n={idx + 1}
            total={total}
            reduced={reduced}
          />
        </AnimatePresence>
      </div>
    </div>
  );
}
