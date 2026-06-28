/*
 * Holo-Bridge boot-up reveal. On each arrival (the `nonce` changes), returns
 * `booting = true` for ~950ms so the panels can play their assemble-from-scanlines
 * choreography (CSS classes keyed off it), then settles to false. Instant (never
 * booting) under reduced-motion / mobile, so those paths render the final state.
 */
import { useState, useEffect, useRef } from "react";
import useViewport from "../useViewport";
import { HOLO } from "./holoTokens";

export default function useBootReveal(nonce) {
  const { reducedMotion, isMobile } = useViewport();
  const instant = reducedMotion || isMobile;
  const [booting, setBooting] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    if (instant) {
      setBooting(false);
      return undefined;
    }
    setBooting(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setBooting(false), HOLO.bootMs);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [nonce, instant]);

  return { booting, instant };
}
