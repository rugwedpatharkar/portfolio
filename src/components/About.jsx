/* eslint-disable react/prop-types */
/* eslint-disable react-refresh/only-export-components */
import React, { useState } from "react";
import { motion } from "framer-motion";
import { styles } from "../styles";
import { services, personalInfo } from "../constants";
import { fadeIn, textVariant } from "../utils/motion";
import { Tilt } from "react-tilt";
import { SectionWrapper } from "../hoc";
import { photo, resume } from "../assets";
import ResumeModal from "./ResumeModal";
import TextScramble from "./TextScramble";
import MagneticButton from "./MagneticButton";
import JsonAboutCard from "./JsonAboutCard";

const ServiceCard = ({ index, title, icon }) => {
  return (
    <Tilt
      className="w-full xs:w-[200px]"
      options={{ max: 45, scale: 1, speed: 450 }}
    >
      <motion.div
        variants={fadeIn("right", "spring", 0.5 * index, 0.75)}
        className="w-full green-pink-gradient p-[1px] rounded-[20px] shadow-card"
      >
        <div className="glass-card rounded-[20px] py-5 px-8 sm:px-12 min-h-[200px] xs:min-h-[250px] sm:min-h-[280px] flex justify-evenly items-center flex-col card-shine">
          <img src={icon} alt={title} className="w-12 h-12 sm:w-16 sm:h-16 object-contain" />
          <h3 className="font-bold text-center text-white text-[16px] sm:text-[20px]">
            {title}
          </h3>
        </div>
      </motion.div>
    </Tilt>
  );
};

const About = () => {
  const [showResume, setShowResume] = useState(false);

  return (
    <>
      <motion.div variants={textVariant()}>
        <p className={styles.sectionSubText}>Introduction</p>
        <TextScramble text="Overview" as="h2" className={styles.sectionHeadText} />
      </motion.div>

      <div className="flex flex-col md:flex-row items-center gap-6 md:gap-0">
        <div className="w-56 xs:w-64 sm:w-72 md:w-[38%] lg:w-[35%] flex-shrink-0 relative hero-img-container">
          <div className="hero-img-glow" />
          <motion.img
            src={photo}
            alt="Rugwed Patharkar"
            variants={fadeIn("", "", 0.1, 1)}
            className="object-contain w-full hero-img"
          />
        </div>
        <div className="w-full md:w-[62%] lg:w-[65%] md:pl-4 lg:pl-8">
          <motion.p
            variants={fadeIn("", "", 0.1, 1)}
            className="text-secondary text-base sm:text-lg max-w-[800px] leading-[26px] sm:leading-[30px]"
          >
            {personalInfo.about}
          </motion.p>
          <div className="flex flex-col xs:flex-row items-start xs:items-center mt-6 gap-3">
            <div className="flex gap-3">
              <MagneticButton strength={0.2}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowResume(true)}
                  className="ripple-btn text-white font-bold py-3 px-6 rounded-full focus:outline-none transition duration-300 ease-in-out glass-card hover:border-[#915eff] whitespace-nowrap text-sm sm:text-base"
                >
                  View Resume
                </motion.button>
              </MagneticButton>
              <MagneticButton strength={0.2}>
                <a href={resume} download>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="ripple-btn text-[#915eff] font-bold py-3 px-6 rounded-full focus:outline-none transition duration-300 ease-in-out bg-transparent border border-[#915eff]/30 hover:border-[#915eff] whitespace-nowrap text-sm sm:text-base"
                  >
                    Download
                  </motion.button>
                </a>
              </MagneticButton>
            </div>
          </div>
        </div>
      </div>

      <JsonAboutCard />

      <div className="mt-12 sm:mt-20 grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-10">
        {services.map((service, index) => (
          <ServiceCard key={service.title} index={index} {...service} />
        ))}
      </div>

      <ResumeModal isOpen={showResume} onClose={() => setShowResume(false)} />
    </>
  );
};

export default SectionWrapper(About, "about");
