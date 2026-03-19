import { useRef, useEffect, useState } from "react";

/**
 * SVG border-trace animation: line splits from top-center,
 * follows the card's rounded corners, meets at bottom-center.
 * Must be placed OUTSIDE the card's overflow-hidden container,
 * inside a `relative group` wrapper.
 */
const CardBorderTrace = ({ color, borderRadius = 16 }) => {
  const wrapRef = useRef(null);
  const [dims, setDims] = useState(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    let timer = null;
    const update = () => {
      const { width, height } = el.getBoundingClientRect();
      if (width > 0 && height > 0) setDims({ w: width, h: height });
    };
    const debouncedUpdate = () => {
      clearTimeout(timer);
      timer = setTimeout(update, 100);
    };
    update();
    const ro = new ResizeObserver(debouncedUpdate);
    ro.observe(el);
    return () => {
      clearTimeout(timer);
      ro.disconnect();
    };
  }, []);

  const r = borderRadius;
  const s = 1; // stroke inset from card edge in px

  let right = "";
  let left = "";
  if (dims) {
    const { w, h } = dims;
    right = `M${w / 2},${s} L${w - r},${s} Q${w - s},${s} ${w - s},${r} L${w - s},${h - r} Q${w - s},${h - s} ${w - r},${h - s} L${w / 2},${h - s}`;
    left  = `M${w / 2},${s} L${r},${s} Q${s},${s} ${s},${r} L${s},${h - r} Q${s},${h - s} ${r},${h - s} L${w / 2},${h - s}`;
  }

  return (
    <div
      ref={wrapRef}
      className="absolute inset-0 pointer-events-none"
      aria-hidden="true"
    >
      {dims && (
        <svg width={dims.w} height={dims.h}>
          <path
            d={right}
            fill="none"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            pathLength="1"
            strokeDasharray="1"
            className="card-border-path"
          />
          <path
            d={left}
            fill="none"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            pathLength="1"
            strokeDasharray="1"
            className="card-border-path"
          />
        </svg>
      )}
    </div>
  );
};

export default CardBorderTrace;
