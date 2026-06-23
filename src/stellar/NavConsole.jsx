/* eslint-disable react/prop-types */
import { useState } from "react";

/*
 * The on-screen cockpit Nav Console (bottom-center). Built mode-aware: in tour /
 * overview it shows PREV · destination · NEXT, a MAP toggle, and the orbit
 * time-scale pills (also giving touch users real navigation). Phase 3 morphs the
 * same surface into the pilot thruster pad.
 */

const MONO = "'JetBrains Mono', monospace";

const TIME_STEPS = [
  { s: 0, label: "⏸", title: "Pause orbits" },
  { s: 0.5, label: "½×", title: "Half speed" },
  { s: 1, label: "1×", title: "Normal speed" },
  { s: 2, label: "2×", title: "Double speed" },
];

const Btn = ({ onClick, label, ariaLabel, active, wide, animate }) => {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        all: "unset", cursor: "pointer", textAlign: "center",
        minWidth: wide ? 34 : 26, height: 26, padding: wide ? "0 9px" : 0,
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        borderRadius: 7, fontFamily: MONO, fontSize: 12,
        color: active ? "#fff" : hover ? "#fff" : "rgba(255,255,255,0.66)",
        background: active ? "rgba(145,94,255,0.32)" : hover ? "rgba(255,255,255,0.09)" : "transparent",
        border: `1px solid ${active ? "rgba(145,94,255,0.6)" : "transparent"}`,
        transition: animate ? "background 160ms ease, color 160ms ease" : "none",
      }}
    >{label}</button>
  );
};

const Divider = () => <span style={{ width: 1, height: 18, background: "rgba(255,255,255,0.1)" }} />;

const NavConsole = ({ destinations, activeIdx, onPrev, onNext, onMap, overview, timeScale, onTimeScale, isMobile, animate = true }) => {
  const d = destinations[activeIdx];
  const n = destinations.length;

  return (
    <div
      style={{
        position: "fixed", bottom: 16, left: "50%", transform: "translateX(-50%)",
        zIndex: 47, display: "flex", alignItems: "center", gap: 6,
        padding: "6px 8px", borderRadius: 12,
        background: "rgba(8,11,24,0.82)",
        border: "1px solid rgba(255,255,255,0.1)",
        backdropFilter: "blur(12px) saturate(1.2)", WebkitBackdropFilter: "blur(12px) saturate(1.2)",
        boxShadow: "0 14px 40px rgba(0,0,0,0.45)",
      }}
    >
      <Btn onClick={onPrev} label="◀" ariaLabel="Previous destination" animate={animate} />
      <div style={{ minWidth: isMobile ? 84 : 116, textAlign: "center", padding: "0 4px" }}>
        <div style={{ fontFamily: MONO, fontSize: 8, letterSpacing: "0.14em", color: "rgba(223,217,255,0.55)" }}>
          {String(activeIdx + 1).padStart(2, "0")} / {n}
        </div>
        <div style={{ fontFamily: "'Michroma', sans-serif", fontSize: isMobile ? 10.5 : 12, letterSpacing: "0.06em", textTransform: "uppercase", color: "white", whiteSpace: "nowrap" }}>
          {d?.label || ""}
        </div>
      </div>
      <Btn onClick={onNext} label="▶" ariaLabel="Next destination" animate={animate} />

      <Divider />
      <Btn onClick={onMap} label={isMobile ? "⊕" : "⊕ MAP"} ariaLabel="Toggle system map" active={overview} wide={!isMobile} animate={animate} />

      {!isMobile && (
        <>
          <Divider />
          {TIME_STEPS.map((t) => (
            <Btn key={t.s} onClick={() => onTimeScale(t.s)} label={t.label} ariaLabel={t.title} active={timeScale === t.s} animate={animate} />
          ))}
        </>
      )}
    </div>
  );
};

export default NavConsole;
