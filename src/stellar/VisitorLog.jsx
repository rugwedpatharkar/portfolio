/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";
import { DESTINATIONS } from "./config/destinations";
import { unlockedSet, ACHIEVEMENTS_BY_ID } from "./data/achievements";

/*
 * Silent telemetry — tracks time on site, scroll distance, destinations
 * visited, easter eggs found. Pops a "Mission Report" panel when the
 * user clicks the report button (toggle in mode-bar).
 */

const VisitorLog = () => {
  const [open, setOpen] = useState(false);
  const startRef = useRef(typeof performance !== "undefined" ? performance.now() : 0);
  const visitedRef = useRef(new Set());
  const [, force] = useState(0);

  useEffect(() => {
    const onDest = (e) => {
      visitedRef.current.add(e.detail?.id);
      force((v) => v + 1);
    };
    window.addEventListener("stellar:destination", onDest);
    return () => window.removeEventListener("stellar:destination", onDest);
  }, []);

  const elapsedMs = typeof performance !== "undefined" ? performance.now() - startRef.current : 0;
  const mins = Math.floor(elapsedMs / 60000);
  const secs = Math.floor((elapsedMs % 60000) / 1000);
  const u = unlockedSet();

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="Open mission report"
        className="stellar-dock-btn"
      >▤</button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(3, 5, 14, 0.78)",
            backdropFilter: "blur(8px)",
            zIndex: 80,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'JetBrains Mono', monospace",
            color: "white",
            padding: 24,
            cursor: "pointer",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: 540,
              width: "100%",
              padding: "26px 30px",
              background: "rgba(8, 10, 26, 0.95)",
              border: "1px solid rgba(0, 206, 168, 0.45)",
              borderRadius: 14,
              boxShadow: "0 30px 80px rgba(0,0,0,0.6), inset 0 0 80px rgba(0, 206, 168, 0.05)",
              cursor: "default",
            }}
          >
            <div style={{ fontSize: 9, color: "#00cea8", letterSpacing: "0.18em", marginBottom: 6 }}>
              MISSION REPORT · STELLAR
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "'Sora', sans-serif", marginBottom: 16 }}>
              Your transit so far
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "8px 18px", fontSize: 12 }}>
              <span style={{ color: "rgba(255,255,255,0.4)" }}>TIME ABOARD</span>
              <span>{mins}m {secs}s</span>
              <span style={{ color: "rgba(255,255,255,0.4)" }}>DESTINATIONS VISITED</span>
              <span>{visitedRef.current.size} / {DESTINATIONS.length}</span>
              <span style={{ color: "rgba(255,255,255,0.4)" }}>ACHIEVEMENTS UNLOCKED</span>
              <span>{u.size} / 12</span>
              <span style={{ color: "rgba(255,255,255,0.4)" }}>EXPLORED</span>
              <span style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                {DESTINATIONS.map((d) => (
                  <span key={d.id} style={{
                    width: 7, height: 7, borderRadius: "50%",
                    background: visitedRef.current.has(d.id) ? d.color : "transparent",
                    border: `1px solid ${visitedRef.current.has(d.id) ? d.color : "rgba(255,255,255,0.15)"}`,
                  }} title={d.label} />
                ))}
              </span>
            </div>

            {u.size > 0 && (
              <>
                <div style={{ marginTop: 18, fontSize: 9, color: "#00cea8", letterSpacing: "0.15em" }}>BADGES</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                  {Array.from(u).map((id) => {
                    const a = ACHIEVEMENTS_BY_ID[id];
                    if (!a) return null;
                    return (
                      <span key={id} style={{
                        display: "inline-flex", alignItems: "center", gap: 6,
                        padding: "4px 9px",
                        background: `${a.color}1c`,
                        border: `1px solid ${a.color}55`,
                        borderRadius: 12,
                        fontSize: 10,
                      }}>
                        <span style={{ color: a.color }}>{a.icon}</span>
                        <span>{a.label}</span>
                      </span>
                    );
                  })}
                </div>
              </>
            )}

            <button
              onClick={() => setOpen(false)}
              style={{
                marginTop: 22, padding: "8px 16px",
                background: "transparent",
                border: "1px solid rgba(0, 206, 168, 0.5)",
                color: "#00cea8",
                borderRadius: 6,
                fontFamily: "inherit", fontSize: 10, letterSpacing: "0.12em",
                cursor: "pointer",
              }}
            >RESUME TRANSIT →</button>
          </div>
        </div>
      )}
    </>
  );
};

export default VisitorLog;
