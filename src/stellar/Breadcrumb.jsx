/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { DESTINATIONS } from "./config/destinations";

/*
 * Bottom-pinned path of dots — visited destinations are filled with the
 * destination's brand colour, the active one pulses, unvisited stays
 * outlined. Persists visited in localStorage so a returning visitor
 * sees what they explored.
 */

const KEY = "stellar:visited";

const Breadcrumb = ({ activeIdx }) => {
  const [visited, setVisited] = useState(() => {
    if (typeof window === "undefined") return {};
    try {
      return JSON.parse(localStorage.getItem(KEY) || "{}");
    } catch {
      return {};
    }
  });

  useEffect(() => {
    const id = DESTINATIONS[activeIdx]?.id;
    if (!id) return;
    setVisited((v) => {
      if (v[id]) return v;
      const next = { ...v, [id]: true };
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, [activeIdx]);

  return (
    <div
      style={{
        position: "fixed",
        bottom: 12,
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "5px 14px",
        background: "rgba(6, 9, 22, 0.6)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: 18,
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 9,
        zIndex: 30,
        pointerEvents: "none",
      }}
    >
      {DESTINATIONS.map((d, i) => {
        const isActive = i === activeIdx;
        const isVisited = !!visited[d.id];
        return (
          <span
            key={d.id}
            style={{ display: "flex", alignItems: "center", gap: 4 }}
            title={d.label}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: isActive || isVisited ? d.color : "transparent",
                border: `1px solid ${isActive || isVisited ? d.color : "rgba(255,255,255,0.25)"}`,
                boxShadow: isActive ? `0 0 10px ${d.color}, 0 0 18px ${d.color}55` : "none",
                animation: isActive ? "breadcrumbPulse 1.6s ease-in-out infinite" : "none",
                transition: "background 280ms ease, border 280ms ease",
              }}
            />
            {i < DESTINATIONS.length - 1 && (
              <span style={{ width: 8, height: 1, background: isVisited && visited[DESTINATIONS[i + 1].id] ? d.color : "rgba(255,255,255,0.12)", transition: "background 280ms ease" }} />
            )}
          </span>
        );
      })}
      <style>{`
        @keyframes breadcrumbPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.35); }
        }
      `}</style>
    </div>
  );
};

export default Breadcrumb;
