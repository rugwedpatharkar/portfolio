/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { personalInfo, heroContent } from "../../content";
import { getBodyContent, OBJECTIVE_TOTAL } from "../data/bodies";
import { rankFor, chartedCount } from "../data/explorer";

/*
 * The space-game cockpit dashboard — the angled "stretched-back" panels of a
 * ship's console (CSS-3D perspective). Everything is data-driven: the RIGHT
 * panel renders getBodyContent(targetId) from the body registry, so new
 * anomalies appear here automatically.
 *
 *   LEFT  (rotateY +)  → PILOT: who you are + score / rank / objectives
 *   RIGHT (rotateY -)  → TARGET: the body you're scanning (registry content)
 *   BOTTOM (rotateX)   → console: thruster pad + READ escape
 */

const MONO = "'JetBrains Mono', monospace";
const TITLE = "'Michroma', sans-serif";
const STATUS_COLOR = { available: "#00cea8", busy: "#f8c555", unavailable: "#ff6b6b" };

const Panel = ({ side, children }) => (
  <div
    style={{
      position: "fixed", bottom: 0, [side]: 0, zIndex: 44,
      width: "min(320px, 26vw)", padding: "16px 18px 22px",
      transformOrigin: `${side} bottom`,
      transform: side === "left" ? "perspective(1100px) rotateY(14deg)" : "perspective(1100px) rotateY(-14deg)",
      background: "linear-gradient(to top, rgba(8,11,24,0.95), rgba(8,11,24,0.6))",
      borderTop: "1px solid rgba(0,206,168,0.3)",
      [`border${side === "left" ? "Right" : "Left"}`]: "1px solid rgba(0,206,168,0.18)",
      backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
      color: "white", pointerEvents: "auto",
    }}
  >{children}</div>
);

const ThrustBtn = ({ thrustRef, dir, label, accent }) => {
  const [down, setDown] = useState(false);
  const set = (v) => { setDown(v); if (thrustRef?.current) thrustRef.current[dir] = v; };
  return (
    <button
      onPointerDown={(e) => { e.preventDefault(); set(true); }}
      onPointerUp={() => set(false)} onPointerLeave={() => set(false)} onPointerCancel={() => set(false)}
      aria-label={dir}
      style={{
        all: "unset", cursor: "pointer", minWidth: 30, height: 28, userSelect: "none",
        display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: 7,
        fontFamily: MONO, fontSize: 12,
        color: down ? "#fff" : "rgba(255,255,255,0.72)",
        background: down ? (accent || "rgba(0,206,168,0.36)") : "rgba(255,255,255,0.06)",
        border: `1px solid ${down ? "rgba(0,206,168,0.7)" : "rgba(255,255,255,0.12)"}`,
      }}
    >{label}</button>
  );
};

