/*
 * Experience — role tabs + two-column editorial spread (redesign 2026-07).
 * Fits inside the fixed 906px `.stellar-dossier-frame` with NO scroll:
 *   LEFT column  — kicker · role tabs · Syne title · meta rows · award · 2x2 metrics · stack
 *   RIGHT column — subhead line · 5 hairline-separated Track rows; ONE track expanded (bullets)
 *
 * All experiences[] data is rendered verbatim (from src/content/index.js) — this
 * file is presentation only. Interaction: click a role tab to switch role (resets
 * active track to 0); click a track row to expand it (only one open at a time).
 * See scratchpad/section-tabs-2col.html for the visual target.
 */
import { memo, useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { experiences, sectionMeta } from "../../../content";

/* Emphasis span — paints in the accent colour. Used inside the title + metric numbers. */
const Em = ({ children }) => (
  <em style={{ fontStyle: "normal", color: "var(--v3-accent)" }}>{children}</em>
);

/* Split a role title into "head" + tinted "tail" word ("Software Engineer" → head "Software",
   tail "Engineer"). Deterministic; no per-role hard-coding. Falls back to the whole string
   tinted if only one word. */
const splitTitle = (str) => {
  const parts = (str || "").trim().split(/\s+/);
  if (parts.length <= 1) return { head: "", tail: str };
  return { head: parts.slice(0, -1).join(" "), tail: parts[parts.length - 1] };
};

/* Wrap a metric value's trailing non-word run (%, →, ×) or its trailing letter suffix
   (ms, MB) with <Em> so it gets the accent tint. "96%" → 96 + Em("%"); pure numbers pass. */
const emTail = (value) => {
  const s = String(value ?? "");
  const m = s.match(/^(.*?)([^\w]+|[a-zA-Z]+)$/);
  if (!m || m[1] === "") return s;
  return (
    <>
      {m[1]}
      <Em>{m[2]}</Em>
    </>
  );
};

/* Company display split — first word for the compact tab label; the rest for the meta line.
   "Upswing Cognitive Hospitality Solutions" → tab "Upswing", tail "Cognitive Hospitality Solutions". */
const splitCompany = (name) => {
  const parts = (name || "").trim().split(/\s+/);
  if (parts.length <= 1) return { short: name, tail: "" };
  return { short: parts[0], tail: parts.slice(1).join(" ") };
};

/* ---- styles ---- */
const S = {
  root: {
    width: "100%",
    height: "100%",
    display: "grid",
    gridTemplateColumns: "minmax(320px, 380px) 1fr",
    gap: "clamp(40px, 5vw, 80px)",
    pointerEvents: "auto",
    color: "var(--v3-fg)",
    fontFamily: "var(--v3-font-ui)",
    minHeight: 0,
  },

  /* ---- LEFT ---- */
  left: { display: "flex", flexDirection: "column", gap: 22, minHeight: 0 },
  kicker: {
    fontFamily: "var(--v3-font-mono)",
    fontSize: 11,
    letterSpacing: ".28em",
    textTransform: "uppercase",
    color: "var(--v3-fg-mute)",
  },
  tabs: {
    display: "flex",
    gap: 0,
    borderTop: "1px solid var(--v3-line)",
    borderBottom: "1px solid var(--v3-line)",
  },
  tab: {
    all: "unset",
    cursor: "pointer",
    flex: 1,
    padding: "12px 0",
    fontFamily: "var(--v3-font-mono)",
    fontSize: 11,
    letterSpacing: ".18em",
    textTransform: "uppercase",
    textAlign: "center",
    position: "relative",
    transition: "color .2s ease",
  },
  tabN: { color: "var(--v3-accent)", marginRight: 8 },
  tabUnderline: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: -1,
    height: 1,
    background: "var(--v3-accent)",
  },
  title: {
    fontFamily: "var(--v3-font-display)",
    fontWeight: 700,
    /* Left column caps ~380px — keep the title small enough that "Software"
       and "Engineer" each fit on their own line without mid-word breaks. */
    fontSize: "clamp(38px, 3.4vw, 60px)",
    lineHeight: 0.9,
    letterSpacing: "-.02em",
    /* Planet-tinted title. --v3-accent is the current stop's planet colour
       (Mercury gray, Mars ochre, Jupiter tan, …). Mixing 62% with white
       gives every planet's identity while staying legible against the scene. */
    color: "color-mix(in oklab, var(--v3-accent) 62%, #ffffff 38%)",
    margin: 0,
    overflowWrap: "normal",
    wordBreak: "keep-all",
    hyphens: "none",
  },
  meta: {
    marginTop: 4,
    fontFamily: "var(--v3-font-mono)",
    fontSize: 11,
    letterSpacing: ".22em",
    textTransform: "uppercase",
    color: "var(--v3-fg-mute)",
    lineHeight: 1.9,
  },
  metaK: { color: "var(--v3-fg)", fontWeight: 500 },
  award: {
    marginTop: 4,
    fontFamily: "var(--v3-font-mono)",
    fontSize: 10,
    letterSpacing: ".22em",
    textTransform: "uppercase",
    color: "var(--v3-accent)",
  },
  metrics: {
    marginTop: 8,
    padding: "16px 0",
    borderTop: "1px solid var(--v3-line)",
    borderBottom: "1px solid var(--v3-line)",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "14px 24px",
  },
  metricN: {
    fontFamily: "var(--v3-font-display)",
    fontWeight: 700,
    fontSize: "clamp(24px, 2.6vw, 32px)",
    lineHeight: 1,
    letterSpacing: "-.01em",
  },
  metricL: {
    fontFamily: "var(--v3-font-mono)",
    fontSize: 9,
    letterSpacing: ".22em",
    textTransform: "uppercase",
    color: "var(--v3-fg-mute)",
    marginTop: 6,
  },
  stack: { marginTop: "auto" },
  stackL: {
    fontFamily: "var(--v3-font-mono)",
    fontSize: 10,
    letterSpacing: ".24em",
    textTransform: "uppercase",
    color: "var(--v3-fg-mute)",
    marginBottom: 10,
  },
  stackRow: {
    color: "var(--v3-fg-dim)",
    fontSize: 13,
    lineHeight: 1.75,
    letterSpacing: ".01em",
  },
  stackItem: { color: "var(--v3-fg)" },
  stackSep: { color: "rgba(255,255,255,.20)", margin: "0 6px" },

  /* ---- RIGHT ---- */
  right: { display: "flex", flexDirection: "column", minHeight: 0 },
  rhead: {
    paddingBottom: 14,
    borderBottom: "1px solid var(--v3-line-strong)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    gap: 16,
  },
  rheadK: {
    fontFamily: "var(--v3-font-mono)",
    fontSize: 11,
    letterSpacing: ".24em",
    textTransform: "uppercase",
    color: "var(--v3-accent)",
  },
  rheadN: {
    fontFamily: "var(--v3-font-mono)",
    fontSize: 10,
    letterSpacing: ".22em",
    textTransform: "uppercase",
    color: "var(--v3-fg-mute)",
  },
  tracks: { marginTop: 8, minHeight: 0, overflow: "hidden" },
  trackBtn: (expanded) => ({
    all: "unset",
    display: "grid",
    gridTemplateColumns: "44px 1fr auto",
    gap: 16,
    alignItems: "baseline",
    padding: "12px 0",
    borderBottom: "1px solid var(--v3-line)",
    width: "100%",
    cursor: "pointer",
    color: "inherit",
    transition: "background .15s ease",
    ...(expanded ? {} : {}),
  }),
  trackIdx: {
    fontFamily: "var(--v3-font-mono)",
    fontSize: 11,
    color: "var(--v3-accent)",
    letterSpacing: ".14em",
  },
  trackH: (expanded) => ({
    fontFamily: "var(--v3-font-display)",
    fontWeight: expanded ? 600 : 500,
    fontSize: "clamp(17px, 1.5vw, 20px)",
    letterSpacing: "-.01em",
    color: expanded ? "var(--v3-fg)" : "var(--v3-fg-dim)",
    lineHeight: 1.15,
    transition: "color .18s ease, font-weight .18s ease",
  }),
  trackCount: {
    fontFamily: "var(--v3-font-mono)",
    fontSize: 10,
    letterSpacing: ".16em",
    color: "rgba(255,255,255,.28)",
  },
  trackBody: {
    padding: "6px 0 14px 60px",
    borderBottom: "1px solid var(--v3-line)",
  },
  trackP: {
    margin: "8px 0 0",
    color: "var(--v3-fg-dim)",
    fontSize: 13.5,
    lineHeight: 1.62,
    maxWidth: "70ch",
  },
};

