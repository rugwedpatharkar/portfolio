"use client";
/*
 * V3Scan — the arrival scan-reveal wrapper. Reads scan direction from V3Frame's
 * context (horizontal | radial | drill | orbit | plot | circuit) and reveals
 * children accordingly. Reduced-motion → instant fade. Stagger caps 350ms so the
 * whole frame feels landed within ~700ms.
 *
 * `variant` prop lets sections override the frame default per-child if needed.
 */
import { motion, useReducedMotion } from "motion/react";
import { useV3Scan } from "./V3Frame";

const ease = [0.22, 1, 0.36, 1];

const DIR = {
  horizontal: {
    hidden: { opacity: 0, x: -18, filter: "blur(4px)" },
    show: { opacity: 1, x: 0, filter: "blur(0px)", transition: { duration: 0.55, ease } },
  },
  radial: {
    hidden: { opacity: 0, scale: 0.96, filter: "blur(4px)" },
    show: { opacity: 1, scale: 1, filter: "blur(0px)", transition: { duration: 0.55, ease } },
  },
  drill: {
    hidden: { opacity: 0, y: -14, filter: "blur(3px)" },
    show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.5, ease } },
  },
  orbit: {
    hidden: { opacity: 0, scale: 0.94, rotate: -1 },
    show: { opacity: 1, scale: 1, rotate: 0, transition: { duration: 0.6, ease } },
  },
  plot: {
    hidden: { opacity: 0, clipPath: "inset(0 100% 0 0)" },
    show: { opacity: 1, clipPath: "inset(0 0 0 0)", transition: { duration: 0.6, ease } },
  },
  circuit: {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
  },
};

export default function V3Scan({ children, variant, delay = 0, className, style, as = "div" }) {
  const { dir, key } = useV3Scan();
  const reduce = useReducedMotion();
  const v = DIR[variant || dir] || DIR.horizontal;
  const As = motion[as] || motion.div;
  if (reduce) {
    /* Reduced-motion — no scan, just plain container. */
    return <div className={className} style={style}>{children}</div>;
  }
  return (
    <As
      key={`${key}-${variant || dir}`}
      variants={v}
      initial="hidden"
      animate="show"
      transition={{ delay }}
      className={className}
      style={style}
    >
      {children}
    </As>
  );
}
