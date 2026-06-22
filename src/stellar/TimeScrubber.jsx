/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";

/*
 * Compact time-scrubber pinned bottom-right (above the audio + mode
 * toggles). Lets the visitor scrub from -5 years → +5 years from now.
 * Updates a shared ref the scene can read each frame.
 */

const RANGE_YEARS = 5;

const TimeScrubber = ({ dateOffsetDaysRef, onChange }) => {
  const [days, setDays] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (dateOffsetDaysRef) dateOffsetDaysRef.current = days;
    onChange?.(days);
  }, [days, dateOffsetDaysRef, onChange]);

  const label = (() => {
    if (days === 0) return "NOW";
    const years = days / 365.25;
    const abs = Math.abs(years);
    if (abs < 1 / 12) return `${days > 0 ? "+" : "-"}${Math.round(Math.abs(days))} d`;
    if (abs < 1) return `${days > 0 ? "+" : "-"}${(abs * 12).toFixed(1)} mo`;
    return `${days > 0 ? "+" : "-"}${abs.toFixed(1)} yr`;
  })();

  return (
    <div
      style={{
        position: "fixed",
        bottom: 282,
        right: 18,
        display: "flex",
        flexDirection: "column",
        gap: 4,
        padding: "8px 10px",
        background: "rgba(6, 9, 22, 0.7)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(127, 170, 255, 0.3)",
        borderRadius: 8,
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 9,
        color: "rgba(255, 255, 255, 0.65)",
        zIndex: 32,
        pointerEvents: "auto",
        width: open ? 220 : 116,
        transition: "width 240ms ease",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
        <span style={{ letterSpacing: "0.12em" }}>EPOCH</span>
        <button
          onClick={() => setOpen((v) => !v)}
          style={{
            all: "unset",
            cursor: "pointer",
            color: "#7faaff",
            fontSize: 11,
          }}
          aria-label={open ? "Collapse scrubber" : "Expand scrubber"}
        >{open ? "−" : "+"}</button>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: "#7faaff", fontSize: 11 }}>{label}</span>
        {open && days !== 0 && (
          <button
            onClick={() => setDays(0)}
            style={{
              all: "unset",
              cursor: "pointer",
              fontSize: 8.5,
              color: "rgba(255,255,255,0.5)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >reset</button>
        )}
      </div>
      {open && (
        <input
          type="range"
          min={-RANGE_YEARS * 365.25}
          max={RANGE_YEARS * 365.25}
          step={1}
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          style={{
            width: "100%",
            marginTop: 4,
            accentColor: "#7faaff",
          }}
        />
      )}
    </div>
  );
};

export default TimeScrubber;
