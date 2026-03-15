import { useEffect, useRef } from "react";

/* ── Time-based color palette ── */
const getTimeColors = () => {
  const h = new Date().getHours();
  // Dawn (5-8): warm amber + soft purple
  if (h >= 5 && h < 8) return ["200, 120, 50", "145, 94, 255", "220, 160, 80"];
  // Morning (8-12): bright teal + purple
  if (h >= 8 && h < 12) return ["145, 94, 255", "0, 206, 168", "97, 218, 251"];
  // Afternoon (12-17): warm gold + purple
  if (h >= 12 && h < 17) return ["145, 94, 255", "248, 197, 85", "191, 97, 255"];
  // Evening (17-21): deep purple + teal
  if (h >= 17 && h < 21) return ["120, 60, 220", "0, 180, 150", "160, 80, 255"];
  // Night (21-5): deep blue + subtle purple
  return ["80, 50, 180", "0, 140, 120", "100, 60, 200"];
};

const GradientMesh = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    const timeColors = getTimeColors();
    const blobs = [
      { x: width * 0.3, y: height * 0.3, radius: 300, color: timeColors[0], speedX: 0.3, speedY: 0.2 },
      { x: width * 0.7, y: height * 0.6, radius: 250, color: timeColors[1], speedX: -0.2, speedY: 0.3 },
      { x: width * 0.5, y: height * 0.8, radius: 280, color: timeColors[2], speedX: 0.25, speedY: -0.15 },
    ];

    let time = 0;
    let lastTime = 0;
    let rafId;

    const animate = (timestamp) => {
      rafId = requestAnimationFrame(animate);

      // Throttle to ~30fps — smooth gradient doesn't need 60fps
      if (timestamp - lastTime < 33) return;
      lastTime = timestamp;

      time += 0.005;
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < blobs.length; i++) {
        const blob = blobs[i];
        const bx = blob.x + Math.sin(time * blob.speedX * 3) * 100;
        const by = blob.y + Math.cos(time * blob.speedY * 3) * 80;

        const gradient = ctx.createRadialGradient(bx, by, 0, bx, by, blob.radius);
        gradient.addColorStop(0, `rgba(${blob.color}, 0.08)`);
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.beginPath();
        ctx.arc(bx, by, blob.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }
    };

    rafId = requestAnimationFrame(animate);

    // Pause when tab is hidden to save CPU/battery
    const handleVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(rafId);
        rafId = null;
      } else if (!rafId) {
        lastTime = 0;
        rafId = requestAnimationFrame(animate);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    const handleResize = () => {
      const newDpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * newDpr;
      canvas.height = height * newDpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(newDpr, 0, 0, newDpr, 0, 0);
      blobs[0].x = width * 0.3; blobs[0].y = height * 0.3;
      blobs[1].x = width * 0.7; blobs[1].y = height * 0.6;
      blobs[2].x = width * 0.5; blobs[2].y = height * 0.8;
    };

    let resizeTimer;
    const debouncedResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(handleResize, 150);
    };
    window.addEventListener("resize", debouncedResize);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", debouncedResize);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      aria-hidden="true"
      style={{ opacity: 0.6 }}
    />
  );
};

export default GradientMesh;
