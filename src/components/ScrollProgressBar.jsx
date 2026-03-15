import { useRef, useEffect, useState, useCallback } from "react";

const MILESTONES = [
  { id: "about", label: "About", icon: "👤" },
  { id: "experience", label: "Experience", icon: "💼" },
  { id: "skills", label: "Skills", icon: "⚡" },
  { id: "projects", label: "Projects", icon: "🚀" },
  { id: "education", label: "Education", icon: "🎓" },
  { id: "contact", label: "Contact", icon: "✉️" },
];

const ScrollProgressBar = () => {
  const barRef = useRef(null);
  const [activeSection, setActiveSection] = useState("");

  // Scroll progress (ref-based, no re-renders)
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? scrollTop / docHeight : 0;
        if (barRef.current) {
          barRef.current.style.transform = `scaleX(${progress})`;
        }
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Track active section via IntersectionObserver
  useEffect(() => {
    const observers = [];
    MILESTONES.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(id);
        },
        { threshold: 0.3 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-[50] group">
      {/* Progress track */}
      <div className="h-[2px] bg-white/[0.04]">
        <div
          ref={barRef}
          className="h-full bg-gradient-to-r from-[#915eff] to-[#00cea8] origin-left"
          style={{ transform: "scaleX(0)" }}
        />
      </div>

      {/* Milestone dots — visible on hover */}
      <div className="absolute top-0 left-0 right-0 flex justify-between px-[10%] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {MILESTONES.map((m) => (
          <button
            key={m.id}
            onClick={() => document.getElementById(m.id)?.scrollIntoView({ behavior: "smooth" })}
            className="relative -top-1 group/dot"
            aria-label={`Scroll to ${m.label}`}
          >
            <span
              className={`block w-3 h-3 rounded-full border-2 transition-all duration-300 ${
                activeSection === m.id
                  ? "bg-[#915eff] border-[#915eff] shadow-[0_0_8px_rgba(145,94,255,0.5)] scale-125"
                  : "bg-primary border-white/20 hover:border-white/40"
              }`}
            />
            {/* Tooltip */}
            <span className="absolute top-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-micro font-mono text-white/60 bg-primary/90 backdrop-blur-sm px-2 py-0.5 rounded opacity-0 group-hover/dot:opacity-100 transition-opacity pointer-events-none border border-white/[0.06]">
              {m.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ScrollProgressBar;
