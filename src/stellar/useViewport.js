import { createContext, createElement, useContext, useEffect, useState } from "react";

/*
 * Single source of truth for viewport + motion preferences.
 *
 * Returns:
 *   - isMobile: width < 768px
 *   - isCompact: width < 1024px (also true on tablets)
 *   - reducedMotion: prefers-reduced-motion: reduce
 *
 * ViewportProvider mounts once at the StellarApp root, runs three matchMedia
 * subscriptions, and shares state via context. The prior implementation ran the
 * hook standalone at ~10 call sites — 30 matchMedia listeners on the same 3
 * breakpoints, each triggering its own state churn. With the provider it's 3
 * listeners total, and consumers just read context (no listener overhead).
 *
 * The hook signature (default + named export) is unchanged; call sites don't
 * need to be updated. Fallback: if no provider is mounted (e.g. a component
 * rendered outside StellarApp), the hook returns a one-shot snapshot so
 * consumers still get sensible values — they just won't react to changes.
 */

const matchOnce = (query) => {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia(query).matches;
};

const readAll = () => ({
  isMobile: matchOnce("(max-width: 767px)"),
  isCompact: matchOnce("(max-width: 1023px)"),
  reducedMotion: matchOnce("(prefers-reduced-motion: reduce)"),
});

const ViewportContext = createContext(null);

export const ViewportProvider = ({ children }) => {
  const [state, setState] = useState(readAll);

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
    /* Race safety: a media query could have flipped between the initial
       useState() and the effect running (React StrictMode or slow first paint).
       Re-read on mount so the provider matches the current window. */
    setState(readAll());
    return () => {
      handlers.forEach(({ mql, fn }) => {
        if (mql.removeEventListener) mql.removeEventListener("change", fn);
        else mql.removeListener(fn);
      });
    };
  }, []);

  return createElement(ViewportContext.Provider, { value: state }, children);
};

export const useViewport = () => {
  const ctx = useContext(ViewportContext);
  /* No provider mounted → return a one-shot snapshot. Values stay static (no
     matchMedia change subscription), which is fine for the tests / SSR-shell
     path where the provider isn't in the tree. Never null-return: every call
     site destructures the result and would crash otherwise. */
  return ctx || readAll();
};

export default useViewport;
