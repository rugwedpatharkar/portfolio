/* eslint-disable react/prop-types */
import { useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { styles } from "../../styles";
import { SectionWrapper } from "../../hoc";
import { achievements, sectionMeta } from "../../content";
import { fadeIn, textVariant } from "../../utils/motion";
import TextScramble from "../../components/TextScramble";
import { ACCENT_COLORS } from "../../config/theme";
import TiltCard from "../../components/TiltCard";

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

const AchievementCard = ({ achievement, index, onCelebrate }) => {
  const color = ACCENT_COLORS[index % ACCENT_COLORS.length];
  const iconRef = useRef(null);

  return (
    <motion.div
      initial={{ opacity: 0, x: index % 2 === 0 ? -40 : 40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.15, duration: 0.5, type: "spring" }}
      className="relative flex items-start gap-4 sm:gap-6 group"
    >
      {/* Timeline column */}
      <div className="flex flex-col items-center">
        <motion.div
          ref={iconRef}
          whileHover={{ scale: 1.15, rotate: [0, -8, 8, 0] }}
          onHoverStart={() => onCelebrate(iconRef.current, color)}
          onClick={() => onCelebrate(iconRef.current, color)}
          transition={{ type: "spring", stiffness: 300 }}
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full glass-card flex items-center justify-center text-subheading sm:text-heading-sm flex-shrink-0 border-2 transition-colors duration-300 cursor-default"
          style={{ borderColor: `${color}40`, boxShadow: `0 0 20px ${color}15` }}
        >
          {achievement.icon}
        </motion.div>
        {index < achievements.length - 1 && (
          <div
            className="w-[2px] h-12 sm:h-16 mt-2 rounded-full"
            style={{ background: `linear-gradient(to bottom, ${color}40, transparent)` }}
          />
        )}
      </div>

      {/* Card */}
      <div className="pb-8 sm:pb-12 flex-1">
        <TiltCard tiltStrength={5}>
          <div
            className="glass-card rounded-2xl p-4 sm:p-5 card-shine glow-hover border-glow achievement-card relative overflow-hidden transition-transform duration-300 ease-out hover:scale-[1.03]"
            style={{
              "--achievement-accent": color,
            }}
          >
            {/* Gradient border glow on hover */}
            <div
              className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 transition-opacity duration-500 achievement-gradient-border"
              style={{
                boxShadow: `inset 0 0 0 1.5px ${color}30, 0 0 20px ${color}15, 0 0 40px ${color}08`,
              }}
            />

            {/* Subtle accent glow — intensifies on hover */}
            <div
              className="absolute -top-6 -right-6 w-24 h-24 rounded-full blur-[40px] pointer-events-none opacity-[0.06] transition-opacity duration-500 achievement-glow-blob"
              style={{ background: color }}
            />

            <div className="flex items-center gap-2 mb-1.5">
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
            <p className="text-secondary text-caption sm:text-body-sm mt-1 leading-relaxed">
              {achievement.description}
            </p>
          </div>
        </TiltCard>
      </div>
    </motion.div>
  );
};

const Achievements = () => {
  const fireConfetti = useConfetti();

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

      <div className="mt-8 sm:mt-12 max-w-3xl mx-auto">
        {achievements.map((achievement, index) => (
          <AchievementCard key={index} achievement={achievement} index={index} onCelebrate={fireConfetti} />
        ))}
      </div>
    </div>
  );
};

export default SectionWrapper(Achievements, "achievements", "Achievements");
