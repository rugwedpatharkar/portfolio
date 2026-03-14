/* eslint-disable react/prop-types */
import { motion } from "framer-motion";
import { styles } from "../styles";
import { SectionWrapper } from "../hoc";
import { achievements } from "../constants";
import { textVariant } from "../utils/motion";
import TextScramble from "./TextScramble";

const AchievementCard = ({ achievement, index }) => (
  <motion.div
    initial={{ opacity: 0, x: index % 2 === 0 ? -40 : 40 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.15, duration: 0.5, type: "spring" }}
    className="relative flex items-start gap-4 sm:gap-6"
  >
    <div className="flex flex-col items-center">
      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full glass-card border-2 border-[#915eff] flex items-center justify-center text-subheading sm:text-heading-sm flex-shrink-0">
        {achievement.icon}
      </div>
      {index < achievements.length - 1 && (
        <div className="w-0.5 h-12 sm:h-16 bg-[#915eff]/30 mt-2" />
      )}
    </div>
    <div className="pb-8 sm:pb-12">
      <span className="text-[#915eff] text-caption sm:text-body-sm font-mono font-semibold">{achievement.year}</span>
      <h3 className="text-white font-heading font-bold text-body sm:text-body-lg mt-1">{achievement.title}</h3>
      <p className="text-secondary text-caption sm:text-body-sm mt-1 leading-relaxed">{achievement.description}</p>
    </div>
  </motion.div>
);

const Achievements = () => {
  return (
    <>
      <motion.div variants={textVariant()}>
        <p className={styles.sectionSubText}>Milestones</p>
        <TextScramble text="Achievements" as="h2" className={styles.sectionHeadText} />
      </motion.div>
      <div className="mt-8 sm:mt-12 max-w-3xl mx-auto">
        {achievements.map((achievement, index) => (
          <AchievementCard key={index} achievement={achievement} index={index} />
        ))}
      </div>
    </>
  );
};

export default SectionWrapper(Achievements, "achievements");
