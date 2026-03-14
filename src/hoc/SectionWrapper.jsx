import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { styles } from "../styles";
import { staggerContainer } from "../utils/motion";

const SectionWrapper = (Component, idName) =>
  function HOC() {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
      target: ref,
      offset: ["start end", "end start"],
    });

    // Subtle parallax: section floats up 20px as it scrolls through viewport
    const y = useTransform(scrollYProgress, [0, 1], [20, -20]);

    return (
      <section ref={ref} className="relative z-0">
        <span className="hash-span" id={idName}>
          &nbsp;
        </span>
        <motion.div
          variants={staggerContainer()}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          style={{ y }}
          className={`${styles.padding} max-w-7xl 3xl:max-w-[2000px] mx-auto`}
        >
          <Component />
        </motion.div>
      </section>
    );
  };

export default SectionWrapper;
