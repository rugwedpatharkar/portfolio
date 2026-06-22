/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";

/*
 * Star-Trek "jump to warp" — the launch burst fired AFTER the countdown,
 * synced with the camera diving from the system establishing-shot into
 * Sol. Unlike WarpOpening (arrival → decelerating streaks), this is an
 * ACCELERATION: stars stretch from points into long streaks that rush
 * outward, a white flash at the jump, then it clears as we drop out at
 * the sun. Bigger + smoother than the opening.
 *
 * Pure canvas overlay; ~DURATION ms then onComplete. Skips on
 * reduced-motion (the parent also short-circuits the whole launch).
 */

const DURATION = 1150;

const ShipWarp = ({ onComplete }) => {
  const canvasRef = useRef(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDone(true);
      onComplete?.();
      return undefined;
    }
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w, h, cx, cy;
    const setSize = () => {
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = `${w}px`; canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx = w / 2; cy = h / 2;
    };
    setSize();
    window.addEventListener("resize", setSize);

    const R = Math.hypot(w, h);
    const stars = Array.from({ length: 260 }, () => ({
      angle: Math.random() * Math.PI * 2,
      r0: 20 + Math.random() * R * 0.5,
      v: 0.7 + Math.random() * 0.6,
      hue: 205 + Math.random() * 40,
    }));

    const start = performance.now();
    let raf = 0;
    const tick = (now) => {
      const p = Math.min(1, (now - start) / DURATION);
      const accel = p * p;                    // acceleration into warp
      const fade = p > 0.78 ? Math.max(0, 1 - (p - 0.78) / 0.22) : 1;

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = `rgba(2, 4, 12, ${0.5 * fade})`;
      ctx.fillRect(0, 0, w, h);

      ctx.lineCap = "round";
      stars.forEach((s) => {
        const r = s.r0 + accel * R * 1.6 * s.v;
        const len = 8 + accel * 520 * s.v;     // stretch points → long streaks
        const ca = Math.cos(s.angle), sa = Math.sin(s.angle);
        const x0 = cx + ca * r, y0 = cy + sa * r;
        const x1 = cx + ca * (r + len), y1 = cy + sa * (r + len);
        const g = ctx.createLinearGradient(x0, y0, x1, y1);
        g.addColorStop(0, `hsla(${s.hue}, 90%, 80%, 0)`);
        g.addColorStop(1, `hsla(${s.hue}, 95%, 88%, ${0.9 * fade})`);
        ctx.strokeStyle = g;
        ctx.lineWidth = 1.2 + accel * 1.4;
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.stroke();
      });

      /* The jump flash — a white core that blooms then collapses. */
      const flash = Math.sin(Math.min(p, 0.55) / 0.55 * Math.PI) * 0.9 * fade;
      if (flash > 0.01) {
        const fg = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * (0.18 + accel * 0.5));
        fg.addColorStop(0, `rgba(225, 240, 255, ${flash})`);
        fg.addColorStop(0.5, `rgba(150, 195, 255, ${flash * 0.4})`);
        fg.addColorStop(1, "rgba(120, 170, 255, 0)");
        ctx.fillStyle = fg;
        ctx.fillRect(0, 0, w, h);
      }

      if (p >= 1) { setDone(true); onComplete?.(); return; }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", setSize);
    };
  }, [onComplete]);

  if (done) return null;
  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ position: "fixed", inset: 0, zIndex: 245, pointerEvents: "none" }}
    />
  );
};

export default ShipWarp;
