import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { personalInfo, skills, projects, experiences, educations, sectionMeta } from "../content";
import { scrollToSection } from "../utils/scrollTo";

/*
 * Unified command palette — absorbs the old terminal commands into a single
 * Linear/Raycast-style ⌘K interface. ⌘K and Ctrl+` both open it.
 *
 * Items have shape:
 *   { type, title, subtitle, keywords, action }
 *
 * Sections / skills / projects / experiences / education all navigate to the
 * matching DOM id. Commands run a function (toggle theme, copy email, etc).
 */

const SEARCH_ITEMS = [];

Object.entries(sectionMeta).forEach(([key, meta]) => {
  SEARCH_ITEMS.push({
    type: "section",
    title: meta.heading,
    subtitle: meta.sub || "Section",
    keywords: `${meta.heading} ${meta.sub} ${meta.description || ""}`,
    action: { kind: "scroll", id: key },
  });
});

Object.entries(skills).forEach(([category, items]) => {
  items.forEach((skill) => {
    SEARCH_ITEMS.push({
      type: "skill",
      title: skill.name,
      subtitle: `${category} · ${skill.level}%`,
      keywords: `${skill.name} ${category}`,
      action: { kind: "scroll", id: "skills" },
    });
  });
});

projects.forEach((proj) => {
  SEARCH_ITEMS.push({
    type: "project",
    title: proj.name,
    subtitle: (proj.description || "").slice(0, 80) + (proj.description?.length > 80 ? "…" : ""),
    keywords: `${proj.name} ${proj.description} ${proj.tags?.map((t) => t.name).join(" ")}`,
    action: { kind: "scroll", id: "projects" },
  });
});

experiences.forEach((exp) => {
  SEARCH_ITEMS.push({
    type: "experience",
    title: exp.title,
    subtitle: `${exp.companyName} · ${exp.date}`,
    keywords: `${exp.title} ${exp.companyName} ${exp.date}`,
    action: { kind: "scroll", id: "experience" },
  });
});

educations.forEach((edu) => {
  SEARCH_ITEMS.push({
    type: "education",
    title: edu.degree,
    subtitle: `${edu.name} · ${edu.year}`,
    keywords: `${edu.degree} ${edu.name} ${edu.year}`,
    action: { kind: "scroll", id: "education" },
  });
});

/* ── Commands: actions, not destinations ── */
const COMMAND_ITEMS = [
  {
    type: "command",
    title: "Copy email",
    subtitle: personalInfo.email,
    keywords: "copy email contact mail address clipboard",
    action: {
      kind: "run",
      fn: async (toast) => {
        try {
          await navigator.clipboard.writeText(personalInfo.email);
          toast?.("Email copied to clipboard", "success", 2000);
        } catch {
          toast?.("Couldn't copy — try again", "warning", 2000);
        }
      },
    },
  },
  {
    type: "command",
    title: "Open GitHub",
    subtitle: personalInfo.github,
    keywords: "github profile open source code",
    action: { kind: "open", url: personalInfo.github },
  },
  {
    type: "command",
    title: "Open LinkedIn",
    subtitle: personalInfo.linkedin,
    keywords: "linkedin profile network",
    action: { kind: "open", url: personalInfo.linkedin },
  },
  {
    type: "command",
    title: "Theme · Deep Space",
    subtitle: "Default purple ambient gradient",
    keywords: "theme space default purple gradient",
    action: { kind: "theme", id: "space" },
  },
  {
    type: "command",
    title: "Theme · Cyberpunk",
    subtitle: "Cyan accent + matrix rain",
    keywords: "theme cyber cyan cyberpunk",
    action: { kind: "theme", id: "cyber" },
  },
  {
    type: "command",
    title: "Theme · Matrix",
    subtitle: "Green accent + matrix rain",
    keywords: "theme matrix green",
    action: { kind: "theme", id: "matrix" },
  },
  {
    type: "command",
    title: "Toggle Cinema Mode",
    subtitle: "Hide all UI chrome for a clean look",
    keywords: "cinema mode hide chrome distraction free zen focus",
    action: {
      kind: "run",
      fn: () => window.dispatchEvent(new CustomEvent("cinema-mode", { detail: "toggle" })),
    },
  },
  {
    type: "command",
    title: "Open resume",
    subtitle: "Opens the PDF in a new tab",
    keywords: "resume cv pdf download print",
    action: { kind: "open", url: "/Rugwed-Patharkar-Resume.pdf" },
  },
  {
    type: "command",
    title: "Print page",
    subtitle: "Print-optimized stylesheet applies automatically",
    keywords: "print save pdf paper",
    action: { kind: "run", fn: () => window.print() },
  },
];

