import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SECTIONS = [
  { key: "1", id: "about", label: "About" },
  { key: "2", id: "experience", label: "Experience" },
  { key: "3", id: "skills", label: "Skills" },
  { key: "4", id: "projects", label: "Projects" },
  { key: "5", id: "educations", label: "Education" },
  { key: "6", id: "contact", label: "Contact" },
];

const ACTIONS = [
  { keys: ["Ctrl", "`"], label: "Toggle Terminal" },
  { keys: ["?"], label: "This Panel" },
  { keys: ["Esc"], label: "Close Overlay" },
  { keys: ["T"], label: "Open Terminal" },
  { keys: ["\u2191"], label: "Scroll to Top" },
];

const Kbd = ({ children }) => (
  <kbd className="text-micro px-1.5 py-0.5 bg-[#151030]/80 rounded border border-white/10 text-white font-mono">
    {children}
  </kbd>
);

const KeyboardHints = () => {
  const [showHints, setShowHints] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

      if (e.key === "?") {
        e.preventDefault();
        setShowHints((prev) => !prev);
        return;
      }

      if (e.key === "Escape") {
        setShowHints(false);
        return;
      }

      const section = SECTIONS.find((s) => s.key === e.key);
      if (section) {
        const el = document.getElementById(section.id);
        if (el) el.scrollIntoView({ behavior: "smooth" });
        return;
      }

      if (e.key === "t" || e.key === "T") {
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "`", ctrlKey: true }));
        return;
      }

      if (e.key === "ArrowUp" && !e.ctrlKey && !e.metaKey) {
        // Only scroll to top if not in a scrollable component
        const active = document.activeElement;
        if (!active || active === document.body) {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <AnimatePresence>
      {showHints && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[65]"
            onClick={() => setShowHints(false)}
          />
          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[66] bg-[#0a0a1a]/95 border border-[#915eff]/20 rounded-2xl p-5 sm:p-7 shadow-2xl backdrop-blur-md w-[90vw] max-w-[380px]"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-heading font-semibold text-body sm:text-body-lg">
                Keyboard Shortcuts
              </h3>
              <button
                onClick={() => setShowHints(false)}
                className="text-secondary hover:text-white text-caption font-mono transition-colors"
              >
                ESC
              </button>
            </div>

            {/* Navigation */}
            <p className="text-[#915eff] text-micro font-mono uppercase tracking-wider mb-2">
              Navigate
            </p>
            <div className="space-y-1.5 mb-5">
              {SECTIONS.map((s) => (
                <div key={s.key} className="flex items-center justify-between">
                  <span className="text-white/60 text-caption sm:text-body-sm font-mono">
                    {s.label}
                  </span>
                  <Kbd>{s.key}</Kbd>
                </div>
              ))}
            </div>

            {/* Actions */}
            <p className="text-[#00cea8] text-micro font-mono uppercase tracking-wider mb-2">
              Actions
            </p>
            <div className="space-y-1.5 mb-5">
              {ACTIONS.map((a) => (
                <div key={a.label} className="flex items-center justify-between">
                  <span className="text-white/60 text-caption sm:text-body-sm font-mono">
                    {a.label}
                  </span>
                  <div className="flex items-center gap-1">
                    {a.keys.map((k, i) => (
                      <span key={i} className="flex items-center gap-1">
                        {i > 0 && <span className="text-white/20 text-micro">+</span>}
                        <Kbd>{k}</Kbd>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Easter egg hint */}
            <div className="border-t border-white/[0.06] pt-3">
              <p className="text-white/20 text-micro font-mono text-center">
                Try the Konami code for a surprise
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default KeyboardHints;
