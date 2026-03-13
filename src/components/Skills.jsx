/* eslint-disable react/prop-types */
/* eslint-disable react-refresh/only-export-components */
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { textVariant } from "../utils/motion";
import { styles } from "../styles";
import { SectionWrapper } from "../hoc";
import { skills } from "../constants";

const ProficiencyRing = ({ level, strokeWidth = 3 }) => {
  const [animatedLevel, setAnimatedLevel] = useState(0);
  const ref = useRef(null);
  const viewSize = 56;
  const radius = (viewSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedLevel / 100) * circumference;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAnimatedLevel(level);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [level]);

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${viewSize} ${viewSize}`}
      className="proficiency-ring absolute inset-0 w-full h-full"
    >
      <circle
        cx={viewSize / 2}
        cy={viewSize / 2}
        r={radius}
        fill="none"
        stroke="rgba(145, 94, 255, 0.15)"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={viewSize / 2}
        cy={viewSize / 2}
        r={radius}
        fill="none"
        stroke="#915eff"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
      />
    </svg>
  );
};

const Skills = () => {
  return (
    <motion.div variants={textVariant()}>
      <p className={styles.sectionSubText}>What I Bring to the Table</p>
      <h2 className={styles.sectionHeadText}>Technical Skills</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 3xl:grid-cols-4 gap-4 sm:gap-6">
        {Object.entries(skills).map(([category, skillsInCategory], index) => (
          <div key={index} className="mt-2">
            <h3 className="text-white text-base sm:text-lg font-semibold mb-3">{category}</h3>
            <div className="flex flex-wrap items-start justify-start gap-4 sm:gap-5 pb-2">
              {skillsInCategory.map((skill, skillIndex) => (
                <motion.div
                  key={skillIndex}
                  whileHover={{ scale: 1.1, zIndex: 20 }}
                  className="relative rounded-md overflow-visible flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 3xl:w-24 3xl:h-24 group"
                  title={`${skill.name} - ${skill.level}%`}
                >
                  <ProficiencyRing level={skill.level} />
                  <div
                    className="absolute inset-[3px] rounded-md flex items-center justify-center p-1.5 sm:p-2 md:p-3"
                    style={{
                      backgroundImage: "linear-gradient(45deg, #151030, #1f1630)",
                      boxShadow: "0 0 8px 2px rgba(145, 94, 255, 0.3)",
                    }}
                  >
                    <img
                      src={skill.icon}
                      alt={skill.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/90 text-white text-[10px] sm:text-[11px] px-2 py-1 rounded whitespace-nowrap pointer-events-none z-30 shadow-lg">
                    {skill.name} ({skill.level}%)
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default SectionWrapper(Skills, "skills");
