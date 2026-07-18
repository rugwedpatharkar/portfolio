/*
 * V3SaganQuote — a whisper-quiet rotating quote at the bottom-right of the
 * viewport. Rotates through a small set of cosmos/science quotes, one every
 * ~24s. Fraunces-italic-like (Space Grotesk italic here) + tiny mono attribution.
 * Hidden on compact viewports, during the fly-through, and on the finale stop
 * (V3TheEdgeQuote already fills that space). Frozen under reduced-motion.
 */
import { memo, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import useViewport from "../useViewport";

const QUOTES = [
  { text: "Somewhere, something incredible is waiting to be known.", by: "Carl Sagan" },
  { text: "The cosmos is within us. We are made of star-stuff.", by: "Carl Sagan" },
  { text: "For small creatures such as we the vastness is bearable only through love.", by: "Carl Sagan" },
  { text: "Imagination will often carry us to worlds that never were, but without it we go nowhere.", by: "Carl Sagan" },
  { text: "Look again at that dot. That's here. That's home. That's us.", by: "Carl Sagan" },
  { text: "The universe is not obligated to make sense to you.", by: "Neil deGrasse Tyson" },
  { text: "We are a way for the cosmos to know itself.", by: "Carl Sagan" },
];

const CINE = [0.25, 0.1, 0.25, 1];
const ROTATE_MS = 24000;
const FADE_MS = 900;

function V3SaganQuote({ hidden = false, finale = false }) {
  const { isCompact } = useViewport();
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);

  useEffect(() => {
    if (reduce) return undefined;
    const id = setInterval(() => setI((v) => (v + 1) % QUOTES.length), ROTATE_MS);
    return () => clearInterval(id);
  }, [reduce]);

  if (isCompact || finale) return null;
  const q = QUOTES[i];

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        right: "calc(34px + 60px)", // clear the right-edge V3Hud rail
        bottom: 22,
        zIndex: 43,
        pointerEvents: "none",
        maxWidth: "42ch",
        textAlign: "right",
        opacity: hidden ? 0 : 0.7,
        transition: `opacity ${FADE_MS / 1000}s ease`,
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={i}
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6 }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
          transition={{ duration: FADE_MS / 1000, ease: CINE }}
        >
          <p
            style={{
              fontFamily: "var(--v3-font-ui)",
              fontStyle: "italic",
              fontWeight: 300,
              fontSize: 12,
              lineHeight: 1.4,
              letterSpacing: ".01em",
              color: "var(--v3-fg-mute)",
              margin: 0,
            }}
          >
            "{q.text}"
          </p>
          <p
            style={{
              marginTop: 4,
              fontFamily: "var(--v3-font-mono)",
              fontSize: 9,
              letterSpacing: ".24em",
              textTransform: "uppercase",
              color: "var(--v3-accent)",
            }}
          >
            — {q.by}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default memo(V3SaganQuote);
