import { useRef, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { styles } from "../../styles";
import Typewriter from "typewriter-effect";
import { AiOutlineGithub } from "react-icons/ai";
import { ImLinkedin } from "react-icons/im";
import { personalInfo, skills, heroContent, heroButtons } from "../../content";

const STATUS_COLORS = {
  available: "#00cea8",
  busy: "#f8c555",
  unavailable: "#ff6b6b",
};
import { heroPhoto, resume } from "../../assets";
import ParticleBackground from "../../components/ParticleBackground";
import MagneticButton from "../../components/MagneticButton";
import TextScramble from "../../components/TextScramble";

/* ── Tech stack marquee — auto-scrolling skill icons ── */
const allSkillIcons = Object.values(skills).flat();
const TechMarquee = () => (
  <div className="absolute bottom-10 sm:bottom-14 left-0 right-0 z-[3] overflow-hidden pointer-events-none opacity-70">
    <div className="hero-marquee flex gap-4 sm:gap-8 md:gap-12 items-center w-max">
      {[...allSkillIcons, ...allSkillIcons].map((skill, i) => (
        <div key={`${skill.name}-${i}`} className="flex items-center gap-2 shrink-0">
          <img src={skill.icon} alt={skill.name} className="w-5 h-5 sm:w-6 sm:h-6 object-contain" loading="lazy" />
          <span className="text-micro sm:text-caption font-mono text-white/70 whitespace-nowrap">{skill.name}</span>
        </div>
      ))}
    </div>
  </div>
);

/* ── Lightweight animated counter ── */
const CountUp = ({ value, suffix = "" }) => {
  const ref = useRef(null);
  const counted = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !counted.current) {
        counted.current = true;
        if (prefersReducedMotion) {
          el.textContent = value + suffix;
          return;
        }
        let start = 0;
        const step = Math.max(1, Math.ceil(value / 30));
        const tick = () => {
          start = Math.min(start + step, value);
          el.textContent = start + suffix;
          if (start < value) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [value, suffix]);
  return <span ref={ref} className="text-white font-heading font-bold text-body-lg sm:text-heading-sm">{suffix}</span>;
};

/* ── Floating code card — auto-types a snippet, orbits around photo ── */
const FloatingCode = () => {
  const ref = useRef(null);
  const started = useRef(false);
  const timerRef = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let cancelled = false;

    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        let charIdx = 0;
        let tokenIdx = 0;
        let currentSpan = null;

        const type = () => {
          if (cancelled || tokenIdx >= heroContent.codeSnippet.length) return;
          const token = heroContent.codeSnippet[tokenIdx];
          if (!currentSpan || currentSpan.dataset.ti !== String(tokenIdx)) {
            currentSpan = document.createElement("span");
            currentSpan.style.color = token.color;
            currentSpan.dataset.ti = tokenIdx;
            el.appendChild(currentSpan);
          }
          const ch = token.text[charIdx];
          currentSpan.textContent += ch === "\n" ? "\n" : ch;
          charIdx++;
          if (charIdx >= token.text.length) {
            tokenIdx++;
            charIdx = 0;
          }
          timerRef.current = setTimeout(type, 40 + Math.random() * 30);
        };
        timerRef.current = setTimeout(type, 800);
      }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => {
      cancelled = true;
      clearTimeout(timerRef.current);
      obs.disconnect();
    };
  }, []);

  return (
    <div className="glass-card-dark rounded-lg px-3 py-2 sm:px-4 sm:py-3 max-w-[200px] sm:max-w-[240px] pointer-events-none">
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="w-2 h-2 rounded-full bg-red-500/70" />
        <span className="w-2 h-2 rounded-full bg-yellow-500/70" />
        <span className="w-2 h-2 rounded-full bg-green-500/70" />
      </div>
      <pre ref={ref} className="font-mono text-micro sm:text-caption leading-relaxed whitespace-pre" />
    </div>
  );
};

