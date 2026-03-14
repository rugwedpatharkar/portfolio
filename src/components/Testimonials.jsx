/* eslint-disable react/prop-types */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { styles } from "../styles";
import { SectionWrapper } from "../hoc";
import { testimonials } from "../constants";
import { textVariant } from "../utils/motion";
import TextScramble from "./TextScramble";

const Testimonials = () => {
  const [current, setCurrent] = useState(0);

  const next = () => setCurrent((prev) => (prev + 1) % testimonials.length);
  const prev = () => setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  return (
    <div className="glass-section rounded-[20px]">
      <div className={`glass-card rounded-2xl ${styles.padding} min-h-[200px] sm:min-h-[250px]`}>
        <motion.div variants={textVariant()}>
          <p className={styles.sectionSubText}>What Others Say</p>
          <TextScramble text="Testimonials" as="h2" className={styles.sectionHeadText} />
        </motion.div>
      </div>

      <div className={`-mt-8 sm:-mt-12 pb-10 sm:pb-14 ${styles.paddingX}`}>
        <div className="relative max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="glass-card-dark rounded-2xl p-6 sm:p-10"
            >
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-[#915eff] mb-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983z" />
              </svg>
              <p className="text-white text-body-sm sm:text-body leading-relaxed italic">
                &ldquo;{testimonials[current].quote}&rdquo;
              </p>
              <div className="mt-6 flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#915eff]/20 flex items-center justify-center">
                  <span className="text-[#915eff] font-bold text-body-sm sm:text-body">
                    {testimonials[current].name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-white font-heading font-semibold text-body-sm sm:text-body">{testimonials[current].name}</p>
                  <p className="text-secondary text-caption sm:text-body-sm">{testimonials[current].role}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {testimonials.length > 1 && (
            <div className="flex justify-center gap-3 mt-6">
              <button
                onClick={prev}
                className="w-10 h-10 rounded-full glass-card border border-secondary/30 hover:border-[#915eff] text-white flex items-center justify-center transition-colors"
                aria-label="Previous testimonial"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="flex items-center gap-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className={`w-2.5 h-2.5 rounded-full transition-colors ${
                      i === current ? "bg-[#915eff]" : "bg-secondary/40"
                    }`}
                    aria-label={`Go to testimonial ${i + 1}`}
                  />
                ))}
              </div>
              <button
                onClick={next}
                className="w-10 h-10 rounded-full glass-card border border-secondary/30 hover:border-[#915eff] text-white flex items-center justify-center transition-colors"
                aria-label="Next testimonial"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SectionWrapper(Testimonials, "");
