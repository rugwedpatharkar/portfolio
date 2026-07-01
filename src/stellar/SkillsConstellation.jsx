 
import { useMemo } from "react";

/*
 * Jupiter's "galaxy of skills" as an actual constellation: each skill is a star
 * (size + brightness = proficiency), grouped into per-category clusters joined
 * to a hub by faint lines. Pure SVG (no 3D), so it's crisp + cheap and sits
 * atop the existing skill bars. Deterministic layout (golden-angle spread).
 */
const W = 320, H = 196, PAD = 26;
const HUE = ["#ffb84d", "#4da6ff", "#a78bfa", "#8ea8ff", "#c08bff", "#7c9bff"];

const SkillsConstellation = ({ skills }) => {
  const { stars, links, labels } = useMemo(() => {
    const cats = Object.entries(skills);
    const cols = Math.min(3, cats.length);
    const rows = Math.ceil(cats.length / cols);
    const cw = (W - PAD * 2) / cols;
    const ch = (H - PAD * 2) / rows;
    const stars = [], links = [], labels = [];
    cats.forEach(([cat, items], ci) => {
      const cx = PAD + (ci % cols) * cw + cw / 2;
      const cy = PAD + Math.floor(ci / cols) * ch + ch / 2;
      const color = HUE[ci % HUE.length];
      // brightest skill is the hub
      const sorted = [...items].sort((a, b) => b.level - a.level);
      const hub = { x: cx, y: cy };
      sorted.forEach((s, i) => {
        const ang = i * 2.39996; // golden angle
        const rad = i === 0 ? 0 : 8 + (i % 5) * 6.2;
        const x = cx + Math.cos(ang) * rad;
        const y = cy + Math.sin(ang) * rad * 0.8;
        const r = 1.2 + (s.level / 100) * 2.4;
        const op = 0.4 + (s.level / 100) * 0.55;
        if (i > 0) links.push({ x1: hub.x, y1: hub.y, x2: x, y2: y, color, op: op * 0.4 });
        stars.push({ x, y, r, op, color, name: s.name, hub: i === 0 });
      });
      labels.push({ x: cx, y: cy + ch / 2 - 4, text: cat, color });
    });
    return { stars, links, labels };
  }, [skills]);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block", marginBottom: 10, filter: "drop-shadow(0 0 8px rgba(150,110,255,0.2))" }} role="img" aria-label="Skills constellation">
      {links.map((l, i) => (
        <line key={`l${i}`} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke={l.color} strokeWidth="0.5" opacity={l.op} />
      ))}
      {stars.map((s, i) => (
        <g key={`s${i}`}>
          {s.hub && <circle cx={s.x} cy={s.y} r={s.r + 3} fill={s.color} opacity={0.12} />}
          <circle cx={s.x} cy={s.y} r={s.r} fill={s.color} opacity={s.op}>
            <title>{s.name}</title>
          </circle>
        </g>
      ))}
      {labels.map((l, i) => (
        <text key={`t${i}`} x={l.x} y={l.y} fill={l.color} opacity="0.8" fontSize="6.5" fontFamily="'Martian Mono', monospace" textAnchor="middle" style={{ textTransform: "uppercase", letterSpacing: "0.06em" }}>{l.text}</text>
      ))}
    </svg>
  );
};

export default SkillsConstellation;
