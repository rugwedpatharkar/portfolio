"use client";
/*
 * sectionKit — shared v3 section primitives extracted from the 12 dossier
 * sections (they were written independently and repeated these three structures
 * verbatim). Each keeps the EXACT inline styles the originals used so the
 * runtime glassmorphic CSS (V3Style attribute selectors on `border: 1px solid
 * var(--v3-line…`) and the pointer-events routing still match byte-for-byte.
 *
 *  - V3SectionHeader — the mono kicker rule + display-serif <h2>, optional
 *    right-aligned slot (Experience's role switcher) sitting on the h2 baseline.
 *  - V3Chip — the mono hairline tag pill (tech tags / proof / focus areas).
 *  - masterCardStyle — style object for the bordered master-detail grid SHELL
 *    (master tablist + detail column stay per-section as the div's children).
 */
import V3Scan from "./V3Scan";

const H2_STYLE = {
  fontFamily: "var(--v3-font-display)", fontWeight: 340,
  fontSize: "clamp(1.5rem, 1.1vw + 0.9rem, 2.3rem)", fontOpticalSizing: "auto",
  lineHeight: 1, letterSpacing: "-.02em", color: "var(--v3-fg)",
  margin: 0,
};

export function V3SectionHeader({ sub, heading, right, delay = 0.05, kickerSize = 10, kickerMb = 8, wrapMinWidth = false }) {
  const h2 = <h2 style={H2_STYLE}>{heading}</h2>;
  return (
    <V3Scan variant="horizontal" delay={delay}>
      <div style={wrapMinWidth ? { minWidth: 0 } : undefined}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: kickerMb }}>
          <span style={{ width: 22, height: 1, background: "var(--v3-accent)" }} />
          <span style={{
            fontFamily: "var(--v3-font-mono)", fontWeight: 400, fontSize: kickerSize,
            letterSpacing: ".28em", textTransform: "uppercase", color: "var(--v3-fg-mute)",
          }}>{sub}</span>
        </div>
        {right ? (
          <div style={{
            display: "flex", alignItems: "baseline", justifyContent: "space-between",
            gap: "clamp(14px, 1.5vw, 26px)", flexWrap: "wrap", minWidth: 0,
          }}>
            {h2}
            {right}
          </div>
        ) : h2}
      </div>
    </V3Scan>
  );
}

/* Mono hairline tag pill. Defaults = the canonical shared by Projects / Notes /
   WhatSetsMeApart / Education; `size` + `pad` cover Testimonials/Hobbies. */
export function V3Chip({ children, size = "clamp(8.5px, 0.3vw + 6px, 10.5px)", pad = "clamp(1px, 0.15vw, 2px) clamp(6px, 0.6vw, 10px)" }) {
  return (
    <span style={{
      fontFamily: "var(--v3-font-mono)", fontWeight: 400, fontSize: size,
      letterSpacing: ".08em", textTransform: "uppercase", color: "var(--v3-fg-dim)",
      border: "1px solid var(--v3-line-strong)", borderRadius: 999,
      padding: pad, whiteSpace: "nowrap",
    }}>{children}</span>
  );
}

/* Master-detail card SHELL style — the bordered grid box shared by Skills /
   Education / Notes / WhatSetsMeApart. Returns the style OBJECT (kept inline so
   the runtime glass CSS still matches `border: 1px solid var(--v3-line…`); the
   master tablist + detail column stay per-section as the div's children.
   Defaults = the Skills canonical; cols/gap/padding parameterize the others. */
export const masterCardStyle = ({
  cols = "minmax(220px, 30%) 1fr",
  gap = "clamp(14px, 1.5vw, 24px)",
  padding = "clamp(10px, 1vw, 18px) clamp(12px, 1.3vw, 22px)",
  alignItems = "stretch",
} = {}) => ({
  width: "100%", height: "100%", display: "grid",
  gridTemplateColumns: cols, gridTemplateRows: "1fr",
  gap, border: "1px solid var(--v3-line)", borderRadius: 6,
  background: "color-mix(in oklab, var(--v3-bg-void) 50%, transparent)",
  padding, minWidth: 0, minHeight: 0, alignItems,
});
