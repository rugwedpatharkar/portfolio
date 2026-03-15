import { useRef, useCallback } from "react";

const TiltCard = ({ children, className = "", tiltStrength = 8, glareOpacity = 0.08 }) => {
  const cardRef = useRef(null);
  const rafRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  const handleMove = useCallback((e) => {
    mouseRef.current.x = e.clientX;
    mouseRef.current.y = e.clientY;

    if (rafRef.current) return; // already scheduled
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const card = cardRef.current;
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const x = (mouseRef.current.x - rect.left) / rect.width;
      const y = (mouseRef.current.y - rect.top) / rect.height;
      const rotateX = (0.5 - y) * tiltStrength;
      const rotateY = (x - 0.5) * tiltStrength;
      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
      // Update CSS variables for the glare/shine effect
      card.style.setProperty("--mouse-x", `${x * 100}%`);
      card.style.setProperty("--mouse-y", `${y * 100}%`);
    });
  }, [tiltStrength]);

  const handleLeave = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={`transition-transform duration-300 ease-out ${className}`}
      style={{ transformStyle: "preserve-3d", transformOrigin: "center center", willChange: "transform" }}
    >
      {children}
    </div>
  );
};

export default TiltCard;
