import { useState, useEffect } from "react";

const ScrollProgressBar = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const totalHeight =
          document.documentElement.scrollHeight - window.innerHeight;
        if (totalHeight > 0) {
          setScrollProgress((window.scrollY / totalHeight) * 100);
        }
        ticking = false;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className="fixed top-0 left-0 h-[3px] z-[60] bg-[#915eff]"
      style={{ width: `${scrollProgress}%`, boxShadow: "0 0 10px rgba(145, 94, 255, 0.6), 0 0 20px rgba(145, 94, 255, 0.3)" }}
    />
  );
};

export default ScrollProgressBar;
