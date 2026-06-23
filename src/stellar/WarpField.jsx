/* eslint-disable react/prop-types */
import { useEffect, useRef } from "react";

/*
 * Hyperspeed warp streaks — a persistent canvas overlay whose intensity is
 * driven by how fast we're travelling: scroll velocity during the tour, and
 * the launch sequence during the intro. Traverse between bodies (planet →
 * planet, the edge of the system → Sol, Sol → a planet) and radial
 * light-streaks rush past the camera; settle on a body and they fade out.
 *
 * Cheap: when intensity is ~0 it just clears the frame. Skips entirely on
 * reduced-motion. Sits under the content overlay so text stays readable.
 */

const STAR_COUNT = 260;

/* Push the launch warp past 1 so cur (and accel = cur²) climb higher — longer,
   denser, brighter streaks for a properly intense hyperjump. */
const introBoost = (phase) => (phase === "warp" ? 1.25 : phase === "establish" ? 0.45 : 0);

const WarpField = ({ velocityRef, launchPhase }) => {
  const canvasRef = useRef(null);
  const launchRef = useRef(launchPhase);
  launchRef.current = launchPhase;

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let w, h, cx, cy, R;
    const setSize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx = w / 2;
      cy = h / 2;
      R = Math.hypot(w, h) * 0.5;
    };
    setSize();
    window.addEventListener("resize", setSize);

    const stars = Array.from({ length: STAR_COUNT }, () => ({
      angle: Math.random() * Math.PI * 2,
      r0: 0.03 + Math.random() * 0.5, // base radius as a fraction of R
      v: 0.6 + Math.random() * 0.8,
      hue: 198 + Math.random() * 60, // blue → cyan/violet
    }));

    let cur = 0; // smoothed intensity
    let raf = 0;
    const tick = () => {
      const target = Math.max(introBoost(launchRef.current), velocityRef.current || 0);
      cur += (target - cur) * 0.14;
      /* Decay the scroll-velocity signal so streaks fade once you stop
         (Navigator re-sets it high on every scroll frame). */
      if (velocityRef.current) velocityRef.current *= 0.9;

      ctx.clearRect(0, 0, w, h);
      if (cur > 0.015) {
        ctx.lineCap = "round";
        const accel = cur * cur;
        const op = Math.min(1, 0.92 * cur);
        for (let i = 0; i < stars.length; i++) {
          const s = stars[i];
          const r = (s.r0 + accel * 0.95 * s.v) * R;
          const len = 14 + accel * 340 * s.v;
          const ca = Math.cos(s.angle);
          const sa = Math.sin(s.angle);
          const x0 = cx + ca * r;
          const y0 = cy + sa * r;
          const x1 = cx + ca * (r + len);
          const y1 = cy + sa * (r + len);
          const g = ctx.createLinearGradient(x0, y0, x1, y1);
          g.addColorStop(0, `hsla(${s.hue}, 90%, 82%, 0)`);
          g.addColorStop(0.7, `hsla(${s.hue}, 95%, 86%, ${0.5 * op})`);
          g.addColorStop(1, `hsla(${s.hue}, 100%, 95%, ${op})`);
          ctx.strokeStyle = g;
          ctx.lineWidth = 1.2 + accel * 2.3;
          ctx.beginPath();
          ctx.moveTo(x0, y0);
          ctx.lineTo(x1, y1);
          ctx.stroke();
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", setSize);
    };
  }, [velocityRef]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ position: "fixed", inset: 0, zIndex: 30, pointerEvents: "none" }}
    />
  );
};

export default WarpField;
