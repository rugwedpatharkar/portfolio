 
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
 *    real per-frame time (EMA) and, only if it stays genuinely bad for a
 *    sustained window, step DOWN: floor the DPR, switch off shadows, and
 *    tell the parent to drop the (expensive) Depth-of-Field pass.
 *
 *    Two fixes for a "quality stuck low forever" bug:
 *    a) GRACE — never degrade during the first ~8s. The intro warp + the
 *       one-time texture decode spike frame time well past the trigger; the
 *       old code dropped to potato there and then couldn't climb back out.
 *    b) Forgiving, near-symmetric restore — the old band (drop >40ms/1.5s,
 *       restore <28ms/5s) left a huge 25–36fps DEAD ZONE: a machine settling
 *       anywhere in it could never restore. Now drop and restore sit close
 *       together, and restore is quick, so a decent machine always recovers.
 */

/* Wide dead-zone so a machine never oscillates: shed the heavy layers only once
   frames genuinely dip (<~43fps sustained), and don't restore until there's real
   headroom (>~58fps sustained). Capable GPUs that hold 45-60fps keep FULL density;
   only struggling hardware sheds — and once shed, it stays shed while the heavy
   scene is up (shedding gains < the 15fps gap, so it can't bounce back and forth). */
const LOW_MS = 23;  // ~43fps — shed heavy layers below this (sustained)
const HIGH_MS = 17; // ~59fps — only restore with genuine headroom
const DROP_AFTER = 2500;
const RESTORE_AFTER = 2200;
const GRACE = 8000; // ms after mount during which we never degrade

const AdaptiveQuality = ({ scrollTRef, highDpr = 1.75, lowDpr = 1.0, onPerf }) => {
  const { gl } = useThree();
  const ema = useRef(16.7);
  const lastT = useRef(0);
  const idleAt = useRef(0);
  const dprState = useRef("high");
  const tier = useRef("high");
  const badSince = useRef(0);
  const goodSince = useRef(0);
  const startAt = useRef(0);

  const setDpr = (mode) => {
    if (dprState.current === mode) return;
    const cap = mode === "low" ? lowDpr : highDpr;
    gl.setPixelRatio(Math.min(window.devicePixelRatio || 1, cap));
    dprState.current = mode;
  };

  useFrame((_, dt) => {
    const now = performance.now();
    if (!startAt.current) startAt.current = now;
    const ms = Math.min((dt || 1 / 60) * 1000, 100);
    ema.current = ema.current * 0.9 + ms * 0.1;

    /* scroll velocity */
    const t = scrollTRef.current ?? 0;
    const vel = Math.abs(t - lastT.current);
    lastT.current = t;
    const scrolling = vel > 0.0008;
    if (scrolling) idleAt.current = now;

    /* Potato-tier hysteresis — skipped entirely during the grace window so
       the intro + texture-decode spike never drops us into potato. */
    if (now - startAt.current > GRACE) {
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
        /* In the (now narrow) dead zone, hold the timers rather than reset —
           a brief excursion shouldn't erase progress toward a restore. */
        badSince.current = 0;
      }
    }

    /* DPR: low while scrolling or in potato tier; else restore after idle */
    if (scrolling || tier.current === "low") setDpr("low");
    else if (now - idleAt.current > 280) setDpr("high");
  });

  return null;
};

export default AdaptiveQuality;
