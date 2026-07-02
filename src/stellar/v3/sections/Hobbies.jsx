"use client";
/*
 * Hobbies (Uranus) — 8 pursuits in a 2×4 tile grid.
 *
 * Correct planet per destinations config: destination 'education' has label
 * 'Uranus' and section 'hobbies', so Uranus is what's framed (was 'NEPTUNE').
 *
 * Narrow-first per v3 rule: LEFT area spans grid col 1 only, maxWidth 50vw.
 * 8 hobbies laid out as 2 cols × 4 rows with hairline dividers. Each cell:
 *   - Emoji + hobby name (DM Serif Display) inline.
 *   - Tagline (Manrope short).
 *   - Stat: DM Serif Display value + mono label at the bottom.
 * Cells stretch (1fr rows) so the grid consumes the full LEFT column height.
 * Scan direction: radial (cells fade in from center outward).
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
      display: "flex", flexDirection: "column", gap: 6,
      padding: "12px 14px",
      borderTop: row > 0 ? "1px solid var(--v3-line)" : "none",
      borderLeft: col > 0 ? "1px solid var(--v3-line)" : "none",
      minWidth: 0, height: "100%",
    }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
        <span aria-hidden style={{ fontSize: "1.4rem", flexShrink: 0, lineHeight: 1 }}>{h.icon}</span>
        <span style={{
          fontFamily: "var(--v3-font-display)", fontWeight: 340,
          fontSize: "clamp(1.05rem, 1.2vw, 1.25rem)", lineHeight: 1.15,
          letterSpacing: "-.005em", color: "var(--v3-fg)", fontOpticalSizing: "auto",
        }}>{h.name}</span>
      </div>
      <p style={{
        fontFamily: "var(--v3-font-ui)", fontWeight: 300,
        fontSize: "clamp(.78rem, 0.85vw, .88rem)",
        color: "var(--v3-fg-dim)", lineHeight: 1.4, margin: 0,
        display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
        overflow: "hidden",
      }}>{h.tagline}</p>
      {h.stat && (
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: "auto", paddingTop: 8 }}>
          <span style={{
            fontFamily: "var(--v3-font-display)", fontWeight: 340,
            fontSize: "clamp(1rem, 1.15vw, 1.2rem)", lineHeight: 1,
            letterSpacing: "-.005em", color: "var(--v3-fg)", fontOpticalSizing: "auto",
            fontVariantNumeric: "tabular-nums",
          }}>{h.stat.value}</span>
          <span style={{
            fontFamily: "var(--v3-font-mono)", fontWeight: 400, fontSize: 9.5,
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
      <div style={{ gridArea: "left", display: "flex", flexDirection: "column", gap: 16, minWidth: 0, overflow: "hidden", maxWidth: "50vw", height: "100%" }}>
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
              fontSize: "clamp(1.9rem, 3vw, 2.4rem)", fontOpticalSizing: "auto",
              lineHeight: 1, letterSpacing: "-.02em", color: "var(--v3-fg)",
              margin: 0,
            }}>
              {META.heading}
            </h2>
          </div>
        </V3Scan>

        {/* 2×4 pursuits grid — rows stretch to fill vertical */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gridAutoRows: "1fr",
          border: "1px solid var(--v3-line)",
          borderRadius: 6,
          background: "color-mix(in oklab, var(--v3-bg-void) 50%, transparent)",
          flex: 1, minHeight: 0, overflow: "hidden",
        }}>
          {list.slice(0, 8).map((h, i) => {
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
