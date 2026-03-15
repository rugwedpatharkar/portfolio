/* eslint-disable react/prop-types */
/* eslint-disable react-refresh/only-export-components */
import { useState, useRef, useCallback, memo } from "react";
import { motion } from "framer-motion";
import { styles } from "../styles";
import { services, personalInfo } from "../constants";
import { fadeIn, textVariant } from "../utils/motion";
import { SectionWrapper } from "../hoc";
import { photo, resume } from "../assets";
import ResumeModal from "./ResumeModal";
import TextScramble from "./TextScramble";
import MagneticButton from "./MagneticButton";

const CARD_ACCENTS = ["#915eff", "#00cea8", "#61dafb", "#f8c555"];

const ServiceCard = memo(({ index, title, icon }) => {
  const accent = CARD_ACCENTS[index % CARD_ACCENTS.length];

  return (
    <motion.div
      variants={fadeIn("right", "spring", 0.5 * index, 0.75)}
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="w-full glass-card rounded-2xl p-5 sm:p-6 min-h-[180px] xs:min-h-[220px] sm:min-h-[250px] flex flex-col justify-center items-center gap-4 card-shine glow-hover border-glow group relative overflow-hidden"
    >
      {/* Accent glow */}
      <div
        className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-[50px] pointer-events-none opacity-[0.06] group-hover:opacity-[0.15] transition-opacity duration-500"
        style={{ background: accent }}
      />

      {/* Accent top bar */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 h-[2px] w-12 rounded-full opacity-40 group-hover:w-20 group-hover:opacity-80 transition-all duration-500"
        style={{ background: accent }}
      />

      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center border border-white/[0.06] bg-white/[0.03] group-hover:border-white/[0.12] transition-colors duration-300">
        <img src={icon} alt={title} className="w-10 h-10 sm:w-12 sm:h-12 object-contain group-hover:scale-110 transition-transform duration-500" />
      </div>

      <h3 className="font-heading font-bold text-center text-white text-body sm:text-body-lg">
        {title}
      </h3>
    </motion.div>
  );
});

/* ── 3D Pop-Out Photo ── */
const Photo3D = () => {
  const containerRef = useRef(null);
  const frameRef = useRef(null);
  const glowRef = useRef(null);
  const shineRef = useRef(null);
  const isHovering = useRef(false);

  const handleMove = useCallback((e) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;   // 0–1
    const y = (e.clientY - rect.top) / rect.height;    // 0–1
    const rotateY = (x - 0.5) * 25;   // ±12.5°
    const rotateX = (0.5 - y) * 20;   // ±10°

    if (frameRef.current) {
      frameRef.current.style.transform =
        `rotateY(${rotateY}deg) rotateX(${rotateX}deg) translateZ(40px) scale(1.06)`;
    }
    if (glowRef.current) {
      glowRef.current.style.opacity = "1";
      glowRef.current.style.background =
        `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(145,94,255,0.35), transparent 60%)`;
    }
    if (shineRef.current) {
      shineRef.current.style.opacity = "1";
      shineRef.current.style.background =
        `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(255,255,255,0.12) 0%, transparent 50%)`;
    }
  }, []);

  const handleEnter = useCallback(() => {
    isHovering.current = true;
  }, []);

  const handleLeave = useCallback(() => {
    isHovering.current = false;
    if (frameRef.current) {
      frameRef.current.style.transform = "rotateY(0deg) rotateX(0deg) translateZ(0px) scale(1)";
    }
    if (glowRef.current) glowRef.current.style.opacity = "0";
    if (shineRef.current) shineRef.current.style.opacity = "0";
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMove}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      className="w-56 xs:w-64 sm:w-72 md:w-[35%] lg:w-[32%] flex-shrink-0 relative group"
      style={{ perspective: "800px" }}
    >
      {/* Animated glow rings behind photo */}
      <div className="absolute -inset-3 sm:-inset-4 rounded-2xl border border-[#915eff]/20 rotate-3 group-hover:border-[#915eff]/40 transition-colors duration-700" />
      <div className="absolute -inset-2 sm:-inset-3 rounded-2xl border border-[#00cea8]/15 -rotate-2 group-hover:border-[#00cea8]/30 transition-colors duration-700" />

      {/* Background glow — intensifies on hover */}
      <div className="absolute -inset-6 rounded-3xl bg-[#915eff]/5 blur-[40px] group-hover:bg-[#915eff]/15 transition-all duration-700 pointer-events-none" />

      {/* Cursor-tracking purple glow behind photo */}
      <div
        ref={glowRef}
        className="absolute -inset-4 rounded-3xl blur-[30px] pointer-events-none opacity-0 transition-opacity duration-500"
      />

      {/* 3D-transformed frame — pops out of card */}
      <div
        ref={frameRef}
        className="relative rounded-2xl overflow-hidden will-change-transform"
        style={{
          transformStyle: "preserve-3d",
          transition: "transform 0.15s ease-out",
        }}
      >
        {/* Edge smudge — blends photo edges into card */}
        <div
          className="absolute inset-0 z-[2] pointer-events-none rounded-2xl"
          style={{
            boxShadow:
              "inset 0 0 40px 15px rgba(5, 8, 22, 0.8), inset 0 -30px 40px 10px rgba(5, 8, 22, 0.9)",
          }}
        />

        {/* Dynamic shine that follows cursor */}
        <div
          ref={shineRef}
          className="absolute inset-0 z-[3] pointer-events-none opacity-0 transition-opacity duration-300 mix-blend-overlay"
        />

        {/* Shadow underneath that grows on hover */}
        <div
          className="absolute -bottom-4 left-[10%] right-[10%] h-8 bg-[#915eff]/0 group-hover:bg-[#915eff]/20 blur-[20px] rounded-full transition-all duration-500 pointer-events-none"
          style={{ transform: "translateZ(-30px)" }}
        />

        <img
          src={photo}
          alt="Rugwed Patharkar"
          loading="lazy"
          className="object-cover w-full aspect-[3/4] rounded-2xl transition-all duration-500 group-hover:brightness-110"
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

      <motion.div
        variants={fadeIn("up", "spring", 0.2, 0.75)}
        className="mt-8 sm:mt-12 glass-card rounded-2xl p-6 sm:p-10 relative overflow-visible"
      >
        {/* Accent glow behind the card */}
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-[#915eff]/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-[#00cea8]/8 rounded-full blur-[80px] pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-0 relative z-[1]">
          {/* Photo — 3D pop-out on hover */}
          <Photo3D />

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
