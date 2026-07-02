"use client";
/*
 * V3Callout — the section's "held focus": one dominant Fraunces headline with an
 * optional italic accent surname/word. Editorial gutter, precise letterspacing.
 * Only one per section. `emphasis` (a string) is rendered in italic accent.
 */
import V3Scan from "./V3Scan";

export default function V3Callout({
  children,
  emphasis,
  size = "s5",         // s3 | s4 | s5 | s6
  align = "left",
  as = "h2",
  style,
  scanDelay = 0.1,
}) {
  const fontSize = `var(--v3-type-${size})`;
  const Tag = as;
  return (
    <V3Scan delay={scanDelay}>
      <Tag
        style={{
          fontFamily: "var(--v3-font-display)",
          fontOpticalSizing: "auto",
          fontWeight: 360,
          fontSize,
          lineHeight: 0.98,
          letterSpacing: "-.025em",
          color: "var(--v3-fg)",
          margin: 0,
          textAlign: align,
          ...style,
        }}
      >
        {children}
        {emphasis && (
          <>{" "}<em style={{ fontStyle: "italic", fontWeight: 380, color: "var(--v3-accent)" }}>{emphasis}</em></>
        )}
      </Tag>
    </V3Scan>
  );
}
