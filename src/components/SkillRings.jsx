/* eslint-disable react/prop-types */
import { useEffect, useRef, memo } from "react";
import { skills } from "../content";
import { CATEGORY_COLORS } from "../config/theme";

const RADIUS = 28;
const STROKE = 5;
const SIZE = 72; // viewBox size
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/* Single skill ring */
const Ring = memo(({ name, level, color, icon, delay }) => {
  const circleRef = useRef(null);
  const wrapRef = useRef(null);
  const observed = useRef(false);

  useEffect(() => {
    const el = circleRef.current;
    const wrap = wrapRef.current;
    if (!el || !wrap) return;

    // Start at full dash (hidden)
    el.style.strokeDashoffset = String(CIRCUMFERENCE);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !observed.current) {
          observed.current = true;
          el.style.strokeDashoffset = String(CIRCUMFERENCE * (1 - level / 100));
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(wrap);
    return () => observer.disconnect();
  }, [level]);

  return (
    <div
      ref={wrapRef}
      className="flex flex-col items-center gap-1.5 group cursor-default"
    >
      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          width={SIZE}
          height={SIZE}
          className="-rotate-90"
          aria-label={`${name}: ${level}%`}
          role="img"
        >
          {/* Track */}
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke={`${color}18`}
            strokeWidth={STROKE}
          />
          {/* Animated fill */}
          <circle
            ref={circleRef}
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke={color}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE}
            style={{
              transition: `stroke-dashoffset 1.1s cubic-bezier(0.4,0,0.2,1) ${delay}s`,
              filter: `drop-shadow(0 0 4px ${color}50)`,
            }}
          />
        </svg>

        {/* Center icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src={icon}
            alt=""
            className="object-contain"
            style={{ width: 26, height: 26 }}
            loading="lazy"
          />
        </div>

        {/* Hover: show percentage */}
        <div
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-full"
          style={{ background: "rgba(0,0,0,0.55)" }}
        >
          <span
            className="font-mono text-[11px] font-bold"
            style={{ color }}
          >
            {level}%
          </span>
        </div>
      </div>

      <span className="text-white/55 text-[10px] font-mono text-center leading-tight max-w-[72px] truncate">
        {name}
      </span>
    </div>
  );
});

Ring.displayName = "Ring";

const SkillRings = () => (
  <div className="mt-8 space-y-8">
    {Object.entries(skills).map(([cat, items]) => {
      const color = CATEGORY_COLORS[cat] ?? "#915eff";
      return (
        <div key={cat}>
          <h3
            className="font-mono text-caption sm:text-body-sm mb-4 uppercase tracking-wider"
            style={{ color }}
          >
            {cat}
          </h3>
          <div className="flex flex-wrap gap-4 sm:gap-5">
            {items.map((skill, i) => (
              <Ring
                key={skill.name}
                name={skill.name}
                level={skill.level}
                icon={skill.icon}
                color={color}
                delay={0.05 + i * 0.06}
              />
            ))}
          </div>
        </div>
      );
    })}
  </div>
);

export default SkillRings;
