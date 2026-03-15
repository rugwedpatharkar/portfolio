/* eslint-disable react/prop-types */
import { useState, useEffect, useRef, useMemo, memo } from "react";
import { skills } from "../constants";

const ASCII_ART = [
  "  ██████╗ ██████╗ ",
  "  ██╔══██╗██╔══██╗",
  "  ██████╔╝██████╔╝",
  "  ██╔══██╗██╔═══╝ ",
  "  ██║  ██║██║     ",
  "  ╚═╝  ╚═╝╚═╝    ",
].join("\n");

const CATEGORY_COLORS = {
  Languages: "#915eff",
  "Backend Frameworks": "#00cea8",
  Frontend: "#61dafb",
  "AI & Emerging Tech": "#f8c555",
  Databases: "#ff6b6b",
  "Cloud & DevOps": "#326ce5",
  "Tools & Platforms": "#68a063",
};

/* ── Single skill bar row — bar stretches to fill width ── */
const SkillBar = memo(({ name, level, color, visible, delay }) => (
  <div
    className="skill-term-row flex items-center gap-2 sm:gap-3 font-mono text-caption sm:text-body-sm leading-[1.8] hover:bg-white/[0.04] px-2 -mx-2 rounded cursor-default transition-colors"
    style={
      visible
        ? { animation: `termLineIn 0.3s ease-out ${delay}s both` }
        : { opacity: 0 }
    }
  >
    <span className="text-white/70 w-[12ch] sm:w-[16ch] shrink-0 truncate">
      {name}
    </span>

    {/* Bar container — flex-1 stretches to fill remaining width */}
    <div className="relative flex-1 h-[1.1em] min-w-0" role="progressbar" aria-valuenow={level} aria-valuemin={0} aria-valuemax={100} aria-label={`${name} proficiency`}>
      {/* Background track */}
      <div
        className="absolute inset-0 rounded-sm"
        style={{ background: `${color}10` }}
      />
      {/* Fill bar */}
      <div
        className="absolute inset-y-0 left-0 rounded-sm"
        style={{
          width: visible ? `${level}%` : "0%",
          background: `linear-gradient(90deg, ${color}90, ${color})`,
          boxShadow: `0 0 12px ${color}30`,
          transition: `width 1s ease-out ${delay + 0.2}s`,
        }}
      />
      {/* Scanline texture on bar */}
      <div
        className="absolute inset-0 rounded-sm opacity-20"
        style={{
          backgroundImage: `repeating-linear-gradient(90deg, transparent 0px, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)`,
        }}
      />
    </div>

    <span className="text-white/50 w-[3ch] text-right shrink-0 tabular-nums">
      {level}%
    </span>
  </div>
));

