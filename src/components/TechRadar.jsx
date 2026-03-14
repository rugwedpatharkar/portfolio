/* eslint-disable react/prop-types */
import { useState, useEffect, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { skills } from "../constants";

const RINGS = [
  { label: "Expert", radius: 0.25, color: "rgba(0, 206, 168, 0.3)" },
  { label: "Proficient", radius: 0.5, color: "rgba(145, 94, 255, 0.2)" },
  { label: "Familiar", radius: 0.75, color: "rgba(191, 97, 255, 0.15)" },
  { label: "Learning", radius: 1, color: "rgba(255, 255, 255, 0.05)" },
];

const getRing = (level) => {
  if (level >= 85) return 0;
  if (level >= 70) return 1;
  if (level >= 50) return 2;
  return 3;
};

const TechRadar = () => {
  const [animated, setAnimated] = useState(false);
  const [hoveredSkill, setHoveredSkill] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setAnimated(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const positionedSkills = useMemo(() => {
    const allSkills = Object.values(skills).flat();
    // Seeded pseudo-random for stable positions across renders
    let seed = 42;
    const rand = () => { seed = (seed * 16807 + 0) % 2147483647; return seed / 2147483647; };

    return allSkills.map((skill, i) => {
      const ringIdx = getRing(skill.level);
      const ring = RINGS[ringIdx];
      const angle = (i / allSkills.length) * Math.PI * 2 + (ringIdx * 0.3);
      const radiusJitter = ring.radius * (0.7 + rand() * 0.3);
      return {
        ...skill,
        ringIdx,
        x: 50 + Math.cos(angle) * radiusJitter * 42,
        y: 50 + Math.sin(angle) * radiusJitter * 42,
      };
    });
  }, []);

  return (
    <div ref={ref} className="relative w-full max-w-2xl mx-auto aspect-square">
      {/* Rings */}
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
        {RINGS.map((ring, i) => (
          <motion.circle
            key={i}
            cx="50"
            cy="50"
            r={ring.radius * 42}
            fill="none"
            stroke={ring.color.replace(/[\d.]+\)$/, "0.4)")}
            strokeWidth="0.3"
            strokeDasharray="2 2"
            initial={{ scale: 0, opacity: 0 }}
            animate={animated ? { scale: 1, opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: i * 0.15 }}
            style={{ transformOrigin: "50px 50px" }}
          />
        ))}
        {/* Cross hairs */}
        <line x1="50" y1="8" x2="50" y2="92" stroke="rgba(145, 94, 255, 0.1)" strokeWidth="0.2" />
        <line x1="8" y1="50" x2="92" y2="50" stroke="rgba(145, 94, 255, 0.1)" strokeWidth="0.2" />
      </svg>

      {/* Ring labels */}
      {RINGS.map((ring, i) => (
        <span
          key={i}
          className="absolute text-micro font-mono text-white/30 pointer-events-none"
          style={{
            left: "50%",
            top: `${50 - ring.radius * 42}%`,
            transform: "translate(-50%, -100%)",
          }}
        >
          {ring.label}
        </span>
      ))}

      {/* Skill dots */}
      {positionedSkills.map((skill, i) => (
        <motion.div
          key={skill.name}
          className="absolute flex items-center justify-center cursor-pointer group"
          style={{
            left: `${skill.x}%`,
            top: `${skill.y}%`,
            transform: "translate(-50%, -50%)",
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={animated ? { scale: 1, opacity: 1 } : {}}
          transition={{ duration: 0.4, delay: 0.5 + i * 0.03 }}
          onMouseEnter={() => setHoveredSkill(skill.name)}
          onMouseLeave={() => setHoveredSkill(null)}
        >
          <div
            className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all ${
              hoveredSkill === skill.name ? "scale-125 z-20" : ""
            }`}
            style={{
              background: RINGS[skill.ringIdx].color,
              boxShadow: hoveredSkill === skill.name
                ? "0 0 12px rgba(145, 94, 255, 0.5)"
                : "none",
            }}
          >
            <img src={skill.icon} alt={skill.name} className="w-4 h-4 sm:w-5 sm:h-5 object-contain" />
          </div>

          {/* Tooltip */}
          <div className="absolute bottom-full mb-1 px-2 py-1 bg-black/90 text-white text-micro font-mono rounded whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-30">
            {skill.name} ({skill.level}%)
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default TechRadar;
