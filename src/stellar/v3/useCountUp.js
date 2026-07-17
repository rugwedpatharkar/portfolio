/*
 * useCountUp — animates a numeric value from 0 → target on mount, easing
 * over ~1s. Preserves any string suffix ("31" stays "31", "96%" stays "96%",
 * "~25%" stays "~25%"), so it's a drop-in for metric values authored as strings.
 * Instant under reduced-motion. `key` = pass activeIdx/bootNonce to replay when
 * the section re-mounts.
 */
import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";

const DURATION = 900;
/* Ease-out cubic — decelerating burst, feels tactile. */
const ease = (t) => 1 - Math.pow(1 - t, 3);

/* Parse a metric string into { prefix, number, suffix }.
   "31"       → { prefix:"",  number:31,   suffix:"" }
   "96%"      → { prefix:"",  number:96,   suffix:"%" }
   "~25%"     → { prefix:"~", number:25,   suffix:"%" }
   "5+"       → { prefix:"",  number:5,    suffix:"+" }
   "99.9%"    → { prefix:"",  number:99.9, suffix:"%" }
   Non-numeric passes through untouched. */
export const parseMetric = (v) => {
  const s = String(v ?? "");
  const m = s.match(/^([^\d\-+.]*)(-?\d+(?:\.\d+)?)(.*)$/);
  if (!m) return { prefix: s, number: null, suffix: "", raw: s };
  return { prefix: m[1] || "", number: parseFloat(m[2]), suffix: m[3] || "", raw: s };
};

export function useCountUp(value, replayKey = 0) {
  const parsed = parseMetric(value);
  const reduce = useReducedMotion();
  const [n, setN] = useState(parsed.number == null || reduce ? parsed.number : 0);

  useEffect(() => {
    if (parsed.number == null) return undefined;
    if (reduce) { setN(parsed.number); return undefined; }
    let raf;
    const t0 = performance.now();
    const tick = () => {
      const p = Math.min(1, (performance.now() - t0) / DURATION);
      setN(parsed.number * ease(p));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [parsed.number, reduce, replayKey]);

  if (parsed.number == null) return parsed.raw;
  const isFloat = String(parsed.number).includes(".");
  const shown = isFloat ? n.toFixed(1) : Math.round(n);
  return `${parsed.prefix}${shown}${parsed.suffix}`;
}
