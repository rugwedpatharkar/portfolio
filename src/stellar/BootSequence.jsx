/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";

/*
 * Cinematic boot sequence. Black canvas, typed monospace log appears line
 * by line at ~30ms per character. Progress bar fills as the Three.js scene
 * loads behind the scenes. When the log finishes AND the scene is ready,
 * dismisses with a fade.
 *
 * Sets the tone before the visitor sees the system. Their first impression
 * is "this person ships intentional software," not "this is a 3D demo."
 */

const BOOT_LINES = [
  { text: "> connect /dev/sol", color: "#915eff", delay: 0 },
  { text: "  link established", color: "rgba(255,255,255,0.5)", delay: 200 },
  { text: "> auth visitor", color: "#915eff", delay: 350 },
  { text: "  welcome aboard.", color: "#00cea8", delay: 550 },
  { text: "> initialize navigation system", color: "#915eff", delay: 750 },
  { text: "  charting orbital paths...", color: "rgba(255,255,255,0.5)", delay: 950 },
  { text: "  calibrating instruments...", color: "rgba(255,255,255,0.5)", delay: 1200 },
  { text: "> load catalog", color: "#915eff", delay: 1500 },
  { text: "  skills: 9 categories · 67 items", color: "rgba(255,255,255,0.7)", delay: 1700 },
  { text: "  projects: 9 entries", color: "rgba(255,255,255,0.7)", delay: 1900 },
  { text: "  writing: 3 notes", color: "rgba(255,255,255,0.7)", delay: 2100 },
  { text: "> ready", color: "#00cea8", delay: 2400 },
];

const TYPE_SPEED_MS = 18; // ms per character

const TypedLine = ({ text, color, onComplete }) => {
  const [shown, setShown] = useState("");
  useEffect(() => {
    let i = 0;
    let cancelled = false;
    const tick = () => {
      if (cancelled) return;
      i++;
      setShown(text.slice(0, i));
      if (i < text.length) {
        setTimeout(tick, TYPE_SPEED_MS);
      } else if (onComplete) {
        onComplete();
      }
    };
    setTimeout(tick, TYPE_SPEED_MS);
    return () => {
      cancelled = true;
    };
  }, [text, onComplete]);

  return (
    <div style={{ color, lineHeight: 1.6 }}>
      {shown}
      <span style={{ opacity: shown.length === text.length ? 0 : 0.7 }}>_</span>
    </div>
  );
};

const BootSequence = ({ sceneReady, onComplete }) => {
  const [activeIdx, setActiveIdx] = useState(0);
  const [allLinesTyped, setAllLinesTyped] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);
  const dismissedRef = useRef(false);

  // Schedule lines on their delay
  useEffect(() => {
    BOOT_LINES.forEach((_, i) => {
      setTimeout(() => setActiveIdx((cur) => Math.max(cur, i + 1)), BOOT_LINES[i].delay);
    });
  }, []);

  // Mark all-typed when the last line schedules
  useEffect(() => {
    const totalDelay = BOOT_LINES[BOOT_LINES.length - 1].delay + 600;
    const t = setTimeout(() => setAllLinesTyped(true), totalDelay);
    return () => clearTimeout(t);
  }, []);

  // Dismiss once both lines done AND scene ready
  useEffect(() => {
    if (dismissedRef.current) return;
    if (allLinesTyped && sceneReady) {
      dismissedRef.current = true;
      setFadingOut(true);
      const t = setTimeout(() => onComplete?.(), 600);
      return () => clearTimeout(t);
    }
  }, [allLinesTyped, sceneReady, onComplete]);

  const progressPct = sceneReady ? 100 : Math.min(95, (activeIdx / BOOT_LINES.length) * 100);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#050816",
        zIndex: 100,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        opacity: fadingOut ? 0 : 1,
        transition: "opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
        pointerEvents: fadingOut ? "none" : "auto",
      }}
    >
      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "14px",
          maxWidth: "560px",
          width: "92vw",
          padding: "0 1rem",
        }}
      >
        {BOOT_LINES.slice(0, activeIdx).map((line, i) => (
          <TypedLine key={i} text={line.text} color={line.color} />
        ))}
      </div>

      <div
        style={{
          position: "absolute",
          bottom: "12vh",
          width: "min(420px, 80vw)",
          padding: "0 1rem",
        }}
      >
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "10px",
            color: "rgba(255,255,255,0.4)",
            marginBottom: "0.5rem",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span>SYSTEM</span>
          <span>{progressPct.toFixed(0)}%</span>
        </div>
        <div
          style={{
            height: "2px",
            background: "rgba(255,255,255,0.1)",
            borderRadius: "1px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progressPct}%`,
              background: "linear-gradient(90deg, #915eff, #00cea8)",
              transition: "width 200ms cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default BootSequence;
