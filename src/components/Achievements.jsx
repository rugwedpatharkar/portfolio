/* eslint-disable react/prop-types */
import { motion } from "framer-motion";
import { styles } from "../styles";
import { SectionWrapper } from "../hoc";
import { achievements } from "../constants";
import { fadeIn, textVariant } from "../utils/motion";
import TextScramble from "./TextScramble";

const ACCENT_COLORS = ["#915eff", "#00cea8", "#f8c555", "#61dafb", "#ff6b6b"];

const AchievementCard = ({ achievement, index }) => {
  const color = ACCENT_COLORS[index % ACCENT_COLORS.length];

  return (
    <motion.div
      initial={{ opacity: 0, x: index % 2 === 0 ? -40 : 40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.15, duration: 0.5, type: "spring" }}
      className="relative flex items-start gap-4 sm:gap-6 group"
    >
      {/* Timeline column */}
      <div className="flex flex-col items-center">
        <motion.div
          whileHover={{ scale: 1.15, rotate: [0, -8, 8, 0] }}
          transition={{ type: "spring", stiffness: 300 }}
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full glass-card flex items-center justify-center text-subheading sm:text-heading-sm flex-shrink-0 border-2 transition-colors duration-300 cursor-default"
          style={{ borderColor: `${color}40`, boxShadow: `0 0 20px ${color}15` }}
        >
          {achievement.icon}
        </motion.div>
        {index < achievements.length - 1 && (
          <div
            className="w-[2px] h-12 sm:h-16 mt-2 rounded-full"
            style={{ background: `linear-gradient(to bottom, ${color}40, transparent)` }}
          />
        )}
      </div>

      {/* Card */}
      <div className="pb-8 sm:pb-12 flex-1">
        <div className="glass-card rounded-2xl p-4 sm:p-5 card-shine glow-hover relative overflow-hidden">
          {/* Subtle accent glow */}
          <div
            className="absolute -top-6 -right-6 w-24 h-24 rounded-full blur-[40px] pointer-events-none opacity-[0.06]"
            style={{ background: color }}
          />

          <div className="flex items-center gap-2 mb-1.5">
            <span
              className="font-mono text-caption sm:text-body-sm font-semibold"
              style={{ color }}
            >
              {achievement.year}
            </span>
          </div>
          <h3 className="text-white font-heading font-bold text-body sm:text-body-lg">
            {achievement.title}
          </h3>
          <p className="text-secondary text-caption sm:text-body-sm mt-1 leading-relaxed">
            {achievement.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

const Achievements = () => {
  return (
    <div className="relative">
      {/* Ambient glow blobs */}
      <div className="absolute -top-20 -right-20 w-60 h-60 bg-[#f8c555]/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-[#915eff]/5 rounded-full blur-[80px] pointer-events-none" />

      <motion.div variants={textVariant()}>
        <p className={styles.sectionSubText}>Milestones</p>
        <TextScramble text="Achievements" as="h2" className={styles.sectionHeadText} />
      </motion.div>

      <motion.p
        variants={fadeIn("", "", 0.1, 1)}
        className="mt-3 text-secondary text-body-sm sm:text-body max-w-3xl"
      >
        Key milestones and recognitions from my academic and professional journey
        that keep me motivated to push further.
      </motion.p>

      <div className="mt-8 sm:mt-12 max-w-3xl mx-auto">
        {achievements.map((achievement, index) => (
          <AchievementCard key={index} achievement={achievement} index={index} />
        ))}
      </div>
    </div>
  );
};

export default SectionWrapper(Achievements, "achievements");
