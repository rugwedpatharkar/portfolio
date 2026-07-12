import { useCallback, useRef } from "react";

/*
 * Standardised keyboard navigation for master-list sections (§4.6 + §10.8).
 *
 * Every section's dossier used to inline its own onKeyDown block, and the
 * conventions had drifted:
 *   · Skills / Experience    — ↑↓+jk, clamped
 *   · Education / Notes / WhatSetsMeApart — ↑↓+jk, wrapping
 *   · Projects / Achievements — ←→+hl, wrapping
 *
 * §10.6 + §10.7: also owns the ARIA roving tabIndex pattern. Only the ACTIVE
 * item has tabIndex=0; the others have -1. Arrow navigation moves focus to
 * the newly-active item on the next frame (after React commits the tabIndex
 * change). This is what makes a tablist keyboard-usable — without it, Tab
 * lands on every item individually (10+ presses to leave the list) and
 * `all: unset` on the buttons hides the browser's default focus outline.
 *
 * The v3-glass focus ring lives in V3Style — `:focus-visible` on the two
 * card classes draws a 2px accent outline so keyboard users can see the
 * active item without breaking mouse-only styling.
 *
 * Usage:
 *   const { onKeyDown, itemProps } = useMasterListKeys(active, setActive, list.length);
 *   // or with options:
 *   const { onKeyDown, itemProps } = useMasterListKeys(active, setActive, list.length, { axis: "x", wrap: false });
 *   ...
 *   <div onKeyDown={onKeyDown}>
 *     {list.map((item, i) => (
 *       <button {...itemProps(i)} onClick={() => setActive(i)}>...</button>
 *     ))}
 *   </div>
 *
 * @param {number}   current   the currently-active index
 * @param {Function} setter    setter that accepts the new numeric index — works
 *                             with useState's `setX(n)` or a custom `goto(n)`
 * @param {number}   length    total item count
 * @param {Object}   [opts]
 * @param {"y"|"x"}  [opts.axis="y"]   "y" = ↑↓+jk; "x" = ←→+hl
 * @param {boolean}  [opts.wrap=true]  wrap around at either end
 * @returns {{ onKeyDown, itemProps }} onKeyDown handler + per-index prop spread
 */
export function useMasterListKeys(current, setter, length, opts = {}) {
  const { axis = "y", wrap = true } = opts;
  const refs = useRef([]);

  const setActive = useCallback((i) => {
    setter(i);
    /* Focus the newly-active item on the next frame — after React commits the
       roving tabIndex change, so the button is tabIndex=0 by the time it
       receives focus. rAF is the smallest reliable "post-commit" hook without
       pulling in useLayoutEffect gymnastics. */
    requestAnimationFrame(() => refs.current[i]?.focus?.());
  }, [setter]);

  const onKeyDown = useCallback(
    (e) => {
      const key = e.key.toLowerCase();
      const isNext = axis === "y"
        ? key === "arrowdown" || key === "j"
        : key === "arrowright" || key === "l";
      const isPrev = axis === "y"
        ? key === "arrowup" || key === "k"
        : key === "arrowleft" || key === "h";
      if (!isNext && !isPrev) return;
      if (length <= 0) return;
      e.preventDefault();
      const delta = isNext ? 1 : -1;
      const next = wrap
        ? (((current + delta) % length) + length) % length
        : Math.max(0, Math.min(length - 1, current + delta));
      setActive(next);
    },
    [current, setActive, length, axis, wrap]
  );

  const itemProps = useCallback(
    (i) => ({
      ref: (el) => { refs.current[i] = el; },
      tabIndex: i === current ? 0 : -1,
    }),
    [current]
  );

  return { onKeyDown, itemProps };
}
