/* eslint-disable react/prop-types */
/* eslint-disable react-refresh/only-export-components */
import React from "react";
import { motion } from "framer-motion";

import { styles } from "../styles";
import { SectionWrapper } from "../hoc";
import { fadeIn, textVariant } from "../utils/motion";
import { educations } from "../constants";
import TextScramble from "./TextScramble";

const EducationCard = ({ index, marks, name, degree, image }) => (
  <motion.div
    variants={fadeIn("", "spring", index * 0.5, 0.75)}
    className="Box2 p-4 sm:p-5 rounded-3xl w-full card-shine glow-hover"
  >
    <div className="mt-4 sm:mt-7 flex flex-col justify-between items-center gap-1">
      <img
        src={image}
        alt={degree}
        width="80"
        height="80"
        className="rounded-full object-cover w-16 h-16 sm:w-20 sm:h-20"
      />
      <div className="mt-2 sm:mt-3 flex-1 flex flex-col">
        <p className="text-center text-white font-medium text-[13px] sm:text-[16px]">
          <span className="blue-text-gradient">{name}</span>
        </p>
      </div>
    </div>

    <div className="mt-1">
      <p className="text-center text-white tracking-wider text-[15px] sm:text-[18px]">
        {degree}
      </p>
      <p className="mt-2 sm:mt-3 text-center green-text-gradient text-[13px] sm:text-[15px]">
        {marks}
      </p>
    </div>
  </motion.div>
);

const Education = () => {
  return (
    <div className="glass-section rounded-[20px]">
      <div
        className={`glass-card rounded-2xl ${styles.padding} min-h-[200px] sm:min-h-[300px]`}
      >
        <motion.div variants={textVariant()}>
          <p className={styles.sectionSubText}>Educational Details</p>
          <TextScramble text="Education" as="h2" className={styles.sectionHeadText} />
        </motion.div>
      </div>
      <div
        className={`-mt-10 sm:-mt-14 pb-10 sm:pb-14 ${styles.paddingX} grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6`}
      >
        {educations.map((education, index) => (
          <EducationCard key={education.name} index={index} {...education} />
        ))}
      </div>
    </div>
  );
};

export default SectionWrapper(Education, "educations");
