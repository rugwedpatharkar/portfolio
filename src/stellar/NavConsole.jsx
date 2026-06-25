/* eslint-disable react/prop-types */
import { useState } from "react";

/*
 * The on-screen cockpit Nav Console (bottom-center), mode-aware:
 *   tour / overview → PREV · destination · NEXT + MAP + orbit time-scale pills
 *   pilot           → a thruster pad (strafe / fwd-back / ascend-descend + BOOST)
 *                     that writes the shared thrustRef the FreeRoam rig reads
 * A LOCK / FREE switch on the left flips between the scroll tour and free-flight.
 * Touch-friendly — gives mobile real navigation (pilot is desktop-only).
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
        background: active ? "rgba(77,166,255,0.32)" : hover ? "rgba(255,255,255,0.09)" : "transparent",
        border: `1px solid ${active ? "rgba(77,166,255,0.6)" : "transparent"}`,
        transition: animate ? "background 160ms ease, color 160ms ease" : "none",
      }}
    >{label}</button>
  );
};

/* Hold-to-thrust button — writes the shared thrustRef while pressed. */
const ThrustBtn = ({ thrustRef, dir, label, ariaLabel, accent }) => {
  const [down, setDown] = useState(false);
  const set = (v) => { setDown(v); if (thrustRef?.current) thrustRef.current[dir] = v; };
  return (
    <button
      aria-label={ariaLabel}
      onPointerDown={(e) => { e.preventDefault(); set(true); }}
      onPointerUp={() => set(false)}
      onPointerLeave={() => set(false)}
      onPointerCancel={() => set(false)}
      style={{
        all: "unset", cursor: "pointer", textAlign: "center",
        minWidth: 28, height: 26, display: "inline-flex", alignItems: "center", justifyContent: "center",
        borderRadius: 7, fontFamily: MONO, fontSize: 12, userSelect: "none",
        color: down ? "#fff" : "rgba(255,255,255,0.72)",
        background: down ? (accent || "rgba(47, 224, 176,0.34)") : "rgba(255,255,255,0.06)",
        border: `1px solid ${down ? "rgba(47, 224, 176,0.7)" : "rgba(255,255,255,0.12)"}`,
      }}
    >{label}</button>
  );
};

const Divider = () => <span style={{ width: 1, height: 18, background: "rgba(255,255,255,0.1)" }} />;

/* LOCK / FREE two-position switch. */
const ModeSwitch = ({ pilot, onToggle, disabled }) => (
  <button
    onClick={disabled ? undefined : onToggle}
    aria-label={pilot ? "Dock (exit pilot)" : "Enter free flight"}
    title={disabled ? "Free flight — desktop only" : pilot ? "Dock — back to the tour" : "Take the controls"}
    style={{
      all: "unset", cursor: disabled ? "not-allowed" : "pointer",
      display: "inline-flex", alignItems: "center", gap: 2, padding: 2,
      borderRadius: 8, background: "rgba(255,255,255,0.05)", opacity: disabled ? 0.4 : 1,
      fontFamily: MONO, fontSize: 9, letterSpacing: "0.06em",
    }}
  >
    <span style={{ padding: "4px 7px", borderRadius: 6, color: pilot ? "rgba(255,255,255,0.5)" : "#fff", background: pilot ? "transparent" : "rgba(77,166,255,0.4)" }}>◉ LOCK</span>
    <span style={{ padding: "4px 7px", borderRadius: 6, color: pilot ? "#fff" : "rgba(255,255,255,0.5)", background: pilot ? "rgba(47, 224, 176,0.4)" : "transparent" }}>✈ FREE</span>
  </button>
);

const NavConsole = ({ mode, destinations, activeIdx, onPrev, onNext, onMap, overview, timeScale, onTimeScale, onTogglePilot, thrustRef, isMobile, animate = true }) => {
  const d = destinations[activeIdx];
  const n = destinations.length;
  const pilot = mode === "pilot";

  return (
    <div
      style={{
        position: "fixed", bottom: 16, left: "50%", transform: "translateX(-50%)",
        zIndex: 47, display: "flex", alignItems: "center", gap: 6,
        padding: "6px 8px", borderRadius: 12,
        background: "rgba(8,11,24,0.82)",
        border: `1px solid ${pilot ? "rgba(47, 224, 176,0.4)" : "rgba(255,255,255,0.1)"}`,
        backdropFilter: "blur(12px) saturate(1.2)", WebkitBackdropFilter: "blur(12px) saturate(1.2)",
        boxShadow: "0 14px 40px rgba(0,0,0,0.45)",
      }}
    >
      <ModeSwitch pilot={pilot} onToggle={onTogglePilot} disabled={isMobile} />
      <Divider />

      {pilot ? (
        <>
          <ThrustBtn thrustRef={thrustRef} dir="left" label="◀" ariaLabel="Strafe left" />
          <ThrustBtn thrustRef={thrustRef} dir="fwd" label="▲" ariaLabel="Thrust forward" />
          <ThrustBtn thrustRef={thrustRef} dir="back" label="▼" ariaLabel="Thrust back" />
          <ThrustBtn thrustRef={thrustRef} dir="right" label="▶" ariaLabel="Strafe right" />
          <Divider />
          <ThrustBtn thrustRef={thrustRef} dir="up" label="⏶" ariaLabel="Ascend" />
          <ThrustBtn thrustRef={thrustRef} dir="down" label="⏷" ariaLabel="Descend" />
          <Divider />
          <ThrustBtn thrustRef={thrustRef} dir="boost" label="» BOOST" ariaLabel="Boost" accent="rgba(248,197,85,0.4)" />
        </>
      ) : (
        <>
          <Btn onClick={onPrev} label="◀" ariaLabel="Previous destination" animate={animate} />
          <div style={{ minWidth: isMobile ? 84 : 116, textAlign: "center", padding: "0 4px" }}>
            <div style={{ fontFamily: MONO, fontSize: 8, letterSpacing: "0.14em", color: "rgba(223,217,255,0.55)" }}>
              {String(activeIdx + 1).padStart(2, "0")} / {n}
            </div>
            <div style={{ fontFamily: "'Chakra Petch', sans-serif", fontSize: isMobile ? 10.5 : 12, letterSpacing: "0.06em", textTransform: "uppercase", color: "white", whiteSpace: "nowrap" }}>
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
        </>
      )}
    </div>
  );
};

export default NavConsole;
