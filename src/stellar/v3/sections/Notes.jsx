"use client";
/*
 * Notes (Saturn) — Editorial 3-column spread. Three schematic mini-essay panels;
 * one gets a V3Quote treatment. Scan direction: horizontal wipe.
 */
import { blogPosts } from "../../../content";
import { V3Frame, V3Callout, V3Schematic } from "../primitives";

export default function NotesSection({ index, bootNonce }) {
  return (
    <V3Frame section="Writing" planet="SATURN" index={index} scanDir="horizontal" scanKey={bootNonce}>
      <div style={{ gridArea: "left / left / right-top / right-top", display: "flex", flexDirection: "column", gap: 22, minWidth: 0 }}>
        <V3Callout size="s5" emphasis="notes">Working</V3Callout>
        <p style={{ font: `300 var(--v3-type-body) var(--v3-font-ui)`, color: "var(--v3-fg-dim)", lineHeight: 1.55, margin: 0, maxWidth: "60ch" }}>
          Short, specific lessons pulled straight from production. Published as I learn, not when they're polished.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
          {(blogPosts || []).map((b, i) => (
            <V3Schematic
              key={i}
              label={b.date || "Note"}
              meta={b.tags?.join(" · ")}
              scanDelay={0.2 + i * 0.07}
            >
              <div style={{ font: `400 1rem var(--v3-font-serif)`, color: "var(--v3-fg)", lineHeight: 1.2, letterSpacing: "-.01em", margin: "0 0 10px", fontOpticalSizing: "auto" }}>
                {b.title}
              </div>
              <p style={{ font: `300 var(--v3-type-cap) var(--v3-font-ui)`, color: "var(--v3-fg-dim)", lineHeight: 1.55, margin: 0 }}>
                {b.description}
              </p>
            </V3Schematic>
          ))}
        </div>
      </div>
    </V3Frame>
  );
}
