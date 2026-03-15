/* eslint-disable react/prop-types */
/* eslint-disable react-refresh/only-export-components */
import { useState, useMemo, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { styles } from "../../styles";
import { SectionWrapper } from "../../hoc";
import { projects, sectionMeta } from "../../content";
import { fadeIn, textVariant } from "../../utils/motion";
import TextScramble from "../../components/TextScramble";
import { PROJECT_ACCENTS, PROJECT_FILTERS, STATUS_CONFIG } from "../../config/theme";

/* ── Filter Tab ── */
const FilterTab = ({ label, isActive, onClick, count }) => (
  <button
    onClick={onClick}
    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-mono text-micro sm:text-caption transition-all duration-300 border ${
      isActive
        ? "bg-[#915eff]/15 border-[#915eff]/40 text-[#915eff]"
        : "bg-white/[0.02] border-white/[0.06] text-white/40 hover:text-white/60 hover:border-white/15"
    }`}
  >
    {label}
    <span
      className={`ml-1.5 ${isActive ? "text-[#915eff]/60" : "text-white/20"}`}
    >
      {count}
    </span>
  </button>
);

/* ── Mouse-tracking glow for cards ── */
const handleCardMouse = (e) => {
  const rect = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
  e.currentTarget.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
};

/* ── Project Card ── */
const ProjectCard = memo(({ project, index, isExpanded, onToggle, accent }) => {
  const status = STATUS_CONFIG[project.status] || STATUS_CONFIG.completed;

  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      onClick={onToggle}
      onMouseMove={handleCardMouse}
      role="button"
      tabIndex={0}
      aria-expanded={isExpanded}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onToggle(); } }}
      className="proj-card glass-card rounded-2xl overflow-hidden cursor-pointer group relative card-shine glow-hover border-glow"
      style={{
        borderColor: isExpanded ? `${accent}35` : undefined,
        "--proj-accent": accent,
      }}
    >
      {/* Hover glow — positioned behind card content */}
      <div
        className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${accent}08, transparent 60%)`,
        }}
      />

      {/* Accent bar */}
      <div
        className="h-[3px] transition-all duration-500 relative z-[1]"
        style={{
          background: `linear-gradient(90deg, ${accent}, ${accent}30)`,
          opacity: isExpanded ? 1 : 0.4,
          boxShadow: isExpanded ? `0 0 20px ${accent}25` : "none",
        }}
      />

      <div className="p-4 sm:p-5 relative z-[1]">
        {/* Project image */}
        {project.image && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative h-40 sm:h-48 overflow-hidden rounded-t-2xl -mx-5 -mt-5 sm:-mx-6 sm:-mt-6 mb-4"
          >
            <img
              src={project.image}
              alt={`${project.name} screenshot`}
              className="w-full h-full object-cover object-top"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#151030] to-transparent" />
          </motion.div>
        )}

        {/* Top row: type + status + index */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 sm:gap-3">
            <span
              className="font-mono text-micro sm:text-caption"
              style={{ color: `${accent}aa` }}
            >
              {project.type === "professional"
                ? "// professional"
                : "// personal"}
            </span>
            <span className="flex items-center gap-1.5 font-mono text-micro sm:text-caption text-white/45">
              <span
                className="w-1.5 h-1.5 rounded-full inline-block"
                style={{ background: status.dot }}
              />
              {status.label}
            </span>
          </div>
          <span className="font-mono text-caption text-white/20 shrink-0">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>

        {/* Name + highlight metric */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-white font-heading font-bold text-body-lg sm:text-heading-sm leading-tight">
            {project.name}
          </h3>
          {project.highlight && !isExpanded && (
            <div className="shrink-0 text-right">
              <div
                className="font-heading font-bold text-subheading sm:text-heading-sm"
                style={{ color: accent }}
              >
                {project.highlight.value}
              </div>
              <div className="text-white/45 text-micro font-mono">
                {project.highlight.label}
              </div>
            </div>
          )}
        </div>

        {/* Meta row: year + team */}
        <div className="flex items-center gap-3 mt-2">
          <span className="text-white/40 text-micro sm:text-caption font-mono">
            {project.year}
          </span>
          <span className="text-white/10">|</span>
          <span className="text-white/40 text-micro sm:text-caption font-mono">
            {project.team}
          </span>
        </div>

        {/* Description */}
        <p
          className={`text-secondary text-caption sm:text-body-sm mt-3 leading-relaxed ${
            !isExpanded ? "line-clamp-2" : ""
          }`}
        >
          {project.description}
        </p>

        {/* Expanded content */}
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{
                duration: 0.35,
                ease: [0.04, 0.62, 0.23, 0.98],
              }}
              className="overflow-hidden"
            >
              {/* Features */}
              {project.features && (
                <ul className="mt-4 space-y-2">
                  {project.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span
                        className="mt-0.5 shrink-0 text-caption"
                        style={{ color: accent }}
                      >
                        ▹
                      </span>
                      <span className="text-white/80 text-caption sm:text-body-sm">
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              {/* Stats */}
              {project.stats?.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-4">
                  {project.stats.map((s, i) => (
                    <div
                      key={i}
                      className="px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06]"
                    >
                      <div
                        className="font-bold font-heading text-body"
                        style={{ color: accent }}
                      >
                        {s.value}
                      </div>
                      <div className="text-secondary text-micro sm:text-caption font-mono">
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Links */}
              {(project.github || project.live) && (
                <div className="flex flex-wrap gap-3 mt-4">
                  {project.github && (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1.5 text-caption sm:text-body-sm font-mono px-3 py-1.5 rounded-lg border border-white/[0.08] hover:border-white/20 text-white/60 hover:text-white transition-colors"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12"/></svg>
                      Source
                    </a>
                  )}
                  {project.live && (
                    <a
                      href={project.live}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1.5 text-caption sm:text-body-sm font-mono px-3 py-1.5 rounded-lg border hover:border-opacity-40 text-white/60 hover:text-white transition-colors"
                      style={{ borderColor: `${accent}30` }}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                      Live Demo
                    </a>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {(isExpanded ? project.tags : project.tags.slice(0, 3)).map(
            (tag, tagIndex) => (
              <motion.span
                key={tag.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: tagIndex * 0.03 }}
                className="font-mono text-micro sm:text-caption px-2 py-0.5 rounded-full border"
                style={{
                  color: `${accent}cc`,
                  borderColor: `${accent}20`,
                  background: `${accent}0a`,
                }}
              >
                {tag.name}
              </motion.span>
            )
          )}
          {!isExpanded && project.tags.length > 3 && (
            <span className="text-white/40 text-micro font-mono self-center">
              +{project.tags.length - 3}
            </span>
          )}
        </div>

        {/* Expand chevron */}
        <div className="flex justify-end mt-2">
          <motion.svg
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="w-4 h-4 text-white/20 group-hover:text-white/40 transition-colors"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </motion.svg>
        </div>
      </div>
    </motion.div>
  );
});

/* ── Main Section ── */
const Projects = () => {
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [filter, setFilter] = useState("all");

  const filtered = useMemo(
    () =>
      filter === "all"
        ? projects
        : projects.filter((p) => p.type === filter),
    [filter]
  );

  const counts = useMemo(
    () => ({
      all: projects.length,
      professional: projects.filter((p) => p.type === "professional").length,
      personal: projects.filter((p) => p.type === "personal").length,
    }),
    []
  );

  const toggle = (i) => {
    setExpandedIndex((prev) => {
      if (prev !== i) {
        window.dispatchEvent(new CustomEvent("achievement", { detail: "curious" }));
      }
      return prev === i ? null : i;
    });
  };

  const expandAll = () =>
    setExpandedIndex(expandedIndex === "all" ? null : "all");

  return (
    <div className="relative">
      {/* Ambient glow blobs */}
      <div className="absolute -top-20 -right-20 w-60 h-60 bg-[#915eff]/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-[#61dafb]/5 rounded-full blur-[80px] pointer-events-none" />

      <motion.div variants={textVariant()}>
        <p className={styles.sectionSubText}>{sectionMeta.projects.sub}</p>
        <TextScramble
          text={sectionMeta.projects.heading}
          as="h2"
          className={styles.sectionHeadText}
        />
      </motion.div>

      <motion.p
        variants={fadeIn("", "", 0.1, 1)}
        className="mt-3 text-secondary text-body-sm sm:text-body max-w-3xl"
      >
        {sectionMeta.projects.description}
      </motion.p>

      {/* Filter bar + expand all */}
      <div className="mt-6 sm:mt-8 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {PROJECT_FILTERS.map((f) => (
            <FilterTab
              key={f}
              label={f.charAt(0).toUpperCase() + f.slice(1)}
              isActive={filter === f}
              onClick={() => {
                setFilter(f);
                setExpandedIndex(null);
              }}
              count={counts[f]}
            />
          ))}
        </div>

        <button
          onClick={expandAll}
          className="font-mono text-micro sm:text-caption text-white/45 hover:text-white/50 transition-colors px-2 py-1"
        >
          {expandedIndex === "all" ? "↑ Collapse all" : "↓ Expand all"}
        </button>
      </div>

      {/* Project summary */}
      <div className="mt-3 font-mono text-micro sm:text-caption text-white/45">
        {filtered.length} project{filtered.length !== 1 ? "s" : ""}
        {filter !== "all" && ` · filtered by ${filter}`}
      </div>

      {/* Card grid */}
      <div className="mt-5 sm:mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 items-start">
        {filtered.length === 0 ? (
          <div className="col-span-full text-center py-16">
            <p className="text-white/40 font-mono text-body-sm">No projects found for this filter.</p>
            <button onClick={() => setFilter("all")} className="mt-3 text-[#915eff] hover:text-[#b8a0ff] font-mono text-caption transition-colors">
              Show all projects
            </button>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filtered.map((project, index) => {
              const globalIndex = projects.indexOf(project);
              return (
                <ProjectCard
                  key={project.name}
                  project={project}
                  index={index}
                  isExpanded={
                    expandedIndex === "all" || expandedIndex === globalIndex
                  }
                  onToggle={() => {
                    if (expandedIndex === "all") {
                      setExpandedIndex(null);
                    } else {
                      toggle(globalIndex);
                    }
                  }}
                  accent={PROJECT_ACCENTS[globalIndex % PROJECT_ACCENTS.length]}
                />
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default SectionWrapper(Projects, "projects", "Projects");
