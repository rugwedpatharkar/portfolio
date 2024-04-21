import React from "react";
import { motion } from "framer-motion";
import { Tilt } from "react-tilt";
import { useMediaQuery } from "react-responsive";
import { textVariant } from "../utils/motion";
import { styles } from "../styles";
import { SectionWrapper } from "../hoc";
import { skills } from "../constants";

const Skills = () => {
  const isDesktop = useMediaQuery({ minWidth: 768 });

  return (
    <motion.div variants={textVariant()}>
      <p className={styles.sectionSubText}>What I Bring to the Table</p>
      <h2 className={styles.sectionHeadText}>Technical Skills</h2>

      <div className="grid grid-cols-2 gap-4">
        {Object.entries(skills).map(([category, skillsInCategory], index) => (
          <div key={index} className="mt-2">
            <h3 className="text-me font-semibold mb-2">{category}</h3>
            <div className="flex flex-wrap items-start justify-start">
              {skillsInCategory.map((skill, index) => (
                <Tilt key={index} className="p-1" options={{ scale: 1.02 }}>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="rounded-md overflow-hidden flex items-center justify-center p-4"
                    style={{
                      backgroundImage:
                        "linear-gradient(45deg, #151030, #1f1630)",
                      boxShadow: "0 0 8px 2px rgba(145, 94, 255, 0.5)", // Gradient glow effect
                      width: isDesktop ? "6rem" : "4rem", // Adjust for larger size on PC screens
                      height: isDesktop ? "6rem" : "4rem", // Adjust for larger size on PC screens
                    }}
                  >
                    <img
                      src={skill.icon}
                      alt={skill.name}
                      className="w-full h-full mb-0"
                      style={{
                        objectFit: "cover",
                        maxWidth: "100%",
                        maxHeight: "100%",
                      }}
                    />
                  </motion.div>
                </Tilt>
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default SectionWrapper(Skills, "skills");
