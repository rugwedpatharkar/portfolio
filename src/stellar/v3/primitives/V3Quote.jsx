"use client";
/*
 * V3Quote — editorial pull-quote block with a signature serif quote-mark treatment
 * (a big single italic curly-quote glyph as the anchor). Author + role captured
 * as compact channels beneath. Used for Testimonials + optional Notes callouts.
 */
import V3Scan from "./V3Scan";

export default function V3Quote({ quote, author, roleAt, tags = [], highlight = false, scanDelay = 0.15 }) {
  return (
    <V3Scan delay={scanDelay}>
      <figure style={{ margin: 0, padding: highlight ? 22 : "18px 4px", borderTop: "1px solid var(--v3-line)", borderBottom: "1px solid var(--v3-line)", position: "relative", background: highlight ? "color-mix(in oklab, var(--v3-accent) 4%, transparent)" : "transparent" }}>
        <span aria-hidden style={{ position: "absolute", top: -14, left: -4, font: "italic 400 3.6rem var(--v3-font-serif)", color: "var(--v3-accent)", lineHeight: 1, opacity: 0.9 }}>“</span>
        <blockquote style={{ font: `${highlight ? 300 : 300} ${highlight ? "1.15rem" : "1rem"} var(--v3-font-serif)`, fontStyle: "italic", lineHeight: 1.55, color: "var(--v3-fg)", margin: "6px 0 14px", letterSpacing: "-.005em", fontOpticalSizing: "auto" }}>
          {(quote || "").replace(/^["“](.*)["”]$/s, "$1")}
        </blockquote>
        <figcaption style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ font: `400 var(--v3-type-cap) var(--v3-font-mono)`, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--v3-accent)" }}>{author}</span>
          {roleAt && <span style={{ font: `300 var(--v3-type-cap) var(--v3-font-ui)`, color: "var(--v3-fg-mute)" }}>{roleAt}</span>}
        </figcaption>
        {tags.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
            {tags.map((t, i) => (
              <span key={i} style={{ font: `400 var(--v3-type-cap) var(--v3-font-mono)`, color: "var(--v3-fg-dim)", border: "1px solid var(--v3-line-strong)", borderRadius: 999, padding: "3px 10px", letterSpacing: ".08em" }}>{t}</span>
            ))}
          </div>
        )}
      </figure>
    </V3Scan>
  );
}
