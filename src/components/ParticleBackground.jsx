import { useEffect, useRef } from "react";

const ParticleBackground = () => {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const animRef = useRef(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let width = (canvas.width = canvas.parentElement.offsetWidth);
    let height = (canvas.height = canvas.parentElement.offsetHeight);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.scale(dpr, dpr);

    const PARTICLE_COUNT = Math.min(40, Math.floor((width * height) / 22000));
    const CONNECTION_DIST = 140;
    const CONNECTION_DIST_SQ = CONNECTION_DIST * CONNECTION_DIST;
    const MOUSE_ATTRACT_DIST = 250;
    const MOUSE_ATTRACT_DIST_SQ = MOUSE_ATTRACT_DIST * MOUSE_ATTRACT_DIST;

    let particles = [];

    const createParticles = () => {
      particles = [];
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          radius: Math.random() * 2 + 0.8,
          baseRadius: Math.random() * 2 + 0.8,
        });
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      const mouse = mouseRef.current;
      const hasMouse = mouse.x > -500;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Mouse attraction — gentle pull toward cursor
        if (hasMouse) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < MOUSE_ATTRACT_DIST_SQ && distSq > 100) {
            const dist = Math.sqrt(distSq);
            const force = (1 - dist / MOUSE_ATTRACT_DIST) * 0.015;
            p.vx += dx / dist * force;
            p.vy += dy / dist * force;
            // Glow up near cursor
            p.radius = p.baseRadius + (1 - dist / MOUSE_ATTRACT_DIST) * 2;
          } else {
            p.radius += (p.baseRadius - p.radius) * 0.05;
          }
        }

        p.vx *= 0.985;
        p.vy *= 0.985;
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Draw particle with glow
        const glowAlpha = Math.min(1, p.radius / (p.baseRadius + 1));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(145, 94, 255, ${0.4 + glowAlpha * 0.4})`;
        ctx.fill();

        // Connections
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const cdx = p.x - p2.x;
          const cdy = p.y - p2.y;
          const cdistSq = cdx * cdx + cdy * cdy;
          if (cdistSq < CONNECTION_DIST_SQ) {
            const ratio = 1 - Math.sqrt(cdistSq) / CONNECTION_DIST;
            const alpha = ratio * 0.2;

            // Connections near mouse are brighter and teal-tinted
            let r = 145, g = 94, b = 255;
            if (hasMouse) {
              const midX = (p.x + p2.x) / 2;
              const midY = (p.y + p2.y) / 2;
              const mDistSq = (midX - mouse.x) ** 2 + (midY - mouse.y) ** 2;
              if (mDistSq < MOUSE_ATTRACT_DIST_SQ) {
                const t = 1 - Math.sqrt(mDistSq) / MOUSE_ATTRACT_DIST;
                r = Math.round(145 + (0 - 145) * t);
                g = Math.round(94 + (206 - 94) * t);
                b = Math.round(255 + (168 - 255) * t);
              }
            }

            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
            ctx.lineWidth = ratio * 1.2;
            ctx.stroke();
          }
        }
      }

      animRef.current = requestAnimationFrame(animate);
    };

    createParticles();
    animRef.current = requestAnimationFrame(animate);

    // Pause when tab is hidden to save CPU/battery
    const handleVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(animRef.current);
        animRef.current = null;
      } else if (!animRef.current) {
        animRef.current = requestAnimationFrame(animate);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    const handleResize = () => {
      width = canvas.parentElement.offsetWidth;
      height = canvas.parentElement.offsetHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.scale(dpr, dpr);
      createParticles();
    };

    let cachedRect = canvas.getBoundingClientRect();
    const updateRect = () => { cachedRect = canvas.getBoundingClientRect(); };

    const parentEl = canvas.parentElement;
    const handleMouse = (e) => {
      mouseRef.current = { x: e.clientX - cachedRect.left, y: e.clientY - cachedRect.top };
    };
    const handleMouseLeave = () => { mouseRef.current = { x: -1000, y: -1000 }; };

    let resizeTimer;
    const resizeHandler = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { handleResize(); updateRect(); }, 150);
    };
    window.addEventListener("resize", resizeHandler);
    parentEl.addEventListener("mousemove", handleMouse, { passive: true });
    parentEl.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", resizeHandler);
      parentEl.removeEventListener("mousemove", handleMouse);
      parentEl.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-[1]"
      aria-hidden="true"
      style={{ opacity: 0.8 }}
    />
  );
};

export default ParticleBackground;
