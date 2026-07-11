import { useCallback } from "react";

/*
 * Standardised keyboard navigation for master-list sections (§4.6 + §10.8).
 *
 * Every section's dossier used to inline its own onKeyDown block, and the
 * conventions had drifted:
 *   · Skills / Experience    — ↑↓+jk, clamped
 *   · Education / Notes / WhatSetsMeApart — ↑↓+jk, wrapping
 *   · Projects / Achievements — ←→+hl, wrapping
 *
 * This hook unifies the handler. The section chooses its axis + wrap policy;
 * everything else is consistent.
 *
 * Usage:
 *   const onKeyDown = useMasterListKeys(active, setActive, list.length);
 *   // or with options:
 *   const onKeyDown = useMasterListKeys(active, setActive, list.length, { axis: "x", wrap: false });
 *
 * @param {number}   current   the currently-active index
 * @param {Function} setter    setter that accepts the new numeric index — works
 *                             with useState's `setX(n)` or a custom `goto(n)`
 * @param {number}   length    total item count
 * @param {Object}   [opts]
 * @param {"y"|"x"}  [opts.axis="y"]   "y" = ↑↓+jk; "x" = ←→+hl
 * @param {boolean}  [opts.wrap=true]  wrap around at either end
 * @returns {(e: KeyboardEvent) => void}
 */
export function useMasterListKeys(current, setter, length, opts = {}) {
  const { axis = "y", wrap = true } = opts;
  return useCallback(
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
      setter(next);
    },
    [current, setter, length, axis, wrap]
  );
}
