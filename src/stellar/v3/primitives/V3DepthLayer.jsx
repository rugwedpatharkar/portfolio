"use client";
/*
 * V3DepthLayer — parallax + depth-of-field wrapper. depth ∈ {0 bg, 1 mid, 2 fg}.
 *
 * Reads the global cursor position (window.__v3Pointer, populated by V3Cursor if
 * present, else a lightweight local listener) and applies a small translate on
 * each layer. Background moves opposite to cursor (parallax further); foreground
 * moves with cursor (closer). Also applies a tiny opacity/blur cue so foreground
 * feels crisp and background feels distant. Reduced-motion → no motion.
 */
import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

const RATES = {
  0: { rate: -6, blur: 1.5, alpha: 0.9 },
  1: { rate: 0, blur: 0, alpha: 1 },
  2: { rate: 4, blur: 0, alpha: 1 },
};

/* Shared pointer tracking — first mount installs the listener; refs read from it. */
let _pointer = { x: 0, y: 0 };
let _installed = false;
const installPointer = () => {
  if (_installed || typeof window === "undefined") return;
  _installed = true;
  const on = (e) => {
    /* normalised to −1..+1 relative to viewport centre */
    _pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    _pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
  };
  window.addEventListener("pointermove", on, { passive: true });
};

export default function V3DepthLayer({ depth = 1, children, style, as = "div" }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const spec = RATES[depth] || RATES[1];

  useEffect(() => {
    if (reduce) return undefined;
    installPointer();
    let raf = 0;
    const tick = () => {
      const el = ref.current;
      if (el) {
        const tx = _pointer.x * spec.rate;
        const ty = _pointer.y * spec.rate * 0.6;
        el.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduce, spec.rate]);

  const Tag = as;
  return (
    <Tag
      ref={ref}
      style={{
        willChange: reduce ? undefined : "transform",
        opacity: spec.alpha,
        filter: reduce ? undefined : (spec.blur ? `blur(${spec.blur}px)` : undefined),
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}
