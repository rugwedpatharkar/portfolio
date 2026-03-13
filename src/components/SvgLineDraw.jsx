/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";

const SvgLineDraw = ({ className = "", variant = "circuit" }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const paths = {
    circuit: (
      <>
        <path
          d="M0 40 Q 80 10, 160 40 T 320 40 T 480 40 T 640 40"
          className="svg-draw-path"
          style={{ animationDelay: "0s" }}
        />
        <path
          d="M0 60 Q 80 90, 160 60 T 320 60 T 480 60 T 640 60"
          className="svg-draw-path"
          style={{ animationDelay: "0.3s" }}
        />
        <circle cx="160" cy="40" r="4" className="svg-draw-dot" style={{ animationDelay: "0.8s" }} />
        <circle cx="320" cy="60" r="4" className="svg-draw-dot" style={{ animationDelay: "1.1s" }} />
        <circle cx="480" cy="40" r="4" className="svg-draw-dot" style={{ animationDelay: "1.4s" }} />
      </>
    ),
    wave: (
      <>
        <path
          d="M0 50 C 40 20, 80 80, 120 50 S 200 20, 240 50 S 320 80, 360 50 S 440 20, 480 50 S 560 80, 600 50 S 640 20, 640 50"
          className="svg-draw-path"
          style={{ animationDelay: "0s" }}
        />
        <path
          d="M0 50 C 40 80, 80 20, 120 50 S 200 80, 240 50 S 320 20, 360 50 S 440 80, 480 50 S 560 20, 600 50 S 640 80, 640 50"
          className="svg-draw-path svg-draw-path-alt"
          style={{ animationDelay: "0.5s" }}
        />
      </>
    ),
    nodes: (
      <>
        <line x1="80" y1="30" x2="200" y2="70" className="svg-draw-path" style={{ animationDelay: "0s" }} />
        <line x1="200" y1="70" x2="340" y2="25" className="svg-draw-path" style={{ animationDelay: "0.3s" }} />
        <line x1="340" y1="25" x2="460" y2="65" className="svg-draw-path" style={{ animationDelay: "0.6s" }} />
        <line x1="460" y1="65" x2="580" y2="35" className="svg-draw-path" style={{ animationDelay: "0.9s" }} />
        <circle cx="80" cy="30" r="5" className="svg-draw-dot" style={{ animationDelay: "0.2s" }} />
        <circle cx="200" cy="70" r="5" className="svg-draw-dot" style={{ animationDelay: "0.5s" }} />
        <circle cx="340" cy="25" r="5" className="svg-draw-dot" style={{ animationDelay: "0.8s" }} />
        <circle cx="460" cy="65" r="5" className="svg-draw-dot" style={{ animationDelay: "1.1s" }} />
        <circle cx="580" cy="35" r="5" className="svg-draw-dot" style={{ animationDelay: "1.4s" }} />
      </>
    ),
  };

  return (
    <div ref={ref} className={`w-full overflow-hidden ${className}`}>
      <svg
        viewBox="0 0 640 100"
        preserveAspectRatio="none"
        className={`w-full h-[40px] sm:h-[60px] ${visible ? "svg-draw-active" : ""}`}
      >
        {paths[variant]}
      </svg>
    </div>
  );
};

export default SvgLineDraw;
