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

    const y = useTransform(scrollYProgress, [0, 1], [40, -40]);
    const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.6, 1, 1, 0.6]);

    return (
      <motion.section
        ref={ref}
        variants={staggerContainer()}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.15 }}
        className={`${styles.padding} relative z-0 max-w-7xl 3xl:max-w-[2000px] mx-auto`}
      >
        <span className="hash-span" id={idName}>
          &nbsp;
        </span>
        <motion.div style={{ y, opacity }}>
          <Component />
        </motion.div>
      </motion.section>
    );
  };

export default SectionWrapper;
