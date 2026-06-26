 
import { SC, rgba } from "./ui/tokens";
import { DESTINATIONS } from "./config/destinations";
import { PLANET_FACTS } from "./data/planetFacts";

/*
 * Navicomputer — the cockpit's orrery radar. Top-down map of the system: Sun at
 * centre, the bodies on a compressed radial scale (so inner worlds don't bunch),
 * your blip pulsing on the active world with a heading line, and the AU /
 * light-time readout. Dots are clickable to jump. Static layout (authored t=0)
 * + React state for the blip → no per-frame work.
 */

const SIZE = 132;
const C = SIZE / 2;
const R = C - 10;

const NODES = (() => {
  const pts = DESTINATIONS.map((d) => {
    const [x, , z] = d.position;
    return { id: d.id, label: d.label, r: Math.hypot(x, z), a: Math.atan2(z, x) };
  });
  const maxR = Math.max(...pts.map((p) => p.r)) || 1;
  return pts.map((p) => ({ ...p, nr: Math.pow(p.r / maxR, 0.55) })); // compress inner spacing
})();

const MONO = "'JetBrains Mono', monospace";

export default function Navicomputer({ activeIdx = 0, onPlanet }) {
  const active = NODES[activeIdx];
  const dest = DESTINATIONS[activeIdx];
  const facts = PLANET_FACTS[dest?.section] || PLANET_FACTS[dest?.id];
  const ax = active ? C + active.nr * R * Math.cos(active.a) : C;
  const ay = active ? C + active.nr * R * Math.sin(active.a) : C;

  return (
    <div style={{ pointerEvents: "auto" }}>
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} aria-label="System navicomputer">
        <circle cx={C} cy={C} r={R} fill={rgba(SC.bg, 0.55)} stroke={rgba(SC.blueDim, 0.55)} strokeWidth="1" />
        {[0.33, 0.66, 1].map((f) => (
          <circle key={f} cx={C} cy={C} r={R * f} fill="none" stroke={rgba(SC.blue, 0.12)} strokeWidth="0.5" />
        ))}
        <line x1={C} y1={8} x2={C} y2={SIZE - 8} stroke={rgba(SC.blue, 0.1)} strokeWidth="0.5" />
        <line x1={8} y1={C} x2={SIZE - 8} y2={C} stroke={rgba(SC.blue, 0.1)} strokeWidth="0.5" />
        {active && <line x1={C} y1={C} x2={ax} y2={ay} stroke={rgba(SC.amber, 0.55)} strokeWidth="0.8" />}
        <circle cx={C} cy={C} r={3.2} fill={SC.amber} />
        {NODES.map((n, i) => {
          if (n.id === "sol") return null;
          const px = C + n.nr * R * Math.cos(n.a);
          const py = C + n.nr * R * Math.sin(n.a);
          const isA = i === activeIdx;
          return (
            <g key={n.id} onClick={() => onPlanet && onPlanet(i - activeIdx)} style={{ cursor: "pointer" }}>
              <circle cx={px} cy={py} r={6} fill="transparent" />
              <circle cx={px} cy={py} r={isA ? 3.4 : 1.8} fill={isA ? SC.amber : rgba(SC.blueInk, 0.85)} />
              {isA && (
                <circle cx={px} cy={py} r={6} fill="none" stroke={SC.amber} strokeWidth="0.8">
                  <animate attributeName="r" values="4;9;4" dur="1.9s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.8;0;0.8" dur="1.9s" repeatCount="indefinite" />
                </circle>
              )}
            </g>
          );
        })}
      </svg>
      <div style={{ fontFamily: MONO, marginTop: 3, textAlign: "center", lineHeight: 1.35 }}>
        <div style={{ color: SC.amberInk, fontSize: 9.5, letterSpacing: "0.1em" }}>{(active?.label || "").toUpperCase()}</div>
        <div style={{ color: rgba(SC.blueInk, 0.7), fontSize: 8 }}>{facts?.distance || ""}</div>
      </div>
    </div>
  );
}
