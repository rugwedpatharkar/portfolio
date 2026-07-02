"use client";
/*
 * Fun facts (Mercury) — the numbers dossier.
 *
 * Same left-column architecture as About: all content stays LEFT (max 50vw)
 * so the planet + top-right telemetry card have the right half of the frame
 * to themselves. No boxed schematic panels — that reads too "gauges" and
 * competes with About's editorial voice. Instead: 8 stats in a 2×4
 * hairline-divided grid, each with a big serif number (DM Serif Display, same
 * as About's 96%/31/7+ strip) + mono label + one supporting line.
 *
 * Scan direction stays radial (per plan) — stats scan in from center outward,
 * a subtle spread that reads as "dashboard coming online".
 */
import { funFacts, sectionMeta } from "../../../content";
import { V3Frame, V3Scan, V3Ticker } from "../primitives";

const META = sectionMeta.funFacts;

const Stat = ({ icon, value, suffix, label, detail, delay = 0.2, decimals }) => (
  <V3Scan variant="radial" delay={delay}>
    <div style={{ display: "flex", flexDirection: "column", gap: 10, minWidth: 0 }}>
      {/* number + icon inline; icon small enough not to steal focus from the numeric */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
        <span aria-hidden style={{ fontSize: "1rem", opacity: 0.75, flexShrink: 0 }}>{icon}</span>
        <span style={{
          fontFamily: "var(--v3-font-display)", fontWeight: 340,
          fontSize: "clamp(2rem, 3.4vw, 2.6rem)", lineHeight: 1,
          letterSpacing: "-.02em", color: "var(--v3-fg)", fontOpticalSizing: "auto",
        }}>
          <V3Ticker value={value} suffix={suffix || ""} decimals={decimals} />
        </span>
      </div>
      <div style={{
        fontFamily: "var(--v3-font-mono)", fontWeight: 400,
        fontSize: "clamp(10px, 0.85vw, 12px)",
        letterSpacing: ".18em", textTransform: "uppercase",
        color: "var(--v3-fg-mute)",
      }}>{label}</div>
      <p style={{
        fontFamily: "var(--v3-font-ui)", fontWeight: 300,
        fontSize: "clamp(.82rem, 0.95vw, .95rem)",
        color: "var(--v3-fg-dim)", lineHeight: 1.5, margin: 0,
        maxWidth: "34ch",
      }}>{detail}</p>
    </div>
  </V3Scan>
);

export default function FunFactsSection({ index, bootNonce }) {
  return (
    <V3Frame
      section="Fun facts"
      planet="MERCURY"
      index={index}
      scanDir="radial"
      scanKey={bootNonce}
      gridAreas={`"top top top" "left . ." "left . ." "bottom bottom bottom"`}
    >
      {/* LEFT — all content. maxWidth 50vw keeps clear of Mercury on the right. */}
      <div style={{ gridArea: "left", display: "flex", flexDirection: "column", gap: 24, minWidth: 0, overflow: "hidden", maxWidth: "50vw" }}>
        {/* Header: kicker + heading + lede — same voice as About */}
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
              fontSize: "clamp(2rem, 3.6vw, 3.2rem)", fontOpticalSizing: "auto",
              lineHeight: 1, letterSpacing: "-.02em", color: "var(--v3-fg)",
              margin: "0 0 12px",
            }}>
              {META.heading}
            </h2>
            <p style={{
              fontFamily: "var(--v3-font-ui)", fontWeight: 300,
              fontSize: "clamp(.9rem, 1vw, 1.02rem)", color: "var(--v3-fg-dim)",
              lineHeight: 1.55, margin: 0, maxWidth: "62ch",
            }}>
              {META.description}
            </p>
          </div>
        </V3Scan>

        {/* 2×4 stats grid — hairline dividers between rows AND columns.
            Each stat gets a scan delay that ripples outward for the radial feel. */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gridAutoRows: "min-content",
          columnGap: 28, rowGap: 24,
          borderTop: "1px solid var(--v3-line)",
          paddingTop: 22,
        }}>
          {funFacts.map((f, i) => {
            const row = Math.floor(i / 2);
            const col = i % 2;
            const isFloat = !Number.isInteger(f.value);
            return (
              <div key={i} style={{
                paddingTop: row > 0 ? 22 : 0,
                paddingLeft: col > 0 ? 24 : 0,
                borderTop: row > 0 ? "1px solid var(--v3-line)" : "none",
                borderLeft: col > 0 ? "1px solid var(--v3-line)" : "none",
                minWidth: 0,
              }}>
                <Stat
                  icon={f.icon}
                  value={f.value}
                  suffix={f.suffix}
                  label={f.label}
                  detail={f.detail}
                  decimals={isFloat ? 1 : 0}
                  delay={0.15 + (row + col) * 0.06}
                />
              </div>
            );
          })}
        </div>
      </div>
    </V3Frame>
  );
}
