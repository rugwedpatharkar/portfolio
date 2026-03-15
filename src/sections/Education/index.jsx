/* eslint-disable react/prop-types */
/* eslint-disable react-refresh/only-export-components */
import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { styles } from "../../styles";
import { SectionWrapper } from "../../hoc";
import { fadeIn, textVariant } from "../../utils/motion";
import { educations, sectionMeta } from "../../content";
import TextScramble from "../../components/TextScramble";
import { NODE_COLORS } from "../../config/theme";

/* ── SVG Progress Ring ── */
const ProgressRing = ({ percent, color, size = 56, strokeWidth = 3, visible }) => {
  const r = (size - strokeWidth * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = visible ? circ - (percent / 100) * circ : circ;

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="w-full h-full transform -rotate-90"
      aria-hidden="true"
    >
      {/* Track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="white"
        strokeOpacity={0.06}
        strokeWidth={strokeWidth}
      />
      {/* Fill */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-1000 ease-out"
        style={{
          filter: `drop-shadow(0 0 6px ${color}40)`,
        }}
      />
    </svg>
  );
};

/* ── Pulse-glow keyframes (injected once) ── */
const PULSE_STYLE_ID = "edu-pulse-glow";
if (typeof document !== "undefined" && !document.getElementById(PULSE_STYLE_ID)) {
  const style = document.createElement("style");
  style.id = PULSE_STYLE_ID;
  style.textContent = `
    @keyframes eduPulseGlow {
      0%, 100% { opacity: 0.6; transform: scale(1); }
      50%      { opacity: 1;   transform: scale(1.18); }
    }
    .edu-pulse-glow { animation: eduPulseGlow 2s ease-in-out infinite; }
  `;
  document.head.appendChild(style);
}

/* ── Milestone Node ── */
const MilestoneNode = ({ edu, index, isActive, isPast, onClick, color, isLast }) => (
  <button
    onClick={onClick}
    className={`relative z-10 flex flex-col items-center gap-1.5 sm:gap-2 group transition-transform duration-300 ${
      isActive ? "scale-110" : "hover:scale-105"
    }`}
    aria-label={`View ${edu.shortName} details`}
  >
    {/* Ring + percentage */}
    <div className="relative w-11 h-11 sm:w-14 sm:h-14">
      {/* Solid bg disc — covers full ring area to mask the track line */}
      <div className="absolute inset-0 rounded-full bg-primary z-[1]" />
      <div className="relative z-[2] w-full h-full">
        <ProgressRing
          percent={edu.percentage}
          color={isActive || isPast ? color : "rgba(255,255,255,0.15)"}
          strokeWidth={isActive ? 3.5 : 2.5}
          visible={isPast || isActive}
        />
      </div>
      {/* Center label */}
      <div className="absolute inset-0 flex items-center justify-center z-[3]">
        <span
          className={`font-heading font-bold text-micro sm:text-caption transition-colors duration-300 ${
            isActive ? "text-white" : isPast ? "text-white/60" : "text-white/40"
          }`}
        >
          {edu.percentage}%
        </span>
      </div>
      {/* Active pulse glow */}
      {isActive && (
        <div
          className="absolute inset-[-6px] rounded-full edu-pulse-glow pointer-events-none z-[0]"
          style={{
            boxShadow: `0 0 18px ${color}50, 0 0 36px ${color}25, 0 0 54px ${color}10`,
          }}
        />
      )}
    </div>

    {/* Short name */}
    <span
      className={`font-mono text-micro sm:text-caption font-medium transition-colors duration-300 ${
        isActive ? "text-white" : isPast ? "text-white/50" : "text-white/40"
      }`}
    >
      {edu.shortName}
    </span>

    {/* Year */}
    <span className="font-mono text-micro text-white/20 hidden sm:block">
      {edu.year}
    </span>
  </button>
);

/* ── Detail Card ── */
const DetailCard = ({ edu, color }) => (
  <motion.div
    key={edu.shortName}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -15 }}
    transition={{ duration: 0.35, ease: [0.04, 0.62, 0.23, 0.98] }}
    className="glass-card rounded-2xl p-5 sm:p-7 relative overflow-hidden card-shine glow-hover border-glow"
  >
    {/* Accent glow */}
    <div
      className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-[60px] pointer-events-none"
      style={{ background: `${color}08` }}
    />

    {/* Level badge */}
    <span
      className="inline-block font-mono text-micro sm:text-caption px-2.5 py-1 rounded-full border mb-3"
      style={{
        color: `${color}cc`,
        borderColor: `${color}25`,
        background: `${color}0a`,
      }}
    >
      {edu.level}
    </span>

    {/* Degree */}
    <h3 className="text-white font-heading font-bold text-body-lg sm:text-heading-sm leading-tight">
      {edu.degree}
    </h3>

    {/* Institution */}
    <p className="text-secondary text-body-sm sm:text-body mt-1">
      {edu.name}
    </p>

    {/* Meta row */}
    <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-3 font-mono text-caption sm:text-body-sm text-white/45">
      <span>{edu.year}</span>
      {edu.duration && (
        <>
          <span className="text-white/20">|</span>
          <span>{edu.duration}</span>
        </>
      )}
      <span className="text-white/20">|</span>
      <span className="flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-[#00cea8] inline-block" />
        Completed
      </span>
    </div>

    {/* Course highlights */}
    {edu.highlights?.length > 0 && (
      <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-4">
        {edu.highlights.map((h) => (
          <span
            key={h}
            className="font-mono text-micro sm:text-caption px-2.5 py-1 rounded-full border"
            style={{
              color: `${color}bb`,
              borderColor: `${color}20`,
              background: `${color}08`,
            }}
          >
            {h}
          </span>
        ))}
      </div>
    )}

    {/* Progress bar */}
    <div className="mt-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-white/40 text-caption sm:text-body-sm font-mono">
          Score
        </span>
        <span
          className="font-heading font-bold text-body sm:text-body-lg"
          style={{ color }}
        >
          {edu.percentage}%
        </span>
      </div>
      <div className="w-full h-2 sm:h-2.5 rounded-full bg-white/[0.06] overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${edu.percentage}%` }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, ${color}80, ${color})`,
            boxShadow: `0 0 12px ${color}40`,
          }}
        />
      </div>
    </div>
  </motion.div>
);

