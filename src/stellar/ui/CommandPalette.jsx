/* eslint-disable react/prop-types */
import { useEffect, useMemo, useRef, useState } from "react";

/*
 * ⌘K Mission-Control command palette — a centered modal that fuzzy-searches the
 * command registry (warp / scan / actions / playback) and runs the selected
 * command. The app's keyboard hub opens/closes it and yields all keys while it
 * is open; this component owns arrow / enter / escape internally.
 */

const MONO = "'JetBrains Mono', monospace";

/* Lightweight relevance score: title prefix > title substring > haystack
   substring > subsequence. 0 = no match. */
const score = (q, c) => {
  const title = c.title.toLowerCase();
  if (title.startsWith(q)) return 100;
  if (title.includes(q)) return 80;
  const hay = `${title} ${c.keywords.join(" ")}`;
  if (hay.includes(q)) return 60;
  let qi = 0;
  for (let i = 0; i < hay.length && qi < q.length; i++) if (hay[i] === q[qi]) qi += 1;
  return qi === q.length ? 30 : 0;
};

const CommandPalette = ({ open, onClose, commands }) => {
  const [query, setQuery] = useState("");
  const [sel, setSel] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands
      .map((c) => [c, score(q, c)])
      .filter(([, s]) => s > 0)
      .sort((a, b) => b[1] - a[1])
      .map(([c]) => c);
  }, [query, commands]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setSel(0);
      /* focus after paint so the autofocus reliably lands */
      const t = setTimeout(() => inputRef.current?.focus(), 20);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [open]);

  useEffect(() => { setSel(0); }, [query]);

  if (!open) return null;

  const run = (c) => { if (c) { onClose(); c.run(); } };

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSel((s) => Math.min(results.length - 1, s + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSel((s) => Math.max(0, s - 1)); }
    else if (e.key === "Enter") { e.preventDefault(); run(results[sel]); }
    else if (e.key === "Escape") { e.preventDefault(); onClose(); }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 95,
        display: "flex", alignItems: "flex-start", justifyContent: "center",
        paddingTop: "14vh",
        background: "rgba(3,5,14,0.6)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)",
        animation: "cmdFade 140ms ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Command palette"
        style={{
          width: "min(560px, 92vw)", maxHeight: "68vh", display: "flex", flexDirection: "column",
          background: "rgba(9,12,24,0.96)",
          border: "1px solid rgba(145,94,255,0.3)", borderRadius: 14,
          backdropFilter: "blur(20px) saturate(1.2)", WebkitBackdropFilter: "blur(20px) saturate(1.2)",
          boxShadow: "0 40px 100px rgba(0,0,0,0.6), 0 0 40px rgba(145,94,255,0.12)",
          overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <span style={{ fontFamily: MONO, fontSize: 13, color: "#915eff" }}>⌘</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Warp, scan, control time…"
            aria-label="Search commands"
            style={{
              flex: 1, background: "transparent", border: "none", outline: "none",
              color: "white", fontFamily: MONO, fontSize: 14, caretColor: "#915eff", cursor: "text",
            }}
          />
          <kbd style={{ fontFamily: MONO, fontSize: 9, padding: "2px 6px", borderRadius: 5, border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.6)" }}>esc</kbd>
        </div>

        <div ref={listRef} style={{ overflowY: "auto", padding: 6 }}>
          {results.length === 0 && (
            <div style={{ padding: "18px 14px", fontFamily: MONO, fontSize: 12, color: "rgba(255,255,255,0.45)" }}>No commands match “{query}”.</div>
          )}
          {results.map((c, i) => {
            const active = i === sel;
            return (
              <button
                key={c.id}
                onMouseEnter={() => setSel(i)}
                onClick={() => run(c)}
                style={{
                  all: "unset", boxSizing: "border-box", width: "100%", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 9,
                  background: active ? "rgba(145,94,255,0.16)" : "transparent",
                  border: `1px solid ${active ? "rgba(145,94,255,0.4)" : "transparent"}`,
                }}
              >
                <span style={{ width: 22, textAlign: "center", fontSize: 14, color: c.accent || "rgba(255,255,255,0.7)" }}>{c.icon}</span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "block", fontFamily: MONO, fontSize: 13, color: "white", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.title}</span>
                  {c.subtitle && <span style={{ display: "block", fontFamily: MONO, fontSize: 10, color: "rgba(223,217,255,0.5)", marginTop: 1 }}>{c.subtitle}</span>}
                </span>
                {c.shortcut && <kbd style={{ fontFamily: MONO, fontSize: 9, padding: "2px 6px", borderRadius: 5, border: "1px solid rgba(255,255,255,0.18)", color: "rgba(255,255,255,0.5)" }}>{c.shortcut}</kbd>}
                <span style={{ fontFamily: MONO, fontSize: 8.5, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>{c.group}</span>
              </button>
            );
          })}
        </div>
      </div>
      <style>{`@keyframes cmdFade { from { opacity: 0 } to { opacity: 1 } }`}</style>
    </div>
  );
};

export default CommandPalette;
