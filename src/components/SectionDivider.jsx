import { useEffect, useRef, useState } from "react";

const SectionDivider = () => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="flex items-center justify-center py-8 sm:py-12"
      aria-hidden="true"
    >
      <div className="flex items-center gap-3 sm:gap-4 w-full max-w-xs">
        {/* Left line */}
        <div
          className="flex-1 h-px transition-all duration-1000 ease-out"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(145, 94, 255, 0.3))",
            transform: visible ? "scaleX(1)" : "scaleX(0)",
            transformOrigin: "left",
          }}
        />
        {/* Center dot */}
        <div
          className="w-1.5 h-1.5 rounded-full transition-all duration-700 delay-300"
          style={{
            background: visible ? "#915eff" : "transparent",
            boxShadow: visible ? "0 0 8px rgba(145, 94, 255, 0.5)" : "none",
            transform: visible ? "scale(1)" : "scale(0)",
          }}
        />
        {/* Right line */}
        <div
          className="flex-1 h-px transition-all duration-1000 ease-out"
          style={{
            background: "linear-gradient(90deg, rgba(145, 94, 255, 0.3), transparent)",
            transform: visible ? "scaleX(1)" : "scaleX(0)",
            transformOrigin: "right",
          }}
        />
      </div>
    </div>
  );
};

export default SectionDivider;
