import { useEffect, useRef } from "react";

const DOT_COUNT = 10;
const LERP_BASE = 0.25; // spring stiffness — each dot lerps slower than the one before

const CursorTrail = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    // Respect reduced motion preference
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Desktop only
    if (window.innerWidth < 768) return;

    const container = containerRef.current;
    if (!container) return;

    // Create trail dots via direct DOM manipulation — zero React re-renders
    const dots = [];
    for (let i = 0; i < DOT_COUNT; i++) {
      const dot = document.createElement("div");
      const t = i / (DOT_COUNT - 1); // 0 = nearest cursor, 1 = farthest
      const size = 6 - t * 4; // 6px down to 2px
      const opacity = 0.4 - t * 0.4; // 0.4 down to 0

      Object.assign(dot.style, {
        position: "fixed",
        top: "0",
        left: "0",
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "50%",
        background: `rgba(145, 94, 255, ${opacity})`,
        pointerEvents: "none",
        transform: "translate3d(-100px, -100px, 0) translate(-50%, -50%)",
        willChange: "transform",
        transition: "background 0.4s ease",
      });

      container.appendChild(dot);
      dots.push({ el: dot, x: -100, y: -100, size, baseOpacity: opacity });
    }

    // Cursor position target
    const mouse = { x: -100, y: -100 };

    const handleMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    // Read section color from ContextualCursor's section tracking
    // We observe section intersections independently to stay decoupled
    const SECTION_COLORS = {
      default: [145, 94, 255],
      about: [145, 94, 255],
      experience: [248, 197, 85],
      skills: [0, 206, 168],
      projects: [97, 218, 251],
      education: [0, 206, 168],
      achievements: [248, 197, 85],
      testimonials: [145, 94, 255],
      contact: [145, 94, 255],
    };

    let activeColor = SECTION_COLORS.default;
    const SECTION_IDS = Object.keys(SECTION_COLORS).filter((k) => k !== "default");

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = entry.target.id || "default";
            activeColor = SECTION_COLORS[id] || SECTION_COLORS.default;
            // Update dot colors to match current section
            const [r, g, b] = activeColor;
            for (let i = 0; i < dots.length; i++) {
              dots[i].el.style.background = `rgba(${r}, ${g}, ${b}, ${dots[i].baseOpacity})`;
            }
          }
        }
      },
      { threshold: 0.3 }
    );

    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    // Animation loop — spring-like interpolation
    let rafId;
    let paused = false;

    const animate = () => {
      if (paused) return;

      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i];
        // Each successive dot lerps toward the previous dot's position (or mouse for first)
        const targetX = i === 0 ? mouse.x : dots[i - 1].x;
        const targetY = i === 0 ? mouse.y : dots[i - 1].y;
        const lerpFactor = LERP_BASE * (1 - i * 0.06); // progressively slower

        dot.x += (targetX - dot.x) * lerpFactor;
        dot.y += (targetY - dot.y) * lerpFactor;

        dot.el.style.transform = `translate3d(${dot.x}px, ${dot.y}px, 0) translate(-50%, -50%)`;
      }

      rafId = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", handleMove, { passive: true });
    rafId = requestAnimationFrame(animate);

    // Pause when tab is hidden
    const handleVisibility = () => {
      if (document.hidden) {
        paused = true;
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
      } else {
        paused = false;
        if (!rafId) {
          rafId = requestAnimationFrame(animate);
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    // Handle resize — hide on mobile
    const handleResize = () => {
      if (window.innerWidth < 768) {
        container.style.display = "none";
      } else {
        container.style.display = "";
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibility);
      if (rafId) cancelAnimationFrame(rafId);
      observer.disconnect();
      // Clean up DOM nodes
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[97] pointer-events-none hidden md:block"
      aria-hidden="true"
    />
  );
};

export default CursorTrail;