/* ── Main terminal component ── */
const SkillTerminal = () => {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setVisible(true);
      },
      { threshold: 0.1 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const stats = useMemo(() => {
    const all = Object.values(skills).flat();
    const total = all.length;
    const avg = Math.round(
      all.reduce((a, s) => a + s.level, 0) / total
    );
    const top = [...all]
      .sort((a, b) => b.level - a.level)
      .slice(0, 3)
      .map((s) => s.name)
      .join(", ");
    return { total, avg, top, domains: Object.keys(skills).length };
  }, []);

  /* Sequential delay counter — resets each render */
  let lineIdx = 0;
  const d = () => (lineIdx++) * 0.03;

  const ls = (delay) =>
    visible
      ? { animation: `termLineIn 0.3s ease-out ${delay}s both` }
      : { opacity: 0 };

  return (
    <div ref={ref} className="skill-terminal mt-6 sm:mt-8 card-shine glow-hover">
      {/* ── Terminal chrome ── */}
      <div className="skill-terminal-chrome flex items-center justify-between px-4 py-2.5 sm:py-3 rounded-t-xl">
        <div className="flex gap-1.5 sm:gap-2">
          <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#ff5f57]" />
          <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#febc2e]" />
          <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#28c840]" />
        </div>
        <span className="text-white/40 text-micro sm:text-micro font-mono tracking-wide">
          rugwed@portfolio — skills
        </span>
        <div className="w-10 sm:w-12" />
      </div>

      {/* ── Terminal body ── */}
      <div className="skill-terminal-body relative px-3 sm:px-6 py-4 sm:py-6 overflow-x-auto">
        {/* CRT scanline overlay */}
        <div className="skill-terminal-scanline" />

        {/* $ neofetch --skills */}
        <div
          className="font-mono text-caption sm:text-body-sm"
          style={ls(d())}
        >
          <span className="text-green-400">❯</span>{" "}
          <span className="text-[#61dafb]">neofetch</span>{" "}
          <span className="text-white/40">--skills</span>
        </div>

        {/* ── neofetch output block ── */}
        <div
          className="flex flex-col sm:flex-row gap-3 sm:gap-8 my-3 sm:my-5"
          style={ls(d() + 0.1)}
        >
          {/* ASCII art — hidden on small screens */}
          <pre
            className="hidden md:block text-[#915eff] text-micro leading-[1.2] select-none shrink-0"
            style={{ textShadow: "0 0 14px rgba(145, 94, 255, 0.4)" }}
          >
            {ASCII_ART}
          </pre>

          {/* System info */}
          <div className="font-mono text-caption sm:text-body-sm space-y-0.5">
            <div>
              <span className="text-[#915eff] font-bold">rugwed</span>
              <span className="text-white/30">@</span>
              <span className="text-[#00cea8] font-bold">portfolio</span>
            </div>
            <div className="text-white/15 select-none">
              ──────────────────
            </div>
            <div>
              <span className="text-white/40">OS:</span>{" "}
              <span className="text-white/70">Engineer v3.0</span>
            </div>
            <div>
              <span className="text-white/40">Shell:</span>{" "}
              <span className="text-white/70">Python / JavaScript</span>
            </div>
            <div>
              <span className="text-white/40">Stack:</span>{" "}
              <span className="text-white/70">
                {stats.total} technologies
              </span>
            </div>
            <div>
              <span className="text-white/40">Domains:</span>{" "}
              <span className="text-white/70">
                {stats.domains} categories
              </span>
            </div>
            <div>
              <span className="text-white/40">Uptime:</span>{" "}
              <span className="text-white/70">3+ years</span>
            </div>
            <div>
              <span className="text-white/40">Avg Level:</span>{" "}
              <span className="text-[#00cea8]">{stats.avg}%</span>
            </div>
            <div>
              <span className="text-white/40">Top:</span>{" "}
              <span className="text-[#f8c555]">{stats.top}</span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="text-white/10 my-2 font-mono text-caption sm:text-body-sm select-none overflow-hidden whitespace-nowrap">
          {"─".repeat(120)}
        </div>

        {/* $ cat skills.json | jq */}
        <div
          className="font-mono text-caption sm:text-body-sm mb-4"
          style={ls(d())}
        >
          <span className="text-green-400">❯</span>{" "}
          <span className="text-[#61dafb]">cat</span>{" "}
          <span className="text-white/70">skills.json</span>{" "}
          <span className="text-white/30">|</span>{" "}
          <span className="text-[#61dafb]">jq</span>{" "}
          <span className="text-[#00cea8]">{"'.categories[]'"}</span>
        </div>

        {/* ── Skills grid — 2 columns on desktop ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 sm:gap-y-5">
          {Object.entries(skills).map(([category, categorySkills]) => {
            const color = CATEGORY_COLORS[category] || "#915eff";
            const catDelay = d();

            return (
              <div key={category}>
                {/* Category header */}
                <div
                  className="font-mono text-caption sm:text-body-sm mb-1"
                  style={ls(catDelay)}
                >
                  <span style={{ color: color + "60" }}>//</span>{" "}
                  <span className="font-bold" style={{ color }}>
                    {category}
                  </span>
                  <span className="text-white/20 ml-2">
                    ({categorySkills.length})
                  </span>
                </div>

                {/* Skill bars */}
                {categorySkills.map((skill) => (
                  <SkillBar
                    key={skill.name}
                    name={skill.name}
                    level={skill.level}
                    color={color}
                    visible={visible}
                    delay={d()}
                  />
                ))}
              </div>
            );
          })}
        </div>

        {/* ── Bottom prompt + blinking cursor ── */}
        <div className="font-mono text-caption sm:text-body-sm mt-5">
          <span className="text-green-400">❯</span>{" "}
          <span className="skill-terminal-cursor">█</span>
        </div>
      </div>
    </div>
  );
};

export default SkillTerminal;
