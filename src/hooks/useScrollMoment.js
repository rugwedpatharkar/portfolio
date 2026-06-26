import { useRef } from "react";
import { useScroll, useTransform, useReducedMotion } from "motion/react";

/*
 * Scroll-driven choreography helper.
 *
 * Returns a ref to attach to a target element plus a `scrub(from, to)` helper
 * that maps the element's scroll progress 0 → 1 to any numeric range.
 *
 * Used for the portfolio's three signature scroll moments:
 *   1. Hero photo depth parallax (Hero index.jsx — already inline)
 *   2. Notes index markers scrub up as you read down
 *   3. Contact CTA "breathe" — scales gently in/out as it enters the viewport
 *
 * Respects prefers-reduced-motion: scrub returns a constant value (the
 * midpoint) when the user has opted out of motion.
 */
export const useScrollMoment = (offsets = ["start end", "end start"]) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: offsets });
  const reduced = useReducedMotion();

  /* `scrub` is a render-time motion-value factory (Framer Motion pattern):
     callers invoke it at the top level of their render, the same number of
     times each render, so the hook order is stable despite the non-`use` name. */
  const scrub = (from, to) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useTransform(scrollYProgress, [0, 1], reduced ? [(from + to) / 2, (from + to) / 2] : [from, to]);

  return { ref, scrollYProgress, scrub, reduced };
};

export default useScrollMoment;
