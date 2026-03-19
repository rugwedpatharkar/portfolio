/* eslint-disable react/prop-types */
import { memo } from "react";
import { motion } from "framer-motion";
import { styles } from "../../styles";
import { SectionWrapper } from "../../hoc";
import { hobbies, sectionMeta } from "../../content";
import { fadeIn, textVariant } from "../../utils/motion";
import { ACCENT_COLORS } from "../../config/theme";
import TextScramble from "../../components/TextScramble";
import TiltCard from "../../components/TiltCard";

const HobbyCard = memo(({ hobby, index }) => {
  const color = ACCENT_COLORS[index % ACCENT_COLORS.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.5, type: "spring" }}
      className="h-full"
    >
      <TiltCard tiltStrength={8}>
        <div className="glass-card rounded-2xl p-5 sm:p-6 card-shine glow-hover border-glow relative overflow-hidden group h-full min-h-[220px] sm:min-h-[260px] flex flex-col">

          {/* Accent top bar — widens on hover */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 h-[2px] w-12 rounded-full opacity-40 group-hover:w-20 group-hover:opacity-80 transition-all duration-500"
            style={{ background: color }}
          />

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

          {/* Crossfading text: tagline ↔ detail (fixed height prevents layout shift) */}
          <div className="relative mt-1 mb-3 h-[60px] sm:h-[72px] z-[1]">
            {/* Tagline — visible by default, fades out on hover */}
            <p className="text-secondary text-caption sm:text-body-sm absolute inset-0 opacity-100 group-hover:opacity-0 transition-opacity duration-200 line-clamp-3 leading-relaxed">
              {hobby.tagline}
            </p>
            {/* Detail — hidden by default, fades in on hover */}
            <p className="text-white/70 text-caption sm:text-body-sm absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100 line-clamp-3 leading-relaxed">
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
      </TiltCard>
    </motion.div>
  );
});
HobbyCard.displayName = "HobbyCard";

const Hobbies = () => {
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
          <HobbyCard key={hobby.name} hobby={hobby} index={index} />
        ))}
      </div>
    </div>
  );
};

export default SectionWrapper(Hobbies, "hobbies", "Hobbies");
