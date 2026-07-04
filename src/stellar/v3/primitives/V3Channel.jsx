"use client";
/*
 * V3Channel — a labelled data channel: mono uppercase label + value in editorial
 * type + optional tick / rule to its left. Composable in rows or columns.
 *
 * `size` controls typographic scale: "sm" | "md" | "lg" | "xl".
 */
import V3Scan from "./V3Scan";

const SIZES = {
  sm:  { label: "9px",  value: ".95rem" },
  md:  { label: "10px", value: "1.2rem"  },
  lg:  { label: "10px", value: "1.9rem"  },
  xl:  { label: "10px", value: "2.6rem"  },
};

export default function V3Channel({
  label,
  children,
  size = "md",
  mono = false,
  tick = true,
  scanDelay = 0.1,
  style,
}) {
  const s = SIZES[size] || SIZES.md;
  const valueFont = mono
    ? `400 ${s.value} var(--v3-font-mono)`
    : `340 ${s.value} var(--v3-font-display)`;
  return (
    <V3Scan delay={scanDelay}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, ...style }}>
        {tick && <span aria-hidden style={{ display: "block", width: 8, height: 1, background: "var(--v3-accent)", opacity: 0.75, marginTop: 12 }} />}
        <div style={{ minWidth: 0, flex: 1 }}>
          {label && (
            <div style={{ font: `400 ${s.label} var(--v3-font-mono)`, letterSpacing: ".18em", textTransform: "uppercase", color: "var(--v3-fg-mute)", marginBottom: 4 }}>
              {label}
            </div>
          )}
          <div style={{ font: valueFont, lineHeight: 1.15, letterSpacing: mono ? "0" : "-.01em", color: "var(--v3-fg)", fontOpticalSizing: "auto" }}>
            {children}
          </div>
        </div>
      </div>
    </V3Scan>
  );
}
