import { useEffect, useState } from "react";

/*
 * Single hook for viewport + motion preferences.
 *
 * Returns:
 *   - isMobile: width < 768px
 *   - isCompact: width < 1024px (also true on tablets)
 *   - reducedMotion: prefers-reduced-motion: reduce
 *
 * We listen to media query changes so a flipped orientation updates
 * derived counts (asteroid density etc.) without a full reload.
 */

const matchOnce = (query) => {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia(query).matches;
};

export const useViewport = () => {
  const [state, setState] = useState(() => ({
    isMobile: matchOnce("(max-width: 767px)"),
    isCompact: matchOnce("(max-width: 1023px)"),
    reducedMotion: matchOnce("(prefers-reduced-motion: reduce)"),
  }));

  useEffect(() => {
    const queries = [
      ["(max-width: 767px)", "isMobile"],
      ["(max-width: 1023px)", "isCompact"],
      ["(prefers-reduced-motion: reduce)", "reducedMotion"],
    ];
    const handlers = queries.map(([q, key]) => {
      const mql = window.matchMedia(q);
      const fn = (e) => setState((s) => ({ ...s, [key]: e.matches }));
      if (mql.addEventListener) mql.addEventListener("change", fn);
      else mql.addListener(fn);
      return { mql, fn };
    });
    return () => {
      handlers.forEach(({ mql, fn }) => {
        if (mql.removeEventListener) mql.removeEventListener("change", fn);
        else mql.removeListener(fn);
      });
    };
  }, []);

  return state;
};

export default useViewport;
