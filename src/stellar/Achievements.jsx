/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";
import { DESTINATIONS } from "./config/destinations";
import { ACHIEVEMENTS, ACHIEVEMENTS_BY_ID, persistUnlocked, unlockedSet } from "./data/achievements";
import { markCharted, chartedSet, HUNT_IDS } from "./data/explorer";

/*
 * Listens to navigation + custom events, tracks unlocked achievements
 * in localStorage, fires top-centre toast on unlock, renders a mission-
 * patch strip in the top-right corner.
 *
 * Triggers used:
 *   activeIdx == 0                              → first_light
 *   set covers Mercury+Venus+Earth+Mars         → inner_tour
 *   activeIdx == 5 (asteroid belt)              → belt_crossed
 *   set covers all 4 gas giants                 → gas_giants
 *   activeIdx == 11 (contact)                   → edge_beacon
 *   all 12 visited                              → all_destinations
 *   custom "stellar:konami"                     → konami
 *   custom "stellar:salute"                     → salute
 *   custom "stellar:deathstar"                  → death_star
 *   custom "stellar:answer42"                   → the_answer
 *   custom "stellar:speedrun" {seconds<60}      → speed_runner
 *   custom "stellar:freeroam"                   → explorer
 */

const INNER = new Set(["about", "funfacts", "experience", "projects"]);
const GIANTS = new Set(["skills", "notes", "education", "hobbies"]);

const Achievements = ({ activeIdx, showStrip = true }) => {
  const [unlocked, setUnlocked] = useState(() => unlockedSet());
  const [toast, setToast] = useState(null);
  const visitedRef = useRef(new Set());

  const unlock = (id) => {
    setUnlocked((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      persistUnlocked(next);
      const a = ACHIEVEMENTS_BY_ID[id];
      if (a) {
        setToast(a);
        setTimeout(() => setToast(null), 3600);
      }
      return next;
    });
  };

  /* Visited destinations → derived unlocks */
  useEffect(() => {
    const dest = DESTINATIONS[activeIdx];
    if (!dest) return;
    visitedRef.current.add(dest.id);
    const v = visitedRef.current;

    if (dest.id === "sol") unlock("first_light");
    if (dest.id === "achievements") unlock("belt_crossed");
    if (dest.id === "contact") unlock("edge_beacon");
    if ([...INNER].every((id) => v.has(id))) unlock("inner_tour");
    if ([...GIANTS].every((id) => v.has(id))) unlock("gas_giants");
    if (DESTINATIONS.every((d) => v.has(d.id))) unlock("all_destinations");
  }, [activeIdx]);

  /* Custom event triggers — badges + discovery charting. */
  useEffect(() => {
    /* Charting a homage ship advances Explorer Rank; five of them also unlock a
       named badge (the other four count only toward rank + the meta-badge). */
    const find = (chartId, badgeId) => () => {
      markCharted(chartId);
      if (badgeId) unlock(badgeId);
    };
    const evts = [
      ["stellar:konami", () => unlock("konami")],
      ["stellar:salute", () => unlock("salute")],
      ["stellar:answer42", () => unlock("the_answer")],
      ["stellar:freeroam", () => unlock("explorer")],
      ["stellar:speedrun", (e) => { if (e.detail?.seconds && e.detail.seconds < 60) unlock("speed_runner"); }],
      ["stellar:deathstar", find("deathstar", "death_star")],
      ["stellar:enterprise", find("enterprise", "enterprise")],
      ["stellar:endurance", find("endurance", "endurance")],
      ["stellar:stardestroyer", find("stardestroyer", "stardestroyer")],
      ["stellar:hal", find("hal", "hal")],
      ["stellar:cooperstation", find("cooperstation")],
      ["stellar:walle", find("walle")],
      ["stellar:tardis", find("tardis")],
      ["stellar:watney", find("watney")],
      /* Meta-badge: all 9 hidden anomalies charted. Listens to the generic
         progress event so it also catches charting done via the overview map. */
      ["stellar:progress", () => { if (HUNT_IDS.every((id) => chartedSet().has(id))) unlock("anomaly_hunter"); }],
    ];
    evts.forEach(([k, fn]) => window.addEventListener(k, fn));
    return () => evts.forEach(([k, fn]) => window.removeEventListener(k, fn));
  }, []);

  /* Announce badge changes AFTER commit (never during render) so the rank meter
     + log refresh without a cross-component setState-in-render warning. */
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("stellar:progress"));
  }, [unlocked]);

  return (
    <>
      {/* Mission-patch strip — top-right. Hidden by default when mounted next
          to the Discoveries log (which renders the full badge grid). */}
      {showStrip && (
      <div
        style={{
          position: "fixed",
          top: 230,
          right: 16,
          display: "flex",
          flexDirection: "column",
          gap: 5,
          zIndex: 35,
          pointerEvents: "none",
        }}
      >
        {ACHIEVEMENTS.map((a) => {
          const got = unlocked.has(a.id);
          return (
            <div
              key={a.id}
              title={got ? `${a.label} · unlocked` : `${a.label} — ${a.hint}`}
              style={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                background: got ? `${a.color}28` : "rgba(8, 10, 26, 0.4)",
                border: `1px solid ${got ? a.color : "rgba(255,255,255,0.12)"}`,
                color: got ? a.color : "rgba(255, 255, 255, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: a.id === "the_answer" ? 7.5 : 11,
                fontWeight: 600,
                pointerEvents: "auto",
                cursor: "default",
                transition: "background 240ms ease, color 240ms ease, border 240ms ease",
                boxShadow: got ? `0 0 8px ${a.color}55` : "none",
              }}
            >{a.icon}</div>
          );
        })}
      </div>
      )}

      {/* Unlock toast */}
      {toast && (
        <div
          key={toast.id}
          style={{
            position: "fixed",
            top: 16,
            left: "50%",
            transform: "translateX(-50%)",
            padding: "10px 18px",
            background: "rgba(6, 9, 22, 0.92)",
            border: `1px solid ${toast.color}`,
            borderRadius: 8,
            color: "white",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 12,
            display: "flex",
            alignItems: "center",
            gap: 12,
            zIndex: 90,
            boxShadow: `0 12px 40px rgba(0,0,0,0.5), 0 0 30px ${toast.color}40`,
            animation: "achToast 3.6s ease-in-out",
            pointerEvents: "none",
          }}
        >
          <span style={{ fontSize: 18, color: toast.color }}>{toast.icon}</span>
          <span>
            <span style={{ color: toast.color, fontSize: 9, letterSpacing: "0.15em" }}>ACHIEVEMENT UNLOCKED</span>
            <br />
            <span style={{ fontWeight: 600 }}>{toast.label}</span>
          </span>
        </div>
      )}
      <style>{`
        @keyframes achToast {
          0% { opacity: 0; transform: translateX(-50%) translateY(-14px); }
          12%, 88% { opacity: 1; transform: translateX(-50%) translateY(0); }
          100% { opacity: 0; transform: translateX(-50%) translateY(-14px); }
        }
      `}</style>
    </>
  );
};

export default Achievements;
