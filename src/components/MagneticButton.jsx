/* eslint-disable react/prop-types */
import { useRef, useCallback, useState } from "react";

// Inject keyframes once
const RIPPLE_STYLE_ID = "magnetic-btn-ripple-keyframes";
if (typeof document !== "undefined" && !document.getElementById(RIPPLE_STYLE_ID)) {
  const style = document.createElement("style");
  style.id = RIPPLE_STYLE_ID;
  style.textContent = `
    @keyframes magnetic-ripple {
      0% {
        transform: scale(0);
        opacity: 1;
      }
      100% {
        transform: scale(4);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
}

const MagneticButton = ({ children, className = "", strength = 0.3, ...props }) => {
  const ref = useRef(null);
  const [shadow, setShadow] = useState("");
  const [ripples, setRipples] = useState([]);
  const rippleIdRef = useRef(0);

  const handleMouseMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * strength;
    const y = (e.clientY - rect.top - rect.height / 2) * strength;
    el.style.transform = `translate(${x}px, ${y}px)`;

    // Directional glow shadow following the magnetic pull
    const glowX = x * 0.5;
    const glowY = y * 0.5;
    setShadow(`${glowX}px ${glowY}px 20px rgba(145, 94, 255, 0.25)`);
  }, [strength]);

  const handleMouseLeave = useCallback(() => {
    if (ref.current) ref.current.style.transform = "";
    setShadow("");
  }, []);

  const handleClick = useCallback((e) => {
    const el = ref.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    const id = ++rippleIdRef.current;
    setRipples((prev) => [...prev, { id, x, y, size }]);

    // Auto-remove after animation completes (600ms)
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 600);
  }, []);

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      className={className}
      style={{
        position: "relative",
        overflow: "hidden",
        transition: "transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.3s ease",
        boxShadow: shadow,
      }}
      {...props}
    >
      {children}
      {ripples.map((r) => (
        <span
          key={r.id}
          style={{
            position: "absolute",
            left: r.x,
            top: r.y,
            width: r.size,
            height: r.size,
            borderRadius: "50%",
            background: "rgba(145, 94, 255, 0.15)",
            pointerEvents: "none",
            animation: "magnetic-ripple 0.6s ease-out forwards",
          }}
        />
      ))}
    </div>
  );
};

export default MagneticButton;