/* ── Time-based greeting ── */
const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
};

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
  const spotlightRef = useRef(null);
  const statusColor = useMemo(
    () => STATUS_COLORS[personalInfo.availabilityStatus] ?? STATUS_COLORS.available,
    []
  );

  /* ── mouse parallax + spotlight — single RAF loop ── */
  const rafIdRef = useRef(0);

  useEffect(() => {
    if (window.innerWidth < 768) return;

    let latestX = 0;
    let latestY = 0;

    const el = parallaxRef.current;
    const spot = spotlightRef.current;
    if (!el) return;
    const layers = el.querySelectorAll("[data-parallax]");
    const speeds = Array.from(layers, (l) => parseFloat(l.dataset.parallax));

    const onMouse = (e) => {
      latestX = e.clientX;
      latestY = e.clientY;
      if (!rafIdRef.current) {
        rafIdRef.current = requestAnimationFrame(() => {
          const cx = window.innerWidth / 2;
          const cy = window.innerHeight / 2;
          const dx = (latestX - cx) / cx;
          const dy = (latestY - cy) / cy;
          for (let i = 0; i < layers.length; i++) {
            layers[i].style.transform = `translate(${dx * speeds[i]}px, ${dy * speeds[i]}px)`;
          }
          // Spotlight follows cursor
          if (spot) {
            spot.style.background = `radial-gradient(600px circle at ${latestX}px ${latestY}px, rgba(145, 94, 255, 0.06), transparent 60%)`;
          }
          rafIdRef.current = 0;
        });
      }
    };

    window.addEventListener("mousemove", onMouse, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMouse);
      cancelAnimationFrame(rafIdRef.current);
    };
  }, []);

  return (
    <section className="relative w-full mx-auto overflow-hidden" style={{ height: "100dvh", minHeight: "100svh" }}>
      <ParticleBackground />
      {/* Cursor spotlight overlay */}
      <div ref={spotlightRef} className="absolute inset-0 z-[1] pointer-events-none" />

      <div
        ref={parallaxRef}
        className={`${styles.paddingX} absolute inset-0 top-[60px] sm:top-0 pb-14 sm:pb-0 max-w-[1800px] mx-auto flex flex-col lg:flex-row items-center lg:justify-center gap-0 sm:gap-8 z-[2] pointer-events-none`}
      >
        {/* Left column: decorative line + text */}
        <div className="flex flex-row items-start gap-3 sm:gap-5 lg:flex-1 min-w-0">
          {/* Decorative line + dot — hidden on small mobile */}
          <div className="hidden xs:flex flex-col justify-center items-center mt-5" data-parallax="-8">
            <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#915eff] shadow-[0_0_20px_rgba(145,94,255,0.6)]" />
            <div className="w-1 h-24 sm:h-80 violet-gradient" />
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
                {getGreeting()},&nbsp;I&apos;m
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
              <div className={`${styles.heroSubText} green-text-gradient font-mono-bold mt-2 sm:mt-3`}>
                <Typewriter
                  options={{
                    strings: heroContent.typewriterRoles,
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

            {/* Tagline — hidden on small mobile to save space */}
            <motion.p
              variants={item()}
              data-parallax="-6"
              className="hidden xs:block text-secondary text-body sm:text-body-lg mt-2 sm:mt-4 max-w-lg leading-relaxed"
            >
              {heroContent.tagline}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={item(20)}
              className="mt-2 sm:mt-8 flex flex-wrap items-center gap-2 sm:gap-4 pointer-events-auto"
            >
              <MagneticButton strength={0.2}>
                <a href="#projects">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="group relative text-white font-bold py-2.5 px-5 sm:py-3 sm:px-7 rounded-full focus:outline-none overflow-hidden whitespace-nowrap text-body-sm sm:text-body"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-[#915eff] to-[#7c3aed] rounded-full" />
                    <span className="absolute inset-0 bg-gradient-to-r from-[#7c3aed] to-[#00cea8] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out" />
                    <span className="relative z-[1] flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      {heroButtons.primary}
                    </span>
                  </motion.button>
                </a>
              </MagneticButton>

              <MagneticButton strength={0.2}>
                <a href="#contact">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-white font-bold py-2.5 px-5 sm:py-3 sm:px-7 rounded-full focus:outline-none border border-[#915eff]/40 hover:border-[#915eff] whitespace-nowrap text-body-sm sm:text-body transition-colors duration-300 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {heroButtons.secondary}
                  </motion.button>
                </a>
              </MagneticButton>

              <MagneticButton strength={0.2}>
                <a href={resume} download={heroButtons.resumeFilename} className="hidden xs:inline-flex">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-white/80 font-bold py-2.5 px-5 sm:py-3 sm:px-7 rounded-full focus:outline-none border border-white/10 hover:border-white/30 whitespace-nowrap text-body-sm sm:text-body transition-colors duration-300 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {heroButtons.resume}
                  </motion.button>
                </a>
              </MagneticButton>
            </motion.div>

            {/* Availability + Social icons */}
            <motion.div
              variants={item()}
              className="mt-1 sm:mt-5 flex flex-wrap items-center gap-2 sm:gap-3 pointer-events-auto"
            >
              <span
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full status-pulse"
                style={{
                  background: `${statusColor}12`,
                  border: `1px solid ${statusColor}35`,
                }}
              >
                <span className="w-2 h-2 rounded-full" style={{ background: statusColor }} />
                <span className="text-caption sm:text-body-sm font-mono font-medium" style={{ color: statusColor }}>
                  {personalInfo.availability}
                </span>
              </span>

              <span className="hidden xs:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                <svg className="w-3 h-3 text-[#915eff]" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <span className="text-white/60 text-caption sm:text-body-sm font-mono">{personalInfo.location}</span>
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
                    <AiOutlineGithub className="text-body-lg sm:text-heading-sm text-white/70 group-hover:text-white transition-colors" />
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
                    <ImLinkedin className="text-body sm:text-subheading text-white/70 group-hover:text-[#0077b5] transition-colors" />
                  </a>
                </MagneticButton>
              </div>
            </motion.div>

            {/* Stats counter row — hidden on small mobile */}
            <motion.div
              variants={item(20)}
              className="mt-2 sm:mt-6 hidden xs:flex items-center gap-4 sm:gap-8"
            >
              {heroContent.stats.map((stat, i) => (
                <div key={i} className="flex flex-col items-center">
                  <CountUp value={stat.value} suffix={stat.suffix} />
                  <span className="text-secondary text-micro sm:text-caption font-mono mt-0.5">{stat.label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Photo — solar system: flex-1 on mobile fills remaining space and centers orbit */}
        <motion.div
          className="flex flex-1 lg:flex-none items-center justify-center w-full lg:w-auto pointer-events-none"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", damping: 20, stiffness: 80, delay: 0.6 }}
          data-parallax="-20"
        >
          <div className="hero-solar-system hero-photo-frame relative">
            {/* Center glow — the "star" */}
            <div className="hero-photo-glow absolute -inset-[5%] rounded-full opacity-60" />

            {/* Orbital ring tracks — concentric circles (outer 2 hidden on mobile) */}
            <div className="absolute rounded-full border border-[#915eff]/20 hero-orbit-ring" style={{ inset: "-8%" }} />
            <div className="absolute rounded-full border border-[#915eff]/15 hero-orbit-ring" style={{ inset: "-25%", animationDelay: "-1.5s" }} />
            <div className="absolute rounded-full border border-[#915eff]/10 hero-orbit-ring hidden sm:block" style={{ inset: "-42%", animationDelay: "-3s" }} />
            <div className="absolute rounded-full border border-[#915eff]/5 hidden sm:block" style={{ inset: "-58%" }} />

            {/* Orbiting tech tags — outer ring (r=0.92) hidden on small screens */}
            {heroContent.orbitTags.map((tag, i) => (
              <div
                key={i}
                className={`hero-orbit-tag${tag.r >= 0.92 ? " hidden sm:block" : ""}`}
                style={{
                  "--orbit-r": `calc(var(--photo-size) * ${tag.r})`,
                  "--orbit-dur": `${tag.dur}s`,
                  "--orbit-delay": `${tag.delay}s`,
                }}
              >
                <span
                  className="hero-orbit-tag-label"
                  style={{ borderColor: `${tag.color}40`, color: tag.color }}
                >
                  {tag.name}
                </span>
              </div>
            ))}

            {/* Orbiting dots — tiny moons/asteroids, outer dots hidden on small */}
            {heroContent.orbitDots.map((dot, i) => (
              <div
                key={`dot-${i}`}
                className={`hero-orbit-moon${dot.r >= 0.92 ? " hidden sm:block" : ""}`}
                style={{
                  "--orbit-r": `calc(var(--photo-size) * ${dot.r})`,
                  "--orbit-dur": `${dot.dur}s`,
                  "--orbit-delay": `${dot.delay}s`,
                  width: `${dot.size}px`,
                  height: `${dot.size}px`,
                  background: dot.color,
                  boxShadow: `0 0 ${dot.size * 2}px ${dot.color}80`,
                }}
              />
            ))}

            {/* Comets — tech tags streaking across (hidden on small screens) */}
            {heroContent.comets.map((c, i) => (
              <div
                key={`comet-${i}`}
                className="hero-comet hidden sm:block"
                style={{
                  "--cx1": `calc(var(--photo-size) * ${c.x1})`,
                  "--cy1": `calc(var(--photo-size) * ${c.y1})`,
                  "--cx2": `calc(var(--photo-size) * ${c.x2})`,
                  "--cy2": `calc(var(--photo-size) * ${c.y2})`,
                  "--comet-dur": `${c.dur}s`,
                  "--comet-delay": `${c.delay}s`,
                  "--comet-color": c.color,
                }}
              >
                <span className={`hero-comet-label hero-comet-tail-${c.tail}`} style={{ color: c.color, borderColor: `${c.color}50` }}>
                  {c.name}
                </span>
              </div>
            ))}

            {/* Orbiting code card — hidden on sm/md where photo is stacked above text (rings overflow) */}
            <div
              className="hero-orbit-tag hero-orbit-code hidden lg:block"
              style={{
                "--orbit-r": `calc(var(--photo-size) * 0.75)`,
                "--orbit-dur": "55s",
                "--orbit-delay": "-18s",
              }}
            >
              <div className="hero-orbit-tag-counter">
                <FloatingCode />
              </div>
            </div>

            {/* Photo with bottom dissolve */}
            <div className="relative rounded-full overflow-hidden hero-photo-float w-full h-full z-[2]">
              <img
                src={heroPhoto}
                alt={personalInfo.fullName}
                className="w-full h-full object-cover object-top hero-photo-fade"
                loading="eager"
                fetchpriority="high"
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tech stack marquee */}
      <TechMarquee />

      {/* Subtle scroll chevron */}
      <motion.a
        href="#about"
        aria-label="Scroll down"
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[2] text-secondary/50 hover:text-secondary transition-colors"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </motion.a>

    </section>
  );
};

export default Hero;
