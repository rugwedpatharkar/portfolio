/* eslint-disable react/prop-types */
/* eslint-disable react-refresh/only-export-components */
import { useState, useEffect, useRef, useCallback, memo } from "react";
import { motion } from "framer-motion";
import { textVariant } from "../utils/motion";
import { styles } from "../styles";
import { SectionWrapper } from "../hoc";
import { skills } from "../constants";
import TextScramble from "./TextScramble";
import SkillGlobe from "./SkillGlobe";
import TechRadar from "./TechRadar";

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

const SkillIcon = memo(({ skill }) => {
  const ref = useRef(null);
  const innerRef = useRef(null);

  const handleMouseMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(500px) rotateX(${-y * 25}deg) rotateY(${x * 25}deg) scale(1.15)`;
    el.style.zIndex = "20";
    if (innerRef.current) innerRef.current.style.boxShadow = "0 0 16px 4px rgba(145, 94, 255, 0.5)";
  }, []);

  const handleMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "";
    el.style.zIndex = "1";
    if (innerRef.current) innerRef.current.style.boxShadow = "0 0 8px 2px rgba(145, 94, 255, 0.3)";
  }, []);

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative rounded-md overflow-visible flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 3xl:w-24 3xl:h-24 group"
      style={{ transition: "transform 0.15s ease-out", zIndex: 1 }}
      aria-label={`${skill.name} - ${skill.level}% proficiency`}
      role="img"
      tabIndex={0}
    >
      <ProficiencyRing level={skill.level} />
      <div
        ref={innerRef}
        className="absolute inset-[3px] rounded-md flex items-center justify-center p-1.5 sm:p-2 md:p-3"
        style={{
          backgroundImage: "linear-gradient(45deg, rgba(21, 16, 48, 0.8), rgba(31, 22, 48, 0.8))",
          boxShadow: "0 0 8px 2px rgba(145, 94, 255, 0.3)",
          transition: "box-shadow 0.3s ease",
        }}
      >
        <img src={skill.icon} alt={skill.name} className="w-full h-full object-contain" loading="lazy" />
      </div>
      <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity bg-black/90 text-white text-micro sm:text-caption px-2 py-1 rounded whitespace-nowrap pointer-events-none z-30 shadow-lg">
        {skill.name} ({skill.level}%)
      </div>
    </div>
  );
});

const Skills = () => {
  const [view, setView] = useState("globe");

  return (
    <motion.div variants={textVariant()}>
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <p className={styles.sectionSubText}>What I Bring to the Table</p>
          <TextScramble text="Technical Skills" as="h2" className={styles.sectionHeadText} />
        </div>
        <div className="flex gap-2 mb-2">
          {["globe", "radar", "grid"].map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1.5 rounded-full text-caption font-mono font-medium transition-colors border ${
                view === v
                  ? "bg-[#915eff] border-[#915eff] text-white"
                  : "bg-transparent border-secondary/30 text-secondary hover:border-[#915eff]"
              }`}
            >
              {v === "globe" ? "3D Globe" : v === "radar" ? "Tech Radar" : "Grid View"}
            </button>
          ))}
        </div>
      </div>

      {view === "globe" ? (
        <div className="mt-6">
          <SkillGlobe />
        </div>
      ) : view === "radar" ? (
        <div className="mt-6">
          <TechRadar />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 3xl:grid-cols-4 gap-4 sm:gap-6">
          {Object.entries(skills).map(([category, skillsInCategory], index) => (
            <div key={index} className="mt-2">
              <h3 className="text-white font-heading text-body sm:text-body-lg font-semibold mb-3">{category}</h3>
              <div className="flex flex-wrap items-start justify-start gap-4 sm:gap-5 pb-2">
                {skillsInCategory.map((skill, skillIndex) => (
                  <SkillIcon key={skillIndex} skill={skill} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default SectionWrapper(Skills, "skills");
