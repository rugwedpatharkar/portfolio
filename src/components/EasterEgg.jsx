import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const KONAMI_CODE = [
  "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
  "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight",
  "b", "a",
];

const EasterEgg = () => {
  const [show, setShow] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let index = 0;
    const handleKeyDown = (e) => {
      if (e.key === KONAMI_CODE[index]) {
        index++;
        setProgress(index);
        if (index === KONAMI_CODE.length) {
          setShow(true);
          index = 0;
          setProgress(0);
          setTimeout(() => setShow(false), 5000);
        }
      } else {
        index = 0;
        setProgress(0);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setShow(false)}
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 10, 0] }}
            transition={{ duration: 0.5 }}
            className="text-center p-8 sm:p-12"
          >
            <p className="text-6xl sm:text-8xl mb-4">🎮</p>
            <h3 className="text-white text-heading-sm sm:text-heading-xl font-heading font-bold mb-2">
              You found it!
            </h3>
            <p className="text-[#915eff] text-body sm:text-body-lg font-mono">
              Thanks for visiting my portfolio!
            </p>
            <p className="text-secondary text-caption sm:text-body-sm mt-4">
              Click anywhere to close
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EasterEgg;
