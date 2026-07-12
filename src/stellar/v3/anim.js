/*
 * Stellar v3 — shared motion/react animation atoms.
 *
 * EASE is the single source for the [0.22,1,0.36,1] curve the whole v3 skin
 * uses (mirrors MOTION.easing.smooth / MOTION.cssSmooth in tokens.js — imported
 * here so there's one array, not 24 inline copies scattered across the
 * sections). shutterVariants() is the broadsheet "clip open" reveal shared by
 * the Projects / Notes / Achievements title rows (only the delay differs).
 */
import { MOTION } from "./tokens";

export const EASE = MOTION.easing.smooth;

/* Broadsheet shutter — the title clips open left→right on switch. Projects/Notes
   use delay 0.1; Achievements uses 0.08. */
export const shutterVariants = (delay = 0.1) => ({
  hidden: { clipPath: "inset(-0.2em 100% -0.3em 0)" },
  show: { clipPath: "inset(-0.2em 0 -0.3em 0)", transition: { duration: 0.5, ease: EASE, delay } },
});
