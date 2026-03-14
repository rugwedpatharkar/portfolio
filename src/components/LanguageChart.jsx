import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

const LANGUAGES = [
  { name: "Java", percentage: 32, color: "#f89820" },
  { name: "Python", percentage: 25, color: "#3776AB" },
  { name: "JavaScript", percentage: 20, color: "#f7df1e" },
  { name: "TypeScript", percentage: 10, color: "#3178c6" },
  { name: "HTML/CSS", percentage: 8, color: "#e34c26" },
  { name: "SQL", percentage: 5, color: "#00cea8" },
];

const LanguageChart = () => {
  const [animated, setAnimated] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setAnimated(true);
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-4xl mx-auto glass-card rounded-2xl p-5 sm:p-8"
    >
      <h3 className="text-white font-bold text-body sm:text-body-lg mb-4 font-mono">
        $ language --stats
      </h3>

      {/* Bar chart */}
      <div className="flex h-4 sm:h-5 rounded-full overflow-hidden mb-6 bg-white/5">
        {LANGUAGES.map((lang) => (
          <motion.div
            key={lang.name}
            initial={{ width: 0 }}
            animate={animated ? { width: `${lang.percentage}%` } : { width: 0 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            style={{ backgroundColor: lang.color }}
            className="h-full"
            title={`${lang.name}: ${lang.percentage}%`}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {LANGUAGES.map((lang) => (
          <div key={lang.name} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-sm shrink-0"
              style={{ backgroundColor: lang.color }}
            />
            <span className="text-secondary text-caption sm:text-body-sm font-mono">
              {lang.name}
            </span>
            <span className="text-white/50 text-caption font-mono ml-auto">
              {lang.percentage}%
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default LanguageChart;
