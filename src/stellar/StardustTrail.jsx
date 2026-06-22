/* eslint-disable react/prop-types */
import { useEffect, useRef } from "react";

/*
 * Stardust mouse trail — small bright dots emitted on pointer movement
 * that fade out over ~700 ms. Drawn on a fixed 2D canvas overlay so
 * it doesn't touch the WebGL pipeline.
 *
 * Cap at MAX_DUST particles to keep CPU cost trivial. Skipped on
 * touch / reduced-motion.
 */

const MAX_DUST = 48;

const StardustTrail = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const touch = window.matchMedia("(pointer: coarse)").matches;
    if (reduced || touch) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    /* DPR capped at 1.25 (was 2): this is a full-screen mix-blend-screen
       overlay, so every device pixel is re-composited each frame — halving
       the pixel count roughly halves that cost and kills the trail lag. */
    const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
    let w, h;
    const setSize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    setSize();
    window.addEventListener("resize", setSize);

    const particles = [];
    let lastX = -999;
    let lastY = -999;

    const onMove = (e) => {
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      const dist = Math.hypot(dx, dy);
      if (dist < 4) return;
      const steps = Math.min(4, Math.ceil(dist / 12));
      for (let i = 0; i < steps; i++) {
        if (particles.length >= MAX_DUST) particles.shift();
        const t = i / steps;
        particles.push({
          x: lastX + dx * t + (Math.random() - 0.5) * 3,
          y: lastY + dy * t + (Math.random() - 0.5) * 3,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35 - 0.15,
          life: 1,
          hue: 30 + Math.random() * 50,
        });
      }
      lastX = e.clientX;
      lastY = e.clientY;
    };
    window.addEventListener("mousemove", onMove);

    let raf = 0;
    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02;
        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }
        const alpha = p.life * p.life;
        ctx.fillStyle = `hsla(${p.hue}, 100%, 88%, ${alpha * 0.85})`;
        const r = 1.5 + p.life * 1.1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", setSize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 9997,
        mixBlendMode: "screen",
      }}
    />
  );
};

export default StardustTrail;
