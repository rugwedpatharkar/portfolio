/* eslint-disable react/prop-types */
import { memo, forwardRef, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import CardBorderTrace from "../../components/CardBorderTrace";
import { styles } from "../../styles";
import { SectionWrapper } from "../../hoc";
import { hobbies, sectionMeta } from "../../content";
import { fadeIn, textVariant } from "../../utils/motion";
import { ACCENT_COLORS } from "../../config/theme";
import TextScramble from "../../components/TextScramble";
import TiltCard from "../../components/TiltCard";

const HobbyCard = memo(forwardRef(({ hobby, index }, ref) => {
  const color = ACCENT_COLORS[index % ACCENT_COLORS.length];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.5, type: "spring" }}
      className="h-full"
    >
      <TiltCard tiltStrength={8} className="h-full">
        <div className="relative group h-full">
        <div className="glass-card rounded-2xl p-5 sm:p-6 card-shine glow-hover border-glow relative overflow-hidden h-full flex flex-col">

          {/* Accent glow blob — top-right corner */}
          <div
            className="absolute -top-6 -right-6 w-28 h-28 rounded-full blur-[50px] pointer-events-none opacity-[0.06] group-hover:opacity-[0.16] transition-opacity duration-500"
            style={{ background: color }}
          />

          {/* Bottom-left subtle glow on hover */}
          <div
            className="absolute -bottom-6 -left-6 w-20 h-20 rounded-full blur-[40px] pointer-events-none opacity-0 group-hover:opacity-[0.08] transition-opacity duration-700"
            style={{ background: color }}
          />

          {/* Top row: emoji (left) + stat (right) */}
          <div className="flex items-start justify-between mb-3 relative z-[1]">
            <span
              className="text-[2rem] sm:text-[2.5rem] leading-none transition-transform duration-300 group-hover:scale-125 inline-block select-none"
              role="img"
              aria-label={hobby.name}
            >
              {hobby.icon}
            </span>

            <div className="text-right flex-shrink-0 ml-2">
              <span
                className="font-heading font-bold text-body sm:text-body-lg block tabular-nums leading-tight"
                style={{ color }}
              >
                {hobby.stat.value}
              </span>
              <span className="text-white/40 font-mono text-micro sm:text-caption block leading-snug">
                {hobby.stat.label}
              </span>
            </div>
          </div>

          {/* Hobby name */}
          <h3 className="text-white font-heading font-bold text-body sm:text-body-lg mb-1 relative z-[1]">
            {hobby.name}
          </h3>

          {/* Crossfading text: tagline ↔ detail — grid stacking avoids fixed height */}
          <div className="grid grid-cols-1 grid-rows-1 mt-1 mb-3 z-[1]">
            {/* Tagline — visible by default, fades out on hover */}
            <p className="col-start-1 row-start-1 text-secondary text-caption sm:text-body-sm opacity-100 group-hover:opacity-0 transition-opacity duration-200 leading-relaxed">
              {hobby.tagline}
            </p>
            {/* Detail — hidden by default, fades in on hover */}
            <p className="col-start-1 row-start-1 text-white/70 text-caption sm:text-body-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100 leading-relaxed">
              {hobby.detail}
            </p>
          </div>

          {/* Tags — always visible, pinned to bottom */}
          <div className="flex flex-wrap gap-1.5 mt-auto relative z-[1]">
            {hobby.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-full font-mono border transition-colors duration-300"
                style={{
                  fontSize: "clamp(9px, 1.8vw, 11px)",
                  color: `${color}cc`,
                  borderColor: `${color}30`,
                  background: `${color}0a`,
                }}
              >
                {tag}
              </span>
            ))}
          </div>

        </div>
          <CardBorderTrace color={color} />
        </div>
      </TiltCard>
    </motion.div>
  );
}));
HobbyCard.displayName = "HobbyCard";

const Hobbies = () => {
  const cardRefs = useRef([]);

  useEffect(() => {
    const equalize = () => {
      const els = cardRefs.current.filter(Boolean);
      if (!els.length) return;
      els.forEach((el) => (el.style.minHeight = ""));
      const max = Math.max(...els.map((el) => el.getBoundingClientRect().height));
      els.forEach((el) => (el.style.minHeight = `${max}px`));
    };
    const timer = setTimeout(equalize, 700);
    window.addEventListener("resize", equalize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", equalize);
    };
  }, []);

  return (
    <div className="relative">
      {/* Ambient glow blobs behind section */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#00cea8]/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-52 h-52 bg-[#915eff]/5 rounded-full blur-[80px] pointer-events-none" />

      {/* Section header */}
      <motion.div variants={textVariant()}>
        <p className={styles.sectionSubText}>{sectionMeta.hobbies.sub}</p>
        <TextScramble
          text={sectionMeta.hobbies.heading}
          as="h2"
          className={styles.sectionHeadText}
        />
      </motion.div>

      <motion.p
        variants={fadeIn("", "", 0.1, 1)}
        className="mt-3 text-secondary text-body-sm sm:text-body max-w-3xl"
      >
        {sectionMeta.hobbies.description}
      </motion.p>

      {/* Hover hint — fades out after first hover (handled by group) */}
      <motion.p
        variants={fadeIn("", "", 0.25, 1)}
        className="mt-2 text-white/30 text-caption font-mono"
      >
        hover each card to discover more ↗
      </motion.p>

      {/* Grid: 2 cols on mobile/sm → 4 cols on lg */}
      <div className="mt-8 sm:mt-12 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
        {hobbies.map((hobby, index) => (
          <HobbyCard key={hobby.name} ref={(el) => (cardRefs.current[index] = el)} hobby={hobby} index={index} />
        ))}
      </div>
    </div>
  );
};

export default SectionWrapper(Hobbies, "hobbies", "Hobbies");
