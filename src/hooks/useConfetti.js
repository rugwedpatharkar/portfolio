import { useCallback, useRef } from "react";

const COLORS = ["#915eff", "#00cea8", "#61dafb", "#ffffff", "#f8c555", "#ff6b6b", "#a78bfa"];

export default function useConfetti() {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  const burst = useCallback((originEl) => {
    // Lazy-create canvas once
    let canvas = canvasRef.current;
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.style.cssText =
        "position:fixed;inset:0;pointer-events:none;z-index:9999;width:100%;height:100%";
      canvas.setAttribute("aria-hidden", "true");
      document.body.appendChild(canvas);
      canvasRef.current = canvas;
    }

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const rect = originEl?.getBoundingClientRect?.();
    const ox = rect ? rect.left + rect.width / 2 : canvas.width / 2;
    const oy = rect ? rect.top + rect.height / 2 : canvas.height / 2;

    const particles = Array.from({ length: 90 }, () => ({
      x: ox,
      y: oy,
      vx: (Math.random() - 0.5) * 16,
      vy: -Math.random() * 14 - 4,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: 4 + Math.random() * 7,
      alpha: 1,
      gravity: 0.38 + Math.random() * 0.2,
      shape: Math.random() > 0.4 ? "rect" : "circle",
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.18,
    }));

    const ctx = canvas.getContext("2d");
    cancelAnimationFrame(animRef.current);

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let anyAlive = false;

      for (const p of particles) {
        if (p.alpha <= 0) continue;
        anyAlive = true;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= 0.985;
        p.alpha -= 0.013;
        p.rotation += p.rotSpeed;

        ctx.save();
        ctx.globalAlpha = Math.max(p.alpha, 0);
        ctx.fillStyle = p.color;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        if (p.shape === "circle") {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        }
        ctx.restore();
      }

      if (anyAlive) {
        animRef.current = requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    animRef.current = requestAnimationFrame(tick);
  }, []);

  return burst;
}
