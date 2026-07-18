/* eslint-disable react/no-unknown-property */
/*
 * TIME-DILATION HUD — a small annotation overlay that appears at The Edge
 * (stop 13, the black hole). Shows the general-relativistic time-dilation
 * factor near the event horizon: dilated seconds "here" versus proper
 * seconds "far away," per the Schwarzschild metric
 *
 *   dτ / dt = √(1 − r_s / r)
 *
 * For a viewer at 3 r_s (the ISCO): dτ/dt ≈ 0.816 — one second here is
 * ~1.22 s outside. At 1.05 r_s (just above the horizon): dτ/dt ≈ 0.218 —
 * one second here is ~4.6 s outside. At 1.005 r_s (very close): ~14×.
 *
 * The HUD is informational (not a live camera-tracked factor) — it
 * captions the phenomenon rather than computing it in real time.
 *
 * Sources: docs/research/09-black-holes-and-wormholes.md §2.3
 * (Schwarzschild time dilation).
 */
import { Html } from "@react-three/drei";

const TimeDilationHUD = ({ position = [0, 0, 0] }) => (
  <Html
    center
    position={[position[0], position[1] + 60, position[2]]}
    style={{
      pointerEvents: "none",
      fontFamily: "'Space Mono', monospace",
      fontSize: 10,
      letterSpacing: "0.18em",
      color: "rgba(220, 232, 248, 0.65)",
      textTransform: "uppercase",
      textShadow: "0 0 8px rgba(0,0,0,0.85)",
      whiteSpace: "nowrap",
      textAlign: "center",
    }}
  >
    <div>Time Dilation Zone</div>
    <div style={{ opacity: 0.55, fontSize: 9, marginTop: 3 }}>
      dτ/dt = √(1 − r_s/r) · at 1.05 r_s, 1 s here ≈ 4.6 s outside
    </div>
  </Html>
);

export default TimeDilationHUD;
