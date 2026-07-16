/*
 * V3TheEdgeQuote — a single elegant quote overlaid on the final black-hole
 * stop (The Edge). No résumé card, no info dossier — just the visual
 * black hole and a single line of copy that closes the tour with a beat.
 *
 * Mounts only when the visitor is at destination index 13 (The Edge).
 * Fades in smoothly on arrival, out on departure.
 */
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

export default function V3TheEdgeQuote({ activeIdx }) {
  const reduce = useReducedMotion();
  /* Small mount delay so the black hole visual establishes first, then the
     quote drifts in — cleaner than a hard punch-in on arrival. */
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (activeIdx === 13) {
      const id = setTimeout(() => setVisible(true), reduce ? 0 : 900);
      return () => clearTimeout(id);
    }
    setVisible(false);
    return undefined;
  }, [activeIdx, reduce]);

  return (
    <motion.div
      aria-hidden={!visible}
      initial={{ opacity: 0 }}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: reduce ? 0 : 1.4, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 45,
        display: "grid",
        placeItems: "end center",
        padding: "0 clamp(24px, 4vw, 88px) clamp(64px, 10vh, 128px)",
      }}
    >
      <div
        style={{
          maxWidth: 780,
          textAlign: "center",
          color: "rgba(255, 235, 200, 0.94)",
          textShadow: "0 0 24px rgba(0, 0, 0, 0.85)",
        }}
      >
        <div
          style={{
            fontFamily: 'Fraunces, "Times New Roman", serif',
            fontStyle: "italic",
            fontWeight: 300,
            fontSize: "clamp(20px, 2.4vw, 34px)",
            lineHeight: 1.35,
            letterSpacing: "-0.005em",
          }}
        >
          &ldquo;Look again at that dot. That&rsquo;s here. That&rsquo;s home. That&rsquo;s us.&rdquo;
        </div>
        <div
          style={{
            marginTop: "clamp(14px, 1.4vw, 22px)",
            fontFamily: "'Space Mono', monospace",
            fontSize: "clamp(10px, 0.85vw, 12px)",
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "rgba(255, 220, 168, 0.6)",
          }}
        >
          Carl Sagan · Pale Blue Dot · 1994
        </div>
      </div>
    </motion.div>
  );
}
