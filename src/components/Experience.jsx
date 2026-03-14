/* eslint-disable react/prop-types */
/* eslint-disable react-refresh/only-export-components */
import { useState } from "react";
import { motion } from "framer-motion";
import { styles } from "../styles";
import { experiences } from "../constants";
import { SectionWrapper } from "../hoc";
import { fadeIn, textVariant } from "../utils/motion";
import TextScramble from "./TextScramble";

const CAT_COLORS = ["#915eff", "#00cea8", "#61dafb", "#f8c555"];

const ExperienceCard = ({ experience, index, isLast }) => {
  const [openCats, setOpenCats] = useState(new Set([0]));

  const toggleCat = (ci) => {
    setOpenCats((prev) => {
      const next = new Set(prev);
      if (next.has(ci)) next.delete(ci);
      else next.add(ci);
      return next;
    });
  };

  return (
    <motion.div
      variants={fadeIn("up", "spring", index * 0.3, 0.75)}
      className="flex gap-4 sm:gap-6"
    >
      {/* Timeline column: node + line */}
      <div className="flex flex-col items-center shrink-0">
        <div
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border-2 border-[#915eff]/30 shadow-[0_0_15px_rgba(145,94,255,0.2)] z-[2]"
          style={{ background: experience.iconBg }}
        >
          <img
            src={experience.icon}
            alt={experience.company_name}
            className="w-[70%] h-[70%] object-contain"
          />
        </div>
        {!isLast && (
          <div className="w-[2px] flex-1 mt-2 bg-gradient-to-b from-[#915eff]/40 to-[#00cea8]/20" />
        )}
      </div>

      {/* Card */}
      <div className="flex-1 pb-10 sm:pb-14">
        <div className="glass-card rounded-2xl p-5 sm:p-7 relative overflow-hidden">
          {/* Accent glow */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#915eff]/5 rounded-full blur-[60px] pointer-events-none" />

          {/* Achievement banner */}
          {experience.achievement && (
            <div className="exp-achievement mb-4 flex items-center gap-2 px-3 py-1.5 rounded-full w-fit">
              <svg
                className="w-3.5 h-3.5 text-[#f8c555]"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-[#f8c555] text-caption sm:text-body-sm font-mono font-medium">
                {experience.achievement}
              </span>
            </div>
          )}

          {/* Header */}
          <h3 className="text-white font-heading font-bold text-body-lg sm:text-heading-sm">
            {experience.title}
          </h3>
          <p className="text-secondary text-body-sm sm:text-body font-semibold mt-0.5">
            {experience.company_name}
          </p>
          <p className="text-[#915eff] text-caption sm:text-body-sm font-mono mt-1">
            {experience.date}
          </p>

          {/* Tech pills */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-4">
            {experience.tech.map((t) => (
              <span
                key={t}
                className="exp-tech-pill px-2 py-0.5 rounded-full bg-[#915eff]/10 border border-[#915eff]/20 text-[#915eff] text-micro sm:text-caption font-mono"
              >
                {t}
              </span>
            ))}
          </div>

          {/* Metrics strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mt-5">
            {experience.metrics.map((m, i) => (
              <div
                key={i}
                className="exp-metric text-center p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]"
              >
                <div className="text-white font-heading font-bold text-body-lg sm:text-heading-sm">
                  {m.value}
                </div>
                <div className="text-secondary text-micro sm:text-caption font-mono mt-0.5">
                  {m.label}
                </div>
              </div>
            ))}
          </div>

          {/* Categorized points — accordion */}
          <div className="mt-5 space-y-1.5">
            {experience.categories.map((cat, ci) => (
              <div
                key={ci}
                className="rounded-xl border border-white/[0.06] overflow-hidden"
              >
                <button
                  onClick={() => toggleCat(ci)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/[0.03] transition-colors duration-200"
                >
                  <span className="flex items-center gap-2.5 text-white text-body-sm sm:text-body font-medium">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: CAT_COLORS[ci % 4] }}
                    />
                    {cat.name}
                    <span className="text-secondary text-caption font-mono">
                      ({cat.points.length})
                    </span>
                  </span>
                  <svg
                    className={`w-4 h-4 text-secondary exp-chevron ${openCats.has(ci) ? "open" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                <div
                  className={`exp-accordion-content ${openCats.has(ci) ? "open" : ""}`}
                >
                  <div>
                    <ul className="px-4 pb-4 space-y-2.5">
                      {cat.points.map((point, pi) => (
                        <li
                          key={pi}
                          className="text-white-100 text-caption sm:text-body-sm tracking-wider flex items-start gap-2.5"
                        >
                          <span className="text-[#00cea8] mt-0.5 shrink-0 text-caption">
                            &#9657;
                          </span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Experience = () => {
  return (
    <>
      <motion.div variants={textVariant()}>
        <p className={styles.sectionSubText}>Where I've worked</p>
        <TextScramble
          text="Work Experience"
          as="h2"
          className={styles.sectionHeadText}
        />
      </motion.div>

      <div className="mt-10 sm:mt-16">
        {experiences.map((exp, i) => (
          <ExperienceCard
            key={i}
            experience={exp}
            index={i}
            isLast={i === experiences.length - 1}
          />
        ))}
      </div>
    </>
  );
};

export default SectionWrapper(Experience, "experience");
