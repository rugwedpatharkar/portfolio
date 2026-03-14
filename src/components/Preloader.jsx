import { useState, useEffect, useRef } from "react";

const BOOT_LINES = [
  { text: "> booting rugwed_portfolio v2.0...", delay: 0 },
  { text: "> loading modules............... done", delay: 400 },
  { text: "> initializing 3D engine....... done", delay: 800 },
  { text: "> compiling stylesheets........ done", delay: 1100 },
  { text: "> establishing connection...... ready", delay: 1400 },
  { text: "", delay: 1600 },
  { text: "> welcome, visitor.", delay: 1700, accent: true },
];

const Preloader = () => {
  const [loaded, setLoaded] = useState(false);
  const [visibleLines, setVisibleLines] = useState(0);
  const [cursorVisible, setCursorVisible] = useState(true);
  const readyRef = useRef(false);

  useEffect(() => {
    const handleLoad = () => {
      readyRef.current = true;
    };

    if (document.readyState === "complete") {
      readyRef.current = true;
    } else {
      window.addEventListener("load", handleLoad);
    }

    // Sequentially reveal boot lines
    BOOT_LINES.forEach((line, i) => {
      setTimeout(() => setVisibleLines(i + 1), line.delay);
    });

    // After last line, wait a beat then fade out (only if page loaded)
    const finalDelay = BOOT_LINES[BOOT_LINES.length - 1].delay + 600;
    const checkAndFinish = () => {
      if (readyRef.current) {
        setLoaded(true);
      } else {
        // Page not loaded yet, check again shortly
        setTimeout(checkAndFinish, 200);
      }
    };
    setTimeout(checkAndFinish, finalDelay);

    // Cursor blink
    const cursorInterval = setInterval(() => setCursorVisible((v) => !v), 530);

    return () => {
      window.removeEventListener("load", handleLoad);
      clearInterval(cursorInterval);
    };
  }, []);

  return (
    <div className={`preloader ${loaded ? "loaded" : ""}`}>
      <div className="w-full max-w-lg px-6">
        <div className="font-mono text-sm sm:text-base space-y-1.5">
          {BOOT_LINES.slice(0, visibleLines).map((line, i) => (
            <div
              key={i}
              className={`${line.accent ? "text-[#00cea8]" : "text-[#915eff]/80"} whitespace-pre`}
              style={{ animation: "fadeInLine 0.2s ease forwards" }}
            >
              {line.text}
              {line.text.includes("done") && (
                <span className="text-[#00cea8]"> ✓</span>
              )}
              {line.text.includes("ready") && (
                <span className="text-[#00cea8]"> ✓</span>
              )}
            </div>
          ))}
          {visibleLines > 0 && (
            <span
              className={`inline-block w-2.5 h-5 bg-[#915eff] mt-1 ${
                cursorVisible ? "opacity-100" : "opacity-0"
              }`}
              style={{ transition: "opacity 0.1s" }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Preloader;
