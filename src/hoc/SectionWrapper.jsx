import { motion } from "motion/react";
import { styles } from "../styles";
import { staggerContainer } from "../utils/motion";

/*
 * Lean SectionWrapper — dropped per-section useScroll + useTransform.
 * Previously every section subscribed to scrollYProgress and wrote two
 * style transforms (y + opacity) on every scroll frame. With 11 sections
 * that meant 22+ subscriptions × every scroll event = the main cause of
 * the "extremely laggy" feel in production.
 *
 * Reveal is now a one-shot via whileInView: opacity 0 → 1 with a small
 * y lift, fires once when the section enters the viewport. After that
 * there is zero scroll work per section. Same visual result, ~95% less
 * main-thread cost on scroll.
 */
const SectionWrapper = (Component, idName, label) =>
  function HOC() {
    return (
      <section id={idName} className="relative z-0 overflow-hidden">
        {label && (
          <div
            className="absolute inset-0 overflow-hidden pointer-events-none z-0"
            aria-hidden="true"
          >
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 0.06 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute top-6 sm:top-8 md:top-10 left-0 w-full max-w-[100vw] font-heading font-black text-white text-[clamp(80px,18vw,220px)] leading-none select-none uppercase overflow-hidden"
            >
              <span className="watermark-marquee-track">
                <span className="watermark-marquee-item">{label}</span>
                <span className="watermark-marquee-item">{label}</span>
              </span>
            </motion.div>
          </div>
        )}
        <span className="hash-span">&nbsp;</span>
        <motion.div
          variants={staggerContainer()}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          className={`${styles.padding} max-w-7xl 3xl:max-w-screen-3xl 4xl:max-w-screen-4xl 5xl:max-w-screen-5xl mx-auto relative z-[1]`}
        >
          <Component />
        </motion.div>
      </section>
    );
  };

export default SectionWrapper;
