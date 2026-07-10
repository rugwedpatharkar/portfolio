/*
 * V3Ticker — count-up number on scroll-into-view (IntersectionObserver, first-view
 * only). Used inside V3Channel for numerics. Reduced-motion → jumps to final.
 *
 * Handles floats (99.9), suffixes (%, +, ×), and plain integers.
 */
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

export default function V3Ticker({ value, suffix = "", duration = 900, decimals }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const [n, setN] = useState(reduce ? Number(value) : 0);

  const target = Number(value);
  const dp = decimals ?? (Number.isInteger(target) ? 0 : 1);
  const fmt = (x) => x.toFixed(dp);

  useEffect(() => {
    if (reduce || !Number.isFinite(target)) { setN(target); return undefined; }
    let raf = 0;
    let cancelled = false;
    const el = ref.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting || cancelled) return;
          io.disconnect();
          const t0 = performance.now();
          const step = (t) => {
            if (cancelled) return;
            const p = Math.min(1, (t - t0) / duration);
            const eased = 1 - Math.pow(1 - p, 3);
            setN(target * eased);
            if (p < 1) raf = requestAnimationFrame(step);
            else setN(target);
          };
          raf = requestAnimationFrame(step);
        });
      },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => { cancelled = true; io.disconnect(); cancelAnimationFrame(raf); };
  }, [target, duration, reduce]);

  return (
    <span ref={ref}>{fmt(n)}{suffix}</span>
  );
}
