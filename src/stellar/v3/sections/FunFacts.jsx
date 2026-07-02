"use client";
/*
 * Fun facts (Mercury) — Instrument dashboard. 8 stats laid out as HUD gauges in
 * a two-column schematic grid across the frame. Each channel: icon + ticker
 * value + label + detail line. Scan direction: radial.
 */
import { funFacts } from "../../../content";
import { V3Frame, V3Schematic, V3Ticker } from "../primitives";

export default function FunFactsSection({ index, bootNonce }) {
  return (
    <V3Frame section="Fun facts" planet="MERCURY" index={index} scanDir="radial" scanKey={bootNonce}
      gridAreas={`"top top" "left right-top" "left right-top" "bottom bottom"`}>
      <div style={{ gridArea: "left", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, gridAutoRows: "min-content", alignContent: "start" }}>
        {funFacts.slice(0, 4).map((f, i) => (
          <V3Schematic key={i} label={f.label} scanDelay={0.15 + i * 0.06}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span aria-hidden style={{ fontSize: "1.05rem" }}>{f.icon}</span>
              <span style={{ font: `340 2.2rem var(--v3-font-display)`, letterSpacing: "-.01em", color: "var(--v3-fg)", fontOpticalSizing: "auto" }}>
                <V3Ticker value={f.value} suffix={f.suffix || ""} />
              </span>
            </div>
            <p style={{ font: `300 var(--v3-type-cap) var(--v3-font-ui)`, color: "var(--v3-fg-dim)", lineHeight: 1.5, margin: "10px 0 0" }}>{f.detail}</p>
          </V3Schematic>
        ))}
      </div>
      <div style={{ gridArea: "right-top", display: "grid", gridTemplateColumns: "1fr", gap: 14, gridAutoRows: "min-content", alignContent: "start" }}>
        {funFacts.slice(4).map((f, i) => (
          <V3Schematic key={i} label={f.label} scanDelay={0.25 + i * 0.06}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span aria-hidden style={{ fontSize: "1rem" }}>{f.icon}</span>
              <span style={{ font: `340 1.8rem var(--v3-font-display)`, letterSpacing: "-.01em", color: "var(--v3-fg)", fontOpticalSizing: "auto" }}>
                <V3Ticker value={f.value} suffix={f.suffix || ""} />
              </span>
            </div>
            <p style={{ font: `300 var(--v3-type-cap) var(--v3-font-ui)`, color: "var(--v3-fg-dim)", lineHeight: 1.5, margin: "8px 0 0" }}>{f.detail}</p>
          </V3Schematic>
        ))}
      </div>
    </V3Frame>
  );
}
