"use client";
/*
 * Hobbies (Neptune) — Cinematic portrait grid. 8 V3Schematic mini-vignettes with
 * editorial gutters. Emoji as scanned marker, name in Instrument Serif, tagline
 * as mono channel, stat as V3Channel. Hover swaps tagline↔detail via a subtle
 * fade. Scan direction: radial.
 */
import { useState } from "react";
import { hobbies } from "../../../content";
import { V3Frame, V3Callout, V3Schematic, V3Channel } from "../primitives";

function HobbyTile({ h, delay }) {
  const [hover, setHover] = useState(false);
  return (
    <V3Schematic
      label={h.stat?.label || "PURSUIT"}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      scanDelay={delay}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 6 }}>
        <span aria-hidden style={{ fontSize: "1.15rem" }}>{h.icon}</span>
        <span style={{ font: `400 1rem var(--v3-font-serif)`, color: "var(--v3-fg)", lineHeight: 1.2, letterSpacing: "-.01em" }}>{h.name}</span>
      </div>
      {/* tagline ↔ detail crossfade (grid-rows-1 trick) */}
      <div style={{ display: "grid", gridTemplateRows: "1fr", gridTemplateColumns: "1fr", minHeight: 60 }}>
        <p style={{ gridArea: "1 / 1", font: `300 var(--v3-type-cap) var(--v3-font-ui)`, color: "var(--v3-fg-dim)", lineHeight: 1.5, margin: 0, opacity: hover ? 0 : 1, transition: "opacity .28s ease" }}>
          {h.tagline}
        </p>
        <p style={{ gridArea: "1 / 1", font: `300 var(--v3-type-cap) var(--v3-font-ui)`, color: "var(--v3-fg-dim)", lineHeight: 1.5, margin: 0, opacity: hover ? 1 : 0, transition: "opacity .28s ease" }}>
          {h.detail}
        </p>
      </div>
      {h.stat && (
        <V3Channel label={h.stat.label} size="sm" scanDelay={0} tick={false} style={{ marginTop: 10 }}>
          <span style={{ font: `340 1rem var(--v3-font-display)`, color: "var(--v3-fg)" }}>{h.stat.value}</span>
        </V3Channel>
      )}
    </V3Schematic>
  );
}

export default function HobbiesSection({ index, bootNonce }) {
  return (
    <V3Frame section="Hobbies" planet="NEPTUNE" index={index} scanDir="radial" scanKey={bootNonce}>
      <div style={{ gridArea: "left / left / right-top / right-top", display: "flex", flexDirection: "column", gap: 20, minWidth: 0 }}>
        <V3Callout size="s4" emphasis="the code">Beyond</V3Callout>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 12 }}>
          {(hobbies || []).map((h, i) => (
            <HobbyTile key={i} h={h} delay={0.16 + i * 0.055} />
          ))}
        </div>
      </div>
    </V3Frame>
  );
}
