import { useEffect, useRef } from "react";

/**
 * Adds a subtle blur layer that intensifies as the user scrolls deeper,
 * creating a sense of atmospheric depth. Fully passive / non-blocking.
 */
const ScrollDepthBlur = () => {
  const ref = useRef(null);
  const ticking = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(scrollY / docHeight, 1) : 0;

      const opacity = progress * 0.3;
      el.style.opacity = opacity;
      ticking.current = false;
    };

    const onScroll = () => {
      if (!ticking.current) {
        ticking.current = true;
        requestAnimationFrame(update);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      ref={ref}
      className="fixed inset-0 pointer-events-none z-0"
      aria-hidden="true"
      style={{ opacity: 0, background: "rgba(5, 8, 22, 0.6)", willChange: "opacity" }}
    />
  );
};

export default ScrollDepthBlur;
