 
import { useEffect, useState } from "react";
import { ACHIEVEMENTS, unlockedSet } from "./data/achievements";
import { getDiscoveriesModel } from "./data/explorer";
import useViewport from "./useViewport";

/*
 * The Explorer Log — the rich gamification screen (a right-side slide-in panel).
 * Three sections: Explorer Rank (tier + progress), the "anomalies X / 9"
 * scavenger hunt (found objects revealed, unfound masked with a cryptic hint),
 * and the full achievement grid. Reads fresh on open + on every progress event.
 */

const MONO = "'Martian Mono', monospace";
const TITLE = "'Chakra Petch', sans-serif";
const ACCENT = "#4da6ff";

const read = () => ({ model: getDiscoveriesModel(), unlocked: unlockedSet() });

const SectionLabel = ({ children, right }) => (
  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", margin: "0 0 10px" }}>
    <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.2em", color: "rgba(223,217,255,0.7)" }}>{children}</span>
    {right != null && <span style={{ fontFamily: MONO, fontSize: 10, color: "#2fe0b0" }}>{right}</span>}
  </div>
);

const DiscoveriesView = ({ open, onClose, animate = true }) => {
  const { isMobile } = useViewport();
  const [{ model, unlocked }, setState] = useState(read);

  useEffect(() => {
    if (!open) return undefined;
    const refresh = () => setState(read());
    refresh();
    window.addEventListener("stellar:progress", refresh);
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("stellar:progress", refresh);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const { rank, hunt } = model;
  const pct = Math.round((rank.count / rank.total) * 100);
  const width = isMobile ? "100%" : 384;

  return (
    <>
      {/* Scrim — click to dismiss; subtle so the scene stays visible behind. */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 79,
          background: "rgba(3,5,14,0.42)",
          backdropFilter: "blur(2px)", WebkitBackdropFilter: "blur(2px)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: animate ? "opacity 260ms ease" : "none",
        }}
      />
      <aside
        role="dialog"
        aria-label="Explorer log"
        style={{
          position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 80,
          width, maxWidth: "100vw",
          padding: "22px 20px 28px",
          overflowY: "auto",
          background: "rgba(7,10,20,0.94)",
          borderLeft: `1px solid rgba(77,166,255,0.28)`,
          backdropFilter: "blur(18px) saturate(1.2)", WebkitBackdropFilter: "blur(18px) saturate(1.2)",
          boxShadow: "-24px 0 60px rgba(0,0,0,0.55)",
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: animate ? "transform 320ms cubic-bezier(0.4,0,0.2,1)" : "none",
          color: "white",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
          <span style={{ fontFamily: TITLE, fontSize: 15, letterSpacing: "0.1em", textTransform: "uppercase" }}>Explorer Log</span>
          <button
            onClick={onClose}
            aria-label="Close log"
            style={{ all: "unset", cursor: "pointer", fontFamily: MONO, fontSize: 12, color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 999, padding: "4px 9px" }}
          >✕ Esc</button>
        </div>

        {/* Rank */}
        <section style={{ marginBottom: 26 }}>
          <SectionLabel right={`${rank.count} / ${rank.total}`}>EXPLORER RANK</SectionLabel>
          <div style={{ fontFamily: TITLE, fontSize: 22, letterSpacing: "0.03em", textTransform: "uppercase", marginBottom: 9 }}>{rank.label}</div>
          <div style={{ height: 6, borderRadius: 4, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, ${ACCENT}, #2fe0b0)`, boxShadow: `0 0 10px ${ACCENT}88`, transition: animate ? "width 480ms cubic-bezier(0.4,0,0.2,1)" : "none" }} />
          </div>
          <div style={{ fontFamily: MONO, fontSize: 9.5, color: "rgba(223,217,255,0.6)", marginTop: 7 }}>
            {rank.next ? `${rank.remaining} more to reach ${rank.next}` : "Maximum rank achieved — the system is fully charted."}
          </div>
        </section>

        {/* Scavenger hunt */}
        <section style={{ marginBottom: 26 }}>
          <SectionLabel right={`${hunt.found} / ${hunt.total} FOUND`}>HIDDEN ANOMALIES</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {hunt.items.map((it) => (
              <div
                key={it.id}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "8px 11px", borderRadius: 9,
                  background: it.found ? `${it.color}14` : "rgba(255,255,255,0.03)",
                  border: `1px solid ${it.found ? `${it.color}55` : "rgba(255,255,255,0.07)"}`,
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: "50%", flexShrink: 0, background: it.found ? it.color : "transparent", border: it.found ? "none" : "1px solid rgba(255,255,255,0.25)", boxShadow: it.found ? `0 0 8px ${it.color}` : "none" }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: MONO, fontSize: 11.5, color: it.found ? "white" : "rgba(255,255,255,0.55)", fontWeight: it.found ? 600 : 400 }}>
                    {it.found ? it.label : "Uncharted anomaly"}
                  </div>
                  <div style={{ fontFamily: "'Saira', sans-serif", fontSize: 11, fontStyle: it.found ? "normal" : "italic", color: it.found ? "rgba(47, 224, 176,0.9)" : "rgba(223,217,255,0.5)", marginTop: 1 }}>
                    {it.found ? "Charted ✓" : it.hint}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Achievements grid */}
        <section>
          <SectionLabel right={`${unlocked.size} / ${ACHIEVEMENTS.length}`}>ACHIEVEMENTS</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(64px, 1fr))", gap: 8 }}>
            {ACHIEVEMENTS.map((a) => {
              const got = unlocked.has(a.id);
              return (
                <div
                  key={a.id}
                  title={got ? `${a.label} · unlocked` : `${a.label} — ${a.hint}`}
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
                    padding: "10px 4px", borderRadius: 9,
                    background: got ? `${a.color}16` : "rgba(255,255,255,0.025)",
                    border: `1px solid ${got ? `${a.color}55` : "rgba(255,255,255,0.06)"}`,
                    cursor: "default",
                  }}
                >
                  <span style={{ fontFamily: MONO, fontSize: a.id === "the_answer" ? 11 : 16, color: got ? a.color : "rgba(255,255,255,0.22)", lineHeight: 1, textShadow: got ? `0 0 10px ${a.color}66` : "none" }}>{a.icon}</span>
                  <span style={{ fontFamily: MONO, fontSize: 7.5, textAlign: "center", letterSpacing: "0.03em", color: got ? "rgba(255,255,255,0.82)" : "rgba(255,255,255,0.3)", lineHeight: 1.25 }}>{a.label}</span>
                </div>
              );
            })}
          </div>
        </section>
      </aside>
    </>
  );
};

export default DiscoveriesView;
