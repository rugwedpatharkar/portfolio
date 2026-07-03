"use client";
/*
 * Achievements (Mars) — 8-milestone circuit grid.
 *
 * Same LEFT-content architecture as Projects/Experience. 4×2 hairline-divided
 * grid gives 8 nodes; the dividers between them read as circuit traces linking
 * milestones. Each cell: year mono kicker, big emoji + serif title, one-line
 * blurb. Scan direction: circuit (nodes light up first, staggered).
 *
 * Responsive strategy — every dimension is clamp()/vw-scaled so the section
 * survives 1280→2560 viewports and 75%→125% browser zoom without overflow,
 * type-crush, or corner-card collision. Grid degrades to 1-col via auto-fit
 * (minmax 240px) at very narrow widths — clean single-column stack instead of
 * crushed 2-col — and upgrades to 3-col at 2560+ so cells don't stretch into
 * awkward billboards. LEFT column capped at min(55vw, 900px): the min() ensures
 * we never crowd the 78% corner card, the 900px ceiling stops runaway width on
 * 4K displays. Type + padding all fluid-clamped to keep visual rhythm at any
 * step. overflow-wrap: anywhere on the blurb so pathological long words in the
 * copy don't punch a horizontal scrollbar into the frame.
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
      display: "flex", flexDirection: "column", gap: "clamp(4px, 0.35vw, 8px)",
      /* Fluid padding — tightens on 1280, breathes on 2560 without gulping cell
         real-estate away from the 3-line description. */
      padding: "clamp(8px, 0.8vw, 16px) clamp(10px, 1vw, 18px)",
      /* Dividers reference row/col from the 2-col baseline. Auto-fit rewrite
         at very narrow widths still lands on 1-col so cells reflow cleanly;
         the top-borders on wrapped rows are harmless (all cells become col 0). */
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
        fontFamily: "var(--v3-font-mono)", fontWeight: 400,
        fontSize: "clamp(9.5px, 0.45vw + 6px, 11.5px)",
        letterSpacing: ".22em", textTransform: "uppercase", color: "var(--v3-fg-mute)",
      }}>{a.year ? `Logged ${a.year}` : "Milestone"}</div>
      <div style={{ display: "flex", alignItems: "flex-start", gap: "clamp(8px, 0.7vw, 14px)" }}>
        <span aria-hidden style={{
          fontSize: "clamp(1.3rem, 1vw + 0.6rem, 2rem)",
          flexShrink: 0, lineHeight: 1,
        }}>{a.icon}</span>
        <div style={{
          fontFamily: "var(--v3-font-display)", fontWeight: 340,
          /* Title: 1rem floor at 1280, 1.5rem ceiling at 2560. 0.8vw slope keeps
             it linked to viewport without overshooting the cell. */
          fontSize: "clamp(1rem, 0.8vw + 0.5rem, 1.5rem)",
          lineHeight: 1.15,
          letterSpacing: "-.005em", color: "var(--v3-fg)", fontOpticalSizing: "auto",
          minWidth: 0, overflowWrap: "anywhere",
        }}>{a.title}</div>
      </div>
      <p style={{
        fontFamily: "var(--v3-font-ui)", fontWeight: 300,
        /* Description: 0.78rem floor keeps it readable at 75% zoom, 1rem ceiling
           at 2560. overflow-wrap: anywhere prevents a long token from busting
           the cell width and forcing horizontal scroll on the section. */
        fontSize: "clamp(0.78rem, 0.55vw + 0.4rem, 1rem)",
        color: "var(--v3-fg-dim)", lineHeight: 1.5, margin: 0,
        display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical",
        overflow: "hidden", overflowWrap: "anywhere",
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
      /* Slightly wider — 'left' spans cols 1+2 so maxWidth: min(55vw, 900px)
         actually sets the section width (col 1 alone caps at 1.4fr ≈ 585px).
         Cells still fill vertical via flex:1 + gridAutoRows:1fr. */
      gridAreas={`"top top top" "left left ." "left left ." "bottom bottom bottom"`}
    >
      <div style={{
        gridArea: "left", display: "flex", flexDirection: "column",
        gap: "clamp(12px, 1.2vw, 22px)",
        minWidth: 0, overflow: "auto",
        /* min() cap: 55vw keeps clearance from the corner card at 78%→96% x,
           900px ceiling prevents runaway width on 2560+ displays where 55vw
           would push into 1400px and make cells feel stretched. */
        maxWidth: "min(55vw, 900px)",
        height: "100%",
      }}>
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
              fontSize: "clamp(1.7rem, 2.8vw, 2.8rem)", fontOpticalSizing: "auto",
              lineHeight: 1, letterSpacing: "-.02em", color: "var(--v3-fg)",
              margin: 0,
            }}>
              {META.heading}
            </h2>
            {META.description && (
              <p style={{
                fontFamily: "var(--v3-font-ui)", fontWeight: 300,
                fontSize: "clamp(.82rem, 0.7vw + 0.35rem, 1rem)", color: "var(--v3-fg-dim)",
                lineHeight: 1.55, margin: "12px 0 0", maxWidth: "62ch",
              }}>{META.description}</p>
            )}
          </div>
        </V3Scan>

        {/* Milestone circuit grid — auto-fit with minmax(240px, 1fr) collapses
            to 1-col at narrow widths (or 125% zoom on smaller viewports) and
            expands to 3-col at 2560+ where each cell has room. gridAutoRows:1fr
            + flex:1 still stretch cells to consume the full remaining LEFT
            column height regardless of column count. */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gridAutoRows: "1fr",
          border: "1px solid var(--v3-line)",
          borderRadius: 6,
          background: "color-mix(in oklab, var(--v3-bg-void) 50%, transparent)",
          position: "relative",
          flex: 1, minHeight: 0,
        }}>
          {list.slice(0, 8).map((a, i) => {
            /* Row/col here anchor the divider pattern to the 2-col baseline —
               the visual language readers land on at 1440/1512/1920. When
               auto-fit collapses to 1-col, extra top-borders read as clean
               row separators; at 3-col at 2560+, the pattern still telegraphs
               a circuit grid. */
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
