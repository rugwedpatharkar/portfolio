/* eslint-disable react/prop-types */
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

/*
 * ⌘K / Ctrl-K command palette — jump to any planet, scan any object, or run an
 * action by name. Renders the existing buildCommands(ctx) registry; commands
 * whose handler wasn't provided (run not a function) are filtered out. Keyboard:
 * ↑/↓ move, Enter run, Esc close. AnimatePresence mode="wait".
 */
const CommandPalette = ({ open, commands, onClose }) => {
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);

  const list = useMemo(() => {
    const cmds = commands.filter((c) => typeof c.run === "function");
    const s = q.trim().toLowerCase();
    if (!s) return cmds;
    return cmds.filter((c) => c.title.toLowerCase().includes(s) || (c.keywords || []).some((k) => k.includes(s)));
  }, [commands, q]);

  useEffect(() => {
    if (open) { setQ(""); setActive(0); const t = setTimeout(() => inputRef.current?.focus(), 30); return () => clearTimeout(t); }
    return undefined;
  }, [open]);
  useEffect(() => { setActive(0); }, [q]);

  const run = (c) => { onClose(); c.run(); };
  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(list.length - 1, a + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(0, a - 1)); }
    else if (e.key === "Enter") { e.preventDefault(); if (list[active]) run(list[active]); }
    else if (e.key === "Escape") { e.preventDefault(); onClose(); }
  };

  return (
    <AnimatePresence mode="wait">
      {open && (
        <motion.div
          role="dialog" aria-modal="true" aria-label="Command palette"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
          onClick={onClose}
          style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(3,5,14,0.5)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)", display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: "13vh" }}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()} onKeyDown={onKeyDown}
            initial={{ opacity: 0, y: -10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            style={{ width: "min(560px, 92vw)", background: "rgba(10,13,28,0.93)", backdropFilter: "blur(16px) saturate(1.2)", WebkitBackdropFilter: "blur(16px) saturate(1.2)", border: "1px solid rgba(150,195,255,0.25)", borderRadius: 14, boxShadow: "0 30px 80px rgba(0,0,0,0.6)", overflow: "hidden" }}
          >
            <input
              ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search planets, objects, actions…"
              style={{ all: "unset", display: "block", width: "100%", boxSizing: "border-box", padding: "15px 18px", fontFamily: "'Exo 2', sans-serif", fontSize: 15, color: "white", borderBottom: "1px solid rgba(255,255,255,0.08)" }}
            />
            <div style={{ maxHeight: "48vh", overflowY: "auto", padding: 6 }}>
              {list.length === 0 && <div style={{ padding: 16, color: "rgba(255,255,255,0.4)", fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>No matches</div>}
              {list.map((c, i) => (
                <button
                  key={c.id} onClick={() => run(c)} onMouseEnter={() => setActive(i)}
                  style={{ all: "unset", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 9, background: i === active ? "rgba(150,195,255,0.14)" : "transparent" }}
                >
                  <span style={{ fontSize: 14, color: c.accent || "#9cc6ff", width: 18, textAlign: "center" }}>{c.icon}</span>
                  <span style={{ flex: 1 }}>
                    <span style={{ display: "block", fontFamily: "'Exo 2', sans-serif", fontSize: 13.5, color: "white" }}>{c.title}</span>
                    {c.subtitle && <span style={{ display: "block", fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, color: "rgba(255,255,255,0.45)" }}>{c.subtitle}</span>}
                  </span>
                  {c.shortcut && <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 4, padding: "2px 6px" }}>{c.shortcut}</span>}
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;
