/* eslint-disable react/prop-types */
import { useEffect, useRef } from "react";

/*
 * Slim vertical tour-progress rail on the right edge. Reads the shared scroll
 * ref (0..1) each frame and scales a glowing fill — imperative, so it never
 * re-renders React per frame. Purely a position cue; safe under reduced-motion
 * (it just reflects where you are, no easing of its own).
 */
const ScrollProgress = ({ scrollTRef }) => {
  const fillRef = useRef(null);
  useEffect(() => {
    let raf;
    const loop = () => {
      const p = Math.max(0, Math.min(1, scrollTRef.current || 0));
      if (fillRef.current) fillRef.current.style.transform = `scaleY(${p})`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [scrollTRef]);

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        right: 14,
        top: "50%",
        transform: "translateY(-50%)",
        height: "32vh",
        width: 2,
        background: "rgba(255,255,255,0.1)",
        borderRadius: 2,
        zIndex: 45,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      <div
        ref={fillRef}
        style={{
          position: "absolute",
          inset: 0,
          transformOrigin: "top",
          transform: "scaleY(0)",
          background: "linear-gradient(180deg, #9cc6ff, #6f8cff)",
          borderRadius: 2,
          boxShadow: "0 0 8px rgba(150,195,255,0.6)",
        }}
      />
    </div>
  );
};

export default ScrollProgress;
