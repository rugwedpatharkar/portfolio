/*
 * V3SystemOverview — the stop-00 "system map": a crafted, premium schematic orrery.
 * The true-scale 3D world can't frame the 109×-Earth Sun AND all eight planets in one
 * shot, so the OVERVIEW is a to-taste schematic (like a classic solar-system diagram):
 * a large Sun anchored at the FAR-RIGHT edge, concentric dotted orbit arcs sweeping
 * left, each planet a labelled body on its arc, plus the asteroid belt. Info sits on
 * the left. On scroll it dissolves into the real 3D scene (HoloBridge unmounts the hero
 * branch past stop 0). Pure SVG/CSS — reliable + premium; motion respects reduced-motion.
 */
import { useRef, useEffect } from "react";

const CX = 1645; // sun centre (right edge, partly cropped)
const CY = 470;

/* r = orbit radius from the Sun, a = angle (deg, y-down), each planet's section is the
   v3 shifted mapping. Colours are each body's real hue. */
const PLANETS = [
  { name: "Mercury", section: "Fun facts", r: 305, a: 206, s: 7, c: "#9a8f83" },
  { name: "Venus", section: "Experience", r: 450, a: 156, s: 12, c: "#e6c98a" },
  { name: "Earth", section: "Projects", r: 605, a: 199, s: 13, c: "#5b8fd0" },
  { name: "Mars", section: "Achievements", r: 760, a: 149, s: 9, c: "#c1552e" },
  { name: "Jupiter", section: "Notes", r: 990, a: 193, s: 30, c: "#d8a875", ring: false },
  { name: "Saturn", section: "Education", r: 1195, a: 166, s: 23, c: "#e3c88a", ring: true },
  { name: "Uranus", section: "Hobbies", r: 1385, a: 184, s: 17, c: "#a9dbe0" },
  { name: "Neptune", section: "Testimonials", r: 1560, a: 176, s: 17, c: "#5a7fd6" },
];

const BELT_R = 872; // asteroid belt between Mars and Jupiter
const pt = (r, aDeg) => {
  const a = (aDeg * Math.PI) / 180;
  return [CX + r * Math.cos(a), CY + r * Math.sin(a)];
};

export default function V3SystemOverview() {
  const ref = useRef(null);

  /* Subtle pointer parallax — the whole map drifts a few px, damped, for depth. */
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let tx = 0, ty = 0, x = 0, y = 0, raf = 0;
    const onMove = (e) => {
      tx = (e.clientX / window.innerWidth - 0.5) * 26;
      ty = (e.clientY / window.innerHeight - 0.5) * 18;
    };
    const tick = () => {
      x += (tx - x) * 0.05; y += (ty - y) * 0.05;
      el.style.transform = `translate(${x}px, ${y}px)`;
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener("pointermove", onMove);
    raf = requestAnimationFrame(tick);
    return () => { window.removeEventListener("pointermove", onMove); cancelAnimationFrame(raf); };
  }, []);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none", overflow: "hidden" }}>
      {/* Soft scrim — mutes the true-scale 3D scene behind so the crisp schematic
          map reads clearly (the real Sun/stars remain a faint glow beneath). */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 100% at 82% 50%, rgba(5,6,9,0.34) 0%, rgba(5,6,9,0.66) 55%, rgba(5,6,9,0.82) 100%)" }} />
      <svg
        ref={ref}
        viewBox="0 0 1600 940"
        preserveAspectRatio="xMidYMid slice"
        style={{ width: "100%", height: "100%", display: "block" }}
      >
        <defs>
          <radialGradient id="v3sun" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fffdf6" />
            <stop offset="30%" stopColor="#fff3d0" />
            <stop offset="58%" stopColor="#f6d489" />
            <stop offset="80%" stopColor="#d99a3c" />
            <stop offset="100%" stopColor="rgba(180,120,40,0)" />
          </radialGradient>
          <radialGradient id="v3sunGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(255,225,160,0.5)" />
            <stop offset="60%" stopColor="rgba(255,205,120,0.12)" />
            <stop offset="100%" stopColor="rgba(255,205,120,0)" />
          </radialGradient>
          {/* left fade — keeps the info column readable over the map */}
          <linearGradient id="v3fade" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--v3-bg-void)" stopOpacity="0.92" />
            <stop offset="34%" stopColor="var(--v3-bg-void)" stopOpacity="0.5" />
            <stop offset="60%" stopColor="var(--v3-bg-void)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* orbit arcs — faint dashed ellipses centred on the Sun */}
        <g fill="none" stroke="var(--v3-line-strong)" strokeWidth="1.1" strokeDasharray="2 9" strokeLinecap="round">
          {PLANETS.map((p) => (
            <circle key={p.name} cx={CX} cy={CY} r={p.r} opacity={0.5}>
              <animate attributeName="stroke-dashoffset" from="0" to="44" dur={`${34 + p.r / 42}s`} repeatCount="indefinite" />
            </circle>
          ))}
          {/* asteroid belt — denser dotted band */}
          <circle cx={CX} cy={CY} r={BELT_R} stroke="var(--v3-fg-mute)" strokeWidth="7" strokeDasharray="1 7" opacity={0.35} />
        </g>

        {/* the Sun — anchored at the far-right edge, mostly cropped */}
        <circle cx={CX} cy={CY} r={560} fill="url(#v3sunGlow)" />
        <circle cx={CX} cy={CY} r={372} fill="url(#v3sun)" />

        {/* planets + labels */}
        {PLANETS.map((p) => {
          const [x, y] = pt(p.r, p.a);
          return (
            <g key={p.name}>
              {p.ring && (
                <ellipse cx={x} cy={y} rx={p.s * 2.05} ry={p.s * 0.66} fill="none" stroke={p.c} strokeWidth="2.4" opacity="0.7" transform={`rotate(-18 ${x} ${y})`} />
              )}
              <circle cx={x} cy={y} r={p.s} fill={p.c}>
                <animate attributeName="opacity" values="0.86;1;0.86" dur="6s" repeatCount="indefinite" />
              </circle>
              <text x={x} y={y - p.s - 12} fill="var(--v3-fg)" fontFamily="var(--v3-font-serif)" fontSize="26" fontStyle="italic" textAnchor="middle" opacity="0.92">{p.name}</text>
              <text x={x} y={y - p.s - 30} fill="var(--v3-fg-mute)" fontFamily="var(--v3-font-mono)" fontSize="12" letterSpacing="2" textAnchor="middle" style={{ textTransform: "uppercase" }}>{p.section}</text>
            </g>
          );
        })}

        {/* Sun label */}
        <text x={CX - 250} y={CY + 6} fill="var(--v3-bg-void)" fontFamily="var(--v3-font-serif)" fontSize="40" fontStyle="italic" textAnchor="middle" opacity="0.65">Sol</text>

        {/* left fade to protect the info column */}
        <rect x="0" y="0" width="1600" height="940" fill="url(#v3fade)" />
      </svg>
    </div>
  );
}
