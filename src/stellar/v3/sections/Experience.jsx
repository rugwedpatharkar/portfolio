"use client";
/*
 * Experience (Earth) — Drill-down cross-section. Vertical V3Circuit of roles on
 * the left as timeline nodes; each expanded role on the right shows metrics
 * (V3Channel grid), categories as horizontal schematic tracks (mono head + bullet
 * list, no accordion). Tags row on top. Scan direction: drill (top→bottom).
 */
import { useState } from "react";
import { experiences } from "../../../content";
import { V3Frame, V3Callout, V3Schematic, V3Channel, V3Circuit } from "../primitives";

export default function ExperienceSection({ index, bootNonce }) {
  const [active, setActive] = useState(0);
  const exp = experiences[active] || experiences[0];

  const timelineNodes = experiences.map((e, i) => ({
    id: `role-${i}`,
    render: (
      <button
        onClick={() => setActive(i)}
        aria-pressed={active === i}
        style={{
          all: "unset", cursor: "pointer", display: "block", width: "100%", padding: "6px 4px",
          borderLeft: `2px solid ${active === i ? "var(--v3-accent)" : "var(--v3-line)"}`,
          transition: "border-color .2s",
        }}
      >
        <div style={{ font: `400 10px var(--v3-font-mono)`, letterSpacing: ".18em", textTransform: "uppercase", color: active === i ? "var(--v3-accent)" : "var(--v3-fg-mute)", paddingLeft: 10 }}>
          {e.date}
        </div>
        <div style={{ font: `400 1rem var(--v3-font-serif)`, color: active === i ? "var(--v3-fg)" : "var(--v3-fg-dim)", lineHeight: 1.2, letterSpacing: "-.01em", paddingLeft: 10, marginTop: 4 }}>
          {e.companyName}
        </div>
        <div style={{ font: `300 var(--v3-type-cap) var(--v3-font-ui)`, color: "var(--v3-fg-mute)", paddingLeft: 10, marginTop: 2 }}>
          {e.title}
        </div>
      </button>
    ),
  }));

  return (
    <V3Frame section="Experience" planet="EARTH" index={index} scanDir="drill" scanKey={bootNonce}>
      {/* LEFT column — company timeline */}
      <div style={{ gridArea: "left", display: "flex", flexDirection: "column", gap: 20, minWidth: 0 }}>
        <V3Callout size="s5" emphasis={exp?.companyName?.split(" ")[0] || ""}>Now at</V3Callout>
        <V3Circuit mode="vertical" nodes={timelineNodes} gap={16} scanDelay={0.15} />
        {exp?.achievement && (
          <div style={{ font: `300 var(--v3-type-cap) var(--v3-font-ui)`, color: "var(--v3-fg-dim)", lineHeight: 1.55, paddingLeft: 14, borderLeft: "2px solid var(--v3-accent)" }}>
            {exp.achievement}
          </div>
        )}
      </div>

      {/* RIGHT-TOP — metrics + first two category tracks */}
      <div style={{ gridArea: "right-top", display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
        {exp?.metrics?.length > 0 && (
          <V3Schematic label={`METRICS · ${exp.date}`} scanDelay={0.2}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              {exp.metrics.map((m, i) => (
                <V3Channel key={i} label={m.label} scanDelay={0} tick={false} size="md">
                  <span style={{ font: `340 1.4rem var(--v3-font-display)`, color: "var(--v3-fg)", letterSpacing: "-.01em" }}>{m.value}</span>
                </V3Channel>
              ))}
            </div>
          </V3Schematic>
        )}
        {(exp?.categories || []).slice(0, 2).map((c, i) => (
          <V3Schematic key={i} label={c.name} scanDelay={0.26 + i * 0.06}>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
              {(c.points || []).slice(0, 3).map((p, k) => (
                <li key={k} style={{ font: `300 var(--v3-type-cap) var(--v3-font-ui)`, color: "var(--v3-fg-dim)", paddingLeft: 20, position: "relative", lineHeight: 1.5 }}>
                  <span aria-hidden style={{ position: "absolute", left: 0, top: 1, font: `400 9px var(--v3-font-mono)`, color: "var(--v3-fg-mute)" }}>{String(k + 1).padStart(2, "0")}</span>
                  {p}
                </li>
              ))}
            </ul>
          </V3Schematic>
        ))}
      </div>

      {/* RIGHT-BOTTOM — remaining category tracks + tags */}
      <div style={{ gridArea: "right-bottom", display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
        {(exp?.categories || []).slice(2).map((c, i) => (
          <V3Schematic key={i} label={c.name} scanDelay={0.36 + i * 0.06} padding="12px 14px 12px">
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 4 }}>
              {(c.points || []).slice(0, 2).map((p, k) => (
                <li key={k} style={{ font: `300 var(--v3-type-cap) var(--v3-font-ui)`, color: "var(--v3-fg-dim)", paddingLeft: 20, position: "relative", lineHeight: 1.5 }}>
                  <span aria-hidden style={{ position: "absolute", left: 0, top: 1, font: `400 9px var(--v3-font-mono)`, color: "var(--v3-fg-mute)" }}>{String(k + 1).padStart(2, "0")}</span>
                  {p}
                </li>
              ))}
            </ul>
          </V3Schematic>
        ))}
      </div>

      {/* BOTTOM — tech tag rail */}
      {exp?.tech?.length > 0 && (
        <div style={{ gridArea: "bottom", display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
          <span style={{ font: `400 10px var(--v3-font-mono)`, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--v3-fg-mute)", marginRight: 8 }}>STACK</span>
          {exp.tech.map((t, i) => (
            <span key={i} style={{ font: `400 10px var(--v3-font-mono)`, letterSpacing: ".08em", color: "var(--v3-fg-dim)", border: "1px solid var(--v3-line-strong)", borderRadius: 999, padding: "3px 10px" }}>{t}</span>
          ))}
        </div>
      )}
    </V3Frame>
  );
}
