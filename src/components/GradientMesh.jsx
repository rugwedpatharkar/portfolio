import { useEffect, useRef } from "react";

const GradientMesh = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const blobs = [
      { x: width * 0.3, y: height * 0.3, radius: 300, color: "145, 94, 255", speedX: 0.3, speedY: 0.2 },
      { x: width * 0.7, y: height * 0.6, radius: 250, color: "0, 206, 168", speedX: -0.2, speedY: 0.3 },
      { x: width * 0.5, y: height * 0.8, radius: 280, color: "191, 97, 255", speedX: 0.25, speedY: -0.15 },
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

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      blobs[0].x = width * 0.3; blobs[0].y = height * 0.3;
      blobs[1].x = width * 0.7; blobs[1].y = height * 0.6;
      blobs[2].x = width * 0.5; blobs[2].y = height * 0.8;
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      style={{ opacity: 0.6 }}
    />
  );
};

export default GradientMesh;
