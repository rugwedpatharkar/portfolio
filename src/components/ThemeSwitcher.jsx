import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const THEMES = [
  { id: "space", label: "Deep Space", icon: "🌌", accent: "#915eff", bg: "#050816" },
  { id: "cyber", label: "Cyberpunk", icon: "⚡", accent: "#00f0ff", bg: "#0a0014" },
  { id: "matrix", label: "Matrix", icon: "🟢", accent: "#00ff41", bg: "#000a00" },
];

const ThemeSwitcher = () => {
  const [open, setOpen] = useState(false);
  const [activeTheme, setActiveTheme] = useState("space");

  useEffect(() => {
    const saved = localStorage.getItem("portfolio_theme") || "space";
    setActiveTheme(saved);
    applyTheme(saved);
  }, []);

  const applyTheme = (themeId) => {
    const theme = THEMES.find((t) => t.id === themeId);
    if (!theme) return;

    const root = document.documentElement;
    root.style.setProperty("--accent-color", theme.accent);
    root.style.setProperty("--bg-color", theme.bg);

    // Apply theme-specific CSS custom properties
    document.body.setAttribute("data-theme", themeId);

    localStorage.setItem("portfolio_theme", themeId);
    setActiveTheme(themeId);
  };

  return (
    <div className="fixed top-20 sm:top-24 right-3 sm:right-4 z-50">
      <button
        onClick={() => setOpen(!open)}
        className="w-11 h-11 sm:w-10 sm:h-10 rounded-full glass-card hover:border-[#915eff] text-white flex items-center justify-center shadow-lg transition-colors text-body-sm sm:text-body"
        aria-label="Change theme"
        title="Theme switcher"
      >
        {THEMES.find((t) => t.id === activeTheme)?.icon || "🌌"}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute right-0 mt-2 glass-card rounded-2xl p-2 min-w-[140px] border border-white/[0.08]"
          >
            {THEMES.map((theme) => (
              <button
                key={theme.id}
                onClick={() => {
                  applyTheme(theme.id);
                  setOpen(false);
                  window.dispatchEvent(new CustomEvent("achievement", { detail: "timeTravel" }));
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-caption sm:text-body-sm transition-colors ${
                  activeTheme === theme.id
                    ? "text-white bg-white/10"
                    : "text-secondary hover:text-white hover:bg-white/5"
                }`}
              >
                <span>{theme.icon}</span>
                <span className="font-mono">{theme.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ThemeSwitcher;
