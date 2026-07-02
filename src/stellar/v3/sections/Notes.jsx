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
      gridTemplateColumns: "minmax(120px, 18%) 1fr",
      gap: 20,
      padding: "18px 4px",
      borderTop: i > 0 ? "1px solid var(--v3-line)" : "none",
      minWidth: 0,
    }}>
      {/* Left rail: numeral, date, tags */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span aria-hidden style={{
            fontFamily: "var(--v3-font-mono)", fontWeight: 400, fontSize: 11,
            color: "var(--v3-accent)", letterSpacing: ".14em",
            fontVariantNumeric: "tabular-nums",
          }}>{String(i + 1).padStart(2, "0")}</span>
          <span style={{
            fontFamily: "var(--v3-font-mono)", fontWeight: 400, fontSize: 10,
            letterSpacing: ".22em", textTransform: "uppercase", color: "var(--v3-fg-mute)",
          }}>{post.date}</span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {(post.tags || []).map((t, k) => (
            <span key={k} style={{
              fontFamily: "var(--v3-font-mono)", fontWeight: 400, fontSize: 9,
              letterSpacing: ".08em", textTransform: "uppercase", color: "var(--v3-fg-dim)",
              border: "1px solid var(--v3-line-strong)", borderRadius: 999,
              padding: "1px 7px", whiteSpace: "nowrap",
            }}>{t}</span>
          ))}
        </div>
      </div>

      {/* Right column: title + description */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
        <h3 style={{
          fontFamily: "var(--v3-font-display)", fontWeight: 340,
          fontSize: "clamp(1.15rem, 1.35vw, 1.5rem)", fontOpticalSizing: "auto",
          lineHeight: 1.15, letterSpacing: "-.005em",
          color: "var(--v3-fg)", margin: 0,
        }}>{post.title}</h3>
        <p style={{
          fontFamily: "var(--v3-font-ui)", fontWeight: 300,
          fontSize: "clamp(.82rem, 0.9vw, .92rem)",
          color: "var(--v3-fg-dim)", lineHeight: 1.55, margin: 0,
          display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical",
          overflow: "hidden",
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
            {META.description && (
              <p style={{
                fontFamily: "var(--v3-font-ui)", fontWeight: 300,
                fontSize: "clamp(.85rem, 0.95vw, .98rem)", color: "var(--v3-fg-dim)",
                lineHeight: 1.55, margin: "12px 0 0", maxWidth: "58ch",
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
          padding: "4px 18px",
          flex: 1, minHeight: 0, overflow: "hidden",
        }}>
          {(blogPosts || []).map((post, i) => (
            <NoteRow key={i} i={i} post={post} delay={0.15 + i * 0.08} />
          ))}
        </div>
      </div>
    </V3Frame>
  );
}
