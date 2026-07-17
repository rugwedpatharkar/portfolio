/*
 * V3Cursor — premium HUD-style cursor. A crisp accent dot 1:1 with the pointer,
 * a lagging spring ring for the ambient "expensive" feel, and — over interactive
 * elements — a targeting RETICLE (4 corner brackets) that snaps around them.
 * Real mission-control feel. Desktop + fine-pointer only; fully removed under
 * reduced-motion or touch. SSR-safe.
 */
import { memo, useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

const isFinePointer = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(pointer: fine)").matches &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

  /* Reticle bracket — small L-shape corner, positioned relative to the cursor. */
  const bracket = (dx, dy, rotate) => (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 8,
        height: 8,
        marginLeft: dx,
        marginTop: dy,
        borderColor: "var(--v3-accent)",
        borderStyle: "solid",
        borderWidth: 0,
        borderTopWidth: 1,
        borderLeftWidth: 1,
        transform: `rotate(${rotate}deg)`,
      }}
    />
  );

  const reticleSize = 22;
  const off = pressed ? reticleSize - 6 : reticleSize;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, pointerEvents: "none" }} aria-hidden>
      {/* Ambient ring — spring-lagged, fades when the reticle takes over. */}
      <motion.div
        style={{
          position: "absolute", left: 0, top: 0, x: rx, y: ry,
          width: 34, height: 34, marginLeft: -17, marginTop: -17,
          borderRadius: "50%", border: "1px solid var(--v3-accent)",
        }}
        animate={{ scale: hovering ? 0.5 : (pressed ? 0.85 : 1), opacity: hovering ? 0 : 0.4 }}
        transition={{ type: "spring", stiffness: 400, damping: 22 }}
      />
      {/* Targeting reticle — 4 corner brackets that snap in around the pointer
          when hovering an interactive element, tighten on press. Snappier spring
          than the ring so it feels "locked on". */}
      <motion.div
        style={{
          position: "absolute", left: 0, top: 0, x: rx, y: ry,
          width: 0, height: 0,
        }}
        animate={{ scale: hovering ? 1 : 0.6, opacity: hovering ? 1 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 26 }}
      >
        {bracket(-off, -off, 0)}
        {bracket(off - 8, -off, 90)}
        {bracket(off - 8, off - 8, 180)}
        {bracket(-off, off - 8, 270)}
      </motion.div>
      {/* Instant dot — the true pointer position. Fades when reticle is active. */}
      <div
        ref={dotRef}
        style={{
          position: "absolute", left: 0, top: 0,
          width: 5, height: 5, marginLeft: -2.5, marginTop: -2.5,
          borderRadius: "50%", background: "var(--v3-accent)",
          boxShadow: "0 0 8px color-mix(in oklab, var(--v3-accent) 65%, transparent)",
          opacity: hovering ? 0 : 1, transition: "opacity .2s",
        }}
      />
    </div>
  );
}

export default memo(V3Cursor);
