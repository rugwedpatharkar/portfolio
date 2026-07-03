"use client";
/*
 * Hobbies (Uranus) — 8 pursuits in a 2×4 tile grid.
 *
 * Correct planet per destinations config: destination 'education' has label
 * 'Uranus' and section 'hobbies', so Uranus is what's framed (was 'NEPTUNE').
 *
 * Narrow-first per v3 rule: LEFT area spans grid col 1 only, maxWidth capped so
 * the corner Body Telemetry card (78%→96% x) never collides. 8 hobbies laid out
 * as 2 cols × 4 rows at baseline, with hairline dividers between cells. Each
 * cell: emoji + hobby name (DM Serif Display), tagline (Manrope 2-line clamp),
 * stat (value + label at bottom). Cells stretch (1fr rows + flex:1) so the grid
 * consumes the full LEFT column height. Scan direction: radial (cells fade in
 * from center outward).
 *
 * Responsive strategy — every dimension is clamp()/vw-scaled so the section
 * survives 1280→2560 viewports and 75%→125% browser zoom without overflow,
 * type-crush, or corner-card collision. Grid degrades to 1-col via auto-fit
 * (minmax 220px) at very narrow widths — clean single-column stack instead of
 * crushed 2-col — and expands to 4-col at 2560+ so cells don't stretch into
 * awkward billboards. LEFT column capped at min(50vw, 820px): the min() ensures
 * we never crowd the 78% corner card, the 820px ceiling stops runaway width on
 * 4K displays. Type + padding all fluid-clamped to keep visual rhythm at any
 * step. overflow-wrap: anywhere on the name and tagline so pathological long
 * words don't punch a horizontal scrollbar into the frame. Dividers use fixed
 * row/col math from the 2-col baseline; when auto-fit collapses to 1-col or
 * expands to 4-col the extra borders read as clean separators either way.
 */
import { hobbies, sectionMeta } from "../../../content";
import { V3Frame, V3Scan } from "../primitives";

const META = sectionMeta.hobbies || {
  sub: "Beyond the Code",
  heading: "Off-Duty Pursuits",
};

const Tile = ({ h, row, col, delay }) => (
  <V3Scan variant="radial" delay={delay}>
    <div style={{
      display: "flex", flexDirection: "column",
      gap: "clamp(4px, 0.4vw, 8px)",
      /* Fluid padding — tightens on 1280 / 125% zoom, breathes on 2560 without
         gulping cell real-estate away from the 2-line tagline + stat row. */
      padding: "clamp(10px, 1vw, 18px) clamp(12px, 1.15vw, 20px)",
      /* Dividers reference row/col from the 2-col baseline. Auto-fit rewrite
         at very narrow widths still lands on 1-col so cells reflow cleanly;
         the top-borders on wrapped rows read as clean row separators. */
      borderTop: row > 0 ? "1px solid var(--v3-line)" : "none",
      borderLeft: col > 0 ? "1px solid var(--v3-line)" : "none",
      minWidth: 0, height: "100%",
    }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: "clamp(8px, 0.7vw, 12px)", minWidth: 0 }}>
        <span aria-hidden style={{
          fontSize: "clamp(1.2rem, 1vw + 0.6rem, 1.8rem)",
          flexShrink: 0, lineHeight: 1,
        }}>{h.icon}</span>
        <span style={{
          fontFamily: "var(--v3-font-display)", fontWeight: 340,
          /* Hobby name: 1rem floor at 1280 / 125% zoom, 1.4rem ceiling at 2560.
             0.8vw slope keeps it linked to viewport without overshooting. */
          fontSize: "clamp(1rem, 0.8vw + 0.5rem, 1.4rem)", lineHeight: 1.15,
          letterSpacing: "-.005em", color: "var(--v3-fg)", fontOpticalSizing: "auto",
          minWidth: 0, overflowWrap: "anywhere",
        }}>{h.name}</span>
      </div>
      <p style={{
        fontFamily: "var(--v3-font-ui)", fontWeight: 300,
        /* Tagline: 0.75rem floor keeps it readable at 75% zoom, 0.95rem ceiling
           at 2560. overflow-wrap: anywhere prevents a long token from busting
           the cell width and forcing horizontal scroll on the section. */
        fontSize: "clamp(0.75rem, 0.5vw + 0.4rem, 0.95rem)",
        color: "var(--v3-fg-dim)", lineHeight: 1.4, margin: 0,
        display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
        overflow: "hidden", overflowWrap: "anywhere",
      }}>{h.tagline}</p>
      {h.stat && (
        <div style={{
          display: "flex", alignItems: "baseline", gap: "clamp(6px, 0.55vw, 10px)",
          marginTop: "auto", paddingTop: "clamp(4px, 0.55vw, 10px)",
          minWidth: 0, flexWrap: "wrap",
        }}>
          <span style={{
            fontFamily: "var(--v3-font-display)", fontWeight: 340,
            /* Stat value: 0.95rem floor, 1.35rem ceiling — tabular-nums keeps
               numeric alignment tidy across all sizes. */
            fontSize: "clamp(0.95rem, 0.7vw + 0.4rem, 1.15rem)", lineHeight: 1,
            letterSpacing: "-.005em", color: "var(--v3-fg)", fontOpticalSizing: "auto",
            fontVariantNumeric: "tabular-nums",
          }}>{h.stat.value}</span>
          <span style={{
            fontFamily: "var(--v3-font-mono)", fontWeight: 400,
            fontSize: "clamp(9px, 0.4vw + 6px, 11px)",
            letterSpacing: ".2em", textTransform: "uppercase", color: "var(--v3-fg-mute)",
          }}>{h.stat.label}</span>
        </div>
      )}
    </div>
  </V3Scan>
);

