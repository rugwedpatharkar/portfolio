import { useState, useEffect, useCallback } from "react";

const CURSOR_STATES = {
  default: { size: 12, label: "", mix: true },
  link: { size: 48, label: "", mix: true },
  button: { size: 56, label: "Click", mix: false },
  grab: { size: 48, label: "Drag", mix: false },
  external: { size: 56, label: "↗", mix: false },
  image: { size: 64, label: "View", mix: false },
};

const ContextualCursor = () => {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [cursorState, setCursorState] = useState("default");
  const [isDesktop, setIsDesktop] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const detectState = useCallback((el) => {
    if (!el) return "default";

    // Walk up DOM tree to find relevant element
    let current = el;
    while (current && current !== document.body) {
      const tag = current.tagName?.toLowerCase();

      // External links
      if (tag === "a" && current.target === "_blank") return "external";
      // Internal links
      if (tag === "a") return "link";
      // Buttons
      if (tag === "button" || current.role === "button") return "button";
      // Draggable
      if (current.getAttribute("draggable") === "true" || current.classList?.contains("active:cursor-grabbing")) return "grab";
      // Images in project cards
      if (tag === "img" && current.closest(".card-shine")) return "image";

      current = current.parentElement;
    }
    return "default";
  }, []);

  useEffect(() => {
    if (!isDesktop) return;

    const handleMove = (e) => {
      requestAnimationFrame(() => {
        setPosition({ x: e.clientX, y: e.clientY });
        setCursorState(detectState(e.target));
      });
    };

    const handleDown = () => setIsClicking(true);
    const handleUp = () => setIsClicking(false);

    window.addEventListener("mousemove", handleMove, { passive: true });
    window.addEventListener("mousedown", handleDown);
    window.addEventListener("mouseup", handleUp);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mousedown", handleDown);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [isDesktop, detectState]);

  if (!isDesktop) return null;

  const state = CURSOR_STATES[cursorState];
  const size = isClicking ? state.size * 0.8 : state.size;

  return (
    <div
      className="fixed pointer-events-none z-[9998] transition-[width,height,opacity] duration-200 ease-out flex items-center justify-center"
      style={{
        width: size,
        height: size,
        left: position.x,
        top: position.y,
        transform: "translate(-50%, -50%)",
        borderRadius: "50%",
        border: cursorState === "default" ? "2px solid rgba(145, 94, 255, 0.6)" : "2px solid rgba(145, 94, 255, 0.3)",
        background: cursorState === "default" ? "rgba(145, 94, 255, 0.2)" : "rgba(145, 94, 255, 0.08)",
        mixBlendMode: state.mix ? "difference" : "normal",
        backdropFilter: cursorState !== "default" ? "blur(2px)" : "none",
      }}
    >
      {state.label && (
        <span className="text-white text-[9px] font-bold uppercase tracking-wider select-none">
          {state.label}
        </span>
      )}
    </div>
  );
};

export default ContextualCursor;
