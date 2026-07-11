/*
 * §11 (ideas #11) — ambient hairline scale callouts overlaid on the hero /
 * overview stop. Just fine-print type telling the viewer where they are in
 * the physical hierarchy: this scene, this galaxy, this local group.
 *
 * Fades in on hero (activeIdx === 0), out on every planet stop. Pure DOM,
 * no per-frame cost, no canvas.
 */
import { motion, useReducedMotion } from "motion/react";

export default function V3ScaleAnnotations({ activeIdx, hidden = false }) {
  const reduce = useReducedMotion();
  const visible = activeIdx === 0 && !hidden;
  return (
    <motion.div
      aria-hidden="true"
      initial={{ opacity: 0 }}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: reduce ? 0 : 0.7, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: "fixed",
        top: "clamp(28px, 4vh, 46px)",
        right: "clamp(28px, 4vw, 60px)",
        pointerEvents: "none",
        zIndex: 45,
        fontFamily: "var(--v3-font-mono, monospace)",
        fontSize: "clamp(9px, 0.3vw + 7px, 11px)",
        letterSpacing: ".22em",
        textTransform: "uppercase",
        color: "var(--v3-fg-mute, #7c8391)",
        textAlign: "right",
        lineHeight: 1.7,
      }}
    >
      <div>
        <span style={{ color: "var(--v3-fg-dim, #b3b9c7)" }}>Milky Way ·</span> 100,000 ly across
      </div>
      <div>
        <span style={{ color: "var(--v3-fg-dim, #b3b9c7)" }}>Local Group ·</span> 54 galaxies
      </div>
      <div>
        <span style={{ color: "var(--v3-fg-dim, #b3b9c7)" }}>Sol ·</span> 26,670 ly from centre
      </div>
      <div>
        <span style={{ color: "var(--v3-fg-dim, #b3b9c7)" }}>Position ·</span> Orion Spur
      </div>
    </motion.div>
  );
}
