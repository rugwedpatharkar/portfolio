/* eslint-disable react/prop-types */
import { useState, useEffect, useRef, memo, forwardRef } from "react";
import CardBorderTrace from "../../components/CardBorderTrace";
import { motion } from "framer-motion";
import { funFacts, sectionMeta, uiLabels } from "../../content";
import { fadeIn, textVariant } from "../../utils/motion";
import { styles } from "../../styles";
import { SectionWrapper } from "../../hoc";
import { ACCENT_COLORS } from "../../config/theme";
import TextScramble from "../../components/TextScramble";
import TiltCard from "../../components/TiltCard";

const AnimatedCounter = ({ value, suffix = "", duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let timer;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimatedRef.current) {
          hasAnimatedRef.current = true;
          if (prefersReducedMotion) {
            setCount(value);
            return;
          }
          let start = 0;
          const increment = value / (duration / 16);
          timer = setInterval(() => {
            start += increment;
            if (start >= value) {
              setCount(value);
              clearInterval(timer);
            } else {
              setCount(Math.floor(start));
            }
          }, 16);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      clearInterval(timer);
    };
  }, [value, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {count.toLocaleString()}{suffix}
    </span>
  );
};

const FunFactCard = memo(forwardRef(({ fact, index }, ref) => {
  const [flipped, setFlipped] = useState(false);
  const color = ACCENT_COLORS[index % ACCENT_COLORS.length];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.12, duration: 0.5, type: "spring" }}
      whileHover={{ y: -5 }}
      className="cursor-pointer h-full"
      style={{ perspective: "800px" }}
      role="button"
      tabIndex={0}
      onClick={() => setFlipped((f) => !f)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setFlipped((f) => !f);
        }
      }}
    >
      <div
        className="relative w-full h-full transition-transform duration-500 will-change-transform"
        style={{
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Front face -- stays in flow so it sets the container height */}
        <TiltCard tiltStrength={6}>
          <div className="relative group">
          <div
            className="glass-card rounded-2xl p-4 sm:p-5 md:p-7 text-center card-shine glow-hover border-glow relative overflow-hidden hover:scale-[1.02] hover:border-white/[0.12] transition-transform duration-300"
            style={{ backfaceVisibility: "hidden" }}
          >
            <div
              className="absolute top-0 right-0 w-28 h-28 rounded-full blur-[50px] pointer-events-none opacity-[0.06] group-hover:opacity-[0.12] transition-opacity duration-500"
              style={{ background: color }}
            />
            <span className="text-heading sm:text-heading-xl block mb-3">{fact.icon}</span>
            <p className="font-bold text-heading-sm sm:text-heading-xl font-mono" style={{ color }}>
              <AnimatedCounter value={fact.value} suffix={fact.suffix} />
            </p>
            <p className="text-secondary text-caption sm:text-body-sm mt-2">{fact.label}</p>
            <p className="text-white/45 text-micro mt-3 font-mono">{uiLabels.funFacts.flipHint}</p>
          </div>
            <CardBorderTrace color={color} />
          </div>
        </TiltCard>

        {/* Back face -- absolute overlay, same size as front */}
        <div
          className="absolute inset-0 glass-card rounded-2xl p-4 sm:p-5 md:p-7 text-center overflow-hidden flex flex-col items-center justify-center"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <div
            className="absolute top-0 right-0 w-28 h-28 rounded-full blur-[50px] pointer-events-none opacity-[0.10]"
            style={{ background: color }}
          />
          <span className="text-body-lg sm:text-heading block mb-2">{fact.icon}</span>
          <p className="text-white/80 text-caption sm:text-body-sm leading-relaxed px-1">
            {fact.detail}
          </p>
          <p className="text-micro mt-3 font-mono" style={{ color: `${color}80` }}>
            {uiLabels.funFacts.flipBack}
          </p>
        </div>
      </div>
    </motion.div>
  );
}));
FunFactCard.displayName = "FunFactCard";

const FunFacts = () => {
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
      {/* Ambient glow blobs */}
      <div className="absolute -top-20 -right-20 w-60 h-60 bg-[#61dafb]/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-[#915eff]/5 rounded-full blur-[80px] pointer-events-none" />

      <motion.div variants={textVariant()}>
        <p className={styles.sectionSubText}>{sectionMeta.funFacts.sub}</p>
        <TextScramble text={sectionMeta.funFacts.heading} as="h2" className={styles.sectionHeadText} />
      </motion.div>

      <motion.p
        variants={fadeIn("", "", 0.1, 1)}
        className="mt-3 text-secondary text-body-sm sm:text-body max-w-3xl"
      >
        {sectionMeta.funFacts.description}
      </motion.p>

      <div className="mt-8 sm:mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {funFacts.map((fact, index) => (
          <FunFactCard key={index} ref={(el) => (cardRefs.current[index] = el)} fact={fact} index={index} />
        ))}
      </div>
    </div>
  );
};

export default SectionWrapper(FunFacts, "funfacts", "Fun Facts");
