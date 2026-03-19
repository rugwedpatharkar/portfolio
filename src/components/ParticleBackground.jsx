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
    const parent = canvas.parentElement;
    if (!parent) return;
    let width = (canvas.width = parent.offsetWidth);
    let height = (canvas.height = parent.offsetHeight);
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
    const CELL_SIZE = CONNECTION_DIST;

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

    // Spatial grid for O(n) neighbor lookups instead of O(n²) — reused each frame
    const gridState = { grid: {}, cols: 1 };
    const gridKeys = [];

    const buildGrid = () => {
      // Clear previous frame's cells without re-allocating the object
      for (let ki = 0; ki < gridKeys.length; ki++) {
        delete gridState.grid[gridKeys[ki]];
      }
      gridKeys.length = 0;

      gridState.cols = Math.ceil(width / CELL_SIZE) || 1;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const key = ((p.x / CELL_SIZE) | 0) + ((p.y / CELL_SIZE) | 0) * gridState.cols;
        if (!gridState.grid[key]) {
          gridState.grid[key] = [];
          gridKeys.push(key);
        }
        gridState.grid[key].push(i);
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
        ctx.fillStyle = "rgba(145,94,255," + (0.4 + glowAlpha * 0.4) + ")";
        ctx.fill();
      }

      // Spatial-grid connections — only check neighboring cells
      buildGrid();
      const { grid, cols } = gridState;
      for (const key in grid) {
        const cell = grid[key];
        const k = +key;
        const cx = k % cols;
        const cy = (k / cols) | 0;

        // Check this cell + 4 neighbors (right, below-left, below, below-right) to avoid duplicates
        const neighborKeys = [k, k + 1, k + cols - 1, k + cols, k + cols + 1];
        for (const nk of neighborKeys) {
          const neighbor = grid[nk];
          if (!neighbor) continue;
          const sameCell = nk === k;
          for (let a = 0; a < cell.length; a++) {
            const startB = sameCell ? a + 1 : 0;
            for (let b = startB; b < neighbor.length; b++) {
              const i = cell[a];
              const j = neighbor[b];
              const p = particles[i];
              const p2 = particles[j];
              const cdx = p.x - p2.x;
              const cdy = p.y - p2.y;
              const cdistSq = cdx * cdx + cdy * cdy;
              if (cdistSq < CONNECTION_DIST_SQ) {
                const ratio = 1 - Math.sqrt(cdistSq) / CONNECTION_DIST;
                const alpha = ratio * 0.2;

                let r = 145, g = 94, bv = 255;
                if (hasMouse) {
                  const midX = (p.x + p2.x) * 0.5;
                  const midY = (p.y + p2.y) * 0.5;
                  const mDistSq = (midX - mouse.x) ** 2 + (midY - mouse.y) ** 2;
                  if (mDistSq < MOUSE_ATTRACT_DIST_SQ) {
                    const t = 1 - Math.sqrt(mDistSq) / MOUSE_ATTRACT_DIST;
                    r = (145 + (0 - 145) * t) | 0;
                    g = (94 + (206 - 94) * t) | 0;
                    bv = (255 + (168 - 255) * t) | 0;
                  }
                }

                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.strokeStyle = "rgba(" + r + "," + g + "," + bv + "," + alpha + ")";
                ctx.lineWidth = ratio * 1.2;
                ctx.stroke();
              }
            }
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
      if (!canvas.parentElement) return;
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
