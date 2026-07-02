"use client";
/*
 * V3Schematic — the basic "instrument panel" building block: hairline rectangle
 * with a title tick and content inside. Optional footer strip for status/tags.
 * Can host chip clusters, bullet lists, mini-diagrams. Restrained: no glass,
 * no gradient. Hairline border, subtle accent tick top-left.
 */
import V3Scan from "./V3Scan";

export default function V3Schematic({
  label,
  title,
  meta,
  children,
  footer,
  scanDelay = 0.15,
  padding = "16px 18px 18px",
  style,
  onMouseEnter,
  onMouseLeave,
}) {
  return (
    <V3Scan delay={scanDelay}>
      <div
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        style={{
          position: "relative",
          border: "1px solid var(--v3-line)",
          borderRadius: 8,
          padding,
          background: "color-mix(in oklab, var(--v3-bg-void) 60%, transparent)",
          transition: "border-color .25s, background .25s",
          ...style,
        }}
      >
        {/* accent tick top-left */}
        <span aria-hidden style={{ position: "absolute", top: -1, left: -1, width: 14, height: 1, background: "var(--v3-accent)" }} />
        <span aria-hidden style={{ position: "absolute", top: -1, left: -1, width: 1, height: 14, background: "var(--v3-accent)" }} />

        {label && (
          <div style={{ font: `400 10px var(--v3-font-mono)`, letterSpacing: ".22em", textTransform: "uppercase", color: "var(--v3-fg-mute)", marginBottom: title ? 8 : 12 }}>
            {label}
          </div>
        )}
        {title && (
          <div style={{ font: `400 var(--v3-type-body) var(--v3-font-serif)`, color: "var(--v3-fg)", lineHeight: 1.15, letterSpacing: "-.01em", margin: "0 0 6px", fontOpticalSizing: "auto" }}>
            {title}
          </div>
        )}
        {meta && (
          <div style={{ font: `400 var(--v3-type-cap) var(--v3-font-mono)`, color: "var(--v3-fg-dim)", marginBottom: 10 }}>
            {meta}
          </div>
        )}
        {children}
        {footer && (
          <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--v3-line)", font: `400 var(--v3-type-cap) var(--v3-font-mono)`, color: "var(--v3-fg-mute)", letterSpacing: ".08em" }}>
            {footer}
          </div>
        )}
      </div>
    </V3Scan>
  );
}
