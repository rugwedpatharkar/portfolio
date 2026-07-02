"use client";
/*
 * Skills (Ceres) — 9 category rows, editorial dossier.
 *
 * Per the narrow-first rule: LEFT area starts at maxWidth 55vw (Skills is
 * dense — 9 categories, ~80 skills — so it needs a little more room than the
 * pure-narrow 50vw, but not the full-wide 65vw of Experience). Ceres is small
 * so even a bit of horizontal breathing space stays clear of the planet + the
 * top-right telemetry card.
 *
 * Each category row:
 *   - Left column (compact): numeral (01, 02…) + category name (mono kicker)
 *     + chip count.
 *   - Right column (flex): chip cloud of skills, hairline-bordered pills.
 *   - Hairline divider between rows so the grid reads as a spec-panel.
 *
 * No hover states — chips are always visible. Scan direction: orbit (rows fade
 * in from the top).
 */
import { skills, sectionMeta } from "../../../content";
import { V3Frame, V3Scan } from "../primitives";

const META = sectionMeta.skills || { sub: "What I Bring", heading: "Technical Skills" };

const Row = ({ i, cat, list, delay }) => (
  <V3Scan variant="orbit" delay={delay}>
    <div style={{
      display: "grid",
      gridTemplateColumns: "minmax(140px, 22%) 1fr",
      gap: 16,
      padding: "8px 4px",
      borderTop: i > 0 ? "1px solid var(--v3-line)" : "none",
      minWidth: 0,
    }}>
      {/* left: numeral + category name + count */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span aria-hidden style={{
            fontFamily: "var(--v3-font-mono)", fontWeight: 400, fontSize: 10,
            color: "var(--v3-accent)", letterSpacing: ".14em",
          }}>{String(i + 1).padStart(2, "0")}</span>
          <span style={{
            fontFamily: "var(--v3-font-display)", fontWeight: 340,
            fontSize: "clamp(.95rem, 1.1vw, 1.15rem)", lineHeight: 1.15,
            letterSpacing: "-.005em", color: "var(--v3-fg)", fontOpticalSizing: "auto",
          }}>{cat}</span>
        </div>
        <span style={{
          fontFamily: "var(--v3-font-mono)", fontWeight: 400, fontSize: 9,
          letterSpacing: ".22em", textTransform: "uppercase", color: "var(--v3-fg-mute)",
          paddingLeft: 22,
        }}>{list.length} skill{list.length === 1 ? "" : "s"}</span>
      </div>

      {/* right: chip cloud */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 3, alignContent: "flex-start", minWidth: 0 }}>
        {list.map((s, k) => (
          <span key={k} style={{
            fontFamily: "var(--v3-font-mono)", fontWeight: 400, fontSize: 9.5,
            color: "var(--v3-fg-dim)",
            border: "1px solid var(--v3-line-strong)", borderRadius: 999,
            padding: "1px 7px", letterSpacing: ".04em",
            whiteSpace: "nowrap",
          }}>{s.name}</span>
        ))}
      </div>
    </div>
  </V3Scan>
);

export default function SkillsSection({ index, bootNonce }) {
  const cats = Object.entries(skills);

  return (
    <V3Frame
      section="Skills"
      planet="CERES"
      index={index}
      scanDir="orbit"
      scanKey={bootNonce}
      /* Skills is dense (9 cats × ~10 skills = ~80 chips). Bumped LEFT to
         span cols 1+2 so maxWidth: 55vw actually applies (col 1 alone caps
         at 585px, too narrow for long chip names like 'Google BigQuery'). */
      gridAreas={`"top top top" "left left ." "left left ." "bottom bottom bottom"`}
    >
      <div style={{ gridArea: "left", display: "flex", flexDirection: "column", gap: 14, minWidth: 0, overflow: "hidden", maxWidth: "55vw", height: "100%" }}>
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
              fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontOpticalSizing: "auto",
              lineHeight: 1, letterSpacing: "-.02em", color: "var(--v3-fg)",
              margin: 0,
            }}>
              {META.heading}
            </h2>
          </div>
        </V3Scan>

        {/* 9 category rows — hairline divider between */}
        <div style={{
          display: "flex", flexDirection: "column",
          border: "1px solid var(--v3-line)",
          borderRadius: 6,
          background: "color-mix(in oklab, var(--v3-bg-void) 50%, transparent)",
          padding: "6px 14px",
          flex: 1, minHeight: 0, overflow: "hidden",
        }}>
          {cats.map(([cat, list], i) => (
            <Row key={cat} i={i} cat={cat} list={list} delay={0.15 + i * 0.05} />
          ))}
        </div>
      </div>
    </V3Frame>
  );
}
