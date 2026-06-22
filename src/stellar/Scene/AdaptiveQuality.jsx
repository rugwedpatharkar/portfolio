/* eslint-disable react/prop-types */
import { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";

/*
 * Drops renderer DPR while the user is actively scrolling, restores
 * after idle. Keeps the perceived frame rate smooth during fast
 * scrolls without hurting still-frame quality.
 *
 * Scroll velocity is sampled from the scrollT ref; once the per-frame
 * delta is below a threshold for ~250 ms, we restore.
 */

const AdaptiveQuality = ({ scrollTRef, highDpr = 1.75, lowDpr = 1.0 }) => {
  const { gl } = useThree();
  const lastT = useRef(0);
  const lastChangeAt = useRef(0);
  const stateRef = useRef("high");

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const t = scrollTRef.current ?? 0;
      const dt = Math.abs(t - lastT.current);
      lastT.current = t;
      const now = performance.now();

      const SHOULD_DROP = dt > 0.0008;
      const HOLD = 280;

      if (SHOULD_DROP) {
        if (stateRef.current !== "low") {
          gl.setPixelRatio(Math.min(window.devicePixelRatio || 1, lowDpr));
          stateRef.current = "low";
        }
        lastChangeAt.current = now;
      } else if (stateRef.current === "low" && now - lastChangeAt.current > HOLD) {
        gl.setPixelRatio(Math.min(window.devicePixelRatio || 1, highDpr));
        stateRef.current = "high";
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [gl, scrollTRef, highDpr, lowDpr]);

  return null;
};

export default AdaptiveQuality;
