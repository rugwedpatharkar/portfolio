/* eslint-disable react/no-unescaped-entities */
import { motion } from "framer-motion";
import { styles } from "../styles";
import { ComputersCanvas } from "./canvas";
import Typewriter from "typewriter-effect";
import { AiOutlineGithub } from "react-icons/ai";
import { ImLinkedin } from "react-icons/im";
const Hero = () => {
  return (
    <section className="relative w-full h-screen mx-auto">
      <div
        className={`${styles.paddingX} absolute inset-0 top-[120px] max-w-7xl mx-auto flex flex-row items-start gap-5`}
      >
        <div className="flex flex-col justify-center items-center mt-5">
          <div className="w-5 h-5 rounded-full bg-[#915eff]" />
          <div className="w-1 sm:h-80 h-80 violet-gradient" />
        </div>
        <div>
          <h1 className={`${styles.heroHeadText} text-white`}>
            Hii there,&nbsp;I'm
            <p className={`${styles.heroHeadTextCustom}`}>Rugwed Patharkar</p>
          </h1>
          <h2 className={`${styles.heroSubText} text-[#915eff] mt-2`}>
            <Typewriter
              options={{
                strings: [
                  '<span class="ubuntu-mono-bold green-text-gradient">Full Stack Developer</span>',
                  '<span class="ubuntu-mono-bold green-text-gradient">Tech Enthusiast</span>',
                  // '<span class="ubuntu-mono-bold green-text-gradient"></span>',
                ],
                autoStart: true,
                delay: 75,
                loop: true,
                wrapperClassName: "typewriter-wrapper", // Add a class to the wrapper for styling
              }}
              onInit={(typewriter) => {
                typewriter
                  .pauseFor(1000) // Optionally pause before starting typing
                  .start();
              }}
            />
          </h2>
          <div className="absolute link1">
            <a href="https://github.com/rugwedpatharkar" target="_blank">
              <AiOutlineGithub />
            </a>
            <a
              href="https://www.linkedin.com/in/rugwed-patharkar/"
              target="_blank"
            >
              <ImLinkedin />
            </a>
          </div>
        </div>
      </div>
      <ComputersCanvas />
      <div className="absolute xs:bottom-10 bottom-32 w-full flex justify-center items-center">
        <a href="#about">
          <div className="w-[35px] h-[64px] rounded-3xl border-4 border-secondary flex justify-center items-start p-2">
            <motion.div
              animate={{ y: [0, 24, 0] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatType: "loop",
              }}
              className="w-3 h-3 rounded-full bg-secondary mb-1"
            />
          </div>
        </a>
      </div>
    </section>
  );
};

export default Hero;
