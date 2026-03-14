import { useEffect, useRef } from "react";

const FRAMES = ["{ }", "< />", "R P", "⚡"];
const INTERVAL = 3000;

const AnimatedFavicon = () => {
  const canvas = useRef(null);
  const frameIdx = useRef(0);

  useEffect(() => {
    const c = document.createElement("canvas");
    c.width = 32;
    c.height = 32;
    canvas.current = c;

    const drawFrame = () => {
      const ctx = c.getContext("2d");
      ctx.clearRect(0, 0, 32, 32);

      // Background circle
      ctx.beginPath();
      ctx.arc(16, 16, 15, 0, Math.PI * 2);
      ctx.fillStyle = "#151030";
      ctx.fill();
      ctx.strokeStyle = "#915eff";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Text
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 10px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(FRAMES[frameIdx.current], 16, 17);

      // Update favicon
      const link = document.querySelector('link[rel="icon"]') || document.createElement("link");
      link.rel = "icon";
      link.href = c.toDataURL("image/png");
      if (!link.parentNode) document.head.appendChild(link);

      frameIdx.current = (frameIdx.current + 1) % FRAMES.length;
    };

    drawFrame();
    const interval = setInterval(drawFrame, INTERVAL);

    return () => clearInterval(interval);
  }, []);

  return null;
};

export default AnimatedFavicon;
