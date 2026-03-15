import React, { useRef, useMemo } from "react";
import { motion, useInView } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04 },
  },
};

const child = {
  hidden: { opacity: 0, y: 20, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { type: "tween", duration: 0.3 },
  },
};

const AnimatedText = React.memo(({ text, mode = "words", className = "" }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  const items = useMemo(() => {
    if (mode === "chars") {
      return text.split("").map((char, i) => ({
        key: `${char}-${i}`,
        content: char === " " ? "\u00A0" : char,
      }));
    }
    return text.split(" ").map((word, i) => ({
      key: `${word}-${i}`,
      content: word,
    }));
  }, [text, mode]);

  return (
    <motion.span
      ref={ref}
      className={className}
      style={{ display: "inline-flex", flexWrap: "wrap", gap: mode === "words" ? "0.3em" : 0 }}
      variants={container}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
    >
      {items.map(({ key, content }) => (
        <motion.span
          key={key}
          variants={child}
          style={{ display: "inline-block" }}
        >
          {content}
        </motion.span>
      ))}
    </motion.span>
  );
});

AnimatedText.displayName = "AnimatedText";

export default AnimatedText;
