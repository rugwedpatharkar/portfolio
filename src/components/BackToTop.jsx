import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const CIRCLE_R = 18;
const CIRCLE_C = 2 * Math.PI * CIRCLE_R;

const BackToTop = () => {
  const [visible, setVisible] = useState(false);
  const circleRef = useRef(null);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        setVisible(scrollY > 400);
        // Update progress ring
        if (circleRef.current) {
          const docH = document.documentElement.scrollHeight - window.innerHeight;
          const pct = docH > 0 ? scrollY / docH : 0;
          circleRef.current.style.strokeDashoffset = String(CIRCLE_C * (1 - pct));
        }
        ticking = false;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-3 right-3 sm:bottom-4 sm:right-4 z-50 w-11 h-11 sm:w-12 sm:h-12 rounded-full glass-card hover:border-[#915eff] text-white flex items-center justify-center shadow-lg transition-colors"
          aria-label="Back to top"
        >
          {/* Scroll progress ring */}
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 44 44">
            <circle
              ref={circleRef}
              cx="22"
              cy="22"
              r={CIRCLE_R}
              fill="none"
              stroke="#915eff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={CIRCLE_C}
              strokeDashoffset={CIRCLE_C}
              className="transition-[stroke-dashoffset] duration-150"
            />
          </svg>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 relative"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default BackToTop;
