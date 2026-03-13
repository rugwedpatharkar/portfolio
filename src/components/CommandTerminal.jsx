import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { personalInfo, skills, projects } from "../constants";

const COMMANDS = {
  help: () =>
    `Available commands:
  about       - Learn about me
  skills      - View my technical skills
  projects    - View my projects
  contact     - Get my contact info
  experience  - View work experience
  education   - View education
  social      - Social media links
  clear       - Clear terminal
  exit        - Close terminal`,
  about: () => personalInfo.about,
  skills: () => {
    return Object.entries(skills)
      .map(([cat, list]) => `${cat}: ${list.map((s) => s.name).join(", ")}`)
      .join("\n");
  },
  projects: () =>
    projects
      .map(
        (p, i) =>
          `${i + 1}. ${p.name}\n   ${p.tags.map((t) => `#${t.name}`).join(" ")}\n   ${p.source_code_link}`
      )
      .join("\n\n"),
  contact: () =>
    `Email: ${personalInfo.email}\nGitHub: ${personalInfo.github}\nLinkedIn: ${personalInfo.linkedin}`,
  experience: () =>
    "IT Trainee Intern @ Tech Entrepreneurs (Mar 2023 - Sep 2023)\nDeveloped Placement Portal, collaborated with cross-functional team.",
  education: () =>
    "MSc Computer Application - PVG's College (81.95%)\nBSc Computer Science - Modern College (72.57%)",
  social: () =>
    `GitHub:   ${personalInfo.github}\nLinkedIn: ${personalInfo.linkedin}`,
};

const CommandTerminal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [lines, setLines] = useState([
    { type: "output", text: 'Welcome to Rugwed\'s Terminal! Type "help" for commands.' },
  ]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "`" && e.ctrlKey) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const cmd = input.trim().toLowerCase();
    if (!cmd) return;

    const newLines = [...lines, { type: "input", text: `$ ${cmd}` }];

    if (cmd === "clear") {
      setLines([{ type: "output", text: "Terminal cleared." }]);
    } else if (cmd === "exit") {
      setIsOpen(false);
      return;
    } else if (COMMANDS[cmd]) {
      newLines.push({ type: "output", text: COMMANDS[cmd]() });
      setLines(newLines);
    } else {
      newLines.push({
        type: "error",
        text: `Command not found: "${cmd}". Type "help" for available commands.`,
      });
      setLines(newLines);
    }

    setHistory((prev) => [cmd, ...prev]);
    setHistoryIndex(-1);
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInput(history[newIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(history[newIndex]);
      } else {
        setHistoryIndex(-1);
        setInput("");
      }
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-3 left-20 sm:bottom-4 sm:left-24 z-50 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-tertiary border border-[#915eff]/30 hover:border-[#915eff] text-[#915eff] flex items-center justify-center shadow-lg transition-colors group"
        aria-label="Open terminal"
        title="Ctrl + ` to toggle"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className="absolute left-full ml-2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Terminal (Ctrl+`)
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-16 left-3 sm:bottom-20 sm:left-4 z-[60] w-[calc(100vw-24px)] max-w-[560px] rounded-xl overflow-hidden shadow-2xl border border-[#915eff]/20"
          >
            {/* Title bar */}
            <div className="bg-[#1a1a2e] px-4 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <button onClick={() => setIsOpen(false)} className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400 transition-colors" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <span className="text-secondary text-xs ml-2 font-mono">rugwed@portfolio ~ </span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-secondary hover:text-white text-xs">
                ESC
              </button>
            </div>

            {/* Terminal body */}
            <div
              ref={scrollRef}
              className="bg-[#0a0a1a] p-4 h-[300px] sm:h-[350px] overflow-y-auto font-mono text-sm"
              onClick={() => inputRef.current?.focus()}
            >
              {lines.map((line, i) => (
                <div
                  key={i}
                  className={`mb-1 whitespace-pre-wrap break-words ${
                    line.type === "input"
                      ? "text-[#00cea8]"
                      : line.type === "error"
                      ? "text-red-400"
                      : "text-gray-300"
                  }`}
                >
                  {line.text}
                </div>
              ))}

              <form onSubmit={handleSubmit} className="flex items-center">
                <span className="text-[#915eff] mr-2">$</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="bg-transparent text-white outline-none flex-1 font-mono text-sm caret-[#915eff]"
                  autoComplete="off"
                  spellCheck="false"
                />
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CommandTerminal;