const GameCockpit = ({ targetId, thrustRef, onReadMode, scoreRef }) => {
  const [, force] = useState(0);
  /* Re-read score/rank on progress changes. */
  useEffect(() => {
    const r = () => force((n) => n + 1);
    window.addEventListener("stellar:progress", r);
    window.addEventListener("stellar:score", r);
    return () => { window.removeEventListener("stellar:progress", r); window.removeEventListener("stellar:score", r); };
  }, []);

  const charted = chartedCount();
  const rank = rankFor();
  const score = scoreRef?.current ?? charted * 100;
  const target = targetId ? getBodyContent(targetId) : null;
  const dot = STATUS_COLOR[personalInfo.availabilityStatus] || "#00cea8";

  return (
    <>
      {/* LEFT — PILOT */}
      <Panel side="left">
        <div style={{ fontFamily: MONO, fontSize: 8.5, letterSpacing: "0.22em", color: "#00cea8" }}>◢ PILOT</div>
        <div style={{ fontFamily: TITLE, fontSize: 16, letterSpacing: "0.04em", marginTop: 6 }}>{personalInfo.fullName}</div>
        <div style={{ fontFamily: MONO, fontSize: 10, color: "#9fd2ff", marginTop: 3 }}>{heroContent.typewriterRoles[0]}</div>
        <div style={{ fontFamily: MONO, fontSize: 9, color: "rgba(223,217,255,0.65)", marginTop: 8, display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: dot, boxShadow: `0 0 7px ${dot}` }} />
          {personalInfo.location} · {personalInfo.availabilityStatus}
        </div>

        <div style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: "12px 0" }} />

        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: MONO }}>
          <Stat label="SCORE" value={score} accent="#f8c555" />
          <Stat label="CHARTED" value={`${charted}/${OBJECTIVE_TOTAL}`} accent="#00cea8" />
        </div>
        <div style={{ marginTop: 12 }}>
          <div style={{ fontFamily: MONO, fontSize: 8, letterSpacing: "0.18em", color: "rgba(223,217,255,0.6)" }}>RANK</div>
          <div style={{ fontFamily: TITLE, fontSize: 14, textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 2 }}>{rank.label}</div>
          <div style={{ height: 4, borderRadius: 3, background: "rgba(255,255,255,0.08)", overflow: "hidden", marginTop: 5 }}>
            <div style={{ height: "100%", width: `${Math.round((rank.count / rank.total) * 100)}%`, background: "linear-gradient(90deg,#915eff,#00cea8)" }} />
          </div>
          <div style={{ fontFamily: MONO, fontSize: 8.5, color: "rgba(223,217,255,0.55)", marginTop: 5 }}>
            {rank.next ? `${rank.remaining} to ${rank.next}` : "system fully charted"}
          </div>
        </div>
      </Panel>

      {/* RIGHT — TARGET (registry-driven) */}
      <Panel side="right">
        <div style={{ fontFamily: MONO, fontSize: 8.5, letterSpacing: "0.22em", color: "#00cea8", textAlign: "right" }}>TARGET ◣</div>
        {target ? (
          <>
            <div style={{ fontFamily: TITLE, fontSize: 16, letterSpacing: "0.04em", marginTop: 6, textAlign: "right" }}>{target.label}</div>
            <div style={{ fontFamily: MONO, fontSize: 9, color: target.color, marginTop: 3, textAlign: "right", textTransform: "uppercase", letterSpacing: "0.08em" }}>{target.category}</div>
            {target.facts && (
              <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 4 }}>
                {target.facts.distance && <Fact k="DISTANCE" v={target.facts.distance} />}
                {target.facts.diameter && <Fact k="DIAMETER" v={target.facts.diameter} />}
                {target.facts.gravity && <Fact k="GRAVITY" v={target.facts.gravity} />}
              </div>
            )}
            <div style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 11.5, color: "rgba(255,255,255,0.85)", lineHeight: 1.5, marginTop: 10, textAlign: "right" }}>
              {target.facts?.wow || target.info}
            </div>
            {target.section && (
              <div style={{ fontFamily: MONO, fontSize: 8.5, letterSpacing: "0.12em", color: "rgba(0,206,168,0.85)", marginTop: 10, textAlign: "right" }}>▸ {target.section.toUpperCase()} LOGGED</div>
            )}
          </>
        ) : (
          <div style={{ fontFamily: MONO, fontSize: 10.5, color: "rgba(255,255,255,0.5)", marginTop: 14, textAlign: "right", lineHeight: 1.6 }}>
            NO TARGET<br />fly to a body to scan it
          </div>
        )}
      </Panel>

      {/* BOTTOM — console (tilted back) */}
      <div
        style={{
          position: "fixed", bottom: 0, left: "50%", zIndex: 45,
          transform: "translateX(-50%) perspective(900px) rotateX(26deg)", transformOrigin: "bottom center",
          display: "flex", alignItems: "center", gap: 10,
          padding: "10px 16px 14px", borderRadius: "12px 12px 0 0",
          background: "linear-gradient(to top, rgba(8,11,24,0.96), rgba(8,11,24,0.7))",
          borderTop: "1px solid rgba(0,206,168,0.35)", borderLeft: "1px solid rgba(0,206,168,0.15)", borderRight: "1px solid rgba(0,206,168,0.15)",
          backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", pointerEvents: "auto",
        }}
      >
        <ThrustBtn thrustRef={thrustRef} dir="left" label="◀" />
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <ThrustBtn thrustRef={thrustRef} dir="fwd" label="▲" />
          <ThrustBtn thrustRef={thrustRef} dir="back" label="▼" />
        </div>
        <ThrustBtn thrustRef={thrustRef} dir="right" label="▶" />
        <span style={{ width: 1, height: 28, background: "rgba(255,255,255,0.12)" }} />
        <ThrustBtn thrustRef={thrustRef} dir="up" label="⏶" />
        <ThrustBtn thrustRef={thrustRef} dir="down" label="⏷" />
        <ThrustBtn thrustRef={thrustRef} dir="boost" label="» BOOST" accent="rgba(248,197,85,0.4)" />
        <span style={{ width: 1, height: 28, background: "rgba(255,255,255,0.12)" }} />
        <button
          onClick={onReadMode}
          aria-label="Switch to read mode (résumé)"
          style={{ all: "unset", cursor: "pointer", padding: "6px 12px", borderRadius: 7, fontFamily: MONO, fontSize: 10, letterSpacing: "0.1em", color: "rgba(255,255,255,0.78)", border: "1px solid rgba(255,255,255,0.22)" }}
        >▤ READ</button>
      </div>
    </>
  );
};

const Stat = ({ label, value, accent }) => (
  <div>
    <div style={{ fontSize: 8, letterSpacing: "0.14em", color: "rgba(223,217,255,0.6)" }}>{label}</div>
    <div style={{ fontSize: 16, fontWeight: 600, color: accent, marginTop: 2 }}>{value}</div>
  </div>
);

const Fact = ({ k, v }) => (
  <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, fontFamily: MONO, fontSize: 9 }}>
    <span style={{ color: "rgba(223,217,255,0.5)" }}>{k}</span>
    <span style={{ color: "white" }}>{v}</span>
  </div>
);

export default GameCockpit;
