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
 * Drive Lenis from GSAP's ticker (one rAF for the whole app) and push
 * ScrollTrigger.update on every Lenis scroll. Pass the ScrollTrigger instance
 * so this module has no hard dependency on it (kept optional for Phase 0/1).
 * Returns a cleanup fn. Caller must have created Lenis with `autoRaf:false`.
 */
export const bindLenisToGsap = (lenis, ScrollTrigger) => {
  if (!lenis) return () => {};
  const onScroll = () => ScrollTrigger?.update();
  lenis.on("scroll", onScroll);
  const tick = (time) => lenis.raf(time * 1000); // gsap ticker time is in seconds
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
  return () => {
    lenis.off("scroll", onScroll);
    gsap.ticker.remove(tick);
  };
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
