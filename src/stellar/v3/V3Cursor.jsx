/*
 * V3Cursor — a premium two-part cursor: a crisp dot that tracks the pointer 1:1, and
 * a larger ring that lags behind on a spring (the classic "expensive" feel). The ring
 * expands + the dot hides over interactive elements (links, buttons, [data-cursor]).
 * Desktop + fine-pointer only; fully removed under reduced-motion or touch. SSR-safe.
 */
import { memo, useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

const isFinePointer = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(pointer: fine)").matches &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* memo: takes no props → after mount, StellarApp re-renders (activeIdx,
   panelHidden, extrasPhase, scrollFinale) never touch V3Cursor's tree again. */
function V3Cursor() {
  const [on, setOn] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [pressed, setPressed] = useState(false);
  const dotRef = useRef(null);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const rx = useSpring(x, { stiffness: 300, damping: 28, mass: 0.5 });
  const ry = useSpring(y, { stiffness: 300, damping: 28, mass: 0.5 });

  useEffect(() => {
    if (!isFinePointer()) return;
    setOn(true);
    document.documentElement.style.cursor = "none";

    const move = (e) => {
      x.set(e.clientX);
      y.set(e.clientY);
      if (dotRef.current) dotRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      const t = e.target;
      setHovering(!!(t && t.closest && t.closest('a, button, [data-cursor], [role="button"]')));
    };
    const down = () => setPressed(true);
    const up = () => setPressed(false);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", down, { passive: true });
    window.addEventListener("pointerup", up, { passive: true });
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      document.documentElement.style.cursor = "";
    };
  }, [x, y]);

  if (!on) return null;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, pointerEvents: "none" }} aria-hidden>
      {/* lagging ring */}
      <motion.div
        style={{
          position: "absolute", left: 0, top: 0, x: rx, y: ry,
          width: 34, height: 34, marginLeft: -17, marginTop: -17,
          borderRadius: "50%", border: "1px solid var(--v3-accent)",
        }}
        animate={{ scale: (hovering ? 1.7 : 1) * (pressed ? 0.8 : 1), opacity: hovering ? 0.9 : 0.5 }}
        transition={{ type: "spring", stiffness: 400, damping: 22 }}
      />
      {/* instant dot */}
      <div
        ref={dotRef}
        style={{
          position: "absolute", left: 0, top: 0,
          width: 5, height: 5, marginLeft: -2.5, marginTop: -2.5,
          borderRadius: "50%", background: "var(--v3-accent)",
          opacity: hovering ? 0 : 1, transition: "opacity .2s",
        }}
      />
    </div>
  );
}

export default memo(V3Cursor);
