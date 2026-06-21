import { useMemo } from "react";

/*
 * Pure-CSS twinkling starfield. Replaces the 945 KB three.js StarsCanvas
 * with 80 absolute-positioned dots animated via CSS @keyframes. All work
 * happens on the compositor thread — zero main-thread cost, zero RAF
 * loops, zero WebGL context.
 *
 * Visually nearly identical to a slow-drift starfield for ambient depth.
 * Respects prefers-reduced-motion (animation disabled in index.css).
 */

const STAR_COUNT = 80;

const useStars = () =>
  useMemo(() => {
    // Deterministic positions seeded from the index so SSR + first paint match.
    return Array.from({ length: STAR_COUNT }, (_, i) => {
      const seed = i + 1;
      // Cheap LCG for stable pseudo-random positions
      const r1 = ((seed * 9301 + 49297) % 233280) / 233280;
      const r2 = ((seed * 49297 + 9301) % 233280) / 233280;
      const r3 = ((seed * 7919 + 7741) % 23328) / 23328;
      return {
        left: (r1 * 100).toFixed(2) + "%",
        top: (r2 * 100).toFixed(2) + "%",
        size: 1 + Math.round(r3 * 2), // 1-3 px
        delay: (r1 * 6).toFixed(2) + "s",
        duration: (3 + r2 * 4).toFixed(2) + "s",
        opacity: (0.35 + r3 * 0.6).toFixed(2),
      };
    });
  }, []);

const StarsBackground = () => {
  const stars = useStars();
  return (
    <div className="stars-background" aria-hidden="true">
      {stars.map((s, i) => (
        <span
          key={i}
          className="star"
          style={{
            left: s.left,
            top: s.top,
            width: `${s.size}px`,
            height: `${s.size}px`,
            animationDelay: s.delay,
            animationDuration: s.duration,
            opacity: s.opacity,
          }}
        />
      ))}
    </div>
  );
};

export default StarsBackground;
