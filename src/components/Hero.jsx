import { Suspense, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { styles } from "../styles";
import { ComputersCanvas } from "./canvas";
import Typewriter from "typewriter-effect";
import { AiOutlineGithub } from "react-icons/ai";
import { ImLinkedin } from "react-icons/im";
import { personalInfo } from "../constants";
import ParticleBackground from "./ParticleBackground";
import MagneticButton from "./MagneticButton";
import TextScramble from "./TextScramble";

/* ── stagger choreography ── */
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.3 } },
};
const item = (y = 30) => ({
  hidden: { opacity: 0, y },
  show: { opacity: 1, y: 0, transition: { type: "spring", damping: 20, stiffness: 100 } },
});

const Hero = () => {
  const parallaxRef = useRef(null);

  /* ── mouse parallax via direct DOM — RAF-throttled ── */
  useEffect(() => {
    if (window.innerWidth < 768) return;

    let rafId = 0;
    let latestX = 0;
    let latestY = 0;

    // Cache layer references once
    const el = parallaxRef.current;
    if (!el) return;
    const layers = el.querySelectorAll("[data-parallax]");
    const speeds = Array.from(layers, (l) => parseFloat(l.dataset.parallax));

    const onMouse = (e) => {
      latestX = e.clientX;
      latestY = e.clientY;
      if (!rafId) {
        rafId = requestAnimationFrame(() => {
          const cx = window.innerWidth / 2;
          const cy = window.innerHeight / 2;
          const dx = (latestX - cx) / cx;
          const dy = (latestY - cy) / cy;
          for (let i = 0; i < layers.length; i++) {
            layers[i].style.transform = `translate(${dx * speeds[i]}px, ${dy * speeds[i]}px)`;
          }
          rafId = 0;
        });
      }
    };

    window.addEventListener("mousemove", onMouse, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMouse);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <section className="relative w-full h-screen mx-auto overflow-hidden">
      <ParticleBackground />

      <div
        ref={parallaxRef}
        className={`${styles.paddingX} absolute inset-x-0 top-[80px] xs:top-[90px] sm:top-[120px] max-w-7xl 3xl:max-w-[2000px] mx-auto flex flex-row items-start gap-3 sm:gap-5 z-[2] pointer-events-none`}
      >
        {/* Decorative line + dot */}
        <div className="flex flex-col justify-center items-center mt-5" data-parallax="-8">
          <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#915eff] shadow-[0_0_20px_rgba(145,94,255,0.6)]" />
          <div className="w-1 h-28 xs:h-40 sm:h-80 violet-gradient" />
        </div>

        {/* Text content — staggered entrance */}
        <motion.div
          className="flex-1 min-w-0"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {/* Greeting */}
          <motion.div variants={item()} data-parallax="-12">
            <h1 className={`${styles.heroHeadText} text-white`}>
              Hi there,&nbsp;I&apos;m
            </h1>
          </motion.div>

          {/* Name — animated gradient */}
          <motion.div variants={item(40)} data-parallax="-16">
            <TextScramble
              text={personalInfo.fullName}
              as="p"
              className={`${styles.heroHeadText} hero-gradient-name mt-1`}
            />
          </motion.div>

          {/* Typewriter role */}
          <motion.div variants={item()} data-parallax="-10">
            <div className={`${styles.heroSubText} text-[#915eff] mt-2 sm:mt-3`}>
              <Typewriter
                options={{
                  strings: [
                    '<span class="font-mono-bold green-text-gradient">Full Stack Developer</span>',
                    '<span class="font-mono-bold green-text-gradient">Tech Enthusiast</span>',
                    '<span class="font-mono-bold green-text-gradient">Problem Solver</span>',
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
          </motion.div>

          {/* Tagline */}
          <motion.p
            variants={item()}
            data-parallax="-6"
            className="text-secondary text-body sm:text-body-lg mt-3 sm:mt-4 max-w-lg leading-relaxed"
          >
            I build fast, beautiful web experiences that users love.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={item(20)}
            className="mt-5 sm:mt-8 flex flex-wrap items-center gap-3 sm:gap-4 pointer-events-auto"
          >
            <MagneticButton strength={0.2}>
              <a href="#projects">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative text-white font-bold py-3 px-7 rounded-full focus:outline-none overflow-hidden whitespace-nowrap text-body-sm sm:text-body"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-[#915eff] to-[#7c3aed] rounded-full" />
                  <span className="absolute inset-0 bg-gradient-to-r from-[#7c3aed] to-[#00cea8] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative z-[1] flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Explore My Work
                  </span>
                </motion.button>
              </a>
            </MagneticButton>

            <MagneticButton strength={0.2}>
              <a href="#contact">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-white font-bold py-3 px-7 rounded-full focus:outline-none border border-[#915eff]/40 hover:border-[#915eff] whitespace-nowrap text-body-sm sm:text-body transition-colors duration-300 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Get in Touch
                </motion.button>
              </a>
            </MagneticButton>
          </motion.div>

          {/* Availability + Social icons — compact row on mobile */}
          <motion.div
            variants={item()}
            className="mt-3 sm:mt-5 flex flex-wrap items-center gap-3 pointer-events-auto"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-900/30 border border-green-500/30 status-pulse">
              <span className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-green-300 text-caption sm:text-body-sm font-mono font-medium">
                {personalInfo.availability}
              </span>
            </span>

            <div className="flex items-center gap-2">
              <MagneticButton strength={0.4}>
                <a
                  href={personalInfo.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                  className="group flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-white/10 hover:border-[#915eff]/50 bg-white/5 hover:bg-[#915eff]/10 transition-all duration-300"
                >
                  <AiOutlineGithub className="text-lg sm:text-2xl text-white/70 group-hover:text-white transition-colors" />
                </a>
              </MagneticButton>
              <MagneticButton strength={0.4}>
                <a
                  href={personalInfo.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="group flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-white/10 hover:border-[#0077b5]/50 bg-white/5 hover:bg-[#0077b5]/10 transition-all duration-300"
                >
                  <ImLinkedin className="text-base sm:text-xl text-white/70 group-hover:text-[#0077b5] transition-colors" />
                </a>
              </MagneticButton>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* 3D Computer model — bottom half on mobile, full on desktop */}
      <div className="absolute bottom-0 left-0 right-0 h-[50vh] sm:h-full sm:top-0 sm:bottom-auto">
        <Suspense fallback={null}>
          <ComputersCanvas />
        </Suspense>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 xs:bottom-8 sm:bottom-10 w-full flex justify-center items-center z-[2]">
        <a href="#about" aria-label="Scroll to about section">
          <div className="w-[30px] h-[54px] sm:w-[35px] sm:h-[64px] rounded-3xl border-4 border-secondary/50 hover:border-secondary transition-colors flex justify-center items-start p-2">
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