const CINE = [0.25, 0.1, 0.25, 1];

const TrackRow = memo(function TrackRow({ track, i, expanded, onSelect, motionOn }) {
  const count = (track.points || []).length;
  return (
    <>
      <button
        type="button"
        data-cursor
        onClick={() => onSelect(i)}
        aria-expanded={expanded}
        style={S.trackBtn(expanded)}
      >
        <span style={S.trackIdx}>{String(i + 1).padStart(2, "0")}</span>
        <span style={S.trackH(expanded)}>{track.name}</span>
        <span style={S.trackCount}>{count} ops</span>
      </button>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="body"
            initial={motionOn ? { opacity: 0, height: 0 } : { opacity: 1, height: "auto" }}
            animate={{ opacity: 1, height: "auto" }}
            exit={motionOn ? { opacity: 0, height: 0 } : { opacity: 0 }}
            transition={{ duration: 0.35, ease: CINE }}
            style={{ overflow: "hidden" }}
          >
            <div style={S.trackBody}>
              {(track.points || []).map((p, j) => (
                <p key={j} style={S.trackP}>{p}</p>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});

export default function ExperienceSection({ bootNonce }) {
  const roles = experiences || [];
  const [roleIdx, setRoleIdx] = useState(0);
  const [trackIdx, setTrackIdx] = useState(0);
  const reduced = useReducedMotion();

  /* Reset selection on section re-mount (bootNonce changes when nav happens). */
  useEffect(() => {
    setRoleIdx(0);
    setTrackIdx(0);
  }, [bootNonce]);

  if (!roles.length) return null;
  const role = roles[Math.min(roleIdx, roles.length - 1)];
  const tracks = role.categories || [];
  const activeTrackIdx = Math.min(trackIdx, Math.max(0, tracks.length - 1));

  const handleRole = (i) => {
    setRoleIdx(i);
    setTrackIdx(0);
  };

  const { head, tail } = splitTitle(role.title);
  const { short: coShort, tail: coTail } = splitCompany(role.companyName);
  const metrics = (role.metrics || []).slice(0, 4);
  const stack = role.tech || [];
  const totalTracks = tracks.length;

  return (
    <div style={S.root}>
      {/* ================== LEFT ================== */}
      <div style={S.left}>
        <div style={S.kicker}>{sectionMeta.experience?.sub || "Where I've worked"}</div>

        {roles.length > 1 && (
          <div style={S.tabs} role="tablist" aria-label="Roles">
            {roles.map((r, i) => {
              const active = i === roleIdx;
              const { short } = splitCompany(r.companyName);
              return (
                <button
                  key={r.companyName + i}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  data-cursor
                  onClick={() => handleRole(i)}
                  style={{ ...S.tab, color: active ? "var(--v3-fg)" : "var(--v3-fg-mute)" }}
                >
                  <span style={S.tabN}>{String(i + 1).padStart(2, "0")}</span>
                  {short}
                  {active && <span style={S.tabUnderline} aria-hidden />}
                </button>
              );
            })}
          </div>
        )}

        <motion.h1
          key={`title-${roleIdx}`}
          initial={reduced ? {} : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: CINE }}
          style={S.title}
        >
          {head}
          {head ? <br /> : null}
          {tail}
        </motion.h1>

        <div style={S.meta}>
          <div>
            <span style={S.metaK}>{coShort}</span>
            {coTail ? ` · ${coTail}` : ""}
          </div>
          <div>
            <span style={S.metaK}>Tenure</span> · {role.date}
          </div>
        </div>

        {role.achievement && <div style={S.award}>★ {role.achievement}</div>}

        {metrics.length > 0 && (
          <div style={S.metrics}>
            {metrics.map((m, i) => (
              <div key={i}>
                <div style={S.metricN}>{emTail(m.value)}</div>
                <div style={S.metricL}>{m.label}</div>
              </div>
            ))}
          </div>
        )}

        {stack.length > 0 && (
          <div style={S.stack}>
            <div style={S.stackL}>Stack</div>
            <div style={S.stackRow}>
              {stack.map((it, i) => (
                <span key={i}>
                  {i > 0 && <span style={S.stackSep}>·</span>}
                  <span style={S.stackItem}>{it}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ================== RIGHT ================== */}
      <div style={S.right}>
        <div style={S.rhead}>
          <div style={S.rheadK}>Mission tracks · {totalTracks} disciplines</div>
          <div style={S.rheadN}>
            Track {String(activeTrackIdx + 1).padStart(2, "0")} / {String(totalTracks).padStart(2, "0")} open ·
            click to swap
          </div>
        </div>

        <div style={S.tracks}>
          {tracks.map((t, i) => (
            <TrackRow
              key={`${roleIdx}-${i}-${t.name}`}
              track={t}
              i={i}
              expanded={i === activeTrackIdx}
              onSelect={setTrackIdx}
              motionOn={!reduced}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
