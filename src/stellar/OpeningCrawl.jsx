import { useEffect, useRef } from "react";
import { personalInfo } from "../content";

/*
 * PHASE 1C — the opening crawl. A receding 3D-transform title card over a dark
 * star layer (a lightspeed-nod, original + trademark-safe — no SW font/logo). The
 * black + bridge-hum hold is the crawl's first moment (text fades in), then the
 * lines recede into the stars. Auto-advances; any gesture skips it straight to the
 * countdown (the whole intro is skippable via the SKIP pill in IntroSequence).
 */

const AUTO_MS = 5200;

const star = (n, seed) =>
  Array.from({ length: n }, (_, i) => {
    const r = (k) => ((Math.sin((i + 1) * (seed + k) * 12.9898) * 43758.5453) % 1 + 1) % 1;
    return `${(r(1) * 100).toFixed(2)}% ${(r(2) * 100).toFixed(2)}%`;
  });

const STARS = star(70, 7.7);

const OpeningCrawl = ({ onDone }) => {
  const doneRef = useRef(false);

  useEffect(() => {
    const finish = () => {
      if (doneRef.current) return;
      doneRef.current = true;
      onDone?.();
    };
    const t = setTimeout(finish, AUTO_MS);
    const skip = () => finish();
    window.addEventListener("pointerdown", skip);
    window.addEventListener("keydown", skip);
    window.addEventListener("wheel", skip, { passive: true });
    window.addEventListener("touchstart", skip, { passive: true });
    return () => {
      clearTimeout(t);
      window.removeEventListener("pointerdown", skip);
      window.removeEventListener("keydown", skip);
      window.removeEventListener("wheel", skip);
      window.removeEventListener("touchstart", skip);
    };
  }, [onDone]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 82,
        background: "radial-gradient(ellipse at 50% 60%, #060a16 0%, #02030a 70%, #010109 100%)",
        overflow: "hidden",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
    >
      <style>{`
        @keyframes scCrawl {
          0%   { transform: rotateX(32deg) translateY(58%) translateZ(0);    opacity: 0; }
          10%  { opacity: 1; }
          88%  { opacity: 1; }
          100% { transform: rotateX(32deg) translateY(-128%) translateZ(-460px); opacity: 0; }
        }
        @keyframes scTwinkle { 0%,100% { opacity: 0.25 } 50% { opacity: 0.9 } }
      `}</style>

      {/* star layer */}
      {STARS.map((pos, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            left: pos.split(" ")[0],
            top: pos.split(" ")[1],
            width: i % 9 === 0 ? 2.4 : 1.4,
            height: i % 9 === 0 ? 2.4 : 1.4,
            borderRadius: "50%",
            background: "#cfe0ff",
            opacity: 0.5,
            animation: `scTwinkle ${3 + (i % 5)}s ease-in-out ${(i % 7) * 0.3}s infinite`,
          }}
        />
      ))}

      {/* perspective viewport — the crawl recedes toward the top */}
      <div
        style={{
          perspective: "440px",
          perspectiveOrigin: "50% 30%",
          width: "min(760px, 84vw)",
          height: "78vh",
          overflow: "hidden",
          WebkitMaskImage: "linear-gradient(to top, transparent 4%, #000 26%, #000 70%, transparent 96%)",
          maskImage: "linear-gradient(to top, transparent 4%, #000 26%, #000 70%, transparent 96%)",
        }}
      >
        <div
          style={{
            transformOrigin: "50% 100%",
            animation: `scCrawl ${AUTO_MS}ms cubic-bezier(0.4, 0, 0.7, 1) both`,
            textAlign: "center",
            color: "#cfe2ff",
          }}
        >
          <div style={{ fontFamily: "'Chakra Petch', sans-serif", letterSpacing: "0.46em", fontSize: 13, color: "#6f9fe6", marginBottom: 30, paddingLeft: "0.46em" }}>
            STELLAR&nbsp;COMMAND
          </div>
          <div style={{ fontFamily: "'Chakra Petch', sans-serif", fontSize: "clamp(34px, 6vw, 54px)", fontWeight: 700, letterSpacing: "0.1em", color: "#eaf3ff", textShadow: "0 0 34px rgba(120,180,255,0.45)" }}>
            {personalInfo.fullName.toUpperCase()}
          </div>
          <div style={{ fontFamily: "'Martian Mono', monospace", fontSize: "clamp(13px, 2vw, 17px)", letterSpacing: "0.16em", color: "#8fb6f2", marginTop: 16 }}>
            {personalInfo.role.toUpperCase()} · BACKEND & AGENTIC&nbsp;AI
          </div>
          <p style={{ fontFamily: "'Chakra Petch', sans-serif", fontSize: "clamp(16px, 2.4vw, 21px)", lineHeight: 1.8, color: "#bcd4f5", marginTop: 46, opacity: 0.95 }}>
            Across a galaxy of thirty-one microservices, one engineer charts the
            systems that keep the lights on — resilient backends, production agentic
            AI, and APIs that never surprise the people who depend on them.
          </p>
          <p style={{ fontFamily: "'Chakra Petch', sans-serif", fontSize: "clamp(15px, 2.2vw, 19px)", lineHeight: 1.8, color: "#9fc0ee", marginTop: 30 }}>
            Set course for the inner system. Welcome aboard.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OpeningCrawl;
