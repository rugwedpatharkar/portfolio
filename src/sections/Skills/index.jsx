/* eslint-disable react-refresh/only-export-components */
import { useState } from "react";
import { motion } from "framer-motion";
import { fadeIn, textVariant } from "../../utils/motion";
import { styles } from "../../styles";
import { SectionWrapper } from "../../hoc";
import { sectionMeta } from "../../content";
import TextScramble from "../../components/TextScramble";
import SkillTerminal from "../../components/SkillTerminal";
import SkillRings from "../../components/SkillRings";

const VIEW_MODES = [
  {
    id: "terminal",
    label: "Terminal",
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: "rings",
    label: "Rings",
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="12" cy="12" r="1" fill="currentColor" />
      </svg>
    ),
  },
];

const Skills = () => {
  const [view, setView] = useState("terminal");

  return (
    <div className="relative">
      {/* Ambient glow blobs */}
      <div className="absolute -top-20 -left-20 w-60 h-60 bg-[#915eff]/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-[#00cea8]/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <motion.div variants={textVariant()}>
          <p className={styles.sectionSubText}>{sectionMeta.skills.sub}</p>
          <TextScramble text={sectionMeta.skills.heading} as="h2" className={styles.sectionHeadText} />
        </motion.div>

        {/* View toggle */}
        <motion.div
          variants={fadeIn("", "", 0.2, 0.5)}
          className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06] w-fit"
        >
          {VIEW_MODES.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setView(mode.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-caption transition-all duration-200 ${
                view === mode.id
                  ? "bg-[#915eff]/15 text-[#915eff] border border-[#915eff]/30"
                  : "text-white/40 hover:text-white/60 border border-transparent"
              }`}
              aria-pressed={view === mode.id}
            >
              {mode.icon}
              {mode.label}
            </button>
          ))}
        </motion.div>
      </div>

      <motion.p
        variants={fadeIn("", "", 0.1, 1)}
        className="mt-3 text-secondary text-body-sm sm:text-body max-w-3xl"
      >
        {sectionMeta.skills.description}
      </motion.p>

      {view === "terminal" ? <SkillTerminal /> : <SkillRings />}
    </div>
  );
};

export default SectionWrapper(Skills, "skills", "Skills");
