/* eslint-disable react/prop-types, react-refresh/only-export-components */
import { createContext, useContext } from "react";
import { useFrame } from "@react-three/fiber";

/*
 * Virtual scene clock — the single source of "world time" for orbital motion
 * and time-driven shaders, so a runtime speed control (pause / ×0.5 / ×1 / ×2)
 * can bend the whole system coherently.
 *
 * Why an accumulator (and NOT clock.elapsedTime * scale): multiplying raw
 * elapsed time makes every orbit + shader PHASE-JUMP the instant scale changes
 * (t doubles → planets teleport). Accumulating `delta * scale` each frame keeps
 * the timeline C0-continuous across scale changes — speed bends, phase never
 * jumps.
 *
 * `clock` is a plain shared object { t, scale, danger } created at the app level
 * (so the DOM control surface can write `scale` and read `danger`) and provided
 * here to every in-canvas consumer via context. Reduced-motion ⇒ scale
 * contributes 0 ⇒ `t` stays 0, exactly reproducing the frozen authored layout —
 * so no per-consumer reduced-motion branch is needed once a site reads `t`.
 *
 * All same-priority useFrame callbacks read the same `t` within a frame, so
 * orbit positions and the camera that tracks them stay locked at any scale.
 * (A uniform one-frame lag between this driver and its readers is irrelevant —
 * everyone lags together, so nothing drifts relative to anything else.)
 */

const SceneClockContext = createContext(null);

export const useSceneClock = () => useContext(SceneClockContext);

const SceneClock = ({ clock, reducedMotion = false, children }) => {
  useFrame((_, dt) => {
    /* Clamp the step so a backgrounded tab (huge dt on refocus) can't fling
       the system forward. */
    clock.t += Math.min(dt, 1 / 20) * (reducedMotion ? 0 : clock.scale);
  });
  return (
    <SceneClockContext.Provider value={clock}>{children}</SceneClockContext.Provider>
  );
};

export default SceneClock;
