 
import { useEffect, useRef, useState } from "react";

/*
 * Cinematic hyperspace warp opening — shown over the mission countdown
 * to give the visitor "you just arrived from FTL travel" arrival drama.
 *
 * Implementation: ~160 streaking lines drawn radially outward from
 * the screen centre on a fixed canvas overlay. Each line has random
 * angle + radius + speed. After ~2.4s the streaks decelerate and fade,
 * onComplete is called.
 */

const WarpOpening = ({ onComplete }) => {
  const canvasRef = useRef(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setDone(true);
      onComplete?.();
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w, h, cx, cy;
    const setSize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.scale(dpr, dpr);
      cx = w / 2;
      cy = h / 2;
    };
    setSize();
    window.addEventListener("resize", setSize);

    const streaks = Array.from({ length: 180 }, () => ({
      angle: Math.random() * Math.PI * 2,
      r: Math.random() * 60,
      v: 6 + Math.random() * 18,
      len: 60 + Math.random() * 220,
      hue: 200 + Math.random() * 80,
    }));

    const start = performance.now();
    const DURATION = 2200;
    const FADE_OUT = 600;
    let raf = 0;

    const tick = (now) => {
      const elapsed = now - start;
      const prog = Math.min(1, elapsed / DURATION);
      const decel = 1 - Math.pow(prog, 2);
      const fadeOut = elapsed > DURATION
        ? Math.max(0, 1 - (elapsed - DURATION) / FADE_OUT)
        : 1;

      ctx.fillStyle = `rgba(3, 5, 14, ${0.32 * fadeOut})`;
      ctx.fillRect(0, 0, w, h);

      streaks.forEach((s) => {
        s.r += s.v * decel;
        const x0 = cx + Math.cos(s.angle) * s.r;
        const y0 = cy + Math.sin(s.angle) * s.r;
        const x1 = cx + Math.cos(s.angle) * (s.r + s.len * decel * 1.5);
        const y1 = cy + Math.sin(s.angle) * (s.r + s.len * decel * 1.5);
        const grd = ctx.createLinearGradient(x0, y0, x1, y1);
        grd.addColorStop(0, `hsla(${s.hue}, 80%, 75%, ${0.95 * fadeOut})`);
        grd.addColorStop(1, "rgba(255,255,255,0)");
        ctx.strokeStyle = grd;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.stroke();
      });

      if (elapsed > DURATION + FADE_OUT) {
        setDone(true);
        onComplete?.();
        return;
      }
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
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 240,
        pointerEvents: "none",
        background: "#03050d",
      }}
    />
  );
};

export default WarpOpening;
