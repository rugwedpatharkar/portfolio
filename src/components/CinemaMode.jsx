import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Cinema Mode — a radial-reveal overlay that darkens the page
 * and shows only the area under the cursor, like a flashlight.
 *
 * Toggle: press  \  (backslash) or dispatch a custom "cinema-mode" event.
 *   window.dispatchEvent(new CustomEvent("cinema-mode", { detail: true/false }))
 */
const CinemaMode = () => {
  const [active, setActive] = useState(false);
  const overlayRef = useRef(null);
  const rafRef = useRef(null);
  const posRef = useRef({ x: -9999, y: -9999 });

  /* Update radial gradient on mousemove via RAF to avoid jank */
  const onMove = useCallback((e) => {
    posRef.current.x = e.clientX;
    posRef.current.y = e.clientY;
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const el = overlayRef.current;
      if (!el) return;
      const { x, y } = posRef.current;
      el.style.background = `radial-gradient(circle 200px at ${x}px ${y}px, transparent 0%, rgba(3,3,12,0.93) 100%)`;
    });
  }, []);

  /* Backslash key toggle */
  useEffect(() => {
    const onKey = (e) => {
      if (
        e.key === "\\" &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey &&
        e.target.tagName !== "INPUT" &&
        e.target.tagName !== "TEXTAREA"
      ) {
        setActive((a) => !a);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* External event toggle (from FloatingActionMenu) */
  useEffect(() => {
    const onExt = (e) => setActive(e.detail);
    window.addEventListener("cinema-mode", onExt);
    return () => window.removeEventListener("cinema-mode", onExt);
  }, []);

  /* Attach/detach mousemove when active changes */
  useEffect(() => {
    if (active) {
      window.addEventListener("mousemove", onMove, { passive: true });
    } else {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, [active, onMove]);

  if (!active) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[140] pointer-events-none"
      style={{ background: "rgba(3,3,12,0.93)" }}
      aria-hidden="true"
    />
  );
};

export default CinemaMode;
