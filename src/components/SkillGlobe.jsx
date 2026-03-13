/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";
import { skills as skillData } from "../constants";

const allSkills = Object.values(skillData).flat();

const SkillGlobe = () => {
  const containerRef = useRef(null);
  const animRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const rotationRef = useRef({ x: 0, y: 0 });
  const [items, setItems] = useState([]);

  useEffect(() => {
    const count = allSkills.length;
    const positions = allSkills.map((skill, i) => {
      const phi = Math.acos(-1 + (2 * i + 1) / count);
      const theta = Math.sqrt(count * Math.PI) * phi;
      return {
        ...skill,
        x: Math.cos(theta) * Math.sin(phi),
        y: Math.sin(theta) * Math.sin(phi),
        z: Math.cos(phi),
      };
    });
    setItems(positions);
  }, []);

  useEffect(() => {
    let speed = { x: 0.002, y: 0.003 };

    const animate = () => {
      const mx = mouseRef.current.x * 0.00002;
      const my = mouseRef.current.y * 0.00002;

      rotationRef.current.x += speed.y + my;
      rotationRef.current.y += speed.x + mx;

      const cosX = Math.cos(rotationRef.current.x);
      const sinX = Math.sin(rotationRef.current.x);
      const cosY = Math.cos(rotationRef.current.y);
      const sinY = Math.sin(rotationRef.current.y);

      setItems((prev) =>
        prev.map((item) => {
          // Rotate around Y
          let x1 = item.x * cosY - item.z * sinY;
          let z1 = item.x * sinY + item.z * cosY;
          // Rotate around X
          let y1 = item.y * cosX - z1 * sinX;
          let z2 = item.y * sinX + z1 * cosX;

          return { ...item, rx: x1, ry: y1, rz: z2 };
        })
      );

      // Reset rotation accumulation
      rotationRef.current.x = 0;
      rotationRef.current.y = 0;

      // Update base positions
      setItems((prev) =>
        prev.map((item) => ({
          ...item,
          x: item.rx ?? item.x,
          y: item.ry ?? item.y,
          z: item.rz ?? item.z,
        }))
      );

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  const handleMouseMove = (e) => {
    const rect = containerRef.current.getBoundingClientRect();
    mouseRef.current = {
      x: e.clientX - rect.left - rect.width / 2,
      y: e.clientY - rect.top - rect.height / 2,
    };
  };

  const handleMouseLeave = () => {
    mouseRef.current = { x: 0, y: 0 };
  };

  const radius = 200;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full h-[400px] sm:h-[500px] flex items-center justify-center"
      style={{ perspective: 800 }}
    >
      {items.map((item, i) => {
        const scale = (item.z + 1.5) / 2.5;
        const opacity = Math.max(0.2, (item.z + 1) / 2);

        return (
          <div
            key={i}
            className="absolute flex flex-col items-center gap-1 transition-none group"
            style={{
              transform: `translate3d(${item.x * radius}px, ${item.y * radius}px, ${item.z * 50}px) scale(${scale})`,
              opacity,
              zIndex: Math.round(item.z * 10 + 10),
            }}
          >
            <div
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center p-1.5 sm:p-2"
              style={{
                backgroundImage: "linear-gradient(45deg, #151030, #1f1630)",
                boxShadow: `0 0 ${8 + scale * 8}px ${2 + scale * 2}px rgba(145, 94, 255, ${0.2 + scale * 0.2})`,
              }}
            >
              <img
                src={item.icon}
                alt={item.name}
                className="w-full h-full object-contain"
              />
            </div>
            <span
              className="text-[9px] sm:text-[10px] text-white/70 whitespace-nowrap font-medium opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {item.name}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default SkillGlobe;
