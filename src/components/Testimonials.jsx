/* eslint-disable react/prop-types */
/* eslint-disable react-refresh/only-export-components */
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, useMotionValue } from "framer-motion";
import { styles } from "../styles";
import { SectionWrapper } from "../hoc";
import { testimonials } from "../constants";
import { textVariant } from "../utils/motion";
import TextScramble from "./TextScramble";

const ACCENTS = ["#915eff", "#00cea8", "#f8c555", "#61dafb", "#ff6b6b", "#326ce5"];
const AUTO_INTERVAL = 6000;
const DRAG_THRESHOLD = 50;

/* ── Animated Stars ── */
const StarRating = ({ rating, color, delay = 0 }) => (
  <div className="flex gap-1">
    {[...Array(5)].map((_, i) => (
      <motion.svg
        key={i}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: delay + i * 0.1, type: "spring", stiffness: 300 }}
        className="w-4 h-4 sm:w-5 sm:h-5"
        viewBox="0 0 20 20"
        fill={i < rating ? color : "rgba(255,255,255,0.08)"}
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </motion.svg>
    ))}
  </div>
);

/* ── Avatar with rotating gradient ring ── */
const AvatarRing = ({ name, color }) => (
  <div className="relative w-12 h-12 sm:w-14 sm:h-14">
    {/* Rotating gradient border */}
    <div
      className="absolute inset-0 rounded-full testimonial-avatar-ring"
      style={{
        background: `conic-gradient(${color}, ${color}40, ${color})`,
      }}
    />
    {/* Inner circle */}
    <div className="absolute inset-[2.5px] rounded-full bg-primary flex items-center justify-center">
      <span
        className="font-heading font-bold text-body sm:text-body-lg"
        style={{ color }}
      >
        {name.charAt(0)}
      </span>
    </div>
  </div>
);

