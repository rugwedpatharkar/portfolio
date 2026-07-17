/*
 * Skills — category directory + proficiency constellation (redesign 2026-07).
 * Each skill is a STAR in the selected category's constellation, sized and
 * brightened by its 0-100 proficiency level. No cards, no scroll — fits inside
 * the fixed 906px `.stellar-dossier-frame`.
 *
 *   LEFT  — kicker · huge Mars-tinted title · 9 category rows
 *           (each: index + name + count). Click a row to swap the constellation.
 *   RIGHT — meta line · constellation name · SVG star-field (skill = star sized
 *           by proficiency) · legend list (Space Mono, skill · level).
 *
 * All skills[] data rendered verbatim (src/content/index.js). Proficiency
 * mapping: size 2px → 8px, opacity 0.35 → 1.0. Positions are deterministic
 * (name-hash seeded) so the constellation stays stable across renders.
 */
import { memo, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { skills, sectionMeta } from "../../../content";

const CINE = [0.25, 0.1, 0.25, 1];

/* Small deterministic PRNG so each skill's position is stable across renders
   yet varies enough per skill/category to feel like a real constellation. */
const hash = (str) => {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};
const rng = (seed) => {
  let s = seed >>> 0;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >>> 17; s >>>= 0;
    s ^= s << 5;  s >>>= 0;
    return s / 4294967296;
  };
};

/* Distribute skills into an SVG viewBox using a poisson-ish spread so stars
   don't overlap into a blob. Deterministic per (category + name). */
const layoutStars = (categoryName, list) => {
  const W = 400;
  const H = 220;
  const PAD = 20;
  const rand = rng(hash(categoryName));
  const placed = [];
  const MIN_DIST = 22;
  const MAX_TRIES = 30;
  list.forEach((s) => {
    const nameRand = rng(hash(categoryName + "::" + s.name));
    let x, y, tries = 0;
    do {
      x = PAD + rand() * (W - PAD * 2) * 0.5 + nameRand() * (W - PAD * 2) * 0.5;
      y = PAD + rand() * (H - PAD * 2) * 0.5 + nameRand() * (H - PAD * 2) * 0.5;
      tries++;
      const clash = placed.some((p) => Math.hypot(p.x - x, p.y - y) < MIN_DIST);
      if (!clash) break;
    } while (tries < MAX_TRIES);
    placed.push({ x, y, ...s });
  });
  return { W, H, stars: placed };
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
  right: { display: "flex", flexDirection: "column", minHeight: 0, gap: 14 },
  metaRow: {
    display: "flex",
    gap: 20,
    flexWrap: "wrap",
    paddingBottom: 12,
    borderBottom: "1px solid var(--v3-line)",
    fontFamily: "var(--v3-font-mono)",
    fontSize: 10,
    letterSpacing: ".22em",
    textTransform: "uppercase",
    color: "var(--v3-fg-mute)",
  },
  metaK: { color: "var(--v3-fg)", fontWeight: 500 },
  catTitle: {
    fontFamily: "var(--v3-font-display)",
    fontWeight: 700,
    fontSize: "clamp(24px, 2.6vw, 34px)",
    lineHeight: 1,
    letterSpacing: "-.02em",
    color: "color-mix(in oklab, var(--v3-accent) 62%, #ffffff 38%)",
    margin: 0,
  },
  svgWrap: {
    position: "relative",
    border: "1px solid var(--v3-line)",
    background: "linear-gradient(180deg, rgba(255,255,255,.02) 0%, rgba(255,255,255,0) 100%)",
    borderRadius: 3,
    padding: 4,
  },
  svg: { width: "100%", height: "auto", display: "block" },
  hoverInfo: {
    position: "absolute",
    top: 8,
    right: 12,
    fontFamily: "var(--v3-font-mono)",
    fontSize: 10,
    letterSpacing: ".16em",
    textTransform: "uppercase",
    color: "var(--v3-accent)",
    pointerEvents: "none",
  },
  legendWrap: {
    marginTop: 6,
    paddingTop: 12,
    borderTop: "1px solid var(--v3-line)",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
    gap: "4px 20px",
    maxHeight: "22vh",
    overflow: "hidden",
  },
  legendItem: {
    display: "flex",
    justifyContent: "space-between",
    fontFamily: "var(--v3-font-mono)",
    fontSize: 11,
    letterSpacing: ".08em",
    padding: "2px 0",
    borderBottom: "1px dotted rgba(255,255,255,.06)",
  },
  legendName: { color: "var(--v3-fg)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: 8 },
  legendLvl: { color: "var(--v3-accent)", fontVariantNumeric: "tabular-nums" },
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

const Constellation = memo(function Constellation({ catName, list }) {
  const [hover, setHover] = useState(null);
  const layout = useMemo(() => layoutStars(catName, list), [catName, list]);
  const peak = useMemo(() => list.reduce((a, b) => (b.level > (a?.level ?? 0) ? b : a), null), [list]);

  return (
    <div style={S.svgWrap}>
      {hover && (
        <div style={S.hoverInfo}>
          {hover.name} · {hover.level}
        </div>
      )}
      <svg viewBox={`0 0 ${layout.W} ${layout.H}`} style={S.svg} aria-label={`${catName} constellation`}>
        {layout.stars.map((s) => {
          const norm = Math.min(1, Math.max(0, s.level / 100));
          const r = 2 + norm * 6;
          const glowR = r * 2.2;
          const opacity = 0.35 + norm * 0.6;
          return (
            <g
              key={s.name}
              style={{ cursor: "pointer" }}
              onMouseEnter={() => setHover(s)}
              onMouseLeave={() => setHover(null)}
            >
              <circle cx={s.x} cy={s.y} r={glowR} fill="var(--v3-accent)" opacity={opacity * 0.18} />
              <circle cx={s.x} cy={s.y} r={r} fill="color-mix(in oklab, var(--v3-accent) 60%, #ffffff 40%)" opacity={opacity} />
            </g>
          );
        })}
      </svg>
      {peak && (
        <div style={{ position: "absolute", bottom: 6, left: 12, fontFamily: "var(--v3-font-mono)", fontSize: 9, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--v3-fg-mute)", pointerEvents: "none" }}>
          Peak · {peak.name} · {peak.level}
        </div>
      )}
    </div>
  );
});

const Detail = memo(function Detail({ catName, list, n, total, reduced }) {
  if (!list) return null;
  const sorted = [...list].sort((a, b) => (b.level || 0) - (a.level || 0));
  return (
    <motion.div
      key={catName}
      initial={reduced ? {} : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: CINE }}
      style={{ display: "flex", flexDirection: "column", height: "100%", gap: 14 }}
    >
      <div style={S.metaRow}>
        <span><span style={S.metaK}>Constellation</span></span>
        <span>· {String(n).padStart(2, "0")} / {String(total).padStart(2, "0")}</span>
        <span>· {list.length} skills</span>
      </div>

      <h2 style={S.catTitle}>{catName}</h2>

      <Constellation catName={catName} list={list} />

      <div style={S.legendWrap}>
        {sorted.map((s) => (
          <div key={s.name} style={S.legendItem}>
            <span style={S.legendName}>{s.name}</span>
            <span style={S.legendLvl}>{s.level}</span>
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
