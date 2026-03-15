import { useEffect, useRef, useState } from "react";

const CURSOR_STATES = {
  default: { size: 12, label: "", mix: true },
  link: { size: 48, label: "", mix: true },
  button: { size: 56, label: "Click", mix: false },
  grab: { size: 48, label: "Drag", mix: false },
  external: { size: 56, label: "↗", mix: false },
  image: { size: 64, label: "View", mix: false },
};

const SECTION_CURSORS = {
  default: { size: 20, color: "rgba(145, 94, 255, 0.5)", label: "" },
  about: { size: 24, color: "rgba(145, 94, 255, 0.5)", label: "" },
  experience: { size: 20, color: "rgba(248, 197, 85, 0.5)", label: "" },
  skills: { size: 18, color: "rgba(0, 206, 168, 0.5)", label: ">" },
  projects: { size: 22, color: "rgba(97, 218, 251, 0.5)", label: "" },
  education: { size: 20, color: "rgba(0, 206, 168, 0.5)", label: "" },
  achievements: { size: 24, color: "rgba(248, 197, 85, 0.5)", label: "" },
  testimonials: { size: 20, color: "rgba(145, 94, 255, 0.5)", label: "" },
  contact: { size: 20, color: "rgba(145, 94, 255, 0.5)", label: "" },
};

const SECTION_IDS = Object.keys(SECTION_CURSORS).filter((k) => k !== "default");

const detectState = (el) => {
  if (!el) return "default";
  let current = el;
  while (current && current !== document.body) {
    const tag = current.tagName?.toLowerCase();
    if (tag === "a" && current.target === "_blank") return "external";
    if (tag === "a") return "link";
    if (tag === "button" || current.role === "button") return "button";
    if (current.getAttribute("draggable") === "true" || current.classList?.contains("active:cursor-grabbing")) return "grab";
    if (tag === "img" && current.closest(".card-shine")) return "image";
    current = current.parentElement;
  }
  return "default";
};

const ContextualCursor = () => {
  const cursorRef = useRef(null);
  const labelRef = useRef(null);
  const stateRef = useRef("default");
  const posRef = useRef({ x: -100, y: -100 });
  const activeSectionRef = useRef("default");
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // IntersectionObserver to track which section is currently in view
  useEffect(() => {
    if (!isDesktop) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            activeSectionRef.current = entry.target.id || "default";
          }
        }
      },
      { threshold: 0.3 }
    );

    // Observe all section elements by their ID
    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [isDesktop]);

  useEffect(() => {
    if (!isDesktop) return;

    const cursor = cursorRef.current;
    const label = labelRef.current;
    if (!cursor) return;

    let lastDetect = 0;
    let lastSection = "default";

    const handleMove = (e) => {
      posRef.current.x = e.clientX;
      posRef.current.y = e.clientY;

      // Direct DOM update — no React re-render (translate3d avoids layout thrashing)
      cursor.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;

      // Throttle DOM traversal to ~15fps
      const now = performance.now();
      if (now - lastDetect > 66) {
        lastDetect = now;
        const newState = detectState(e.target);
        const section = activeSectionRef.current;
        const sectionCfg = SECTION_CURSORS[section] || SECTION_CURSORS.default;

        if (newState !== stateRef.current || section !== lastSection) {
          stateRef.current = newState;
          lastSection = section;
          const s = CURSOR_STATES[newState];

          if (newState === "default") {
            // Use section-specific visuals for the default cursor state
            cursor.style.width = `${sectionCfg.size}px`;
            cursor.style.height = `${sectionCfg.size}px`;
            cursor.style.borderColor = sectionCfg.color;
            cursor.style.background = sectionCfg.color.replace(/[\d.]+\)$/, "0.2)");
            cursor.style.mixBlendMode = "difference";
            label.textContent = sectionCfg.label;
          } else {
            cursor.style.width = `${s.size}px`;
            cursor.style.height = `${s.size}px`;
            cursor.style.borderColor = "rgba(145, 94, 255, 0.3)";
            cursor.style.background = "rgba(145, 94, 255, 0.08)";
            cursor.style.mixBlendMode = s.mix ? "difference" : "normal";
            label.textContent = s.label;
          }
        }
      }
    };

    const handleDown = () => { cursor.style.transform = `translate3d(${posRef.current.x}px, ${posRef.current.y}px, 0) translate(-50%, -50%) scale(0.8)`; };
    const handleUp = () => { cursor.style.transform = `translate3d(${posRef.current.x}px, ${posRef.current.y}px, 0) translate(-50%, -50%) scale(1)`; };

    window.addEventListener("mousemove", handleMove, { passive: true });
    window.addEventListener("mousedown", handleDown);
    window.addEventListener("mouseup", handleUp);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mousedown", handleDown);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [isDesktop]);

  if (!isDesktop) return null;

  return (
    <div
      ref={cursorRef}
      className="fixed pointer-events-none z-[98] flex items-center justify-center"
      style={{
        width: 20,
        height: 20,
        position: "fixed",
        top: 0,
        left: 0,
        transform: "translate3d(-100px, -100px, 0) translate(-50%, -50%)",
        borderRadius: "50%",
        border: "2px solid rgba(145, 94, 255, 0.5)",
        background: "rgba(145, 94, 255, 0.2)",
        mixBlendMode: "difference",
        transition: "width 0.3s, height 0.3s, border-color 0.3s, background 0.3s",
        willChange: "transform",
      }}
    >
      <span
        ref={labelRef}
        className="text-white text-[9px] font-bold uppercase tracking-wider select-none"
      />
    </div>
  );
};

export default ContextualCursor;
