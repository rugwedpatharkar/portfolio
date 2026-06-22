/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";

/*
 * Listens to keypresses globally — type "42" anywhere outside an input
 * and the screen briefly flashes green ("the answer to life, the
 * universe, and everything"). Fires 'stellar:answer42' so Achievements
 * unlocks the badge.
 */

const AnswerListener = () => {
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    let buffer = "";
    const onKey = (e) => {
      if (e.target?.tagName === "INPUT" || e.target?.tagName === "TEXTAREA") return;
      if (e.key === "4" || e.key === "2") {
        buffer += e.key;
        if (buffer.length > 2) buffer = buffer.slice(-2);
        if (buffer === "42") {
          window.dispatchEvent(new CustomEvent("stellar:answer42"));
          console.log("%c42 — the answer.", "color: #7df2c0; font-size: 14px; font-family: monospace;");
          setFlash(true);
          setTimeout(() => setFlash(false), 1100);
          buffer = "";
        }
      } else {
        buffer = "";
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!flash) return null;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "radial-gradient(ellipse at center, rgba(125, 242, 192, 0.18) 0%, rgba(125, 242, 192, 0) 65%)",
        pointerEvents: "none",
        zIndex: 95,
        animation: "answer42Flash 1.1s ease",
      }}
    >
      <div style={{
        position: "absolute",
        top: "50%", left: "50%", transform: "translate(-50%, -50%)",
        fontSize: "clamp(120px, 18vw, 220px)",
        fontWeight: 800,
        color: "#7df2c0",
        fontFamily: "'Sora', sans-serif",
        textShadow: "0 0 60px rgba(125, 242, 192, 0.55)",
        letterSpacing: "-0.04em",
      }}>42</div>
      <style>{`
        @keyframes answer42Flash {
          0% { opacity: 0; }
          15%, 70% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default AnswerListener;
