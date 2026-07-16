/*
 * Projects — directory + selected-project spread (redesign 2026-07).
 * No cards. Fits inside the fixed 906px `.stellar-dossier-frame` with no scroll.
 *
 *   LEFT  — kicker · grouped directory (Professional / Personal),
 *           each row: index + project name + year.
 *   RIGHT — meta line · huge planet-tinted title · description · features
 *           (hairline-separated) · 2 big-number stats · tags line · github link.
 *
 * Click a project row to swap the right pane. Same interaction model as
 * Experience's role tabs, extended to a longer list via a categorized directory.
 * All fields from projects[] are rendered verbatim (src/content/index.js).
 */
import { memo, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { projects, sectionMeta } from "../../../content";

const Em = ({ children }) => (
  <em style={{ fontStyle: "normal", color: "var(--v3-accent)" }}>{children}</em>
);

/* Wrap a stat value's trailing non-word run (%, +) or letter suffix with Em. */
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

const S = {
  root: {
    width: "min(100%, clamp(880px, 72vw, 1240px))",
    height: "100%",
    display: "grid",
    gridTemplateColumns: "minmax(300px, 360px) 1fr",
    gap: "clamp(40px, 5vw, 80px)",
    pointerEvents: "auto",
    color: "var(--v3-fg)",
    fontFamily: "var(--v3-font-ui)",
    minHeight: 0,
  },

  /* ---- LEFT (directory) ---- */
  left: { display: "flex", flexDirection: "column", gap: 18, minHeight: 0 },
  kicker: {
    fontFamily: "var(--v3-font-mono)",
    fontSize: 11,
    letterSpacing: ".28em",
    textTransform: "uppercase",
    color: "var(--v3-fg-mute)",
  },
  groupWrap: { display: "flex", flexDirection: "column", gap: 0 },
  groupHead: {
    fontFamily: "var(--v3-font-mono)",
    fontSize: 10,
    letterSpacing: ".24em",
    textTransform: "uppercase",
    color: "var(--v3-accent)",
    padding: "14px 0 8px",
    borderBottom: "1px solid var(--v3-line-strong)",
  },
  row: (active) => ({
    all: "unset",
    cursor: "pointer",
    display: "grid",
    gridTemplateColumns: "28px 1fr auto",
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
  rowName: (active) => ({
    fontFamily: "var(--v3-font-display)",
    fontWeight: active ? 600 : 500,
    fontSize: 14,
    letterSpacing: "-.005em",
    color: active ? "var(--v3-fg)" : "var(--v3-fg-dim)",
    lineHeight: 1.25,
    transition: "color .18s ease, font-weight .18s ease",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  }),
  rowYear: {
    fontFamily: "var(--v3-font-mono)",
    fontSize: 10,
    letterSpacing: ".14em",
    color: "rgba(255,255,255,.28)",
  },

  /* ---- RIGHT (detail) ---- */
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
  title: {
    marginTop: 18,
    fontFamily: "var(--v3-font-display)",
    fontWeight: 700,
    fontSize: "clamp(30px, 3.4vw, 52px)",
    lineHeight: 0.95,
    letterSpacing: "-.02em",
    color: "color-mix(in oklab, var(--v3-accent) 62%, #ffffff 38%)",
    margin: "18px 0 0",
    overflowWrap: "break-word",
  },
  desc: {
    marginTop: 16,
    fontFamily: "var(--v3-font-ui)",
    fontSize: 14.5,
    lineHeight: 1.62,
    color: "var(--v3-fg-dim)",
    maxWidth: "72ch",
  },
  featuresWrap: { marginTop: 22 },
  featuresLbl: {
    fontFamily: "var(--v3-font-mono)",
    fontSize: 10,
    letterSpacing: ".24em",
    textTransform: "uppercase",
    color: "var(--v3-fg-mute)",
    borderTop: "1px solid var(--v3-line-strong)",
    padding: "12px 0 6px",
  },
  featureRow: {
    display: "grid",
    gridTemplateColumns: "20px 1fr",
    gap: 12,
    padding: "8px 0",
    borderBottom: "1px solid var(--v3-line)",
    alignItems: "baseline",
  },
  featureDot: {
    color: "var(--v3-accent)",
    fontFamily: "var(--v3-font-mono)",
    fontSize: 12,
    lineHeight: 1.5,
  },
  featureText: {
    fontSize: 13.5,
    lineHeight: 1.55,
    color: "var(--v3-fg-dim)",
  },
  statsRow: {
    marginTop: 20,
    padding: "14px 0",
    borderTop: "1px solid var(--v3-line)",
    borderBottom: "1px solid var(--v3-line)",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 24,
  },
  statN: {
    fontFamily: "var(--v3-font-display)",
    fontWeight: 700,
    fontSize: "clamp(22px, 2.2vw, 28px)",
    lineHeight: 1,
    letterSpacing: "-.01em",
  },
  statL: {
    fontFamily: "var(--v3-font-mono)",
    fontSize: 9,
    letterSpacing: ".22em",
    textTransform: "uppercase",
    color: "var(--v3-fg-mute)",
    marginTop: 6,
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
    fontSize: 12.5,
    lineHeight: 1.9,
    letterSpacing: ".01em",
  },
  tagItem: { color: "var(--v3-fg)" },
  tagSep: { color: "rgba(255,255,255,.20)", margin: "0 6px" },
  githubLink: {
    marginTop: 8,
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

const CINE = [0.25, 0.1, 0.25, 1];

const ProjectRow = memo(function ProjectRow({ project, n, active, onSelect }) {
  return (
    <button
      type="button"
      data-cursor
      onClick={onSelect}
      aria-pressed={active}
      style={S.row(active)}
      title={project.name}
    >
      <span style={S.rowN}>{String(n).padStart(2, "0")}</span>
      <span style={S.rowName(active)}>{project.name}</span>
      <span style={S.rowYear}>{project.year}</span>
    </button>
  );
});

const Detail = memo(function Detail({ project, reduced }) {
  if (!project) return null;
  const stats = project.stats || [];
  const tags = (project.tags || []).map((t) => (typeof t === "string" ? t : t?.name)).filter(Boolean);
  return (
    <motion.div
      key={project.name}
      initial={reduced ? {} : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: CINE }}
      style={{ display: "flex", flexDirection: "column", height: "100%" }}
    >
      <div style={S.metaRow}>
        <span><span style={S.metaK}>{project.type === "professional" ? "Professional" : "Personal"}</span></span>
        {project.status && <span>· {project.status}</span>}
        {project.year && <span>· {project.year}</span>}
        {project.team && <span>· {project.team}</span>}
      </div>

      <h1 style={S.title}>{project.name}</h1>

      {project.description && <p style={S.desc}>{project.description}</p>}

      {(project.features || []).length > 0 && (
        <div style={S.featuresWrap}>
          <div style={S.featuresLbl}>Highlights</div>
          {project.features.map((f, i) => (
            <div key={i} style={S.featureRow}>
              <span style={S.featureDot}>›</span>
              <span style={S.featureText}>{f}</span>
            </div>
          ))}
        </div>
      )}

      {stats.length > 0 && (
        <div style={S.statsRow}>
          {stats.slice(0, 2).map((s, i) => (
            <div key={i}>
              <div style={S.statN}>{emTail(s.value)}</div>
              <div style={S.statL}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      <div style={S.tagsWrap}>
        <div style={S.tagsLbl}>Stack</div>
        <div style={S.tagsRow}>
          {tags.map((it, i) => (
            <span key={i}>
              {i > 0 && <span style={S.tagSep}>·</span>}
              <span style={S.tagItem}>{it}</span>
            </span>
          ))}
        </div>
        {project.github && (
          <a href={project.github} target="_blank" rel="noopener noreferrer" style={S.githubLink} data-cursor>
            <span aria-hidden>↗</span> View on GitHub
          </a>
        )}
      </div>
    </motion.div>
  );
});

export default function ProjectsSection({ bootNonce }) {
  const reduced = useReducedMotion();

  /* Group by type, preserving authored order within each group. */
  const groups = useMemo(() => {
    const pro = [];
    const per = [];
    (projects || []).forEach((p) => {
      if (p.type === "personal") per.push(p);
      else pro.push(p);
    });
    return { pro, per, all: [...pro, ...per] };
  }, []);

  const [activeIdx, setActiveIdx] = useState(0);
  useEffect(() => { setActiveIdx(0); }, [bootNonce]);

  const active = groups.all[Math.min(activeIdx, groups.all.length - 1)];

  return (
    <div style={S.root}>
      {/* ================== LEFT ================== */}
      <div style={S.left}>
        <div style={S.kicker}>{sectionMeta.projects?.sub || "Explore my work"}</div>

        <div style={S.groupWrap}>
          <div style={S.groupHead}>Professional · {String(groups.pro.length).padStart(2, "0")}</div>
          {groups.pro.map((p, i) => (
            <ProjectRow
              key={p.name}
              project={p}
              n={i + 1}
              active={groups.all.indexOf(p) === activeIdx}
              onSelect={() => setActiveIdx(groups.all.indexOf(p))}
            />
          ))}
        </div>

        {groups.per.length > 0 && (
          <div style={S.groupWrap}>
            <div style={S.groupHead}>Personal · {String(groups.per.length).padStart(2, "0")}</div>
            {groups.per.map((p, i) => (
              <ProjectRow
                key={p.name}
                project={p}
                n={i + 1}
                active={groups.all.indexOf(p) === activeIdx}
                onSelect={() => setActiveIdx(groups.all.indexOf(p))}
              />
            ))}
          </div>
        )}
      </div>

      {/* ================== RIGHT ================== */}
      <div style={S.right}>
        <AnimatePresence mode="wait">
          <Detail key={active?.name || "empty"} project={active} reduced={reduced} />
        </AnimatePresence>
      </div>
    </div>
  );
}