const ALL_ITEMS = [...SEARCH_ITEMS, ...COMMAND_ITEMS];

const TYPE_ICONS = {
  section: "§",
  skill: "◆",
  project: "▸",
  experience: "●",
  education: "▪",
  command: "⌘",
};

const TYPE_COLORS = {
  section: "#915eff",
  skill: "#00cea8",
  project: "#61dafb",
  experience: "#f8c555",
  education: "#bf61ff",
  command: "#ff9a3c",
};

const applyTheme = (themeId) => {
  const THEMES = {
    space: { accent: "#915eff", bg: "#050816" },
    cyber: { accent: "#00f0ff", bg: "#0a0014" },
    matrix: { accent: "#00ff41", bg: "#000a00" },
  };
  const theme = THEMES[themeId];
  if (!theme) return;
  const root = document.documentElement;
  root.style.setProperty("--accent-color", theme.accent);
  root.style.setProperty("--bg-color", theme.bg);
  document.body.setAttribute("data-theme", themeId);
  localStorage.setItem("portfolio_theme", themeId);
  window.dispatchEvent(new CustomEvent("portfolio-theme-change", { detail: themeId }));
};

const SpotlightSearch = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mode, setMode] = useState("all"); // "all" | "commands"
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const pool = useMemo(() => (mode === "commands" ? COMMAND_ITEMS : ALL_ITEMS), [mode]);

  const results = useMemo(() => {
    const trimmed = query.trim();
    // ">" prefix routes to command mode, VS Code-style
    if (trimmed.startsWith(">")) {
      const q = trimmed.slice(1).toLowerCase().trim();
      if (!q) return COMMAND_ITEMS.slice(0, 10);
      return COMMAND_ITEMS.filter((i) => i.keywords.toLowerCase().includes(q)).slice(0, 10);
    }
    if (!trimmed) return pool.slice(0, 10);
    const q = trimmed.toLowerCase();
    return pool.filter((item) => item.keywords.toLowerCase().includes(q)).slice(0, 10);
  }, [query, pool]);

  const runItem = useCallback((item) => {
    if (!item) return;
    const { action } = item;
    if (!action) return;
    setOpen(false);
    setQuery("");

    switch (action.kind) {
      case "scroll":
        scrollToSection(action.id);
        break;
      case "open":
        window.open(action.url, "_blank", "noopener,noreferrer");
        break;
      case "theme":
        applyTheme(action.id);
        break;
      case "run":
        action.fn?.();
        break;
      default:
        break;
    }
    window.dispatchEvent(new CustomEvent("achievement", { detail: "explorer" }));
  }, []);

  // ⌘K and Ctrl+` both open the palette. Ctrl+` opens in command-only mode.
  useEffect(() => {
    const onKey = (e) => {
      const isCmdK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k";
      const isCtrlBacktick = e.ctrlKey && e.key === "`";
      if (isCmdK) {
        e.preventDefault();
        setMode("all");
        setOpen((prev) => !prev);
      } else if (isCtrlBacktick) {
        e.preventDefault();
        setMode("commands");
        setOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery(mode === "commands" ? ">" : "");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open, mode]);

  const onInputKey = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      runItem(results[selectedIndex]);
    } else if (e.key === "Tab") {
      // Tab toggles between search and command modes
      e.preventDefault();
      setMode((m) => (m === "all" ? "commands" : "all"));
      setQuery("");
      setSelectedIndex(0);
    }
  };

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const selected = list.children[selectedIndex];
    if (selected) selected.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  const inCommandMode = mode === "commands" || query.startsWith(">");

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[95] flex items-start justify-center pt-[12vh] sm:pt-[15vh]"
          onClick={() => setOpen(false)}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2, ease: [0.04, 0.62, 0.23, 0.98] }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="Command palette"
            aria-modal="true"
            className="relative w-[92vw] max-w-xl glass-card rounded-2xl border border-white/[0.08] overflow-hidden shadow-2xl"
          >
            {/* Mode tabs */}
            <div className="flex items-center gap-1 px-2 pt-2 border-b border-white/[0.04]">
              {[
                { id: "all", label: "Search" },
                { id: "commands", label: "Commands" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { setMode(tab.id); setQuery(tab.id === "commands" ? ">" : ""); setSelectedIndex(0); inputRef.current?.focus(); }}
                  className={`px-3 py-1.5 text-caption font-mono rounded-md transition-colors ${
                    (mode === tab.id || (tab.id === "commands" && inCommandMode))
                      ? "bg-white/[0.06] text-white"
                      : "text-white/40 hover:text-white/70"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
              <span className="ml-auto pr-3 text-micro font-mono text-white/30 hidden sm:inline">
                Tab to switch
              </span>
            </div>

            <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.06]">
              <svg className="w-5 h-5 text-white/40 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
                onKeyDown={onInputKey}
                placeholder={inCommandMode ? "Type a command…" : "Search portfolio…"}
                aria-label="Search portfolio or run a command"
                aria-autocomplete="list"
                aria-controls="spotlight-results"
                aria-activedescendant={results[selectedIndex] ? `spotlight-item-${selectedIndex}` : undefined}
                role="combobox"
                aria-expanded="true"
                className="flex-1 bg-transparent text-white text-body placeholder:text-white/30 outline-none font-mono"
              />
              <kbd className="hidden sm:inline text-micro font-mono text-white/30 bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/[0.08]">
                ESC
              </kbd>
            </div>

            <div ref={listRef} id="spotlight-results" role="listbox" aria-label="Results" className="max-h-[50vh] overflow-y-auto py-2">
              {results.length === 0 ? (
                <div className="px-5 py-8 text-center text-white/40 text-body-sm font-mono">
                  No results found
                </div>
              ) : (
                results.map((item, i) => (
                  <button
                    key={`${item.type}-${item.title}-${i}`}
                    id={`spotlight-item-${i}`}
                    role="option"
                    aria-selected={i === selectedIndex}
                    onClick={() => runItem(item)}
                    onMouseEnter={() => setSelectedIndex(i)}
                    className={`w-full flex items-center gap-3 px-5 py-3 text-left transition-colors ${
                      i === selectedIndex ? "bg-[#915eff]/10" : "hover:bg-white/[0.03]"
                    }`}
                  >
                    <span
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-micro shrink-0"
                      style={{
                        color: TYPE_COLORS[item.type],
                        background: `${TYPE_COLORS[item.type]}15`,
                      }}
                    >
                      {TYPE_ICONS[item.type]}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-white text-body-sm font-medium truncate">
                        {item.title}
                      </p>
                      <p className="text-white/40 text-caption font-mono truncate">
                        {item.subtitle}
                      </p>
                    </div>
                    <span className="text-micro font-mono text-white/30 capitalize shrink-0">
                      {item.type}
                    </span>
                  </button>
                ))
              )}
            </div>

            <div className="px-5 py-2.5 border-t border-white/[0.06] flex items-center gap-4 text-micro font-mono text-white/30">
              <span>↑↓ Navigate</span>
              <span>↵ Run</span>
              <span>Tab Switch</span>
              <span className="hidden sm:inline">⌘K / Ctrl ` Open</span>
              <span className="ml-auto">ESC Close</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SpotlightSearch;