export default function HobbiesSection({ index, bootNonce }) {
  const list = hobbies || [];
  return (
    <V3Frame
      section="Hobbies"
      planet="URANUS"
      index={index}
      scanDir="radial"
      scanKey={bootNonce}
      gridAreas={`"top top top" "left . ." "left . ." "bottom bottom bottom"`}
    >
      <div style={{
        gridArea: "left", display: "flex", flexDirection: "column",
        gap: "clamp(12px, 1.1vw, 20px)",
        minWidth: 0, overflow: "hidden",
        /* min() cap: 50vw preserves the narrow-first architecture and keeps
           clearance from the corner card at 78%→96% x; 820px ceiling prevents
           runaway width on 2560+ displays where 50vw would push into 1280px
           and make cells feel stretched horizontally. */
        maxWidth: "min(60vw, 1200px)",
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
              /* Heading: 1.7rem floor at 1280 / 125% zoom, 2.6rem ceiling at
                 2560 so it scales with the rest of the dossier. */
              fontSize: "clamp(1.7rem, 2.4vw, 2.6rem)", fontOpticalSizing: "auto",
              lineHeight: 1, letterSpacing: "-.02em", color: "var(--v3-fg)",
              margin: 0, overflowWrap: "anywhere",
            }}>
              {META.heading}
            </h2>
          </div>
        </V3Scan>

        {/* 2×4 pursuits grid — auto-fit with minmax(220px, 1fr) collapses to
            1-col at narrow widths (or 125% zoom on smaller viewports) and
            expands to 4-col at 2560+ where each cell has room. gridAutoRows:1fr
            + flex:1 still stretch cells to consume the full remaining LEFT
            column height regardless of column count. */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gridAutoRows: "1fr",
          border: "1px solid var(--v3-line)",
          borderRadius: 6,
          background: "color-mix(in oklab, var(--v3-bg-void) 50%, transparent)",
          flex: 1, minHeight: 0, overflow: "visible",
        }}>
          {list.slice(0, 8).map((h, i) => {
            /* Row/col here anchor the divider pattern to the 2-col baseline —
               the visual language readers land on at 1440/1512/1920. When
               auto-fit collapses to 1-col or expands to 4-col, extra
               top/left-borders read as clean row/column separators. */
            const row = Math.floor(i / 2);
            const col = i % 2;
            return (
              <Tile
                key={i}
                h={h}
                row={row}
                col={col}
                delay={0.15 + (row + col) * 0.05}
              />
            );
          })}
        </div>
      </div>
    </V3Frame>
  );
}
