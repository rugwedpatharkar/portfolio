/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
/* eslint-disable react-refresh/only-export-components */
import React from "react";
import { motion } from "framer-motion";
import { styles } from "../styles";
import { services } from "../constants";
import { fadeIn, textVariant } from "../utils/motion";
import { Tilt } from "react-tilt";
import { SectionWrapper } from "../hoc";
import { photo, resume } from "../assets";

const ServiceCard = ({ index, title, icon }) => {
  return (
    <Tilt
      className="xs:w-[200px] w-full"
      options={{ max: 45, scale: 1, speed: 450 }}
    >
      <motion.div
        variants={fadeIn("right", "spring,0.5*index,0.75")}
        className="w-full green-pink-gradient p-[1px] rounded-[20px] shadow-card"
      >
        <div className="bg-tertiary rounded-[20px] py-5 px-12 min-h-[280px] flex justify-evenly items-center flex-col">
          <img src={icon} alt={title} className="w-16 h-16 object-contain" />
          <h3 className="font-bold text-center text-white text-[20px]">
            {title}
          </h3>
        </div>
      </motion.div>
    </Tilt>
  );
};

const About = () => {
  return (
    <>
      <motion.div variants={textVariant()}>
        <p className={styles.sectionSubText}>Introduction</p>
        <h2 className={styles.sectionHeadText}>Overview</h2>
      </motion.div>
      <div className="flex flex-wrap items-start">
        <div className="w-full md:w-1/3">
          <motion.img
            src={photo}
            alt="Rugwed Patharkar"
            variants={fadeIn("", "", 0.1, 1)}
            className="object-contain w-full md:w-auto"
          />
        </div>
        <div className="w-full md:w-2/3 md:pl-8 mt-0 md:mt-[50px]">
          <motion.p
            variants={fadeIn("", "", 0.1, 1)}
            className="mt-0 text-secondary text-lg max-w-[800px] leading-[30px]"
          >
            Hello, I'm Rugwed Patharkar, a dedicated Full Stack Developer
            hailing from Pune, India. With a blend of creativity and technical
            prowess, I specialize in crafting seamless web solutions using a
            variety of technologies such as Java, Python, HTML, CSS, and
            JavaScript. My journey in software development began with a passion
            for problem solving and a commitment to delivering high quality,
            user centric applications. From backend database management to
            frontend design, I thrive in bringing ideas to life through code.
            With a keen eye for detail and a collaborative spirit, I am driven
            to create impactful digital experiences that drive innovation and
            exceed expectations.
          </motion.p>
          <div className="flex items-center mt-6">
            <a href={resume}>
              <Tilt
                className="rounded-full overflow-hidden bg-#151030 border-2 border-#151030 mr-4"
                options={{ max: 10, scale: 1.02 }}
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-white font-bold py-3 px-6 rounded-full focus:outline-none transition duration-300 ease-in-out"
                  style={{ backgroundColor: "#151030" }}
                >
                  Download Resume
                </motion.button>
              </Tilt>
            </a>
            <p className="text-gray-600">
              To know more about me, download my resume.
            </p>
          </div>
        </div>
      </div>
      <div className="mt-20 flex flex-wrap gap-10">
        {services.map((service, index) => (
          <ServiceCard key={service.title} index={index} {...service} />
        ))}
      </div>
    </>
  );
};

export default SectionWrapper(About, "about");
