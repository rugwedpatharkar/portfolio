import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { personalInfo, skills, projects, experiences, educations, sectionMeta } from "../content";

const SEARCH_ITEMS = [];

// Build search index from content
// Sections
Object.entries(sectionMeta).forEach(([key, meta]) => {
  SEARCH_ITEMS.push({
    type: "section",
    title: meta.heading,
    subtitle: meta.sub,
    id: key,
    keywords: `${meta.heading} ${meta.sub} ${meta.description || ""}`,
  });
});

// Skills
Object.entries(skills).forEach(([category, items]) => {
  items.forEach((skill) => {
    SEARCH_ITEMS.push({
      type: "skill",
      title: skill.name,
      subtitle: `${category} · ${skill.level}%`,
      id: "skills",
      keywords: `${skill.name} ${category}`,
    });
  });
});

// Projects
projects.forEach((proj) => {
  SEARCH_ITEMS.push({
    type: "project",
    title: proj.name,
    subtitle: proj.description?.slice(0, 80) + "...",
    id: "projects",
    keywords: `${proj.name} ${proj.description} ${proj.tags?.map(t => t.name).join(" ")}`,
  });
});

// Experiences
experiences.forEach((exp) => {
  SEARCH_ITEMS.push({
    type: "experience",
    title: exp.title,
    subtitle: `${exp.companyName} · ${exp.date}`,
    id: "experience",
    keywords: `${exp.title} ${exp.companyName} ${exp.date}`,
  });
});

// Education
educations.forEach((edu) => {
  SEARCH_ITEMS.push({
    type: "education",
    title: edu.degree,
    subtitle: `${edu.name} · ${edu.year}`,
    id: "education",
    keywords: `${edu.degree} ${edu.name} ${edu.year}`,
  });
});

const TYPE_ICONS = {
  section: "§",
  skill: "◆",
  project: "▸",
  experience: "●",
  education: "▪",
};

const TYPE_COLORS = {
  section: "#915eff",
  skill: "#00cea8",
  project: "#61dafb",
  experience: "#f8c555",
  education: "#bf61ff",
};

const SpotlightSearch = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const results = useMemo(() => {
    if (!query.trim()) return SEARCH_ITEMS.slice(0, 8);
    const q = query.toLowerCase();
    return SEARCH_ITEMS.filter((item) =>
      item.keywords.toLowerCase().includes(q)
    ).slice(0, 10);
  }, [query]);

  const navigate = useCallback((id) => {
    setOpen(false);
    setQuery("");
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Cmd+K to toggle
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Keyboard navigation within results
  const onInputKey = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      navigate(results[selectedIndex].id);
    }
  };

  // Scroll selected into view
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const selected = list.children[selectedIndex];
    if (selected) selected.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[95] flex items-start justify-center pt-[15vh]"
          onClick={() => setOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Search card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2, ease: [0.04, 0.62, 0.23, 0.98] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-[90vw] max-w-lg glass-card rounded-2xl border border-white/[0.08] overflow-hidden shadow-2xl"
          >
            {/* Input */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.06]">
              <svg className="w-5 h-5 text-white/40 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
                onKeyDown={onInputKey}
                placeholder="Search portfolio..."
                className="flex-1 bg-transparent text-white text-body placeholder:text-white/30 outline-none font-mono"
              />
              <kbd className="hidden sm:inline text-micro font-mono text-white/20 bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/[0.08]">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div ref={listRef} className="max-h-[50vh] overflow-y-auto py-2">
              {results.length === 0 ? (
                <div className="px-5 py-8 text-center text-white/40 text-body-sm font-mono">
                  No results found
                </div>
              ) : (
                results.map((item, i) => (
                  <button
                    key={`${item.type}-${item.title}-${i}`}
                    onClick={() => navigate(item.id)}
                    className={`w-full flex items-center gap-3 px-5 py-3 text-left transition-colors ${
                      i === selectedIndex
                        ? "bg-[#915eff]/10"
                        : "hover:bg-white/[0.03]"
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
                    <span className="text-micro font-mono text-white/20 capitalize shrink-0">
                      {item.type}
                    </span>
                  </button>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-2.5 border-t border-white/[0.06] flex items-center gap-4 text-micro font-mono text-white/20">
              <span>↑↓ Navigate</span>
              <span>↵ Open</span>
              <span>ESC Close</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SpotlightSearch;
