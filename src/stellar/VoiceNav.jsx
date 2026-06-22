/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";
import { DESTINATIONS } from "./config/destinations";

/*
 * Web Speech API voice navigation. Phrases like "take me to Earth",
 * "go to Jupiter", or "show me projects" parse against destination
 * labels + section ids and fire onJump(idx).
 *
 * Browser support: Chrome/Edge/Safari. Falls back gracefully (button
 * hides) if SpeechRecognition is unavailable.
 */

const VoiceNav = ({ onJump }) => {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [lastHeard, setLastHeard] = useState("");
  const recogRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    setSupported(true);

    const r = new SR();
    r.continuous = false;
    r.interimResults = false;
    r.lang = "en-US";

    r.onresult = (e) => {
      const text = e.results?.[0]?.[0]?.transcript?.toLowerCase().trim() || "";
      setLastHeard(text);
      const found = findDestination(text);
      if (found != null) {
        onJump?.(found);
      }
    };
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);

    recogRef.current = r;
    return () => { try { r.abort(); } catch { /* ignore */ } };
  }, [onJump]);

  const toggle = () => {
    if (!recogRef.current) return;
    if (listening) {
      recogRef.current.stop();
      setListening(false);
    } else {
      try {
        recogRef.current.start();
        setListening(true);
      } catch { /* already started */ }
    }
  };

  if (!supported) return null;

  return (
    <>
      <button
        onClick={toggle}
        aria-label={listening ? "Stop listening" : "Voice navigation"}
        title={listening ? "Listening… say a destination" : "Voice nav — say 'take me to Earth'"}
        style={{
          position: "fixed",
          bottom: 18, right: 200,
          width: 38, height: 38, borderRadius: "50%",
          background: listening ? "rgba(255, 107, 107, 0.2)" : "rgba(6, 9, 22, 0.7)",
          backdropFilter: "blur(10px)",
          border: listening ? "1px solid rgba(255, 107, 107, 0.6)" : "1px solid rgba(255, 255, 255, 0.18)",
          color: listening ? "#ff6b6b" : "rgba(255, 255, 255, 0.6)",
          cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14,
          zIndex: 50,
          transition: "background 200ms ease, border 200ms ease, color 200ms ease",
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
          <line x1="12" y1="19" x2="12" y2="23"/>
          <line x1="8" y1="23" x2="16" y2="23"/>
        </svg>
      </button>
      {(listening || lastHeard) && (
        <div style={{
          position: "fixed",
          bottom: 64, right: 200,
          padding: "5px 10px",
          background: "rgba(6, 9, 22, 0.85)",
          backdropFilter: "blur(10px)",
          border: `1px solid ${listening ? "rgba(255, 107, 107, 0.5)" : "rgba(255, 255, 255, 0.15)"}`,
          borderRadius: 6,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 9.5,
          color: "rgba(255, 255, 255, 0.7)",
          letterSpacing: "0.08em",
          zIndex: 50,
          maxWidth: 220,
          pointerEvents: "none",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}>
          {listening ? "🎙 LISTENING…" : `↳ "${lastHeard}"`}
        </div>
      )}
    </>
  );
};

const findDestination = (text) => {
  const lower = text.toLowerCase();
  for (let i = 0; i < DESTINATIONS.length; i++) {
    const d = DESTINATIONS[i];
    const candidates = [d.id, d.section, d.label?.toLowerCase()].filter(Boolean);
    if (candidates.some((c) => lower.includes(c.toLowerCase()))) return i;
  }
  /* Synonyms */
  const synonyms = {
    sun: 0, star: 0, sol: 0, home: 0,
    mercury: 1, about: 1, intro: 1,
    venus: 2, "fun fact": 2, stats: 2,
    earth: 3, work: 3, job: 3, experience: 3,
    mars: 4, projects: 4, project: 4,
    asteroid: 5, achievement: 5, award: 5,
    jupiter: 6, skill: 6, skills: 6,
    saturn: 7, notes: 7, blog: 7,
    uranus: 8, education: 8, school: 8,
    neptune: 9, hobbies: 9, hobby: 9,
    kuiper: 10, testimonial: 10, recommend: 10,
    contact: 11, edge: 11, beacon: 11, reach: 11,
  };
  for (const [k, idx] of Object.entries(synonyms)) {
    if (lower.includes(k)) return idx;
  }
  return null;
};

export default VoiceNav;
