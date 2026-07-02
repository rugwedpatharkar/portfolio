"use client";
/*
 * V3PlanetCard — a compact, persistent specimen label pinned top-right.
 *
 * Earlier iteration was a hover-to-reveal card with a tick pointing at the
 * planet. That failed because the planet's on-screen position drifts with
 * arrival + camera moves (About/Sun renders bottom-left, not right-middle) —
 * a fixed-position tick can't chase a moving specimen. Simpler and more
 * honest: a corner spec-label that's always visible, no tick, no hover.
 *
 * Font system (per the plan):
 *   - Kicker + label + values → Geist Mono (data-readout typography, tabular nums)
 *   - Title → DM Serif Display, non-italic
 *
 * On touch/mobile the section inlines its own compact facts, so this hides.
 */
const FACT_ROWS = [
  ["Diameter", "diameter"],
  ["Distance", "distance"],
  ["Gravity", "gravity"],
];

export default function V3PlanetCard({ facts, hidden = false }) {
  if (!facts) return null;
  const rows = FACT_ROWS.filter(([, k]) => facts[k]);
  return (
    <div
      className="v3-planet-card"
      role="complementary"
      aria-label="Body telemetry"
      aria-hidden={hidden}
      style={{
        position: "fixed",
        right: "clamp(30px, 4vw, 80px)",
        top: "clamp(80px, 10vh, 130px)",
        width: "min(260px, 22vw)",
        padding: "14px 16px 14px",
        background: "rgba(6,7,12,0.72)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        border: "1px solid var(--v3-line)",
        borderRadius: 6,
        boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
        pointerEvents: "auto",
        zIndex: 43,
      }}
    >
      {/* corner accent tick */}
      <span aria-hidden style={{ position: "absolute", top: -1, left: -1, width: 12, height: 1, background: "var(--v3-accent)" }} />
      <span aria-hidden style={{ position: "absolute", top: -1, left: -1, width: 1, height: 12, background: "var(--v3-accent)" }} />

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span aria-hidden style={{ width: 12, height: 1, background: "var(--v3-accent)" }} />
        <span style={{
          fontFamily: "var(--v3-font-mono)", fontWeight: 400, fontSize: 9,
          letterSpacing: ".28em", textTransform: "uppercase", color: "var(--v3-fg-mute)",
        }}>
          Body telemetry
        </span>
      </div>

      {facts.body && (
        <div style={{
          fontFamily: "var(--v3-font-display)", fontStyle: "normal", fontWeight: 340,
          fontSize: ".95rem", lineHeight: 1.2, letterSpacing: "-.005em",
          color: "var(--v3-fg)", marginBottom: 10, fontOpticalSizing: "auto",
        }}>
          {facts.body}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column" }}>
        {rows.map(([label, k], i) => (
          <div key={k} style={{
            display: "flex", flexDirection: "column", gap: 2,
            padding: "7px 0", borderTop: i === 0 ? "0" : "1px solid var(--v3-line)",
          }}>
            <span style={{
              fontFamily: "var(--v3-font-mono)", fontWeight: 400, fontSize: 9,
              letterSpacing: ".16em", textTransform: "uppercase", color: "var(--v3-fg-mute)",
            }}>
              {label}
            </span>
            <span style={{
              fontFamily: "var(--v3-font-mono)", fontWeight: 400, fontSize: ".78rem",
              fontVariantNumeric: "tabular-nums", color: "var(--v3-fg)",
              letterSpacing: ".01em", lineHeight: 1.35,
            }}>
              {facts[k]}
            </span>
          </div>
        ))}
      </div>

      <style>{`
        /* No entry animation — the parent section's V3Scan already choreographs
           arrival. A separate card fade would be redundant and paused
           when the browser tab isn't visible (transitions throttle in hidden tabs). */
        @media (hover: none) {
          /* Touch: mobile sections inline compact facts. Hide the corner label. */
          .v3-planet-card { display: none; }
        }
      `}</style>
    </div>
  );
}
