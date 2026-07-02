"use client";
/*
 * Projects (Jupiter) — Technical wireframe schematic. Each project is a
 * V3Schematic panel with signature title tick, Fraunces name, one-line
 * description, features (2-3), tags, stat highlight, tick-arrow link. Panels
 * arranged in an editorial asymmetric composition. Scan direction: plot.
 */
import { projects } from "../../../content";
import { V3Frame, V3Callout, V3Schematic, V3Channel } from "../primitives";

export default function ProjectsSection({ index, bootNonce }) {
  const list = (projects || []).slice(0, 7);
  return (
    <V3Frame section="Projects" planet="JUPITER" index={index} scanDir="plot" scanKey={bootNonce}>
      <div style={{ gridArea: "left / left / right-top / right-top", display: "flex", flexDirection: "column", gap: 20, minWidth: 0 }}>
        <V3Callout size="s4" emphasis="that shipped">Mission files</V3Callout>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
          {list.map((p, i) => {
            const feats = (p.features || []).slice(0, 3);
            const tags = (p.tags || []).slice(0, 5).map((t) => t.name || t);
            const stat = p.highlight || p.stats?.[0] || null;
            return (
              <V3Schematic
                key={i}
                label={`${p.status || "project"} · ${p.year || ""}`}
                scanDelay={0.18 + i * 0.07}
              >
                <div style={{ font: `400 1.05rem var(--v3-font-serif)`, color: "var(--v3-fg)", lineHeight: 1.15, letterSpacing: "-.01em", margin: "0 0 8px", fontOpticalSizing: "auto" }}>
                  {p.name}
                </div>
                <p style={{ font: `300 var(--v3-type-cap) var(--v3-font-ui)`, color: "var(--v3-fg-dim)", lineHeight: 1.55, margin: "0 0 12px" }}>
                  {p.description}
                </p>
                {feats.length > 0 && (
                  <ul style={{ listStyle: "none", padding: 0, margin: "0 0 12px", display: "flex", flexDirection: "column", gap: 4 }}>
                    {feats.map((f, k) => (
                      <li key={k} style={{ font: `300 var(--v3-type-cap) var(--v3-font-ui)`, color: "var(--v3-fg-dim)", paddingLeft: 22, position: "relative", lineHeight: 1.5 }}>
                        <span aria-hidden style={{ position: "absolute", left: 0, top: 1, font: `400 9px var(--v3-font-mono)`, color: "var(--v3-fg-mute)", letterSpacing: ".08em" }}>{String(k + 1).padStart(2, "0")}</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                )}
                {tags.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: stat || p.github ? 12 : 0 }}>
                    {tags.map((t, k) => (
                      <span key={k} style={{ font: `400 9px var(--v3-font-mono)`, color: "var(--v3-fg-dim)", border: "1px solid var(--v3-line-strong)", borderRadius: 999, padding: "2px 8px", letterSpacing: ".1em", textTransform: "uppercase" }}>{t}</span>
                    ))}
                  </div>
                )}
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, marginTop: 6 }}>
                  {stat && (
                    <V3Channel label={stat.label} size="sm" scanDelay={0} tick={false} style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ font: `340 1.05rem var(--v3-font-display)`, color: "var(--v3-fg)" }}>{stat.value}</span>
                    </V3Channel>
                  )}
                  {p.github && (
                    <a href={p.github} target="_blank" rel="noreferrer"
                      style={{ font: `400 var(--v3-type-cap) var(--v3-font-mono)`, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--v3-accent)", textDecoration: "none", whiteSpace: "nowrap" }}>
                      Open →
                    </a>
                  )}
                </div>
              </V3Schematic>
            );
          })}
        </div>
      </div>
    </V3Frame>
  );
}
