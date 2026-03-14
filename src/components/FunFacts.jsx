/* eslint-disable react/prop-types */
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { funFacts } from "../constants";
import { textVariant } from "../utils/motion";
import { styles } from "../styles";
import { SectionWrapper } from "../hoc";
import TextScramble from "./TextScramble";

const AnimatedCounter = ({ value, suffix = "", duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let start = 0;
          const increment = value / (duration / 16);
          const timer = setInterval(() => {
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
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value, duration, hasAnimated]);

  return (
    <span ref={ref} className="tabular-nums">
      {count.toLocaleString()}{suffix}
    </span>
  );
};

const FunFacts = () => {
  return (
    <>
      <motion.div variants={textVariant()}>
        <p className={styles.sectionSubText}>A Glimpse Into My Journey</p>
        <TextScramble text="Fun Facts" as="h2" className={styles.sectionHeadText} />
      </motion.div>
      <div className="mt-8 sm:mt-12 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {funFacts.map((fact, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30, y: 20 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.15, duration: 0.5, type: "spring" }}
            className="glass-card rounded-2xl p-5 sm:p-8 text-center card-shine glow-hover"
          >
            <span className="text-heading sm:text-heading-xl block mb-3">{fact.icon}</span>
            <p className="text-white font-bold text-heading-sm sm:text-heading-xl font-mono">
              <AnimatedCounter value={fact.value} suffix={fact.suffix} />
            </p>
            <p className="text-secondary text-caption sm:text-body-sm mt-2">{fact.label}</p>
          </motion.div>
        ))}
      </div>
    </>
  );
};

export default SectionWrapper(FunFacts, "");
