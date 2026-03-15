/* eslint-disable react-refresh/only-export-components */
import { motion } from "framer-motion";
import { fadeIn, textVariant } from "../../utils/motion";
import { styles } from "../../styles";
import { SectionWrapper } from "../../hoc";
import { sectionMeta } from "../../content";
import TextScramble from "../../components/TextScramble";
import SkillTerminal from "../../components/SkillTerminal";

const Skills = () => {
  return (
    <div className="relative">
      {/* Ambient glow blobs */}
      <div className="absolute -top-20 -left-20 w-60 h-60 bg-[#915eff]/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-[#00cea8]/5 rounded-full blur-[80px] pointer-events-none" />

      <motion.div variants={textVariant()}>
        <p className={styles.sectionSubText}>{sectionMeta.skills.sub}</p>
        <TextScramble text={sectionMeta.skills.heading} as="h2" className={styles.sectionHeadText} />
      </motion.div>

      <motion.p
        variants={fadeIn("", "", 0.1, 1)}
        className="mt-3 text-secondary text-body-sm sm:text-body max-w-3xl"
      >
        {sectionMeta.skills.description}
      </motion.p>

      <SkillTerminal />
    </div>
  );
};

export default SectionWrapper(Skills, "skills");
