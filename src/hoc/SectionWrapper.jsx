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
    // Watermark: opacity only — no y transform to prevent bleed into adjacent sections
    const labelOpacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 0.06, 0.06, 0]);

    // Fade-in: opacity 0.3 to 1 as content enters viewport center
    const contentOpacity = useTransform(scrollYProgress, [0, 0.25, 0.5], [0.3, 0.8, 1]);

    return (
      <motion.section
        ref={ref}
        id={idName}
        className="relative z-0"
      >
        {/* Watermark clipped strictly within section bounds */}
        {label && (
          <div
            className="absolute inset-0 overflow-hidden pointer-events-none z-0"
            aria-hidden="true"
          >
            <motion.div
              style={{ opacity: labelOpacity }}
              className="absolute top-6 sm:top-8 md:top-10 left-0 w-full font-heading font-black text-white text-[120px] sm:text-[180px] md:text-[220px] leading-none select-none uppercase overflow-hidden"
            >
              <span className="watermark-marquee-track">
                <span className="watermark-marquee-item">{label}</span>
                <span className="watermark-marquee-item">{label}</span>
              </span>
            </motion.div>
          </div>
        )}
        <span className="hash-span">
          &nbsp;
        </span>
        {/* Content always renders above watermark */}
        <motion.div
          variants={staggerContainer()}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          style={{ y, opacity: contentOpacity }}
          className={`${styles.padding} max-w-7xl 3xl:max-w-[2000px] mx-auto relative z-[1]`}
        >
          <Component />
        </motion.div>
      </motion.section>
    );
  };

export default SectionWrapper;
