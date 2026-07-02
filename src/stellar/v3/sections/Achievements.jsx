"use client";
/*
 * Achievements (Mars) — 8-node milestone circuit. 4×2 grid of accent-glowing
 * nodes with connecting wires implied by the V3Circuit grid layout. Each node
 * has emoji + year channel + title + short blurb. Scan direction: circuit.
 */
import { achievements } from "../../../content";
import { V3Frame, V3Callout, V3Circuit, V3Schematic } from "../primitives";

export default function AchievementsSection({ index, bootNonce }) {
  const nodes = (achievements || []).map((a, i) => ({
    id: `ach-${i}`,
    render: (
      <V3Schematic
        label={a.year ? `LOGGED ${a.year}` : "MILESTONE"}
        scanDelay={0}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 6 }}>
          <span aria-hidden style={{ fontSize: "1.1rem" }}>{a.icon}</span>
          <span style={{ font: `400 .98rem var(--v3-font-serif)`, color: "var(--v3-fg)", lineHeight: 1.2, letterSpacing: "-.01em" }}>{a.title}</span>
        </div>
        <p style={{ font: `300 var(--v3-type-cap) var(--v3-font-ui)`, color: "var(--v3-fg-dim)", lineHeight: 1.5, margin: 0 }}>{a.description}</p>
      </V3Schematic>
    ),
  }));

  return (
    <V3Frame section="Achievements" planet="MARS" index={index} scanDir="circuit" scanKey={bootNonce}>
      <div style={{ gridArea: "left / left / right-top / right-top", display: "flex", flexDirection: "column", gap: 22, minWidth: 0 }}>
        <V3Callout size="s4" emphasis="worth charting">Milestones</V3Callout>
        <V3Circuit mode="grid" cols={4} nodes={nodes} gap={14} />
      </div>
    </V3Frame>
  );
}
