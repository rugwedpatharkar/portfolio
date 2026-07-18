/*
 * useTypewriter — types a string character-by-character over ~cps chars/second.
 * Instant under reduced-motion. Pass `key` to replay on section change.
 * Used for the section kickers ("WHERE I'VE WORKED", "NUMBERS I'VE MOVED", …)
 * so each section arrival feels like telemetry coming online.
 */
import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";

const CPS = 44; // characters per second

export function useTypewriter(text, replayKey = 0) {
  const reduce = useReducedMotion();
  const target = String(text || "");
  const [shown, setShown] = useState(reduce ? target : "");

  useEffect(() => {
    if (reduce) { setShown(target); return undefined; }
    setShown("");
    let raf;
    const t0 = performance.now();
    const tick = () => {
      const elapsed = performance.now() - t0;
      const chars = Math.min(target.length, Math.floor((elapsed / 1000) * CPS));
      setShown(target.slice(0, chars));
      if (chars < target.length) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, reduce, replayKey]);

  return shown;
}
