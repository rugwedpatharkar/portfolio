/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";

/*
 * Small credit-card flash that appears when the visitor clicks directly
 * on the sun (or types the konami sequence). Auto-dismisses after 3.5s.
 *
 * Triggers: window.dispatchEvent(new CustomEvent("stellar:salute"))
 *
 * The konami: ↑ ↑ ↓ ↓ ← → ← → b a
 */

const KONAMI = [
  "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
  "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight",
  "b", "a",
];

const EasterEgg = () => {
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const showFor = (text) => {
      setMessage(text);
      setShow(true);
      window.clearTimeout(window.__stellarEasterTimeout);
      window.__stellarEasterTimeout = window.setTimeout(() => setShow(false), 3500);
    };

    const onSalute = () => showFor("☀️  Made by Rugwed Patharkar · backend, late nights, and a love of space.");
    const onKonami = () => showFor("🛸  Konami code accepted. The aliens see you.");

    window.addEventListener("stellar:salute", onSalute);

    let pressed = [];
    const onKey = (e) => {
      pressed.push(e.key);
      if (pressed.length > KONAMI.length) pressed.shift();
      if (pressed.length === KONAMI.length && pressed.every((k, i) => k === KONAMI[i])) {
        onKonami();
        pressed = [];
      }
    };
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("stellar:salute", onSalute);
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(window.__stellarEasterTimeout);
    };
  }, []);

  if (!show) return null;
  return (
    <div
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        padding: "16px 24px",
        background: "rgba(8, 10, 26, 0.92)",
        border: "1px solid rgba(255, 184, 107, 0.4)",
        borderRadius: 14,
        color: "white",
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 14,
        zIndex: 100,
        boxShadow: "0 24px 60px rgba(0, 0, 0, 0.6), 0 0 60px rgba(255, 184, 107, 0.15)",
        pointerEvents: "none",
        animation: "easterFadeIn 280ms ease",
      }}
    >
      {message}
      <style>{`@keyframes easterFadeIn { from { opacity: 0; transform: translate(-50%, calc(-50% + 8px)); } to { opacity: 1; transform: translate(-50%, -50%); } }`}</style>
    </div>
  );
};

export default EasterEgg;
