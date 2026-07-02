"use client";
/*
 * Education (Uranus) — Horizontal drill-down: 4 degree nodes on a V3Circuit
 * horizontal strip, each with a small SVG progress ring for the score. Below
 * each node: school + year + highlight bullets. Scan direction: circuit.
 */
import { educations } from "../../../content";
import { V3Frame, V3Callout, V3Circuit, V3Channel } from "../primitives";

const RING = ({ pct = 0 }) => {
  const r = 22;
  const c = 2 * Math.PI * r;
  const dash = c * (pct / 100);
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" aria-hidden style={{ display: "block" }}>
      <circle cx="28" cy="28" r={r} stroke="var(--v3-line)" strokeWidth="2" fill="none" />
      <circle cx="28" cy="28" r={r} stroke="var(--v3-accent)" strokeWidth="2" fill="none"
        strokeDasharray={`${dash} ${c - dash}`} strokeDashoffset={c / 4} strokeLinecap="round"
        style={{ transformOrigin: "center", transform: "rotate(-90deg)" }} />
      <text x="28" y="32" textAnchor="middle" style={{ fill: "var(--v3-fg)", font: "400 12px var(--v3-font-mono)", letterSpacing: ".04em" }}>
        {Math.round(pct)}%
      </text>
    </svg>
  );
};

export default function EducationSection({ index, bootNonce }) {
  const nodes = (educations || []).map((e, i) => ({
    id: `edu-${i}`,
    render: (
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
          <RING pct={e.percentage || 0} />
          <div style={{ minWidth: 0 }}>
            <div style={{ font: `400 10px var(--v3-font-mono)`, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--v3-fg-mute)" }}>
              {e.shortName || e.level}
            </div>
            <div style={{ font: `400 1rem var(--v3-font-serif)`, color: "var(--v3-fg)", lineHeight: 1.15, letterSpacing: "-.005em", marginTop: 2, fontOpticalSizing: "auto" }}>
              {e.degree}
            </div>
          </div>
        </div>
        <V3Channel label={e.year} scanDelay={0} size="sm" tick={false}>
          <span style={{ font: `300 var(--v3-type-cap) var(--v3-font-ui)`, color: "var(--v3-fg-dim)" }}>{e.name}</span>
        </V3Channel>
        {e.highlights?.length > 0 && (
          <ul style={{ listStyle: "none", padding: 0, margin: "10px 0 0", display: "flex", flexDirection: "column", gap: 4 }}>
            {e.highlights.map((h, k) => (
              <li key={k} style={{ font: `300 var(--v3-type-cap) var(--v3-font-ui)`, color: "var(--v3-fg-dim)", paddingLeft: 12, position: "relative", lineHeight: 1.5 }}>
                <span aria-hidden style={{ position: "absolute", left: 0, color: "var(--v3-accent)" }}>—</span>{h}
              </li>
            ))}
          </ul>
        )}
      </div>
    ),
  }));

  return (
    <V3Frame section="Education" planet="URANUS" index={index} scanDir="circuit" scanKey={bootNonce}>
      <div style={{ gridArea: "left / left / right-top / right-top", display: "flex", flexDirection: "column", gap: 22, minWidth: 0 }}>
        <V3Callout size="s4" emphasis="of the engineer">Formation</V3Callout>
        <V3Circuit mode="horizontal" nodes={nodes} gap={22} />
      </div>
    </V3Frame>
  );
}
