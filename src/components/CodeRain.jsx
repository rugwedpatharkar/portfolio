import { useEffect, useRef } from "react";

const CHARS = "01{}[]();=>+-*/<>!?@#$%^&|~:.";

const CodeRain = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const fontSize = 14;
    let columns = Math.floor(canvas.width / fontSize);
    let drops = Array(columns).fill(1).map(() => Math.random() * -100);

    // Pre-generate colors to avoid per-frame allocation
    const purples = Array.from({ length: 10 }, (_, i) => `rgba(145, 94, 255, ${0.06 + (i / 10) * 0.08})`);
    const greens = Array.from({ length: 10 }, (_, i) => `rgba(0, 206, 168, ${0.04 + (i / 10) * 0.06})`);

    let lastTime = 0;
    const FRAME_INTERVAL = 50; // ms between frames (~20fps for this effect)
    let rafId;

    const draw = (timestamp) => {
      rafId = requestAnimationFrame(draw);

      // Throttle to ~20fps — this effect doesn't need 60fps
      if (timestamp - lastTime < FRAME_INTERVAL) return;
      lastTime = timestamp;

      ctx.fillStyle = "rgba(5, 8, 22, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${fontSize}px "JetBrains Mono", monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = CHARS[(Math.random() * CHARS.length) | 0];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        const colorArr = Math.random() > 0.5 ? purples : greens;
        ctx.fillStyle = colorArr[(Math.random() * colorArr.length) | 0];
        ctx.fillText(char, x, y);

        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i] += 0.5;
      }
    };

    rafId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[-1] pointer-events-none"
      style={{ opacity: 0.5 }}
    />
  );
};

export default CodeRain;
