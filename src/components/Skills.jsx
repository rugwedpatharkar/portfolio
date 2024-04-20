/* eslint-disable no-unused-vars */
/* eslint-disable react-refresh/only-export-components */
import { BallCanvas } from "./canvas";
import { SectionWrapper } from "../hoc";
import { skills } from "../constants";
import { styles } from "../styles";
import { textVariant } from "../utils/motion";
import { motion } from "framer-motion";

const Skills = () => {
  return (
    <motion.div variants={textVariant()}>
      <p className={styles.sectionSubText}>What I Bring to the Table</p>
      <h2 className={styles.sectionHeadText}>Technical Skills</h2>

      <div className="flex flex-row flex-wrap justify-center gap-10">
        {skills.map((skill) => (
          <div className="w-32 h-32" key={skill.name}>
            <BallCanvas icon={skill.icon} />
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default SectionWrapper(Skills, "skills");
