/* eslint-disable react-refresh/only-export-components */
import { motion } from "framer-motion";
import { fadeIn, textVariant } from "../utils/motion";
import { styles } from "../styles";
import { SectionWrapper } from "../hoc";
import TextScramble from "./TextScramble";
import SkillTerminal from "./SkillTerminal";
import SkillGraph from "./SkillGraph";

const Skills = () => {
  return (
    <div className="relative">
      {/* Ambient glow blobs */}
      <div className="absolute -top-20 -left-20 w-60 h-60 bg-[#915eff]/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-[#00cea8]/5 rounded-full blur-[80px] pointer-events-none" />

      <motion.div variants={textVariant()}>
        <p className={styles.sectionSubText}>What I Bring to the Table</p>
        <TextScramble text="Technical Skills" as="h2" className={styles.sectionHeadText} />
      </motion.div>

      <motion.p
        variants={fadeIn("", "", 0.1, 1)}
        className="mt-3 text-secondary text-body-sm sm:text-body max-w-3xl"
      >
        From Python and FastAPI to cloud infrastructure and AI — the tools and
        technologies I use to build production-grade software.
      </motion.p>

      <SkillTerminal />
      <SkillGraph />
    </div>
  );
};

export default SectionWrapper(Skills, "skills");
