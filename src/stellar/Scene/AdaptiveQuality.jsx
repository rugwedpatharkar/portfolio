/* eslint-disable react/prop-types */
import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";

/*
 * Adaptive quality guard. Two independent mechanisms:
 *
 * 1. SCROLL DPR — drop renderer DPR while actively scrolling, restore
 *    after ~280ms idle. Keeps fast scrolls fluid without hurting the
 *    still-frame. (Original behaviour, retained.)
 *
 * 2. POTATO MODE — a safety net for genuinely weak GPUs. We smooth the
 *    real per-frame time (EMA) and, only if it stays bad (< ~25fps) for a
 *    sustained window, step DOWN: floor the DPR, switch off shadows, and
 *    tell the parent to drop the (expensive) Depth-of-Field pass. We
 *    restore just as conservatively (sustained > ~35fps). Strong
 *    hysteresis + a high trigger threshold mean a healthy machine NEVER
 *    degrades — it only ever helps a struggling one. (Note: a headless /
 *    DevTools-driven Chrome is vsync-capped at 30fps ≈ 33ms, which sits
 *    BELOW the 40ms trigger, so automated screenshots don't false-trip it.)
 */

const LOW_MS = 40; // ~25fps — below this (worse) for a while → degrade
const HIGH_MS = 28; // ~36fps — above this (better) for a while → restore
const DROP_AFTER = 1500;
const RESTORE_AFTER = 5000;

const AdaptiveQuality = ({ scrollTRef, highDpr = 1.75, lowDpr = 1.0, onPerf }) => {
  const { gl } = useThree();
  const ema = useRef(16.7);
  const lastT = useRef(0);
  const idleAt = useRef(0);
  const dprState = useRef("high");
  const tier = useRef("high");
  const badSince = useRef(0);
  const goodSince = useRef(0);

  const setDpr = (mode) => {
    if (dprState.current === mode) return;
    const cap = mode === "low" ? lowDpr : highDpr;
    gl.setPixelRatio(Math.min(window.devicePixelRatio || 1, cap));
    dprState.current = mode;
  };

  useFrame((_, dt) => {
    const now = performance.now();
    const ms = Math.min((dt || 1 / 60) * 1000, 100);
    ema.current = ema.current * 0.9 + ms * 0.1;

    /* scroll velocity */
    const t = scrollTRef.current ?? 0;
    const vel = Math.abs(t - lastT.current);
    lastT.current = t;
    const scrolling = vel > 0.0008;
    if (scrolling) idleAt.current = now;

    /* potato-tier hysteresis */
    if (ema.current > LOW_MS) {
      goodSince.current = 0;
      if (!badSince.current) badSince.current = now;
      if (tier.current === "high" && now - badSince.current > DROP_AFTER) {
        tier.current = "low";
        gl.shadowMap.enabled = false;
        onPerf?.("low");
      }
    } else if (ema.current < HIGH_MS) {
      badSince.current = 0;
      if (!goodSince.current) goodSince.current = now;
      if (tier.current === "low" && now - goodSince.current > RESTORE_AFTER) {
        tier.current = "high";
        gl.shadowMap.enabled = true;
        gl.shadowMap.needsUpdate = true;
        onPerf?.("high");
      }
    } else {
      badSince.current = 0;
      goodSince.current = 0;
    }

    /* DPR: low while scrolling or in potato tier; else restore after idle */
    if (scrolling || tier.current === "low") setDpr("low");
    else if (now - idleAt.current > 280) setDpr("high");
  });

  return null;
};

export default AdaptiveQuality;
