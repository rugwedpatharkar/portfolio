 
import { useEffect, useState } from "react";

/*
 * Press "?" to open. Displays every keyboard shortcut + every
 * interactive surface in the portfolio so a recruiter discovers all
 * the easter eggs and modes without trial-and-error.
 */

const SECTIONS = [
  {
    title: "Navigation",
    rows: [
      ["Scroll", "Move along the tour route"],
      ["Click a planet", "Jump to that destination"],
      ["Click any minimap row", "Jump"],
      ["Click any side-rail row", "Jump"],
      ["← / →", "Browser back / forward (hash route)"],
    ],
  },
  {
    title: "Modes",
    rows: [
      ["⌖ button", "Free-roam — WASD + Q/E + Shift"],
      ["Esc", "Exit free-roam"],
      ["⊕ button", "Cockpit HUD frame"],
      ["▤ button", "Mission report (visited + badges)"],
      ["🎙 button", "Voice nav — say 'take me to Earth'"],
      ["🔊 button", "Ambient space drone + whoosh on transitions"],
    ],
  },
  {
    title: "Hidden things",
    rows: [
      ["Click the sun", "☀ Sun salute"],
      ["↑↑↓↓←→←→ba", "🛸 Konami — alien greeting"],
      ["Type 42 anywhere", "Hitchhiker's answer"],
      ["Look near asteroid belt", "☠ A familiar moon"],
      ["Around Saturn, periodically", "Blue police box (vworp vworp)"],
      ["Near Jupiter", "Red unblinking eye"],
      ["Past Neptune", "Small robot watching"],
      ["Mars north pole, close range", "Mark Watney's potato"],
      ["Saturn's rings", "Cooper Station spins"],
    ],
  },
  {
    title: "Tools",
    rows: [
      ["Z", "Wide pull-back · system overview"],
      ["Shift + F", "FPS monitor"],
      ["? (any time)", "This help overlay"],
    ],
  },
];

const HelpOverlay = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      const inField = e.target?.tagName === "INPUT" || e.target?.tagName === "TEXTAREA";
      if (inField) return;
      if (e.key === "?" || (e.shiftKey && e.key === "/")) {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) return null;

  return (
    <div
      onClick={() => setOpen(false)}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(3, 5, 14, 0.85)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        fontFamily: "'Martian Mono', monospace",
        color: "white",
        cursor: "pointer",
        animation: "helpOpen 280ms ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: 720,
          width: "100%",
          padding: "28px 32px",
          background: "rgba(8, 10, 26, 0.96)",
          border: "1px solid rgba(47, 224, 176, 0.45)",
          borderRadius: 14,
          boxShadow: "0 30px 80px rgba(0, 0, 0, 0.6), inset 0 0 80px rgba(47, 224, 176, 0.04)",
          cursor: "default",
          maxHeight: "82vh",
          overflowY: "auto",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 9, color: "#2fe0b0", letterSpacing: "0.2em" }}>STELLAR · OPERATOR MANUAL</div>
            <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "'Chakra Petch', sans-serif", marginTop: 4 }}>
              All the things you can do
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            style={{
              all: "unset",
              cursor: "pointer",
              padding: "4px 10px",
              border: "1px solid rgba(255,255,255,0.18)",
              borderRadius: 4,
              fontSize: 10,
              color: "rgba(255,255,255,0.6)",
              letterSpacing: "0.1em",
            }}
          >ESC</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "18px 28px" }}>
          {SECTIONS.map((s) => (
            <div key={s.title}>
              <div style={{ fontSize: 10, color: "#2fe0b0", letterSpacing: "0.14em", marginBottom: 8 }}>
                {s.title.toUpperCase()}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "4px 14px", fontSize: 11.5 }}>
                {s.rows.map(([k, v]) => (
                  <div key={k} style={{ display: "contents" }}>
                    <span style={{ color: "#ffe1a8" }}>{k}</span>
                    <span style={{ color: "rgba(255,255,255,0.72)" }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 16, fontSize: 10, color: "rgba(255,255,255,0.4)", textAlign: "center" }}>
          Built by Rugwed Patharkar · backend systems + agentic AI on production · {" "}
          <a href="https://github.com/rugwedpatharkar" target="_blank" rel="noopener noreferrer" style={{ color: "#2fe0b0" }}>github</a>
        </div>
      </div>

      <style>{`
        @keyframes helpOpen {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default HelpOverlay;
