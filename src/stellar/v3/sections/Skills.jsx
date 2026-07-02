"use client";
/*
 * Skills (Ceres) — Constellation-map schematic. 9 category clusters plotted
 * across the frame like a star chart. Each category label is a mono channel;
 * chips fan out around the category node. Hover a category brightens its rule.
 * Scan direction: orbit.
 */
import { useState } from "react";
import { skills } from "../../../content";
import { V3Frame, V3Callout, V3Constellation } from "../primitives";

/* Hand-composed positions for the 9 categories — plotted across the left/right
   zones so they don't overlap each other or the planet's centre area. */
const POS = [
  { x: 12, y: 12 },   // Languages         — upper-left
  { x: 40, y: 8 },    // AI & Agentic AI   — upper-mid
  { x: 74, y: 15 },   // Backend           — upper-right
  { x: 10, y: 40 },   // Frontend          — mid-left
  { x: 40, y: 44 },   // Databases         — mid-mid
  { x: 76, y: 44 },   // Distributed Sys   — mid-right
  { x: 14, y: 76 },   // Cloud & DevOps    — lower-left
  { x: 46, y: 82 },   // Messaging         — lower-mid
  { x: 78, y: 78 },   // Testing           — lower-right
];

function Cluster({ cat, list, hover, onEnter, onLeave }) {
  return (
    <div
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      style={{
        display: "flex", flexDirection: "column", gap: 6,
        padding: 8,
        border: "1px solid var(--v3-line)",
        borderColor: hover ? "var(--v3-accent)" : "var(--v3-line)",
        borderRadius: 6,
        background: hover ? "color-mix(in oklab, var(--v3-accent) 6%, transparent)" : "color-mix(in oklab, var(--v3-bg-void) 55%, transparent)",
        transition: "border-color .2s, background .2s",
        minWidth: 210, maxWidth: 260,
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span aria-hidden style={{ display: "inline-block", width: 8, height: 1, background: "var(--v3-accent)", marginBottom: 4 }} />
        <div style={{ font: `400 10px var(--v3-font-mono)`, letterSpacing: ".2em", textTransform: "uppercase", color: hover ? "var(--v3-accent)" : "var(--v3-fg-mute)" }}>
          {cat}
        </div>
        <span style={{ marginLeft: "auto", font: `400 9px var(--v3-font-mono)`, color: "var(--v3-fg-mute)" }}>{list.length}</span>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
        {list.map((s, i) => (
          <span key={i} title={`${s.name} · ${s.level}%`} style={{
            font: `300 10px var(--v3-font-mono)`,
            color: hover ? "var(--v3-fg)" : "var(--v3-fg-dim)",
            border: "1px solid var(--v3-line-strong)",
            borderRadius: 999, padding: "2px 8px",
            letterSpacing: ".04em",
            transition: "color .2s",
          }}>{s.name}</span>
        ))}
      </div>
    </div>
  );
}

export default function SkillsSection({ index, bootNonce }) {
  const [hovered, setHovered] = useState(-1);
  const cats = Object.entries(skills);
  const nodes = cats.map(([cat, list], i) => ({
    id: `cat-${i}`,
    x: POS[i]?.x ?? 50,
    y: POS[i]?.y ?? 50,
    w: 260,
    render: (
      <Cluster
        cat={cat}
        list={list || []}
        hover={hovered === i}
        onEnter={() => setHovered(i)}
        onLeave={() => setHovered(-1)}
      />
    ),
  }));

  return (
    <V3Frame section="Skills" planet="CERES" index={index} scanDir="orbit" scanKey={bootNonce}
      gridAreas={`"top" "left" "left" "bottom"`}>
      <div style={{ gridArea: "top", display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 22, flexWrap: "wrap" }}>
        <V3Callout size="s5" emphasis="chart">Skill</V3Callout>
        <p style={{ font: `300 var(--v3-type-cap) var(--v3-font-ui)`, color: "var(--v3-fg-dim)", lineHeight: 1.55, margin: 0, maxWidth: "42ch" }}>
          Nine clusters plotted across the frame — hover to lift a category and read its stack.
        </p>
      </div>
      <div style={{ gridArea: "left" }}>
        <V3Constellation nodes={nodes} height={480} scanDelay={0.22} />
      </div>
    </V3Frame>
  );
}
