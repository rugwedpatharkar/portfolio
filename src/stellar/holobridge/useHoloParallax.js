/*
 * Mouse-reactive 3D parallax for the holo-panels. Attaches ONE window pointermove
 * listener and eases cursor position into CSS vars (--hx, --hy ∈ [-1,1]) on the
 * returned element. The panel's perspective layers consume those vars to tilt with
 * real depth. Desktop only — a no-op under reduced-motion / mobile (the locked
 * scroll camera is never touched; this is a DOM-only effect).
 */
import { useRef, useEffect } from "react";
import useViewport from "../useViewport";

export default function useHoloParallax() {
  const ref = useRef(null);
  const { reducedMotion, isMobile } = useViewport();

  useEffect(() => {
    if (reducedMotion || isMobile) return undefined;
    const el = ref.current;
    if (!el) return undefined;
    let raf = 0;
    let tx = 0, ty = 0, cx = 0, cy = 0;
    const onMove = (e) => {
      tx = (e.clientX / window.innerWidth - 0.5) * 2;
      ty = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    const tick = () => {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      el.style.setProperty("--hx", cx.toFixed(3));
      el.style.setProperty("--hy", cy.toFixed(3));
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [reducedMotion, isMobile]);

  return ref;
}
