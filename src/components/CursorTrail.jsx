import { useEffect, useRef } from "react";

const CursorTrail = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.innerWidth < 768) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const COLORS = ["#915eff", "#00cea8", "#bf61ff"];
    const MAX_PARTICLES = 60;

    let particles = [];
    let rafId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const handleMouse = (e) => {
      // Spawn 1 particle instead of 2
      particles.push({
        x: e.clientX + (Math.random() - 0.5) * 8,
        y: e.clientY + (Math.random() - 0.5) * 8,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5 - 0.5,
        life: 1,
        size: Math.random() * 2.5 + 0.5,
        color: COLORS[(Math.random() * 3) | 0],
      });

      // Trim from front — avoids creating new array
      if (particles.length > MAX_PARTICLES) {
        particles.splice(0, particles.length - MAX_PARTICLES);
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let writeIdx = 0;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.025;
        p.size *= 0.98;

        if (p.life <= 0) continue;

        ctx.globalAlpha = p.life * 0.6;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        particles[writeIdx++] = p;
      }
      particles.length = writeIdx;
      ctx.globalAlpha = 1;

      rafId = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", handleMouse, { passive: true });
    rafId = requestAnimationFrame(animate);

    // Pause when tab is hidden to save CPU/battery
    const handleVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(rafId);
        rafId = null;
      } else if (!rafId) {
        rafId = requestAnimationFrame(animate);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouse);
      if (rafId) cancelAnimationFrame(rafId);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[2] pointer-events-none hidden md:block"
      aria-hidden="true"
    />
  );
};

export default CursorTrail;
