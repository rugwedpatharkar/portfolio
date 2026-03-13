import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SHORTCUTS = [
  { key: "T", action: "Terminal", handler: () => document.querySelector('[aria-label="Open terminal"]')?.click() },
  { key: "↑", action: "Top", handler: () => window.scrollTo({ top: 0, behavior: "smooth" }) },
];

const SECTIONS = [
  { key: "1", id: "about" },
  { key: "2", id: "experience" },
  { key: "3", id: "skills" },
  { key: "4", id: "projects" },
  { key: "5", id: "educations" },
  { key: "6", id: "contact" },
];

const KeyboardHints = () => {
  const [showHints, setShowHints] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if typing in input
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

      // ? or / to toggle hints
      if (e.key === "?" || (e.key === "/" && !e.ctrlKey)) {
        e.preventDefault();
        setShowHints((prev) => !prev);
        return;
      }

      // Escape to close
      if (e.key === "Escape") {
        setShowHints(false);
        return;
      }

      // Number keys to navigate sections
      const section = SECTIONS.find((s) => s.key === e.key);
      if (section) {
        const el = document.getElementById(section.id);
        if (el) el.scrollIntoView({ behavior: "smooth" });
        return;
      }

      // T for terminal
      if (e.key === "t" || e.key === "T") {
        SHORTCUTS[0].handler();
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <AnimatePresence>
      {showHints && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-20 right-3 sm:bottom-24 sm:right-4 z-[60] bg-[#0a0a1a]/95 border border-[#915eff]/20 rounded-xl p-4 sm:p-5 shadow-2xl backdrop-blur-sm max-w-[280px]"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-semibold text-sm">Keyboard Shortcuts</h3>
            <button
              onClick={() => setShowHints(false)}
              className="text-secondary hover:text-white text-xs"
            >
              ESC
            </button>
          </div>

          <div className="space-y-1.5">
            <p className="text-secondary text-[10px] uppercase tracking-wider mb-2">Navigation</p>
            {SECTIONS.map((s) => (
              <div key={s.key} className="flex items-center justify-between">
                <span className="text-secondary text-xs capitalize">{s.id}</span>
                <kbd className="text-[10px] px-1.5 py-0.5 bg-tertiary rounded border border-secondary/20 text-white font-mono">
                  {s.key}
                </kbd>
              </div>
            ))}

            <p className="text-secondary text-[10px] uppercase tracking-wider mt-3 mb-2">Actions</p>
            {SHORTCUTS.map((s) => (
              <div key={s.key} className="flex items-center justify-between">
                <span className="text-secondary text-xs">{s.action}</span>
                <kbd className="text-[10px] px-1.5 py-0.5 bg-tertiary rounded border border-secondary/20 text-white font-mono">
                  {s.key}
                </kbd>
              </div>
            ))}
            <div className="flex items-center justify-between">
              <span className="text-secondary text-xs">Shortcuts</span>
              <kbd className="text-[10px] px-1.5 py-0.5 bg-tertiary rounded border border-secondary/20 text-white font-mono">
                ?
              </kbd>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default KeyboardHints;
