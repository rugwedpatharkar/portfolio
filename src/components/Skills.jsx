/* eslint-disable react-refresh/only-export-components */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { textVariant } from "../utils/motion";
import { styles } from "../styles";
import { SectionWrapper } from "../hoc";
import TextScramble from "./TextScramble";
import SkillTerminal from "./SkillTerminal";
import TechRadar from "./TechRadar";

const VIEW_MODES = [
  { id: "terminal", label: ">_ Terminal", icon: ">" },
  { id: "radar", label: "◎ Radar", icon: "◎" },
];

const Skills = () => {
  const [view, setView] = useState("terminal");

  return (
    <div className="relative">
      {/* Ambient glow blobs */}
      <div className="absolute -top-20 -left-20 w-60 h-60 bg-[#915eff]/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-[#00cea8]/5 rounded-full blur-[80px] pointer-events-none" />

      <motion.div variants={textVariant()}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className={styles.sectionSubText}>What I Bring to the Table</p>
            <TextScramble text="Technical Skills" as="h2" className={styles.sectionHeadText} />
          </div>

          {/* View toggle */}
          <div className="flex gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/[0.08]">
            {VIEW_MODES.map((mode) => (
              <button
                key={mode.id}
                onClick={() => setView(mode.id)}
                className={`px-3 py-1.5 rounded-lg font-mono text-micro sm:text-caption transition-all duration-300 ${
                  view === mode.id
                    ? "bg-[#915eff]/20 text-[#915eff] border border-[#915eff]/30"
                    : "text-white/30 hover:text-white/50 border border-transparent"
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {view === "terminal" ? (
          <motion.div
            key="terminal"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <SkillTerminal />
          </motion.div>
        ) : (
          <motion.div
            key="radar"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="mt-6"
          >
            <TechRadar />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SectionWrapper(Skills, "skills");
