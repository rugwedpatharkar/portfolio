import { useEffect, useRef } from "react";

const ParticleBackground = () => {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let width = (canvas.width = canvas.parentElement.offsetWidth);
    let height = (canvas.height = canvas.parentElement.offsetHeight);
    // Fewer particles — 40 max instead of 80
    const PARTICLE_COUNT = Math.min(40, Math.floor((width * height) / 25000));
    const CONNECTION_DIST_SQ = 150 * 150; // Squared — avoid Math.sqrt
    const MOUSE_DIST_SQ = 200 * 200;

    let particles = [];

    const createParticles = () => {
      particles = [];
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          radius: Math.random() * 2 + 1,
        });
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      const mouse = mouseRef.current;

      // Batch particle fill
      ctx.fillStyle = "rgba(145, 94, 255, 0.6)";

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Mouse repulsion — squared distance, no sqrt
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const distSq = dx * dx + dy * dy;
        if (distSq < MOUSE_DIST_SQ && distSq > 0) {
          const dist = Math.sqrt(distSq); // Only sqrt when actually needed
          const force = (200 - dist) / 200;
          p.vx += (dx / dist) * force * 0.3;
          p.vy += (dy / dist) * force * 0.3;
        }

        p.vx *= 0.98;
        p.vy *= 0.98;
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        // Connections — squared distance, no sqrt, batch stroke
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const cdx = p.x - p2.x;
          const cdy = p.y - p2.y;
          const cdistSq = cdx * cdx + cdy * cdy;
          if (cdistSq < CONNECTION_DIST_SQ) {
            const alpha = 0.15 * (1 - Math.sqrt(cdistSq) / 150);
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(145, 94, 255, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animRef.current = requestAnimationFrame(animate);
    };

    createParticles();
    animate();

    const handleResize = () => {
      width = canvas.width = canvas.parentElement.offsetWidth;
      height = canvas.height = canvas.parentElement.offsetHeight;
      createParticles();
    };

    // Cache rect — only update on resize, not every mousemove
    let cachedRect = canvas.getBoundingClientRect();
    const updateRect = () => { cachedRect = canvas.getBoundingClientRect(); };

    const parentEl = canvas.parentElement;
    const handleMouse = (e) => {
      mouseRef.current = { x: e.clientX - cachedRect.left, y: e.clientY - cachedRect.top };
    };

    window.addEventListener("resize", () => { handleResize(); updateRect(); });
    parentEl.addEventListener("mousemove", handleMouse, { passive: true });
    parentEl.addEventListener("mouseleave", () => { mouseRef.current = { x: -1000, y: -1000 }; });

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-[1]"
      style={{ opacity: 0.7 }}
    />
  );
};

export default ParticleBackground;
