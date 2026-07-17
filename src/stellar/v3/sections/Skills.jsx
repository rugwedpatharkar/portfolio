/*
 * Skills — category directory + proficiency MAGNITUDE AXIS (redesign 2026-07 v2).
 * Each skill is a labeled STAR along a horizontal proficiency axis (60→100);
 * size + brightness scale with the level. No cards, no scroll — fits inside the
 * fixed 906px `.stellar-dossier-frame`.
 *
 *   LEFT  — kicker · huge Mars-tinted title · 9 category rows
 *           (each: index + name + count). Click a row to swap the axis.
 *   RIGHT — meta line · huge category title · magnitude axis with tick marks
 *           (60/70/80/90/100), labeled stars along it (label alternates
 *           above/below the rail to avoid overlap), legend below.
 *
 * All skills[] data rendered verbatim (src/content/index.js). Star size and
 * label placement are computed from level so the axis stays readable however
 * many skills are in the category.
 */
import { memo, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { skills, sectionMeta } from "../../../content";

const CINE = [0.25, 0.1, 0.25, 1];

/* Axis range — most skills sit 65-92; a bit of headroom below/above. */
const AXIS_MIN = 60;
const AXIS_MAX = 100;
const levelToPct = (l) => Math.max(0, Math.min(100, ((l - AXIS_MIN) / (AXIS_MAX - AXIS_MIN)) * 100));

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
  right: { display: "flex", flexDirection: "column", minHeight: 0, gap: 18 },
  headRow: {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: 24,
    alignItems: "baseline",
    paddingBottom: 14,
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

  /* Axis chart wrapper. Fixed height so label rows have known slots. */
  axisWrap: {
    position: "relative",
    height: 200,
    padding: "72px 24px 48px",
    background: "linear-gradient(180deg, rgba(255,255,255,.02) 0%, rgba(255,255,255,0) 100%)",
    border: "1px solid var(--v3-line)",
    borderRadius: 3,
    overflow: "hidden",
  },
  rail: {
    position: "absolute",
    left: 24,
    right: 24,
    top: "50%",
    height: 1,
    background: "linear-gradient(90deg, transparent, var(--v3-line-strong) 20%, color-mix(in oklab, var(--v3-accent) 60%, transparent))",
    transform: "translateY(-.5px)",
  },
  tick: {
    position: "absolute",
    top: "calc(50% - 6px)",
    width: 1,
    height: 12,
    background: "var(--v3-line)",
  },
  tickLbl: {
    position: "absolute",
    top: "calc(50% + 14px)",
    fontFamily: "var(--v3-font-mono)",
    fontSize: 9,
    letterSpacing: ".22em",
    color: "var(--v3-fg-mute)",
    transform: "translateX(-50%)",
  },
  star: (norm) => {
    const size = 3 + norm * 6; // 3px → 9px
    return {
      position: "absolute",
      top: "50%",
      width: size,
      height: size,
      marginLeft: -size / 2,
      marginTop: -size / 2,
      borderRadius: "50%",
      background: "color-mix(in oklab, var(--v3-accent) 60%, #ffffff 40%)",
      boxShadow: `0 0 ${8 + norm * 12}px color-mix(in oklab, var(--v3-accent) ${50 + norm * 30}%, transparent)`,
      opacity: 0.5 + norm * 0.5,
    };
  },
  starLbl: (above) => ({
    position: "absolute",
    top: above ? -32 : 22,
    fontFamily: "var(--v3-font-mono)",
    fontSize: 10,
    letterSpacing: ".04em",
    color: "var(--v3-fg)",
    transform: "translateX(-50%)",
    padding: "2px 6px",
    background: "rgba(5,6,9,.72)",
    borderRadius: 2,
    whiteSpace: "nowrap",
    pointerEvents: "none",
  }),
  starLvl: { color: "var(--v3-accent)", marginLeft: 6 },
  starGuide: (above) => ({
    position: "absolute",
    top: above ? "calc(50% - 20px)" : "calc(50% + 4px)",
    width: 1,
    height: 16,
    background: "rgba(255,255,255,.12)",
    transform: "translateX(-.5px)",
  }),

  legend: {
    display: "flex",
    gap: 24,
    flexWrap: "wrap",
    padding: "12px 0",
    borderTop: "1px solid var(--v3-line)",
    fontFamily: "var(--v3-font-mono)",
    fontSize: 10,
    letterSpacing: ".18em",
    textTransform: "uppercase",
    color: "var(--v3-fg-mute)",
  },
  legendK: { color: "var(--v3-fg)" },

  fallbackList: {
    marginTop: 4,
    paddingTop: 12,
    borderTop: "1px solid var(--v3-line)",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: "4px 24px",
    maxHeight: "18vh",
    overflow: "hidden",
    fontFamily: "var(--v3-font-mono)",
    fontSize: 11,
    letterSpacing: ".06em",
  },
  fallbackItem: {
    display: "flex",
    justifyContent: "space-between",
    padding: "2px 0",
    borderBottom: "1px dotted rgba(255,255,255,.06)",
  },
  fallbackName: { color: "var(--v3-fg-dim)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: 8 },
  fallbackLvl: { color: "var(--v3-accent)", fontVariantNumeric: "tabular-nums" },
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

const Axis = memo(function Axis({ list }) {
  /* Sort by level ascending so label placement below/above can alternate cleanly. */
  const sorted = useMemo(() => [...list].sort((a, b) => (a.level || 0) - (b.level || 0)), [list]);

  /* Group skills into buckets so labels at similar levels alternate rows. Two
     rows above the rail, two below — 4 vertical slots to space labels apart. */
  return (
    <div style={S.axisWrap}>
      <div style={S.rail} aria-hidden />
      {/* tick marks */}
      {[60, 70, 80, 90, 100].map((v) => (
        <div key={v}>
          <div style={{ ...S.tick, left: `calc(24px + ${levelToPct(v)}% * (100% - 48px) / 100)` }} />
          <div style={{ ...S.tickLbl, left: `calc(24px + ${levelToPct(v)}% * (100% - 48px) / 100)` }}>{v}</div>
        </div>
      ))}
      {/* stars — alternate above/below by index so adjacent labels don't collide */}
      {sorted.map((s, i) => {
        const norm = Math.min(1, Math.max(0, (s.level - AXIS_MIN) / (AXIS_MAX - AXIS_MIN)));
        const pct = levelToPct(s.level);
        const left = `calc(24px + ${pct}% * (100% - 48px) / 100)`;
        const above = i % 2 === 0;
        return (
          <div key={s.name} style={{ position: "absolute", left, top: "50%", pointerEvents: "auto" }} title={`${s.name} · ${s.level}`}>
            <div style={S.starGuide(above)} />
            <div style={S.star(norm)} />
            <div style={S.starLbl(above)}>
              {s.name}<span style={S.starLvl}>{s.level}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
});

const Detail = memo(function Detail({ catName, list, n, total, reduced }) {
  if (!list) return null;
  const peak = list.reduce((a, b) => (b.level > (a?.level ?? 0) ? b : a), null);
  const sorted = [...list].sort((a, b) => (b.level || 0) - (a.level || 0));

  return (
    <motion.div
      key={catName}
      initial={reduced ? {} : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: CINE }}
      style={{ display: "flex", flexDirection: "column", height: "100%", gap: 18 }}
    >
      <div style={S.headRow}>
        <h2 style={S.catTitle}>{catName}</h2>
        <div style={S.meta}>
          <div><span style={S.metaK}>Constellation</span></div>
          <div>{String(n).padStart(2, "0")} / {String(total).padStart(2, "0")} · {list.length} skills{peak ? ` · Peak ${peak.level}` : ""}</div>
        </div>
      </div>

      <Axis list={list} />

      <div style={S.legend}>
        <span><span style={S.legendK}>▲ Brightness</span> = proficiency</span>
        <span><span style={S.legendK}>─ Left</span> = 60 · <span style={S.legendK}>Right</span> = 100</span>
        <span>{list.length} skills across this constellation</span>
      </div>

      <div style={S.fallbackList}>
        {sorted.map((s) => (
          <div key={s.name} style={S.fallbackItem}>
            <span style={S.fallbackName}>{s.name}</span>
            <span style={S.fallbackLvl}>{s.level}</span>
          </div>
        ))}
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