/* ── Slide variants — direction-aware ── */
const slideVariants = {
  enter: (dir) => ({
    x: dir > 0 ? 80 : -80,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (dir) => ({
    x: dir > 0 ? -80 : 80,
    opacity: 0,
  }),
};

/* ── Main Component ── */
const Testimonials = () => {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);
  const [timerKey, setTimerKey] = useState(0);
  const dragX = useMotionValue(0);
  const containerRef = useRef(null);

  const total = testimonials.length;
  const t = testimonials[current];
  const accent = ACCENTS[current % ACCENTS.length];

  const go = useCallback(
    (dir) => {
      setDirection(dir);
      setCurrent((prev) => (prev + dir + total) % total);
      setTimerKey((k) => k + 1);
    },
    [total]
  );

  const goTo = useCallback(
    (i) => {
      setDirection(i > current ? 1 : -1);
      setCurrent(i);
      setTimerKey((k) => k + 1);
    },
    [current]
  );

  /* Auto-rotate */
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => go(1), AUTO_INTERVAL);
    return () => clearInterval(id);
  }, [paused, go, timerKey]);

  /* Keyboard navigation */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  /* Swipe handler */
  const handleDragEnd = (_, info) => {
    if (info.offset.x < -DRAG_THRESHOLD) go(1);
    else if (info.offset.x > DRAG_THRESHOLD) go(-1);
  };

  return (
    <>
      <motion.div variants={textVariant()}>
        <p className={styles.sectionSubText}>What Others Say</p>
        <TextScramble
          text="Testimonials"
          as="h2"
          className={styles.sectionHeadText}
        />
      </motion.div>

      {/* Card container */}
      <div
        ref={containerRef}
        className="mt-8 sm:mt-12 max-w-3xl mx-auto relative"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
      >
        {/* Background glow — color shifts per testimonial */}
        <div
          className="absolute -inset-8 rounded-3xl blur-[80px] opacity-[0.04] pointer-events-none transition-colors duration-1000"
          style={{ background: accent }}
        />

        {/* Animated decorative quote mark */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`quote-${current}`}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.3 }}
            className="flex justify-center mb-4 sm:mb-6"
          >
            <div
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center border"
              style={{
                borderColor: `${accent}25`,
                background: `${accent}0a`,
              }}
            >
              <svg
                className="w-6 h-6 sm:w-7 sm:h-7"
                fill={accent}
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983z" />
              </svg>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Swipeable card */}
        <div className="overflow-hidden rounded-2xl">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={current}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                duration: 0.4,
                ease: [0.04, 0.62, 0.23, 0.98],
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.15}
              onDragEnd={handleDragEnd}
              className="glass-card rounded-2xl p-5 sm:p-8 cursor-grab active:cursor-grabbing touch-pan-y card-shine glow-hover"
              style={{
                x: dragX,
                borderColor: `${accent}15`,
              }}
            >
              {/* Stars */}
              <StarRating
                rating={t.rating}
                color={accent}
                delay={0.1}
              />

              {/* Quote */}
              <p className="text-white text-body-sm sm:text-body leading-relaxed mt-4 sm:mt-5 italic">
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Endorsements */}
              {t.endorsements && (
                <div className="mt-5">
                  <span className="text-white/25 text-micro sm:text-caption font-mono uppercase tracking-wider">
                    Endorses
                  </span>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2">
                    {t.endorsements.map((skill) => (
                      <span
                        key={skill}
                        className="font-mono text-micro sm:text-caption px-2 py-0.5 rounded-full border"
                        style={{
                          color: `${accent}cc`,
                          borderColor: `${accent}20`,
                          background: `${accent}0a`,
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Context block */}
              {t.context && (
                <div className="mt-5 p-3 sm:p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-caption sm:text-body-sm font-mono">
                    <span className="flex items-center gap-1.5 text-white/40">
                      <span style={{ color: accent }}>&#9632;</span>
                      {t.company}
                    </span>
                    <span className="text-white/40">
                      {t.context.period}
                    </span>
                  </div>
                  {t.context.projects && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <span className="text-white/30 text-micro sm:text-caption font-mono">
                        Projects:
                      </span>
                      {t.context.projects.map((p) => (
                        <span
                          key={p}
                          className="text-white/40 text-micro sm:text-caption font-mono"
                        >
                          {p}
                          {t.context.projects.indexOf(p) <
                            t.context.projects.length - 1 && " ·"}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Divider */}
              <div className="h-px bg-white/[0.06] my-5" />

              {/* Author */}
              <div className="flex items-center gap-3 sm:gap-4">
                <AvatarRing name={t.name} color={accent} />
                <div>
                  <p className="text-white font-heading font-semibold text-body-sm sm:text-body">
                    {t.name}
                  </p>
                  <p className="text-secondary text-caption sm:text-body-sm">
                    {t.role}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Progress bar timer */}
        <div className="mt-4 sm:mt-5 h-[2px] rounded-full bg-white/[0.06] overflow-hidden">
          <div
            key={timerKey}
            className="h-full rounded-full testimonial-progress"
            style={{
              background: `linear-gradient(90deg, ${accent}, ${accent}60)`,
              animationDuration: `${AUTO_INTERVAL}ms`,
              animationPlayState: paused ? "paused" : "running",
            }}
          />
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-4 sm:mt-5">
          {/* Prev */}
          <button
            onClick={() => go(-1)}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full glass-card border border-white/[0.08] hover:border-white/20 text-white/40 hover:text-white flex items-center justify-center transition-colors"
            aria-label="Previous testimonial"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          {/* Indicators — dots for ≤6, counter for 7+ */}
          {total <= 6 ? (
            <div className="flex items-center gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className="w-2 h-2 rounded-full transition-all duration-300"
                  style={
                    i === current
                      ? {
                          background: accent,
                          boxShadow: `0 0 8px ${accent}50`,
                          transform: "scale(1.3)",
                        }
                      : { background: "rgba(255,255,255,0.15)" }
                  }
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>
          ) : (
            <span className="font-mono text-caption text-white/30">
              <span style={{ color: accent }}>{String(current + 1).padStart(2, "0")}</span>
              <span className="mx-1">/</span>
              {String(total).padStart(2, "0")}
            </span>
          )}

          {/* Next */}
          <button
            onClick={() => go(1)}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full glass-card border border-white/[0.08] hover:border-white/20 text-white/40 hover:text-white flex items-center justify-center transition-colors"
            aria-label="Next testimonial"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
};

export default SectionWrapper(Testimonials, "testimonials");
