/* eslint-disable react/prop-types */
import { useRef, useCallback, useEffect, forwardRef } from "react";
import { motion } from "framer-motion";
import { styles } from "../../styles";
import { SectionWrapper } from "../../hoc";
import { achievements, sectionMeta } from "../../content";
import { fadeIn, textVariant } from "../../utils/motion";
import TextScramble from "../../components/TextScramble";
import { ACCENT_COLORS } from "../../config/theme";
import TiltCard from "../../components/TiltCard";
import CardBorderTrace from "../../components/CardBorderTrace";

/* ── Mini confetti burst — fires from a DOM element ── */
const useConfetti = () => {
  const particles = useRef([]);
  const canvasRef = useRef(null);

  const fire = useCallback((originEl, color) => {
    if (!originEl) return;
    const rect = originEl.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    // Create or reuse a tiny full-screen canvas
    let canvas = canvasRef.current;
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.style.cssText = "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:60";
      document.body.appendChild(canvas);
      canvasRef.current = canvas;
    }
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext("2d");

    // Spawn 20 particles
    const COLORS = [color, "#ffffff", "#f8c555", "#00cea8", "#61dafb"];
    particles.current = Array.from({ length: 20 }, () => ({
      x: cx,
      y: cy,
      vx: (Math.random() - 0.5) * 8,
      vy: -Math.random() * 6 - 2,
      size: Math.random() * 4 + 2,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      life: 1,
      decay: 0.015 + Math.random() * 0.01,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.2,
    }));

    let rafId;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      for (const p of particles.current) {
        if (p.life <= 0) continue;
        alive = true;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15; // gravity
        p.life -= p.decay;
        p.rotation += p.rotSpeed;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      }
      if (alive) {
        rafId = requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
    rafId = requestAnimationFrame(animate);

    // Safety cleanup after 2s
    setTimeout(() => {
      cancelAnimationFrame(rafId);
      if (canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }, 2000);
  }, []);

  // Remove canvas from DOM on unmount
  useEffect(() => {
    return () => {
      if (canvasRef.current) {
        canvasRef.current.remove();
        canvasRef.current = null;
      }
    };
  }, []);

  return fire;
};

const AchievementCard = forwardRef(({ achievement, index, onCelebrate }, ref) => {
  const color = ACCENT_COLORS[index % ACCENT_COLORS.length];
  const iconRef = useRef(null);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5, type: "spring" }}
      className="h-full"
    >
      <TiltCard tiltStrength={5} className="h-full">
        <div className="relative group h-full">
        <div
          className="glass-card rounded-2xl p-5 sm:p-6 card-shine glow-hover border-glow achievement-card relative overflow-hidden h-full"
          style={{ "--achievement-accent": color }}
        >
          {/* Gradient border glow on hover */}
          <div
            className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 transition-opacity duration-500 achievement-gradient-border"
            style={{
              boxShadow: `inset 0 0 0 1.5px ${color}30, 0 0 20px ${color}15, 0 0 40px ${color}08`,
            }}
          />

          {/* Subtle accent glow */}
          <div
            className="absolute top-0 right-0 w-24 h-24 rounded-full blur-[40px] pointer-events-none opacity-[0.06] transition-opacity duration-500 achievement-glow-blob"
            style={{ background: color }}
          />

          {/* Icon + Year row */}
          <div className="flex items-center gap-3 mb-3">
            <div
              ref={iconRef}
              onClick={() => onCelebrate(iconRef.current, color)}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full glass-card flex items-center justify-center text-body-lg sm:text-subheading flex-shrink-0 border-2 cursor-pointer transition-transform duration-200 hover:scale-110 active:scale-95"
              style={{ borderColor: `${color}40`, boxShadow: `0 0 20px ${color}15` }}
            >
              {achievement.icon}
            </div>
            <span
              className="font-mono text-caption sm:text-body-sm font-semibold"
              style={{ color }}
            >
              {achievement.year}
            </span>
          </div>

          <h3 className="text-white font-heading font-bold text-body sm:text-body-lg">
            {achievement.title}
          </h3>
          <p className="text-secondary text-caption sm:text-body-sm mt-1.5 leading-relaxed">
            {achievement.description}
          </p>
        </div>
          <CardBorderTrace color={color} />
        </div>
      </TiltCard>
    </motion.div>
  );
});
AchievementCard.displayName = "AchievementCard";

const Achievements = () => {
  const fireConfetti = useConfetti();
  const cardRefs = useRef([]);

  // Equalize all card heights so the tallest card sets the size for all
  useEffect(() => {
    const equalize = () => {
      const els = cardRefs.current.filter(Boolean);
      if (!els.length) return;
      els.forEach((el) => (el.style.minHeight = ""));
      const max = Math.max(...els.map((el) => el.getBoundingClientRect().height));
      els.forEach((el) => (el.style.minHeight = `${max}px`));
    };
    // Wait for entrance animations to settle before measuring
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
      <div className="absolute -top-20 -right-20 w-60 h-60 bg-[#f8c555]/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-[#915eff]/5 rounded-full blur-[80px] pointer-events-none" />

      <motion.div variants={textVariant()}>
        <p className={styles.sectionSubText}>{sectionMeta.achievements.sub}</p>
        <TextScramble text={sectionMeta.achievements.heading} as="h2" className={styles.sectionHeadText} />
      </motion.div>

      <motion.p
        variants={fadeIn("", "", 0.1, 1)}
        className="mt-3 text-secondary text-body-sm sm:text-body max-w-3xl"
      >
        {sectionMeta.achievements.description}
      </motion.p>

      <div className="mt-8 sm:mt-12 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {achievements.map((achievement, index) => (
          <AchievementCard
            key={index}
            ref={(el) => (cardRefs.current[index] = el)}
            achievement={achievement}
            index={index}
            onCelebrate={fireConfetti}
          />
        ))}
      </div>
    </div>
  );
};

export default SectionWrapper(Achievements, "achievements", "Achievements");
