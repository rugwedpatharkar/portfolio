/*
 * Smooth-scroll to a section id, accounting for the fixed navbar height.
 *
 * Uses the View Transitions API when available (Chrome/Edge/Safari TP) to
 * cross-fade between sections; falls back to native smooth scroll elsewhere.
 *
 * The 72px offset matches the fixed navbar height — without it `scrollIntoView`
 * lands sections under the navbar, which is the most common "looks broken"
 * complaint about anchor links.
 */

const NAV_OFFSET = 72;

const respectsReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const rawScroll = (id) => {
  const el = document.getElementById(id);
  if (!el) return false;
  const top = el.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;
  window.scrollTo({
    top: Math.max(0, top),
    behavior: respectsReducedMotion() ? "auto" : "smooth",
  });
  return true;
};

export const scrollToSection = (id) => {
  if (!id) return false;
  // View Transitions API gives us a crossfade between section ledes — graceful
  // degradation: if the browser doesn't support it, we just smooth-scroll.
  if (typeof document !== "undefined" && document.startViewTransition && !respectsReducedMotion()) {
    document.startViewTransition(() => rawScroll(id));
    return true;
  }
  return rawScroll(id);
};

export default scrollToSection;
