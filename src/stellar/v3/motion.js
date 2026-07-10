/*
 * Stellar v3 — motion foundation (used from Phase 3 onward).
 *
 * - shouldAnimate(): reduced-motion + low-end gate (motion-foundations rule).
 * - bindLenisToGsap(): the single-rAF loop that unifies Lenis smooth-scroll with
 *   GSAP's ticker and keeps ScrollTrigger in sync (no dual rAF, no scroll lag).
 * - magnetic(): the premium magnetic-button micro-interaction via gsap.quickTo.
 *
 * All guard `window`/`navigator` for SSR safety.
 */
import gsap from "gsap";

export const prefersReduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const isLowEnd = () =>
  typeof navigator !== "undefined" && navigator.hardwareConcurrency <= 4;

export const shouldAnimate = ({ essential = false } = {}) => {
  if (prefersReduced()) return false;
  if (!essential && isLowEnd()) return false;
  return true;
};

/*
 * Magnetic hover: the element eases toward the pointer offset from its centre
 * and springs back on leave. `strength` 0..1 (fraction of the offset applied).
 * Inner layers can be passed a smaller strength for parallax depth. No-op under
 * reduced motion. Returns a cleanup fn.
 */
export const magnetic = (el, { strength = 0.35, ease = "power3.out" } = {}) => {
  if (!el || !shouldAnimate()) return () => {};
  const xTo = gsap.quickTo(el, "x", { duration: 0.5, ease });
  const yTo = gsap.quickTo(el, "y", { duration: 0.5, ease });
  const move = (e) => {
    const r = el.getBoundingClientRect();
    xTo((e.clientX - (r.left + r.width / 2)) * strength);
    yTo((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const leave = () => { xTo(0); yTo(0); };
  el.addEventListener("pointermove", move);
  el.addEventListener("pointerleave", leave);
  return () => {
    el.removeEventListener("pointermove", move);
    el.removeEventListener("pointerleave", leave);
  };
};
