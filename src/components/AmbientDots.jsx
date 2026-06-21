import { useMemo } from "react";

/*
 * Pure-CSS floating ambient dots. Replaces the canvas-based
 * ParticleBackground (which ran a RAF loop + spatial grid + mouse physics
 * — ~5-10% main-thread continuously, the major contributor to scroll jank).
 *
 * Visual goal: a handful of slowly drifting purple dots adding depth to
 * the hero. No interactivity, no mouse attraction — just ambient motion.
 * Compositor-thread only; zero main-thread cost.
 */

const DOT_COUNT = 14;

const useDots = () =>
  useMemo(
    () =>
      Array.from({ length: DOT_COUNT }, (_, i) => {
        const seed = i + 11;
        const r1 = ((seed * 9301 + 49297) % 233280) / 233280;
        const r2 = ((seed * 49297 + 9301) % 233280) / 233280;
        const r3 = ((seed * 7919 + 7741) % 23328) / 23328;
        return {
          left: (r1 * 100).toFixed(2) + "%",
          top: (r2 * 100).toFixed(2) + "%",
          size: (2 + r3 * 3).toFixed(1) + "px",
          dx: (Math.round(r1 * 80) - 40) + "px",
          dy: (Math.round(r2 * 60) - 30) + "px",
          duration: (6 + r2 * 6).toFixed(2) + "s",
          delay: (r3 * 5).toFixed(2) + "s",
          color: r3 > 0.6 ? "rgba(0, 206, 168, 0.55)" : "rgba(145, 94, 255, 0.6)",
        };
      }),
    []
  );

const AmbientDots = () => {
  const dots = useDots();
  return (
    <div className="ambient-dots" aria-hidden="true">
      {dots.map((d, i) => (
        <span
          key={i}
          className="dot"
          style={{
            left: d.left,
            top: d.top,
            width: d.size,
            height: d.size,
            background: d.color,
            animationDelay: d.delay,
            animationDuration: d.duration,
            "--dx": d.dx,
            "--dy": d.dy,
          }}
        />
      ))}
    </div>
  );
};

export default AmbientDots;
