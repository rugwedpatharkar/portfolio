import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { styles } from "../styles";
import { staggerContainer } from "../utils/motion";

const SectionWrapper = (Component, idName, label) =>
  function HOC() {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
      target: ref,
      offset: ["start end", "end start"],
    });

    // Subtle parallax: section floats up 20px as it scrolls through viewport
    const y = useTransform(scrollYProgress, [0, 1], [20, -20]);
    // Watermark moves slower — creates depth separation
    const labelY = useTransform(scrollYProgress, [0, 1], [40, -40]);
    const labelOpacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 0.015, 0.015, 0]);

    // Clip-path reveal: expands from center as section scrolls into view
    const clipInsetTop = useTransform(scrollYProgress, [0, 0.3], [5, 0]);
    const clipInsetSide = useTransform(scrollYProgress, [0, 0.3], [10, 0]);
    const clipPath = useTransform(
      [clipInsetTop, clipInsetSide],
      ([top, side]) => `inset(${top}% ${side}%)`
    );

    // Fade-in: opacity 0.3 to 1 as content enters viewport center
    const contentOpacity = useTransform(scrollYProgress, [0, 0.25, 0.5], [0.3, 0.8, 1]);

    return (
      <motion.section
        ref={ref}
        id={idName}
        className="relative z-0"
        style={{ clipPath }}
      >
        {label && (
          <motion.span
            style={{ y: labelY, opacity: labelOpacity }}
            className="absolute -top-6 -left-4 sm:-left-8 font-heading font-black text-white text-[120px] sm:text-[180px] md:text-[220px] leading-none select-none pointer-events-none whitespace-nowrap overflow-hidden max-w-full"
            aria-hidden="true"
          >
            {label}
          </motion.span>
        )}
        <span className="hash-span">
          &nbsp;
        </span>
        <motion.div
          variants={staggerContainer()}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          style={{ y, opacity: contentOpacity }}
          className={`${styles.padding} max-w-7xl 3xl:max-w-[2000px] mx-auto`}
        >
          <Component />
        </motion.div>
      </motion.section>
    );
  };

export default SectionWrapper;
