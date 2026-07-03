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
    <div style={{ display: "flex", flexDirection: "column", gap: "clamp(8px, 0.7vw, 12px)", minWidth: 0 }}>
      {/* number + icon inline; icon small enough not to steal focus from the numeric */}
      <div style={{ display: "flex", alignItems: "baseline", gap: "clamp(8px, 0.7vw, 12px)", flexWrap: "wrap" }}>
        <span aria-hidden style={{ fontSize: "clamp(.9rem, 0.75vw + 0.4rem, 1.1rem)", opacity: 0.75, flexShrink: 0 }}>{icon}</span>
        <span style={{
          fontFamily: "var(--v3-font-display)", fontWeight: 340,
          /* Wider slope so the big number scales smoothly from 1280 → 2560 without
             looking tiny on narrow or oversized on ultra-wide. */
          fontSize: "clamp(1.8rem, 1.1vw + 1.3rem, 3rem)", lineHeight: 1,
          letterSpacing: "-.02em", color: "var(--v3-fg)", fontOpticalSizing: "auto",
          overflowWrap: "anywhere",
        }}>
          <V3Ticker value={value} suffix={suffix || ""} decimals={decimals} />
        </span>
      </div>
      <div style={{
        fontFamily: "var(--v3-font-mono)", fontWeight: 400,
        fontSize: "clamp(9.5px, 0.35vw + 8px, 13px)",
        letterSpacing: ".18em", textTransform: "uppercase",
        color: "var(--v3-fg-mute)",
        overflowWrap: "anywhere",
      }}>{label}</div>
      <p style={{
        fontFamily: "var(--v3-font-ui)", fontWeight: 300,
        fontSize: "clamp(.8rem, 0.35vw + 0.7rem, 1.02rem)",
        color: "var(--v3-fg-dim)", lineHeight: 1.5, margin: 0,
        maxWidth: "min(34ch, 100%)",
        overflowWrap: "anywhere",
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
      {/* LEFT — all content. maxWidth uses min() so ultra-wide screens cap at
          a comfortable reading width instead of stretching, while narrow
          viewports still get the same 50vw ceiling clear of Mercury. */}
      <div style={{
        gridArea: "left",
        display: "flex", flexDirection: "column",
        gap: "clamp(18px, 1.8vw, 32px)",
        minWidth: 0, overflow: "hidden",
        maxWidth: "min(50vw, 780px)",
      }}>
        {/* Header: kicker + heading + lede — same voice as About */}
        <V3Scan variant="horizontal" delay={0.05}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10, flexWrap: "wrap", minWidth: 0 }}>
              <span style={{ width: 22, height: 1, background: "var(--v3-accent)", flexShrink: 0 }} />
              <span style={{
                fontFamily: "var(--v3-font-mono)", fontWeight: 400,
                fontSize: "clamp(9.5px, 0.2vw + 8px, 11px)",
                letterSpacing: ".28em", textTransform: "uppercase", color: "var(--v3-fg-mute)",
                overflowWrap: "anywhere",
              }}>{META.sub}</span>
            </div>
            <h2 style={{
              fontFamily: "var(--v3-font-display)", fontWeight: 340,
              /* Widen slope + higher cap so the section head keeps presence at
                 2560 without dominating at 1280 / 125% zoom. */
              fontSize: "clamp(1.9rem, 1.4vw + 1.2rem, 3.6rem)", fontOpticalSizing: "auto",
              lineHeight: 1, letterSpacing: "-.02em", color: "var(--v3-fg)",
              margin: "0 0 12px",
              overflowWrap: "anywhere",
            }}>
              {META.heading}
            </h2>
            <p style={{
              fontFamily: "var(--v3-font-ui)", fontWeight: 300,
              fontSize: "clamp(.85rem, 0.35vw + 0.75rem, 1.08rem)", color: "var(--v3-fg-dim)",
              lineHeight: 1.55, margin: 0,
              maxWidth: "min(62ch, 100%)",
              overflowWrap: "anywhere",
            }}>
              {META.description}
            </p>
          </div>
        </V3Scan>

        {/* 2×4 stats grid — hairline dividers between rows AND columns.
            Column count intentionally stays at 2 (auto-fit would break the row/col
            divider math). Row/column gaps + padding all clamp so the grid
            breathes at 1280 and doesn't feel airless at 2560. */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
          gridAutoRows: "min-content",
          columnGap: "clamp(18px, 1.8vw, 36px)",
          rowGap: "clamp(16px, 1.6vw, 30px)",
          borderTop: "1px solid var(--v3-line)",
          paddingTop: "clamp(16px, 1.4vw + 8px, 28px)",
        }}>
          {funFacts.map((f, i) => {
            const row = Math.floor(i / 2);
            const col = i % 2;
            const isFloat = !Number.isInteger(f.value);
            return (
              <div key={i} style={{
                paddingTop: row > 0 ? "clamp(16px, 1.4vw + 8px, 28px)" : 0,
                paddingLeft: col > 0 ? "clamp(14px, 1.4vw, 28px)" : 0,
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
