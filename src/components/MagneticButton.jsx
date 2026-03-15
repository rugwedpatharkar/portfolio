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

    const ripple = document.createElement("span");
    ripple.style.cssText = `
      position: absolute;
      left: ${x}px;
      top: ${y}px;
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      background: rgba(145, 94, 255, 0.15);
      pointer-events: none;
      animation: magnetic-ripple 0.6s ease-out forwards;
    `;

    el.appendChild(ripple);
    ripple.addEventListener("animationend", () => ripple.remove());
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
    </div>
  );
};

export default MagneticButton;
