/* eslint-disable react/prop-types */
import { useEffect, useRef } from "react";
import { skills as skillData } from "../content";

const allSkills = Object.values(skillData).flat();

const SkillGlobe = () => {
  const containerRef = useRef(null);
  const animRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const itemsRef = useRef([]);
  const nodesRef = useRef([]);

  useEffect(() => {
    const count = allSkills.length;
    itemsRef.current = allSkills.map((skill, i) => {
      const phi = Math.acos(-1 + (2 * i + 1) / count);
      const theta = Math.sqrt(count * Math.PI) * phi;
      return {
        ...skill,
        x: Math.cos(theta) * Math.sin(phi),
        y: Math.sin(theta) * Math.sin(phi),
        z: Math.cos(phi),
      };
    });

    // Create DOM nodes once
    const container = containerRef.current;
    if (!container) return;
    nodesRef.current = itemsRef.current.map((item, i) => {
      const wrapper = document.createElement("div");
      wrapper.className = "absolute flex flex-col items-center gap-1 group";

      const iconBox = document.createElement("div");
      iconBox.className = "w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center p-1.5 sm:p-2";
      iconBox.style.backgroundImage = "linear-gradient(45deg, #151030, #1f1630)";

      const img = document.createElement("img");
      img.src = item.icon;
      img.alt = item.name;
      img.className = "w-full h-full object-contain";
      img.loading = "lazy";

      const label = document.createElement("span");
      label.className = "text-micro sm:text-caption text-white/70 whitespace-nowrap font-medium opacity-0 group-hover:opacity-100 transition-opacity";
      label.textContent = item.name;

      iconBox.appendChild(img);
      wrapper.appendChild(iconBox);
      wrapper.appendChild(label);
      container.appendChild(wrapper);

      return { el: wrapper, iconBox };
    });

    const radius = Math.min(200, container.offsetWidth * 0.38);
    const speed = { x: 0.002, y: 0.003 };

    const animate = () => {
      const mx = mouseRef.current.x * 0.00002;
      const my = mouseRef.current.y * 0.00002;

      const rx = speed.y + my;
      const ry = speed.x + mx;
      const cosX = Math.cos(rx);
      const sinX = Math.sin(rx);
      const cosY = Math.cos(ry);
      const sinY = Math.sin(ry);

      const items = itemsRef.current;
      const nodes = nodesRef.current;
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        // Rotate around Y then X
        const x1 = item.x * cosY - item.z * sinY;
        const z1 = item.x * sinY + item.z * cosY;
        const y1 = item.y * cosX - z1 * sinX;
        const z2 = item.y * sinX + z1 * cosX;

        item.x = x1;
        item.y = y1;
        item.z = z2;

        // Update DOM directly — no React re-render
        const scale = (z2 + 1.5) / 2.5;
        const opacity = Math.max(0.2, (z2 + 1) / 2);
        const node = nodes[i];
        const elStyle = node.el.style;
        const iconStyle = node.iconBox.style;
        const px = x1 * radius;
        const py = y1 * radius;
        const blur = 8 + scale * 8;
        const spread = 2 + scale * 2;
        const shadowAlpha = 0.2 + scale * 0.2;

        elStyle.transform = "translate3d(" + px + "px," + py + "px,0) scale(" + scale + ")";
        elStyle.opacity = opacity;
        elStyle.zIndex = (z2 * 10 + 10) | 0;
        iconStyle.boxShadow = "0 0 " + blur + "px " + spread + "px rgba(145,94,255," + shadowAlpha + ")";
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animRef.current);
      try {
        nodesRef.current.forEach((n) => n.el.remove());
      } catch {
        // DOM nodes already cleaned up
      }
    };
  }, []);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseRef.current = {
      x: e.clientX - rect.left - rect.width / 2,
      y: e.clientY - rect.top - rect.height / 2,
    };
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { mouseRef.current = { x: 0, y: 0 }; }}
      className="relative w-full h-[400px] sm:h-[500px] flex items-center justify-center"
      style={{ perspective: 800 }}
    />
  );
};

export default SkillGlobe;
