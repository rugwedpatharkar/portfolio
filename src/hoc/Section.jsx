import { createContext, useContext, useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { styles } from "../styles";
import { staggerContainer, fadeIn } from "../utils/motion";

/*
 * Compound section primitives.
 *
 * Usage:
 *   <Section id="about" label="ABOUT">
 *     <Section.Header>
 *       <Section.Eyebrow>Introduction</Section.Eyebrow>
 *       <Section.Title>Overview</Section.Title>
 *       <Section.Lede>One-line description that anchors the section…</Section.Lede>
 *     </Section.Header>
 *     <Section.Body> … </Section.Body>
 *   </Section>
 *
 * Section.Header / Eyebrow / Title / Lede / Body share the same scroll
 * orchestration as the legacy SectionWrapper HOC. The HOC stays for
 * backwards compat — sections can migrate piecemeal.
 */

const SectionCtx = createContext(null);
const useSection = () => {
  const ctx = useContext(SectionCtx);
  if (!ctx) {
    throw new Error("Section.* components must be rendered inside <Section>.");
  }
  return ctx;
};

const Watermark = ({ label, labelOpacity }) => (
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
);

const Section = ({ id, label, children, className = "" }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [20, -20]);
  const labelOpacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 0.06, 0.06, 0]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.25, 0.5], [0.3, 0.8, 1]);

  return (
    <SectionCtx.Provider value={{ ref, scrollYProgress, y, contentOpacity }}>
      <motion.section ref={ref} id={id} className={`relative z-0 ${className}`}>
        {label && <Watermark label={label} labelOpacity={labelOpacity} />}
        <span className="hash-span">&nbsp;</span>
        <motion.div
          variants={staggerContainer()}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          style={{ y, opacity: contentOpacity }}
          className={`${styles.padding} max-w-7xl 3xl:max-w-screen-3xl 4xl:max-w-screen-4xl 5xl:max-w-screen-5xl mx-auto relative z-[1]`}
        >
          {children}
        </motion.div>
      </motion.section>
    </SectionCtx.Provider>
  );
};

const Header = ({ children, className = "" }) => {
  // Touch context to assert nesting; reveals are driven by parent stagger.
  useSection();
  return (
    <motion.div variants={fadeIn("up", "spring", 0.05, 0.6)} className={`relative ${className}`}>
      {children}
    </motion.div>
  );
};

const Eyebrow = ({ children, className = "" }) => (
  <p className={`${styles.sectionSubText} ${className}`}>{children}</p>
);

const Title = ({ children, as: As = "h2", className = "" }) => (
  <As className={`${styles.sectionHeadText} ${className}`}>{children}</As>
);

const Lede = ({ children, className = "" }) => (
  <p
    className={`mt-3 sm:mt-4 max-w-[60ch] text-secondary text-body sm:text-body-lg leading-relaxed ${className}`}
  >
    {children}
  </p>
);

const Body = ({ children, className = "", delay = 0.1 }) => (
  <motion.div variants={fadeIn("up", "spring", delay, 0.6)} className={`mt-10 sm:mt-14 ${className}`}>
    {children}
  </motion.div>
);

Section.Header = Header;
Section.Eyebrow = Eyebrow;
Section.Title = Title;
Section.Lede = Lede;
Section.Body = Body;

export default Section;
