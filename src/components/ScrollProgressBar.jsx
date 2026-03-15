import { useRef, useEffect, useState } from "react";

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
  const [scrolled, setScrolled] = useState(false);

  // Scroll progress (ref-based, no re-renders for bar)
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
        setScrolled(scrollTop > 200);
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Track active section via IntersectionObserver
  useEffect(() => {
    const visibilityMap = {};
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          visibilityMap[entry.target.id] = entry.intersectionRatio;
        });
        let bestId = null;
        let bestRatio = 0;
        for (const { id } of MILESTONES) {
          if ((visibilityMap[id] || 0) > bestRatio) {
            bestRatio = visibilityMap[id];
            bestId = id;
          }
        }
        if (bestId && bestRatio > 0) setActiveSection(bestId);
      },
      { threshold: [0, 0.2, 0.4, 0.6, 0.8, 1] }
    );

    MILESTONES.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const activeLabel = MILESTONES.find((m) => m.id === activeSection);

  return (
    <div className="fixed top-0 left-0 right-0 z-[50] group">
      {/* Progress track */}
      <div className="h-[2px] bg-white/[0.04]">
        <div
          ref={barRef}
          className="h-full bg-gradient-to-r from-[#915eff] to-[#00cea8] origin-left bar-wave"
          style={{ transform: "scaleX(0)" }}
        />
      </div>

      {/* Active section label — always visible when scrolled */}
      {scrolled && activeLabel && (
        <div className="absolute top-[6px] left-1/2 -translate-x-1/2 pointer-events-none">
          <span
            key={activeLabel.id}
            className="inline-flex items-center gap-1.5 font-mono text-micro px-2.5 py-1 rounded-full border border-[#915eff]/20 bg-primary/80 backdrop-blur-sm text-white/50 scroll-progress-label"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#915eff] animate-pulse" />
            {activeLabel.label}
          </span>
        </div>
      )}

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
