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

const STAR_COUNT = 540;

/* Push the launch warp past 1 so cur (and accel = cur²) climb higher — longer,
   denser, brighter streaks for a properly intense hyperjump. */
const introBoost = (phase) => (phase === "warp" ? 1.35 : phase === "establish" ? 0.5 : 0);

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
      r0: 0.015 + Math.random() * 0.52, // base radius as a fraction of R (some start near centre)
      v: 0.55 + Math.random() * 0.95,
      hue: 196 + Math.random() * 64, // blue → cyan/violet
    }));

    let cur = 0; // smoothed intensity
    let raf = 0;
    const tick = () => {
      const target = Math.max(introBoost(launchRef.current), velocityRef.current || 0);
      /* Asymmetric ease: PUNCH into the jump fast (attack) and ease out of it
         slowly (decay) — the cinematic "snap to lightspeed, then glide down". */
      cur += (target - cur) * (target > cur ? 0.3 : 0.075);
      /* Decay the scroll-velocity signal so streaks fade once you stop
         (Navigator re-sets it high on every scroll frame). */
      if (velocityRef.current) velocityRef.current *= 0.9;

      ctx.clearRect(0, 0, w, h);
      if (cur > 0.012) {
        /* Additive accumulation — overlapping streaks + the core flash build to
           a bright, blooming "tunnel" instead of flat lines. */
        ctx.globalCompositeOperation = "lighter";
        ctx.lineCap = "round";
        const accel = cur * cur;
        const op = Math.min(1, 1.05 * cur);

        /* Hot central flash — the light at the end of the tunnel blooms open as
           you accelerate, then collapses as you settle. */
        if (cur > 0.3) {
          const flash = (cur - 0.3) / 0.7;
          const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.55);
          cg.addColorStop(0, `hsla(202, 100%, 97%, ${0.28 * flash})`);
          cg.addColorStop(0.4, `hsla(208, 100%, 90%, ${0.1 * flash})`);
          cg.addColorStop(1, "hsla(216, 100%, 82%, 0)");
          ctx.fillStyle = cg;
          ctx.fillRect(0, 0, w, h);
        }

        for (let i = 0; i < stars.length; i++) {
          const s = stars[i];
          const r = (s.r0 + accel * 1.5 * s.v) * R;
          const len = 22 + accel * 760 * s.v; // streaks stretch hard at speed
          const ca = Math.cos(s.angle);
          const sa = Math.sin(s.angle);
          const x0 = cx + ca * r;
          const y0 = cy + sa * r;
          const x1 = cx + ca * (r + len);
          const y1 = cy + sa * (r + len);
          const g = ctx.createLinearGradient(x0, y0, x1, y1);
          g.addColorStop(0, `hsla(${s.hue}, 90%, 82%, 0)`);
          g.addColorStop(0.55, `hsla(${s.hue}, 96%, 85%, ${0.42 * op})`);
          g.addColorStop(0.9, `hsla(${s.hue}, 100%, 93%, ${op})`);
          g.addColorStop(1, `hsla(${s.hue}, 100%, 99%, ${op})`); // hot near-white leading tip
          ctx.strokeStyle = g;
          ctx.lineWidth = 1.0 + accel * 3.6;
          ctx.beginPath();
          ctx.moveTo(x0, y0);
          ctx.lineTo(x1, y1);
          ctx.stroke();
        }
        ctx.globalCompositeOperation = "source-over";
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
