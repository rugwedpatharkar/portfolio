import { Suspense } from "react";
import { motion } from "framer-motion";
import { styles } from "../styles";
import { ComputersCanvas } from "./canvas";
import Typewriter from "typewriter-effect";
import { AiOutlineGithub } from "react-icons/ai";
import { ImLinkedin } from "react-icons/im";
import { personalInfo } from "../constants";
import ParticleBackground from "./ParticleBackground";
import MagneticButton from "./MagneticButton";
import GlitchText from "./GlitchText";

const Hero = () => {
  return (
    <section className="relative w-full h-screen mx-auto overflow-hidden">
      <ParticleBackground />
      <div
        className={`${styles.paddingX} absolute inset-x-0 top-[80px] xs:top-[90px] sm:top-[120px] max-w-7xl 3xl:max-w-[2000px] mx-auto flex flex-row items-start gap-3 sm:gap-5 z-[2] pointer-events-none`}
      >
        <div className="flex flex-col justify-center items-center mt-5">
          <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#915eff] neon-glow" />
          <div className="w-1 h-40 xs:h-60 sm:h-80 violet-gradient" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className={`${styles.heroHeadText} text-white`}>
            Hi there,&nbsp;I&apos;m
          </h1>
          <GlitchText text="Rugwed Patharkar" as="p" className={`${styles.heroHeadTextCustom}`} />
          <div className={`${styles.heroSubText} text-[#915eff] mt-2`}>
            <Typewriter
              options={{
                strings: [
                  '<span class="font-mono-bold green-text-gradient">Full Stack Developer</span>',
                  '<span class="font-mono-bold green-text-gradient">Tech Enthusiast</span>',
                ],
                autoStart: true,
                delay: 75,
                loop: true,
              }}
              onInit={(typewriter) => {
                typewriter.pauseFor(1000).start();
              }}
            />
          </div>
          <div className="mt-3 sm:mt-4">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-900/30 border border-green-500/30 status-pulse">
              <span className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-green-300 text-xs sm:text-sm font-medium">{personalInfo.availability}</span>
            </span>
          </div>
          <div className="mt-4 sm:mt-6 link1 pointer-events-auto">
            <MagneticButton strength={0.4}>
              <a
                href={personalInfo.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
              >
                <AiOutlineGithub />
              </a>
            </MagneticButton>
            <MagneticButton strength={0.4}>
              <a
                href={personalInfo.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
              >
                <ImLinkedin />
              </a>
            </MagneticButton>
          </div>
        </div>
      </div>

      <div className="hidden sm:block w-full h-full">
        <Suspense fallback={null}>
          <ComputersCanvas />
        </Suspense>
      </div>

      <div className="absolute bottom-6 xs:bottom-8 sm:bottom-10 w-full flex justify-center items-center z-[2]">
        <a href="#about" aria-label="Scroll to about section">
          <div className="w-[30px] h-[54px] sm:w-[35px] sm:h-[64px] rounded-3xl border-4 border-secondary flex justify-center items-start p-2">
            <motion.div
              animate={{ y: [0, 24, 0] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatType: "loop",
              }}
              className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-secondary mb-1"
            />
          </div>
        </a>
      </div>
    </section>
  );
};

export default Hero;
