/* eslint-disable react/prop-types */
/* eslint-disable react/no-unknown-property */
import { Html } from "@react-three/drei";
import { DESTINATIONS } from "../config/destinations";

/*
 * One small HTML label per destination, anchored to its scene position.
 * The active destination's label is fully visible; nearby ones are dimmed;
 * far ones fade out completely. Lightweight CSS opacity transition does
 * the work — no per-frame JS.
 */

const Label = ({ d, active, near }) => {
  const opacity = active ? 0.95 : near ? 0.45 : 0;
  const scale = active ? 1.04 : 1.0;
  return (
    <Html
      position={d.position}
      center
      distanceFactor={10}
      style={{
        pointerEvents: "none",
        opacity,
        transform: `translateY(-${(d.radius || 0.5) * 18 + 10}px) scale(${scale})`,
        transition: "opacity 280ms ease, transform 280ms ease",
        whiteSpace: "nowrap",
        textAlign: "center",
        userSelect: "none",
      }}
    >
      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 13,
          fontWeight: 600,
          color: "white",
          letterSpacing: "0.04em",
          textShadow: "0 1px 8px rgba(0,0,0,0.65)",
        }}
      >
        {d.label}
      </div>
      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 9.5,
          color: d.color,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          marginTop: 2,
          textShadow: "0 1px 6px rgba(0,0,0,0.65)",
        }}
      >
        {d.section}
      </div>
    </Html>
  );
};

const PlanetLabels = ({ activeIdx }) => (
  <>
    {DESTINATIONS.map((d, i) => {
      const dist = Math.abs(i - activeIdx);
      const active = dist === 0;
      const near = dist === 1;
      if (dist > 1) return null;
      return <Label key={d.id} d={d} active={active} near={near} />;
    })}
  </>
);

export default PlanetLabels;
