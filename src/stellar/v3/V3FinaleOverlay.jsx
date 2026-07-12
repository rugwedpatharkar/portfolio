/*
 * §12.4 — "You are here" (Orion Spur) finale overlay.
 *
 * A subtle FUI callout that appears when the finale scrub crosses into the
 * pull-back regime, points at the Sun (which the finale camera holds near the
 * centre of the frame), and reads "Orion Spur · You are here". Serves as the
 * finale payload — the moment the visitor sees themselves in the galaxy — and
 * lands next to the Contact CTA per docs/v3/PLAN.md §3.
 *
 * Pure DOM overlay (no canvas). Fixed-positioned at viewport centre with a
 * hairline stem tracking from the callout box down to the Sun's screen
 * position (approximated as viewport centre — the finale camera aims at the
 * Sun, so it stays there through the pull-back scrub).
 *
 * Reduced-motion + mobile respect their own quirks in the CSS below (no
 * transitions, shifted layout on narrow viewports).
 */
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

export default function V3FinaleOverlay({ finaleT }) {
  const reduce = useReducedMotion();
  /* Read finaleT via a lightweight rAF loop instead of subscribing per-frame
     — the overlay only crossfades based on whether finaleT crosses a threshold,
     it doesn't need every value. */
  const [t, setT] = useState(0);
  useEffect(() => {
    if (!finaleT) return undefined;
    let raf;
    const tick = () => {
      const v = finaleT.current ?? 0;
      setT((prev) => (Math.abs(prev - v) > 0.02 ? v : prev));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [finaleT]);

  /* Only appear once the reveal has completed the through-black dip and the
     Sun-among-neighbours pose is fully established (~t > 0.75). */
  const visible = t > 0.75;

  return (
    <motion.div
      aria-hidden={!visible}
      initial={{ opacity: 0 }}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: reduce ? 0 : 0.9, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 55,
        display: "grid",
        placeItems: "center",
      }}
    >
      {/* Hairline stem: a very thin gold line reaching from the label up to a
          point just above the Sun's location (viewport centre + a small
          offset). Rendered as an SVG so we get sub-pixel crispness. */}
      <svg
        aria-hidden
        width="1" height="140"
        viewBox="0 0 1 140"
        style={{
          position: "absolute",
          left: "50%",
          top: "calc(50% - 140px)",
          transform: "translateX(-50%)",
          overflow: "visible",
        }}
      >
        <line
          x1="0.5" y1="0" x2="0.5" y2="140"
          stroke="var(--v3-accent, #e9c675)"
          strokeWidth="1"
          strokeDasharray="1 3"
          opacity="0.55"
        />
      </svg>

      {/* Label — sits just above the stem, centered on the Sun. */}
      <div style={{
        position: "absolute",
        left: "50%",
        top: "calc(50% - 175px)",
        transform: "translateX(-50%)",
        fontFamily: "var(--v3-font-mono)",
        fontSize: "clamp(10px, 0.35vw + 8px, 12px)",
        letterSpacing: ".24em",
        textTransform: "uppercase",
        color: "var(--v3-fg, #f5f7fc)",
        textAlign: "center",
        whiteSpace: "nowrap",
      }}>
        <div style={{ color: "var(--v3-accent, #e9c675)" }}>Orion Spur</div>
        <div style={{ opacity: 0.7, marginTop: 4, fontSize: "0.85em" }}>You are here</div>
      </div>

      {/* Descriptor block — bottom of the frame, aligned with V3Panel content.
          Gives the moment its narrative payload. */}
      <div style={{
        position: "absolute",
        left: "50%",
        bottom: "clamp(28px, 4vh, 60px)",
        transform: "translateX(-50%)",
        maxWidth: "min(680px, 84vw)",
        textAlign: "center",
        fontFamily: "var(--v3-font-display, serif)",
        fontSize: "clamp(1.05rem, 0.7vw + 0.7rem, 1.5rem)",
        lineHeight: 1.35,
        color: "var(--v3-fg, #f5f7fc)",
      }}>
        Twenty-six thousand light-years from the galactic centre,
        halfway out on the Orion Spur.
        <div style={{
          marginTop: 12,
          fontFamily: "var(--v3-font-mono)",
          fontSize: "clamp(9px, 0.3vw + 7px, 11px)",
          letterSpacing: ".22em",
          textTransform: "uppercase",
          opacity: 0.65,
        }}>
          The tour ends here. Beam a message aboard.
        </div>
      </div>
    </motion.div>
  );
}
