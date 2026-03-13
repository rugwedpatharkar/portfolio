/* eslint-disable react/prop-types */
import { useState, useEffect, useRef } from "react";

const CHARS = "!<>-_\\/[]{}—=+*^?#_abcdefghijklmnopqrstuvwxyz";

const TextScramble = ({ text, className = "", as: Tag = "span", delay = 0 }) => {
  const [displayText, setDisplayText] = useState("");
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef(null);
  const frameRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          setTimeout(() => scramble(), delay);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frameRef.current);
    };
  }, [hasAnimated, delay]);

  const scramble = () => {
    const length = text.length;
    const duration = 800;
    const startTime = performance.now();

    const update = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const revealedCount = Math.floor(progress * length);

      let result = "";
      for (let i = 0; i < length; i++) {
        if (i < revealedCount) {
          result += text[i];
        } else if (text[i] === " ") {
          result += " ";
        } else {
          result += CHARS[Math.floor(Math.random() * CHARS.length)];
        }
      }

      setDisplayText(result);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(update);
      } else {
        setDisplayText(text);
      }
    };

    frameRef.current = requestAnimationFrame(update);
  };

  return (
    <Tag ref={ref} className={className}>
      {displayText || "\u00A0"}
    </Tag>
  );
};

export default TextScramble;
