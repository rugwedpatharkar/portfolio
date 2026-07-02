"use client";
/*
 * V3Constellation — spatial-map layout: children plotted by (x, y) percentages as
 * if on a chart. Each child slot is a mini-node with an optional label and rule.
 * Used for Skills — 9 categories arranged like constellations across the frame.
 *
 * Renders inside a `position: relative` container; children are absolutely
 * positioned by their `x,y` coords (0–100 percent), centered on those points.
 */
import V3Scan from "./V3Scan";

export default function V3Constellation({ nodes = [], height = 460, scanDelay = 0.2, children }) {
  return (
    <V3Scan delay={scanDelay}>
      <div style={{ position: "relative", width: "100%", height, minHeight: 320 }}>
        {/* faint background survey grid — coordinate ticks every 20% */}
        <svg aria-hidden width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.18 }}>
          {[20, 40, 60, 80].map((p) => (
            <g key={p}>
              <line x1={`${p}%`} y1="0" x2={`${p}%`} y2="100%" stroke="var(--v3-line)" strokeWidth="1" strokeDasharray="2 6" />
              <line x1="0" y1={`${p}%`} x2="100%" y2={`${p}%`} stroke="var(--v3-line)" strokeWidth="1" strokeDasharray="2 6" />
            </g>
          ))}
        </svg>
        {nodes.map((n, i) => (
          <div key={n.id || i} style={{ position: "absolute", left: `${n.x}%`, top: `${n.y}%`, transform: "translate(-50%, -50%)", maxWidth: n.w || 220 }}>
            {n.render}
          </div>
        ))}
        {children}
      </div>
    </V3Scan>
  );
}
