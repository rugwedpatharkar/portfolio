/*
 * Shared motion tokens for the DOM overlay (motion/react). One source of truth
 * for durations / easings / distances so every premium micro-interaction feels
 * consistent. Animate ONLY transform / opacity / filter. Keep staggerChildren
 * ≤ 0.1s. Pair with a global <MotionConfig reducedMotion="user"> +
 * useReducedMotion() fallbacks so motion never fights accessibility.
 */
export const motionTokens = {
  duration: { fast: 0.18, normal: 0.35, slow: 0.6 },
  easing: {
    smooth: [0.22, 1, 0.36, 1], // ease-out-expo-ish — the default premium curve
    sharp: [0.4, 0, 0.2, 1],
  },
  distance: { sm: 8, md: 16, lg: 24 },
  stagger: 0.06,
};

/* Reusable variants — `hidden`/`show`, used with whileInView or animate. */
export const fadeUp = {
  hidden: { opacity: 0, y: motionTokens.distance.md, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: motionTokens.duration.normal, ease: motionTokens.easing.smooth },
  },
};

export const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: motionTokens.stagger } },
};
