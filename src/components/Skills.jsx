/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React from "react";
import { motion } from "framer-motion";
import { Tilt } from "react-tilt";
import { textVariant } from "../utils/motion";
import { styles } from "../styles";
import { SectionWrapper } from "../hoc";
import { skills } from "../constants";

const SkillCard = ({ skill }) => {
  return (
    <Tilt className="w-full" options={{ scale: 1.02 }}>
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="rounded-md overflow-hidden flex flex-col items-center justify-center p-4"
      >
        <div
          className="rounded-md overflow-hidden flex flex-col items-center justify-center p-4"
          style={{
            backgroundImage: "linear-gradient(45deg, #151030, #1f1630)",
            boxShadow: "0 0 8px 2px rgba(145, 94, 255, 0.5)", // Gradient glow effect
          }}
        >
          <img
            src={skill.icon}
            alt={skill.name}
            className="w-8 h-8 mb-0"
            style={{ objectFit: "cover" }}
          />
          <p className="text-[10px] mt-1 text-white">{skill.name}</p>{" "}
        </div>
      </motion.div>
    </Tilt>
  );
};

const Skills = () => {
  return (
    <motion.div variants={textVariant()}>
      <p className={styles.sectionSubText}>What I Bring to the Table</p>
      <h2 className={styles.sectionHeadText}>Technical Skills</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mt-2">
        {" "}
        {/* Adjusted grid layout */}
        {Object.entries(skills).map(([category, skillsInCategory]) => (
          <div key={category}>
            <h3 className="text-me font-semibold mb-2">{category}</h3>
            <div className="grid grid-cols-2 gap-2">
              {skillsInCategory.map((skill, index) => (
                <SkillCard key={index} skill={skill} /> // Removed comment
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default SectionWrapper(Skills, "skills");
