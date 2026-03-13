/* eslint-disable react/prop-types */
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { funFacts } from "../constants";
import { textVariant } from "../utils/motion";
import { styles } from "../styles";
import { SectionWrapper } from "../hoc";

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
        <h2 className={styles.sectionHeadText}>Fun Facts</h2>
      </motion.div>
      <div className="mt-8 sm:mt-12 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {funFacts.map((fact, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.15, duration: 0.5 }}
            className="bg-tertiary rounded-2xl p-5 sm:p-8 text-center card-shine"
          >
            <span className="text-3xl sm:text-4xl block mb-3">{fact.icon}</span>
            <p className="text-white font-bold text-2xl sm:text-4xl">
              <AnimatedCounter value={fact.value} suffix={fact.suffix} />
            </p>
            <p className="text-secondary text-xs sm:text-sm mt-2">{fact.label}</p>
          </motion.div>
        ))}
      </div>
    </>
  );
};

export default SectionWrapper(FunFacts, "");
