"use client";
/*
 * Notes (Jupiter) — working-notes journal.
 *
 * Narrow-first per the v3 section rule: LEFT area spans col 1 only (~50vw),
 * fills vertical. 3 editorial notes stacked vertically — each one gets a wide
 * reading column instead of being squeezed into a 3-col grid where the long
 * paragraph descriptions would wrap into 20+ line towers.
 *
 * Row structure:
 *   - Left rail (~140px): accent numeral (01/02/03) + mono year + hairline
 *     tag list.
 *   - Right column: DM Serif Display title + Manrope description.
 *   - Hairline divider between rows so the stack reads as a spec-panel of
 *     production journal entries.
 * Scan direction: horizontal (rows wipe in from left).
 *
 * Responsive strategy:
 *   - maxWidth: min(50vw, 780px) — proportional at narrow, capped at wide (2560).
 *   - Type: clamp() with rem floors so browser zoom scales legibly at 75/125%.
 *   - Left rail: minmax(min(120px, 25%), 18%) — shrinks below 120px on tight
 *     viewports instead of overflowing the row.
 *   - Chips: flex-wrap + min-width 0 so tag clouds relayout under compression.
 *   - overflow-wrap: anywhere on title/description defeats long-token overflow.
 */
import { blogPosts, sectionMeta } from "../../../content";
import { V3Frame, V3Scan } from "../primitives";

const META = sectionMeta.notes || {
  sub: "Working Notes",
  heading: "Journal from Production",
};

const NoteRow = ({ i, post, delay }) => (
  <V3Scan variant="horizontal" delay={delay}>
    <div style={{
      display: "grid",
      /* Rail shrinks proportionally on narrow viewports (min(120px, 25%))
         but never grows past 18% of the row on wide/zoomed-out layouts. */
      gridTemplateColumns: "minmax(min(120px, 25%), 18%) 1fr",
      gap: "clamp(12px, 1.2vw, 22px)",
      padding: "clamp(14px, 1.4vw, 22px) 4px",
      borderTop: i > 0 ? "1px solid var(--v3-line)" : "none",
      minWidth: 0,
    }}>
      {/* Left rail: numeral, date, tags */}
      <div style={{ display: "flex", flexDirection: "column", gap: "clamp(6px, 0.7vw, 10px)", minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "clamp(6px, 0.6vw, 8px)", flexWrap: "wrap" }}>
          <span aria-hidden style={{
            fontFamily: "var(--v3-font-mono)", fontWeight: 400,
            fontSize: "clamp(10px, 0.4vw + 6px, 12px)",
            color: "var(--v3-accent)", letterSpacing: ".14em",
            fontVariantNumeric: "tabular-nums",
          }}>{String(i + 1).padStart(2, "0")}</span>
          <span style={{
            fontFamily: "var(--v3-font-mono)", fontWeight: 400,
            fontSize: "clamp(9px, 0.4vw + 6px, 11px)",
            letterSpacing: ".22em", textTransform: "uppercase", color: "var(--v3-fg-mute)",
          }}>{post.date}</span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "clamp(3px, 0.3vw, 5px)", minWidth: 0 }}>
          {(post.tags || []).map((t, k) => (
            <span key={k} style={{
              fontFamily: "var(--v3-font-mono)", fontWeight: 400,
              fontSize: "clamp(8px, 0.3vw + 5px, 10px)",
              letterSpacing: ".08em", textTransform: "uppercase", color: "var(--v3-fg-dim)",
              border: "1px solid var(--v3-line-strong)", borderRadius: 999,
              padding: "clamp(1px, 0.15vw, 2px) clamp(5px, 0.5vw, 8px)",
              whiteSpace: "nowrap",
            }}>{t}</span>
          ))}
        </div>
      </div>

      {/* Right column: title + description */}
      <div style={{ display: "flex", flexDirection: "column", gap: "clamp(6px, 0.6vw, 10px)", minWidth: 0 }}>
        <h3 style={{
          fontFamily: "var(--v3-font-display)", fontWeight: 340,
          /* Rem-anchored floor keeps title legible at 75% zoom; vw scales at 1x;
             ceiling holds proportion at 2560. */
          fontSize: "clamp(1rem, 0.8vw + 0.4rem, 1.6rem)", fontOpticalSizing: "auto",
          lineHeight: 1.15, letterSpacing: "-.005em",
          color: "var(--v3-fg)", margin: 0,
          overflowWrap: "anywhere",
        }}>{post.title}</h3>
        <p style={{
          fontFamily: "var(--v3-font-ui)", fontWeight: 300,
          fontSize: "clamp(0.78rem, 0.5vw + 0.4rem, 1rem)",
          color: "var(--v3-fg-dim)", lineHeight: 1.55, margin: 0,
          display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical",
          overflow: "hidden",
          overflowWrap: "anywhere",
        }}>{post.description}</p>
      </div>
    </div>
  </V3Scan>
);

