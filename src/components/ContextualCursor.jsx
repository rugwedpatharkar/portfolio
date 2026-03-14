import { useEffect, useRef, useState } from "react";

const CURSOR_STATES = {
  default: { size: 12, label: "", mix: true },
  link: { size: 48, label: "", mix: true },
  button: { size: 56, label: "Click", mix: false },
  grab: { size: 48, label: "Drag", mix: false },
  external: { size: 56, label: "↗", mix: false },
  image: { size: 64, label: "View", mix: false },
};

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
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (!isDesktop) return;

    const cursor = cursorRef.current;
    const label = labelRef.current;
    if (!cursor) return;

    let lastDetect = 0;

    const handleMove = (e) => {
      posRef.current.x = e.clientX;
      posRef.current.y = e.clientY;

      // Direct DOM update — no React re-render
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;

      // Throttle DOM traversal to ~15fps
      const now = performance.now();
      if (now - lastDetect > 66) {
        lastDetect = now;
        const newState = detectState(e.target);
        if (newState !== stateRef.current) {
          stateRef.current = newState;
          const s = CURSOR_STATES[newState];
          cursor.style.width = `${s.size}px`;
          cursor.style.height = `${s.size}px`;
          cursor.style.border = newState === "default" ? "2px solid rgba(145, 94, 255, 0.6)" : "2px solid rgba(145, 94, 255, 0.3)";
          cursor.style.background = newState === "default" ? "rgba(145, 94, 255, 0.2)" : "rgba(145, 94, 255, 0.08)";
          cursor.style.mixBlendMode = s.mix ? "difference" : "normal";
          label.textContent = s.label;
        }
      }
    };

    const handleDown = () => { cursor.style.transform = "translate(-50%, -50%) scale(0.8)"; };
    const handleUp = () => { cursor.style.transform = "translate(-50%, -50%) scale(1)"; };

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
      className="fixed pointer-events-none z-[9998] flex items-center justify-center"
      style={{
        width: 12,
        height: 12,
        left: -100,
        top: -100,
        transform: "translate(-50%, -50%)",
        borderRadius: "50%",
        border: "2px solid rgba(145, 94, 255, 0.6)",
        background: "rgba(145, 94, 255, 0.2)",
        mixBlendMode: "difference",
        transition: "width 0.2s, height 0.2s, background 0.2s, border 0.2s",
        willChange: "left, top",
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
