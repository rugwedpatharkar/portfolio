import { useEffect, useRef } from "react";

/* ── Section-based color palettes (hex) ── */
const SECTION_PALETTES = {
  default: ["#915eff", "#00cea8", "#bf61ff"],
  about: ["#915eff", "#a78bfa", "#bf61ff"],
  experience: ["#f8c555", "#915eff", "#ff8a50"],
  skills: ["#00cea8", "#61dafb", "#00ff88"],
  projects: ["#61dafb", "#915eff", "#00cea8"],
  education: ["#00cea8", "#bf61ff", "#a78bfa"],
  achievements: ["#f8c555", "#ff6b6b", "#ffa726"],
  testimonials: ["#915eff", "#bf61ff", "#a78bfa"],
  contact: ["#915eff", "#00cea8", "#61dafb"],
};

/* ── Color helpers ── */
const hexToRgb = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

const lerpColor = (current, target, t) =>
  current.map((c, i) => c + (target[i] - c) * t);

const rgbToColorString = (rgb) =>
  `${Math.round(rgb[0])}, ${Math.round(rgb[1])}, ${Math.round(rgb[2])}`;

const SECTION_IDS = [
  "about",
  "experience",
  "skills",
  "projects",
  "education",
  "achievements",
  "testimonials",
  "contact",
];

const GradientMesh = () => {
  const canvasRef = useRef(null);
  const activeSectionRef = useRef("default");
  // Current interpolated RGB values for each of the 3 blobs
  const currentColorsRef = useRef(
    SECTION_PALETTES.default.map(hexToRgb)
  );

  // IntersectionObserver to track the active section
  useEffect(() => {
    const observers = [];

    // Small delay so lazy-loaded sections are in the DOM
    const timer = setTimeout(() => {
      SECTION_IDS.forEach((id) => {
        const anchor = document.getElementById(id);
        // The section element is the parent of the anchor span
        const sectionEl = anchor?.closest("section");
        if (!sectionEl) return;

        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                activeSectionRef.current = id;
              }
            });
          },
          { threshold: 0.3 }
        );

        observer.observe(sectionEl);
        observers.push(observer);
      });
    }, 1000);

    return () => {
      clearTimeout(timer);
      observers.forEach((o) => o.disconnect());
    };
  }, []);

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

    const blobs = [
      { x: width * 0.3, y: height * 0.3, radius: 300, speedX: 0.3, speedY: 0.2 },
      { x: width * 0.7, y: height * 0.6, radius: 250, speedX: -0.2, speedY: 0.3 },
      { x: width * 0.5, y: height * 0.8, radius: 280, speedX: 0.25, speedY: -0.15 },
    ];

    let time = 0;
    let lastTime = 0;
    let rafId;

    const animate = (timestamp) => {
      rafId = requestAnimationFrame(animate);

      // Throttle to ~30fps
      if (timestamp - lastTime < 33) return;
      lastTime = timestamp;

      time += 0.005;

      // Determine target palette from active section
      const palette = SECTION_PALETTES[activeSectionRef.current] || SECTION_PALETTES.default;
      const targetColors = palette.map(hexToRgb);

      // Lerp current colors toward target
      const cur = currentColorsRef.current;
      for (let i = 0; i < 3; i++) {
        cur[i] = lerpColor(cur[i], targetColors[i], 0.02);
      }

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < blobs.length; i++) {
        const blob = blobs[i];
        const bx = blob.x + Math.sin(time * blob.speedX * 3) * 100;
        const by = blob.y + Math.cos(time * blob.speedY * 3) * 80;
        const colorStr = rgbToColorString(cur[i]);

        const gradient = ctx.createRadialGradient(bx, by, 0, bx, by, blob.radius);
        gradient.addColorStop(0, `rgba(${colorStr}, 0.08)`);
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
