/* eslint-disable react/prop-types */
/* eslint-disable react-refresh/only-export-components */
import React, { useState, memo } from "react";
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

const ServiceCard = memo(({ index, title, icon }) => {
  return (
    <Tilt
      className="w-full"
      options={{ max: 45, scale: 1, speed: 450 }}
    >
      <motion.div
        variants={fadeIn("right", "spring", 0.5 * index, 0.75)}
        className="w-full green-pink-gradient p-[1px] rounded-[20px] shadow-card"
      >
        <div className="glass-card rounded-[20px] py-5 px-8 sm:px-12 min-h-[200px] xs:min-h-[250px] sm:min-h-[280px] flex justify-evenly items-center flex-col card-shine">
          <img src={icon} alt={title} className="w-12 h-12 sm:w-16 sm:h-16 object-contain" />
          <h3 className="font-heading font-bold text-center text-white text-body sm:text-subheading">
            {title}
          </h3>
        </div>
      </motion.div>
    </Tilt>
  );
});

const About = () => {
  const [showResume, setShowResume] = useState(false);

  return (
    <>
      <motion.div variants={textVariant()}>
        <p className={styles.sectionSubText}>Introduction</p>
        <TextScramble text="Overview" as="h2" className={styles.sectionHeadText} />
      </motion.div>

      <motion.div
        variants={fadeIn("up", "spring", 0.2, 0.75)}
        className="mt-8 sm:mt-12 glass-card rounded-3xl p-6 sm:p-10 relative overflow-hidden"
      >
        {/* Accent glow behind the card */}
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-[#915eff]/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-[#00cea8]/8 rounded-full blur-[80px] pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-0 relative z-[1]">
          {/* Photo with decorative frame */}
          <div className="w-56 xs:w-64 sm:w-72 md:w-[35%] lg:w-[32%] flex-shrink-0 relative">
            {/* Rotating border ring */}
            <div className="absolute -inset-3 sm:-inset-4 rounded-2xl border border-[#915eff]/20 rotate-3" />
            <div className="absolute -inset-2 sm:-inset-3 rounded-2xl border border-[#00cea8]/15 -rotate-2" />

            <div className="relative rounded-2xl overflow-hidden group">
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#050816] via-transparent to-transparent opacity-40 group-hover:opacity-20 transition-opacity duration-500 z-[2]" />

              <img
                src={photo}
                alt="Rugwed Patharkar"
                loading="lazy"
                className="object-cover w-full aspect-[3/4] rounded-2xl transition-transform duration-700 group-hover:scale-105"
              />

              {/* Bottom info bar */}
              <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 z-[3]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-green-300 text-caption sm:text-body-sm font-mono font-medium">
                    {personalInfo.availability}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Text content */}
          <div className="w-full md:w-[65%] lg:w-[68%] md:pl-8 lg:pl-12">
            {/* Name badge */}
            <div className="mb-4">
              <h3 className="text-white font-heading font-bold text-heading-sm sm:text-heading">
                {personalInfo.fullName}
              </h3>
              <p className="text-[#915eff] font-mono text-body-sm sm:text-body mt-1">
                {personalInfo.role} <span className="text-secondary">— {personalInfo.location || "Pune, India"}</span>
              </p>
            </div>

            {/* Divider */}
            <div className="w-16 h-[2px] bg-gradient-to-r from-[#915eff] to-[#00cea8] mb-4 rounded-full" />

            <p className="text-secondary text-body sm:text-body-lg leading-relaxed max-w-[700px]">
              {personalInfo.about}
            </p>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center mt-6 sm:mt-8 gap-3 sm:gap-4">
              <MagneticButton strength={0.2}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowResume(true)}
                  className="group relative text-white font-bold py-3 px-7 rounded-full focus:outline-none overflow-hidden whitespace-nowrap text-body-sm sm:text-body"
                >
                  {/* Gradient background */}
                  <span className="absolute inset-0 bg-gradient-to-r from-[#915eff] to-[#7c3aed] rounded-full" />
                  <span className="absolute inset-0 bg-gradient-to-r from-[#7c3aed] to-[#00cea8] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative z-[1] flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View Resume
                  </span>
                </motion.button>
              </MagneticButton>

              <MagneticButton strength={0.2}>
                <a href={resume} download>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-white font-bold py-3 px-7 rounded-full focus:outline-none border border-[#915eff]/40 hover:border-[#915eff] whitespace-nowrap text-body-sm sm:text-body transition-colors duration-300 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download CV
                  </motion.button>
                </a>
              </MagneticButton>
            </div>
          </div>
        </div>
      </motion.div>

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
