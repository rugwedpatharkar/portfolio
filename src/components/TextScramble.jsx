/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";

const CHARS = "!<>-_\\/[]{}—=+*^?#_abcdefghijklmnopqrstuvwxyz";

const TextScramble = ({ text, className = "", as: Tag = "span", delay = 0 }) => {
  const [displayText, setDisplayText] = useState("");
  const tagRef = useRef(null);
  const frameRef = useRef(null);
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    const el = tagRef.current;
    if (!el) return;
    let mounted = true;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const scramble = () => {
      if (prefersReducedMotion) {
        setDisplayText(text);
        return;
      }

      const length = text.length;
      const duration = 800;
      const startTime = performance.now();

      const update = (currentTime) => {
        if (!mounted) return;
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

    let timerId;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimatedRef.current) {
          hasAnimatedRef.current = true;
          timerId = setTimeout(scramble, delay);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);

    return () => {
      mounted = false;
      observer.disconnect();
      clearTimeout(timerId);
      cancelAnimationFrame(frameRef.current);
    };
  }, [text, delay]);

  return (
    <Tag ref={tagRef} className={className} aria-label={text}>
      <span aria-hidden="true">{displayText || "\u00A0"}</span>
    </Tag>
  );
};

export default TextScramble;
