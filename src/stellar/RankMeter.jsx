 
import { useEffect, useRef, useState } from "react";
import { getDiscoveriesModel } from "./data/explorer";
import useViewport from "./useViewport";

/*
 * Persistent Explorer Rank chip — the cockpit's gamification anchor (top-right).
 * Shows current rank tier, charted/total with a progress bar, and the scavenger-
 * hunt count. Click to open the full Discoveries log. Re-reads on every
 * `stellar:progress` event (a new chart / visit / badge), so it stays live.
 */

const MONO = "'JetBrains Mono', monospace";

const read = () => {
  const m = getDiscoveriesModel();
  return { rank: m.rank, hunt: m.hunt };
};

const RankMeter = ({ onOpen, animate = true }) => {
  const { isMobile } = useViewport();
  const [{ rank, hunt }, setState] = useState(read);
  const [hover, setHover] = useState(false);
  const [rankUp, setRankUp] = useState(null);
  const prevTierRef = useRef(null);
  const upTimer = useRef(null);

  useEffect(() => {
    const refresh = () => {
      const next = read();
      setState(next);
      /* Rank-gated reveal — a celebratory promotion toast on tier climb. */
      if (prevTierRef.current != null && next.rank.tier > prevTierRef.current) {
        setRankUp(next.rank.label);
        clearTimeout(upTimer.current);
        upTimer.current = setTimeout(() => setRankUp(null), 4500);
      }
      prevTierRef.current = next.rank.tier;
    };
    window.addEventListener("stellar:progress", refresh);
    /* Re-read once on mount in case progress was hydrated after first paint. */
    refresh();
    return () => { window.removeEventListener("stellar:progress", refresh); clearTimeout(upTimer.current); };
  }, []);

  const pct = Math.round((rank.count / rank.total) * 100);
  const accent = "#4da6ff";

  return (
    <>
      <button
      onClick={onOpen}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      aria-label={`Explorer rank ${rank.label}, ${rank.count} of ${rank.total} charted. Open discoveries log.`}
      style={{
        position: "fixed",
        top: 16,
        right: 16,
        zIndex: 36,
        width: isMobile ? 168 : 208,
        textAlign: "left",
        cursor: "pointer",
        padding: isMobile ? "8px 11px 10px" : "9px 13px 11px",
        borderRadius: 12,
        background: "rgba(8,11,24,0.82)",
        border: `1px solid ${hover ? "rgba(77,166,255,0.55)" : "rgba(255,255,255,0.10)"}`,
        backdropFilter: "blur(12px) saturate(1.2)",
        WebkitBackdropFilter: "blur(12px) saturate(1.2)",
        boxShadow: hover
          ? "0 16px 44px rgba(0,0,0,0.5), 0 0 22px rgba(77,166,255,0.22)"
          : "0 12px 34px rgba(0,0,0,0.42)",
        color: "white",
        transition: animate ? "border-color 220ms ease, box-shadow 220ms ease, transform 220ms ease" : "none",
        transform: hover && animate ? "translateY(-1px)" : "none",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: MONO, fontSize: 8.5, letterSpacing: "0.18em", color: "rgba(223,217,255,0.75)" }}>
          EXPLORER RANK
        </span>
        <span style={{ fontFamily: MONO, fontSize: 9, color: hover ? accent : "rgba(255,255,255,0.4)" }}>⤢</span>
      </div>

      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", margin: "3px 0 6px" }}>
        <span style={{ fontFamily: "'Chakra Petch', sans-serif", fontSize: isMobile ? 12.5 : 14, letterSpacing: "0.04em", textTransform: "uppercase" }}>
          {rank.label}
        </span>
        <span style={{ fontFamily: MONO, fontSize: 10.5, color: "#2fe0b0" }}>
          {rank.count}<span style={{ color: "rgba(255,255,255,0.4)" }}>/{rank.total}</span>
        </span>
      </div>

      {/* Charted progress bar */}
      <div style={{ height: 4, borderRadius: 3, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            borderRadius: 3,
            background: `linear-gradient(90deg, ${accent}, #2fe0b0)`,
            boxShadow: `0 0 8px ${accent}88`,
            transition: animate ? "width 420ms cubic-bezier(0.4,0,0.2,1)" : "none",
          }}
        />
      </div>

      <div style={{ marginTop: 5, display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 8.5, letterSpacing: "0.06em", color: "rgba(223,217,255,0.62)" }}>
        <span>{rank.next ? `${rank.remaining} to ${rank.next}` : "MAX RANK"}</span>
        <span>{hunt.found}/{hunt.total} anomalies</span>
      </div>
      </button>
      {rankUp && (
        <div style={{
          position: "fixed", top: 96, left: "50%", transform: "translateX(-50%)",
          zIndex: 60, pointerEvents: "none", textAlign: "center",
          padding: "12px 30px", borderRadius: 14,
          background: "rgba(8,11,24,0.92)", border: "1px solid rgba(77,166,255,0.6)",
          backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
          boxShadow: "0 16px 50px rgba(0,0,0,0.55), 0 0 40px rgba(77,166,255,0.3)",
          animation: animate ? "rankUpPop 4.5s ease-in-out" : "none",
        }}>
          <div style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.25em", color: "#2fe0b0" }}>⬆ PROMOTION</div>
          <div style={{ fontFamily: "'Chakra Petch', sans-serif", fontSize: 20, letterSpacing: "0.08em", textTransform: "uppercase", color: "white", marginTop: 4 }}>{rankUp}</div>
          <div style={{ fontFamily: MONO, fontSize: 9, color: "rgba(223,217,255,0.6)", marginTop: 3 }}>explorer rank advanced</div>
        </div>
      )}
      <style>{`@keyframes rankUpPop { 0% { opacity: 0; transform: translateX(-50%) translateY(-10px) scale(0.95); } 12%, 82% { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); } 100% { opacity: 0; transform: translateX(-50%) translateY(-10px) scale(0.97); } }`}</style>
    </>
  );
};

export default RankMeter;
