/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";

/*
 * Custom navigation reticle cursor — replaces the OS pointer with a
 * crosshair that grows + rotates when hovering interactive surfaces
 * (planets, links, buttons). Native cursor is hidden via global CSS.
 *
 * Touch devices skip this entirely. Reduced-motion users get the
 * native cursor back.
 */

const Cursor = () => {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const [enabled, setEnabled] = useState(false);
  const stateRef = useRef({ x: 0, y: 0, tx: 0, ty: 0, hover: false });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const touch = window.matchMedia("(pointer: coarse)").matches;
    if (reduced || touch) return;
    setEnabled(true);
    document.body.classList.add("stellar-cursor-active");

    const onMove = (e) => {
      const s = stateRef.current;
      s.tx = e.clientX;
      s.ty = e.clientY;
      /* The DOT tracks the pointer INSTANTLY (set in the move handler, not
         the rAF loop) so it never lags or stutters when the 3D scene drops
         a frame — that trailing lerp was the "laggy cursor". Only the ring
         smooths, and tightly. */
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
      }
    };
    const onOver = (e) => {
      const interactive = e.target?.closest?.("a, button, [data-cursor='hover'], canvas");
      stateRef.current.hover = !!interactive;
    };

    let raf = 0;
    const tick = () => {
      const s = stateRef.current;
      /* Ring trails the dot with a tight lerp (0.55) — close enough to feel
         responsive, loose enough to read as a reticle settling on target. */
      s.x += (s.tx - s.x) * 0.55;
      s.y += (s.ty - s.y) * 0.55;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${s.x}px, ${s.y}px, 0) translate(-50%, -50%) scale(${s.hover ? 1.55 : 1}) rotate(${performance.now() * (s.hover ? 0.18 : 0.04)}deg)`;
        ringRef.current.style.opacity = s.hover ? 0.95 : 0.6;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      document.body.classList.remove("stellar-cursor-active");
    };
  }, []);

  if (!enabled) return null;

  return (
    <>
      <style>{`
        body.stellar-cursor-active,
        body.stellar-cursor-active * { cursor: none !important; }
        body.stellar-cursor-active a,
        body.stellar-cursor-active button { cursor: none !important; }
      `}</style>
      <div
        ref={dotRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 4,
          height: 4,
          borderRadius: "50%",
          background: "#ffe1a8",
          mixBlendMode: "screen",
          pointerEvents: "none",
          zIndex: 9999,
          willChange: "transform",
        }}
      />
      <div
        ref={ringRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 32,
          height: 32,
          border: "1px solid rgba(255, 225, 168, 0.55)",
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 9998,
          willChange: "transform, opacity",
          opacity: 0.6,
          /* Cross-hair tick marks */
          backgroundImage: `linear-gradient(rgba(255, 225, 168, 0.45) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 225, 168, 0.45) 1px, transparent 1px)`,
          backgroundSize: "100% 50%, 50% 100%",
          backgroundPosition: "center top, left center",
          backgroundRepeat: "no-repeat",
        }}
      />
    </>
  );
};

export default Cursor;
