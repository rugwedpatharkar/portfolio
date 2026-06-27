import { motion, AnimatePresence, useReducedMotion } from "motion/react";

/*
 * PHASE 2B — the per-ITEM dossier. When ←→ focuses a lane object, this replaces the
 * section panel with that item's own readout (role / project / skill / degree …),
 * normalised in data/sectionItems.js. Holographic scan-reveal (sweep + staggered
 * flicker-in), reduced-motion → instant. Left-anchored to match the section panel.
 */

const DISP = "'Chakra Petch', sans-serif";
const MONO = "'JetBrains Mono', monospace";
const AMBER = "#f8c555";

const ItemDossier = ({ item, index = 0, total = 0, sectionLabel = "" }) => {
  const reduce = useReducedMotion();
  const d = item?.dossier;
  if (!d) return null;

  const container = { hidden: {}, show: { transition: { staggerChildren: reduce ? 0 : 0.045, delayChildren: reduce ? 0 : 0.32 } } };
  const line = {
    hidden: { opacity: 0, y: reduce ? 0 : 8, filter: reduce ? "blur(0px)" : "blur(4px)" },
    show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <div
      className="stellar-content-left"
      style={{
        position: "fixed",
        left: "3vw",
        top: "13.5vh",
        zIndex: 46,
        width: "min(430px, 42vw)",
        maxHeight: "73vh",
        overflowY: "auto",
        overflowX: "hidden",
        pointerEvents: "auto",
        background: "linear-gradient(135deg, rgba(8,12,26,0.9), rgba(6,9,20,0.82))",
        backdropFilter: "blur(16px) saturate(1.2)",
        WebkitBackdropFilter: "blur(16px) saturate(1.2)",
        border: `1px solid ${AMBER}33`,
        borderRadius: 15,
        padding: "16px 20px 18px",
        boxShadow: `0 22px 60px rgba(0,0,0,0.55), 0 0 0 1px ${AMBER}10`,
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={item.id}
          initial={{ opacity: 0, filter: reduce ? "blur(0px)" : "blur(8px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, filter: reduce ? "blur(0px)" : "blur(8px)" }}
          transition={{ duration: 0.24 }}
        >
          {/* scan header */}
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
            <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.16em", color: AMBER, textTransform: "uppercase" }}>
              ◈ {d.eyebrow}
            </span>
            {total > 0 && (
              <span style={{ fontFamily: MONO, fontSize: 9.5, color: "rgba(255,255,255,0.5)" }}>
                {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
                {sectionLabel ? ` · ${sectionLabel}` : ""}
              </span>
            )}
          </div>
          {/* sweep */}
          <div style={{ position: "relative", height: 2, margin: "8px 0 11px", background: "rgba(255,255,255,0.08)", borderRadius: 2, overflow: "hidden" }}>
            <motion.div
              key={`${item.id}-sweep`}
              initial={{ x: reduce ? "0%" : "-100%" }}
              animate={{ x: reduce ? "0%" : "100%" }}
              transition={{ duration: reduce ? 0 : 0.75, ease: [0.4, 0, 0.2, 1] }}
              style={{ position: "absolute", inset: 0, background: `linear-gradient(90deg, transparent, ${AMBER}, transparent)` }}
            />
          </div>

          {/* title block */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            {d.icon && <span style={{ fontSize: 24, lineHeight: 1.2 }}>{d.icon}</span>}
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: DISP, fontWeight: 700, fontSize: 22, lineHeight: 1.15, color: "#fff", letterSpacing: "0.01em" }}>{d.title}</div>
              {d.subtitle && <div style={{ fontFamily: MONO, fontSize: 11.5, color: "rgba(200,214,245,0.78)", marginTop: 5, letterSpacing: "0.04em" }}>{d.subtitle}</div>}
            </div>
          </div>

          {d.accent && (
            <div style={{ fontFamily: DISP, fontSize: 12.5, color: AMBER, marginTop: 9, paddingLeft: 16, position: "relative" }}>
              <span style={{ position: "absolute", left: 0 }}>★</span>{d.accent}
            </div>
          )}

          {/* meta chips */}
          {d.meta?.length > 0 && (
            <motion.div variants={container} initial="hidden" animate="show" style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 13 }}>
              {d.meta.map((m, i) => (
                <motion.div key={i} variants={line} style={{ flex: "1 1 auto", minWidth: 78, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 9, padding: "7px 10px" }}>
                  <div style={{ fontFamily: DISP, fontWeight: 700, fontSize: 17, color: AMBER, lineHeight: 1 }}>{m.value}</div>
                  <div style={{ fontFamily: MONO, fontSize: 8.5, color: "rgba(255,255,255,0.55)", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 4 }}>{m.label}</div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* body — paragraphs + grouped bullet lists */}
          {d.body?.length > 0 && (
            <motion.div variants={container} initial="hidden" animate="show" style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 12 }}>
              {d.body.map((b, i) =>
                typeof b === "string" ? (
                  <motion.p key={i} variants={line} style={{ fontFamily: DISP, fontSize: 13.5, lineHeight: 1.62, color: "rgba(214,224,245,0.9)", margin: 0 }}>{b}</motion.p>
                ) : (
                  <motion.div key={i} variants={line}>
                    <div style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(143,207,255,0.85)", marginBottom: 6 }}>{b.head}</div>
                    <ul style={{ margin: 0, paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
                      {(b.points || []).map((p, j) => (
                        <li key={j} style={{ fontFamily: DISP, fontSize: 12.8, lineHeight: 1.55, color: "rgba(206,218,240,0.86)", paddingLeft: 15, position: "relative" }}>
                          <span style={{ position: "absolute", left: 0, color: AMBER }}>▸</span>{p}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )
              )}
            </motion.div>
          )}

          {/* tags */}
          {d.tags?.length > 0 && (
            <motion.div variants={container} initial="hidden" animate="show" style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 14 }}>
              {d.tags.map((t, i) => (
                <motion.span key={i} variants={line} style={{ fontFamily: MONO, fontSize: 9.5, color: "rgba(200,214,245,0.8)", background: "rgba(143,207,255,0.08)", border: "1px solid rgba(143,207,255,0.22)", borderRadius: 999, padding: "3px 9px" }}>{t}</motion.span>
              ))}
            </motion.div>
          )}

          {/* contact channel link */}
          {d.href && (
            <a href={d.href} target="_blank" rel="noreferrer" style={{ display: "inline-block", marginTop: 15, fontFamily: MONO, fontSize: 10.5, letterSpacing: "0.1em", textTransform: "uppercase", color: AMBER, border: `1px solid ${AMBER}55`, borderRadius: 999, padding: "8px 16px", textDecoration: "none" }}>
              Open channel ▸
            </a>
          )}

          <div style={{ fontFamily: MONO, fontSize: 9, color: "rgba(255,255,255,0.4)", marginTop: 16, letterSpacing: "0.08em" }}>← → cycle objects · ↑ ↓ change world</div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default ItemDossier;