export default function NotesSection({ index, bootNonce }) {
  return (
    <V3Frame
      section="Notes"
      planet="JUPITER"
      index={index}
      scanDir="horizontal"
      scanKey={bootNonce}
      /* Narrow default per v3 rule: 'left' spans col 1 only. Notes are 3 rich
         paragraphs — wider column would waste vertical, narrower would clamp
         too many words per line. */
      gridAreas={`"top top top" "left . ." "left . ." "bottom bottom bottom"`}
    >
      {/* maxWidth: min(50vw, 780px) — proportional at narrow, absolute cap on
          2560 so rows never grow past a comfortable reading measure and never
          sneak under the corner Body Telemetry card (78-96% x). */}
      <div style={{ gridArea: "left", display: "flex", flexDirection: "column", gap: "clamp(12px, 1.2vw, 18px)", minWidth: 0, overflow: "auto", maxWidth: "min(50vw, 780px)", height: "100%" }}>
        {/* Header */}
        <V3Scan variant="horizontal" delay={0.05}>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
              <span style={{ width: 22, height: 1, background: "var(--v3-accent)" }} />
              <span style={{
                fontFamily: "var(--v3-font-mono)", fontWeight: 400,
                fontSize: "clamp(9px, 0.4vw + 6px, 11px)",
                letterSpacing: ".28em", textTransform: "uppercase", color: "var(--v3-fg-mute)",
              }}>{META.sub}</span>
            </div>
            <h2 style={{
              fontFamily: "var(--v3-font-display)", fontWeight: 340,
              /* Zoom-aware: rem floor keeps heading legible at high zoom,
                 vw scale keeps proportional to viewport at 1x. */
              fontSize: "clamp(1.6rem, 1.8vw + 0.6rem, 2.6rem)", fontOpticalSizing: "auto",
              lineHeight: 1, letterSpacing: "-.02em", color: "var(--v3-fg)",
              margin: 0,
              overflowWrap: "anywhere",
            }}>
              {META.heading}
            </h2>
            {META.description && (
              <p style={{
                fontFamily: "var(--v3-font-ui)", fontWeight: 300,
                fontSize: "clamp(0.82rem, 0.5vw + 0.4rem, 1rem)", color: "var(--v3-fg-dim)",
                lineHeight: 1.55, margin: "12px 0 0", maxWidth: "58ch",
                overflowWrap: "anywhere",
              }}>{META.description}</p>
            )}
          </div>
        </V3Scan>

        {/* Notes stack — fills remaining vertical space via flex: 1 +
            justifyContent: space-between so the 3 notes spread evenly to
            consume empty space below rather than clustering at the top. */}
        <div style={{
          display: "flex", flexDirection: "column",
          justifyContent: "space-between",
          border: "1px solid var(--v3-line)",
          borderRadius: 6,
          background: "color-mix(in oklab, var(--v3-bg-void) 50%, transparent)",
          padding: "4px clamp(12px, 1.2vw, 22px)",
          flex: 1, minHeight: 0, overflow: "hidden", minWidth: 0,
        }}>
          {(blogPosts || []).map((post, i) => (
            <NoteRow key={i} i={i} post={post} delay={0.15 + i * 0.08} />
          ))}
        </div>
      </div>
    </V3Frame>
  );
}