/* ── Main Component ── */
const Education = () => {
  // Reverse to show oldest → newest (left → right)
  const timeline = useMemo(() => [...educations].reverse(), []);
  const [activeIndex, setActiveIndex] = useState(timeline.length - 1);

  const active = timeline[activeIndex];
  const activeColor = NODE_COLORS[activeIndex % NODE_COLORS.length];

  const isVisibleRef = useRef(false);
  const sectionRef = useRef(null);

  const goPrev = useCallback(() => setActiveIndex((i) => Math.max(0, i - 1)), []);
  const goNext = useCallback(
    () => setActiveIndex((i) => Math.min(timeline.length - 1, i + 1)),
    [timeline.length]
  );

  /* Track section visibility */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { isVisibleRef.current = entry.isIntersecting; },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  /* Keyboard navigation — scoped to section visibility */
  useEffect(() => {
    const onKey = (e) => {
      if (!isVisibleRef.current) return;
      if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goPrev, goNext]);

  // Progress fill width based on active node
  const progressWidth =
    timeline.length > 1
      ? `${(activeIndex / (timeline.length - 1)) * 100}%`
      : "100%";

  return (
    <div ref={sectionRef} className="relative">
      {/* Ambient glow blobs */}
      <div className="absolute -top-20 -left-20 w-60 h-60 bg-[#00cea8]/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-[#915eff]/5 rounded-full blur-[80px] pointer-events-none" />

      <motion.div variants={textVariant()}>
        <p className={styles.sectionSubText}>{sectionMeta.education.sub}</p>
        <TextScramble
          text={sectionMeta.education.heading}
          as="h2"
          className={styles.sectionHeadText}
        />
      </motion.div>

      <motion.p
        variants={fadeIn("", "", 0.1, 1)}
        className="mt-3 text-secondary text-body-sm sm:text-body max-w-3xl"
      >
        {sectionMeta.education.description}
      </motion.p>

      {/* ── Milestone Track ── */}
      <div className="mt-10 sm:mt-14 relative px-2 sm:px-8">
        {/* Background line — z-0 so nodes sit on top */}
        <div className="absolute top-[22px] sm:top-[28px] left-[calc(8.33%)] right-[calc(8.33%)] h-[2px] bg-white/[0.06] rounded-full z-0" />

        {/* Progress fill line — z-0, behind nodes */}
        <div
          className="absolute top-[22px] sm:top-[28px] left-[calc(8.33%)] h-[2px] rounded-full transition-all duration-700 ease-out z-0"
          style={{
            width: `calc(${progressWidth} * 0.8333)`,
            background: `linear-gradient(90deg, ${NODE_COLORS[0]}, ${activeColor})`,
            boxShadow: `0 0 10px ${activeColor}30`,
          }}
        />

        {/* Nodes */}
        <div className="flex items-start justify-between relative">
          {timeline.map((edu, i) => (
            <MilestoneNode
              key={edu.shortName}
              edu={edu}
              index={i}
              isActive={i === activeIndex}
              isPast={i <= activeIndex}
              onClick={() => setActiveIndex(i)}
              color={NODE_COLORS[i % NODE_COLORS.length]}
            />
          ))}
        </div>
      </div>

      {/* ── Detail Card ── */}
      <div className="mt-8 sm:mt-10">
        <AnimatePresence mode="wait">
          <DetailCard
            key={active.shortName}
            edu={active}
            color={activeColor}
          />
        </AnimatePresence>

        {/* Prev / Next */}
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={goPrev}
            disabled={activeIndex === 0}
            className="font-mono text-caption sm:text-body-sm text-white/45 hover:text-white/60 disabled:opacity-20 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5 px-3 py-2.5 sm:py-2 rounded-lg hover:bg-white/[0.03] min-h-[44px]"
          >
            <svg
              className="w-5 h-5 sm:w-4 sm:h-4"
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
            Prev
          </button>

          {/* Dot indicators */}
          <div className="flex gap-2">
            {timeline.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label={`Go to ${timeline[i].shortName}`}
              >
                <span
                  className={`block w-2 h-2 rounded-full transition-all duration-300 ${
                    i === activeIndex
                      ? "scale-125"
                      : "bg-white/15 hover:bg-white/30"
                  }`}
                  style={
                    i === activeIndex
                      ? { background: activeColor, boxShadow: `0 0 8px ${activeColor}50` }
                      : undefined
                  }
                />
              </button>
            ))}
          </div>

          <button
            onClick={goNext}
            disabled={activeIndex === timeline.length - 1}
            className="font-mono text-caption sm:text-body-sm text-white/45 hover:text-white/60 disabled:opacity-20 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5 px-3 py-2.5 sm:py-2 rounded-lg hover:bg-white/[0.03] min-h-[44px]"
          >
            Next
            <svg
              className="w-5 h-5 sm:w-4 sm:h-4"
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
    </div>
  );
};

export default SectionWrapper(Education, "education", "Education");
