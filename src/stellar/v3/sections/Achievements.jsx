"use client";
/*
 * Achievements (Mars) — 8-milestone circuit grid.
 *
 * Same LEFT-content architecture as Projects/Experience. 4×2 hairline-divided
 * grid gives 8 nodes; the dividers between them read as circuit traces linking
 * milestones. Each cell: year mono kicker, big emoji + serif title, one-line
 * blurb. Scan direction: circuit (nodes light up first, staggered).
 */
import { achievements, sectionMeta } from "../../../content";
import { V3Frame, V3Scan } from "../primitives";

const META = sectionMeta.achievements || {
  sub: "Milestones",
  heading: "Signals from the Wire",
};

const Node = ({ a, delay, row, col }) => (
  <V3Scan variant="circuit" delay={delay}>
    <div style={{
      display: "flex", flexDirection: "column", gap: 8,
      padding: "14px 16px 14px",
      borderTop: row > 0 ? "1px solid var(--v3-line)" : "none",
      borderLeft: col > 0 ? "1px solid var(--v3-line)" : "none",
      minWidth: 0, position: "relative",
    }}>
      {/* node dot at top-left of cell — implies circuit-junction */}
      <span aria-hidden style={{
        position: "absolute", top: -3, left: -3, width: 6, height: 6,
        borderRadius: "50%", background: "var(--v3-accent)",
        boxShadow: "0 0 8px var(--v3-accent)",
      }} />
      <div style={{
        fontFamily: "var(--v3-font-mono)", fontWeight: 400, fontSize: 9,
        letterSpacing: ".22em", textTransform: "uppercase", color: "var(--v3-fg-mute)",
      }}>{a.year ? `Logged ${a.year}` : "Milestone"}</div>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <span aria-hidden style={{ fontSize: "1.4rem", flexShrink: 0, lineHeight: 1 }}>{a.icon}</span>
        <div style={{
          fontFamily: "var(--v3-font-display)", fontWeight: 340,
          fontSize: "clamp(.95rem, 1.1vw, 1.1rem)", lineHeight: 1.15,
          letterSpacing: "-.005em", color: "var(--v3-fg)", fontOpticalSizing: "auto",
        }}>{a.title}</div>
      </div>
      <p style={{
        fontFamily: "var(--v3-font-ui)", fontWeight: 300,
        fontSize: "clamp(.7rem, 0.78vw, .78rem)",
        color: "var(--v3-fg-dim)", lineHeight: 1.4, margin: 0,
        display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical",
        overflow: "hidden",
      }}>{a.description}</p>
    </div>
  </V3Scan>
);

export default function AchievementsSection({ index, bootNonce }) {
  const list = achievements || [];

  return (
    <V3Frame
      section="Achievements"
      planet="MARS"
      index={index}
      scanDir="circuit"
      scanKey={bootNonce}
      /* Narrow default — 'left' spans col 1 only, maxWidth 50vw. Grid cells
         inside stretch to fill remaining vertical space so 8 milestones read
         as a full-height circuit panel, not a floating 4×2 with empty area
         below. */
      gridAreas={`"top top top" "left . ." "left . ." "bottom bottom bottom"`}
    >
      <div style={{ gridArea: "left", display: "flex", flexDirection: "column", gap: 18, minWidth: 0, overflow: "hidden", maxWidth: "50vw", height: "100%" }}>
        {/* Header */}
        <V3Scan variant="horizontal" delay={0.05}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
              <span style={{ width: 22, height: 1, background: "var(--v3-accent)" }} />
              <span style={{
                fontFamily: "var(--v3-font-mono)", fontWeight: 400, fontSize: 10,
                letterSpacing: ".28em", textTransform: "uppercase", color: "var(--v3-fg-mute)",
              }}>{META.sub}</span>
            </div>
            <h2 style={{
              fontFamily: "var(--v3-font-display)", fontWeight: 340,
              fontSize: "clamp(1.9rem, 3.2vw, 2.6rem)", fontOpticalSizing: "auto",
              lineHeight: 1, letterSpacing: "-.02em", color: "var(--v3-fg)",
              margin: 0,
            }}>
              {META.heading}
            </h2>
            {META.description && (
              <p style={{
                fontFamily: "var(--v3-font-ui)", fontWeight: 300,
                fontSize: "clamp(.85rem, 0.95vw, .98rem)", color: "var(--v3-fg-dim)",
                lineHeight: 1.55, margin: "12px 0 0", maxWidth: "62ch",
              }}>{META.description}</p>
            )}
          </div>
        </V3Scan>

        {/* 2×4 milestone circuit grid — narrower section fits 2 cols per row
            comfortably; 4 rows fill vertical. gridAutoRows: 1fr + flex: 1
            stretch cells to consume the full remaining LEFT column height. */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gridAutoRows: "1fr",
          border: "1px solid var(--v3-line)",
          borderRadius: 6,
          background: "color-mix(in oklab, var(--v3-bg-void) 50%, transparent)",
          position: "relative",
          flex: 1, minHeight: 0,
        }}>
          {list.slice(0, 8).map((a, i) => {
            const row = Math.floor(i / 2);
            const col = i % 2;
            return (
              <Node
                key={i}
                a={a}
                row={row}
                col={col}
                delay={0.15 + (row + col) * 0.06}
              />
            );
          })}
        </div>
      </div>
    </V3Frame>
  );
}
