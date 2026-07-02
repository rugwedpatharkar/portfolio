"use client";
/*
 * V3PlanetCard — hover-triggered telemetry card that slides in from the LEFT of
 * the on-screen planet with a small tick connecting them. Replaces the persistent
 * docked Body Telemetry; the frame stays clean until the visitor engages the planet.
 *
 * How it works:
 *   - We render an INVISIBLE hover target ("hot zone") at the planet's approximate
 *     screen position (right ~6% of the viewport, vertically centred). Its size is
 *     tuned to the current v3 camera framing.
 *   - Hovering the hot zone (or the card itself) reveals the card via CSS transitions
 *     — no JS animation, so it's reduced-motion safe automatically.
 *   - On touch devices, hover doesn't fire; sections still inline telemetry per plan.
 *   - No hint UI on the hot zone (user chose "no visible hint" — trust the visitor).
 *
 * Uses facts from src/stellar/data/planetFacts.js (keyed by destination.id).
 */
import { useReducedMotion } from "motion/react";

const FACT_ROWS = [
  ["Diameter", "diameter"],
  ["Distance", "distance"],
  ["Day", "day"],
  ["Year", "year"],
  ["Gravity", "gravity"],
  ["Temp", "temp"],
];

export default function V3PlanetCard({ facts, hidden = false }) {
  const reduce = useReducedMotion();
  if (!facts) return null;
  const rows = FACT_ROWS.filter(([, k]) => facts[k]);
  return (
    <>
      {/* invisible hover hot zone over where the planet renders. Pointer-events
          auto ONLY here; the rest of the dossier stays interactable. */}
      <div
        className="v3-planet-hz"
        aria-hidden={hidden}
        style={{
          position: "fixed",
          right: "clamp(30px, 5vw, 90px)",
          top: "50%",
          transform: "translateY(-50%)",
          width: "clamp(180px, 18vw, 260px)",
          height: "clamp(180px, 18vw, 260px)",
          borderRadius: "50%",
          pointerEvents: hidden ? "none" : "auto",
          zIndex: 42, // above the section (40) + telemetry old slot (41), below hero HUD (44)
          cursor: "default",
        }}
      />
      {/* the specimen card — slides in from the planet's LEFT edge with a tick.
          Position: bottom-right area, offset LEFT of the planet's centre. */}
      <div
        className="v3-planet-card"
        role="tooltip"
        aria-live="polite"
        style={{
          position: "fixed",
          right: "calc(clamp(30px, 5vw, 90px) + clamp(200px, 19vw, 280px))",
          top: "50%",
          transform: "translate(10px, -50%)",
          width: "min(300px, 26vw)",
          padding: "16px 18px 18px",
          background: "rgba(6,7,12,0.86)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          border: "1px solid var(--v3-line)",
          borderRadius: 8,
          boxShadow: "0 20px 60px rgba(0,0,0,0.55)",
          opacity: 0,
          pointerEvents: "none",
          transition: reduce ? "none" : "opacity .3s cubic-bezier(.22,1,.36,1), transform .35s cubic-bezier(.22,1,.36,1)",
          zIndex: 43,
        }}
      >
        {/* accent tick top-left */}
        <span aria-hidden style={{ position: "absolute", top: -1, left: -1, width: 12, height: 1, background: "var(--v3-accent)" }} />
        <span aria-hidden style={{ position: "absolute", top: -1, left: -1, width: 1, height: 12, background: "var(--v3-accent)" }} />
        {/* pointer tick on the right, linking to the planet */}
        <div aria-hidden style={{ position: "absolute", top: "50%", right: -16, transform: "translateY(-50%)", display: "flex", alignItems: "center", gap: 2 }}>
          <span style={{ width: 14, height: 1, background: "var(--v3-accent)" }} />
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--v3-accent)", boxShadow: "0 0 8px var(--v3-accent)" }} />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <span aria-hidden style={{ width: 12, height: 1, background: "var(--v3-accent)" }} />
          <span style={{ font: "400 9px var(--v3-font-mono)", letterSpacing: ".28em", textTransform: "uppercase", color: "var(--v3-fg-mute)" }}>
            Body telemetry
          </span>
        </div>
        {facts.body && (
          <div style={{ font: "400 1rem var(--v3-font-serif)", color: "var(--v3-fg)", lineHeight: 1.15, letterSpacing: "-.005em", marginBottom: 12, fontOpticalSizing: "auto" }}>
            {facts.body}
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {rows.map(([label, k], i) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, padding: "6px 0", borderTop: i === 0 ? "0" : "1px solid var(--v3-line)" }}>
              <span style={{ font: "400 9px var(--v3-font-mono)", letterSpacing: ".16em", textTransform: "uppercase", color: "var(--v3-fg-mute)", flexShrink: 0 }}>
                {label}
              </span>
              <span style={{ font: "340 .82rem var(--v3-font-display)", color: "var(--v3-fg)", textAlign: "right", letterSpacing: "-.005em", fontOpticalSizing: "auto" }}>
                {facts[k]}
              </span>
            </div>
          ))}
        </div>
        {facts.wow && (
          <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid var(--v3-line)", font: "300 .78rem var(--v3-font-ui)", color: "var(--v3-fg-dim)", lineHeight: 1.5, fontStyle: "italic" }}>
            {facts.wow}
          </div>
        )}
      </div>
      {/* the CSS reveal — hover the hot zone OR the card itself reveals it. Native
          CSS = zero JS overhead + fully reduced-motion safe (media query below). */}
      <style>{`
        .v3-planet-hz:hover ~ .v3-planet-card,
        .v3-planet-hz:focus ~ .v3-planet-card,
        .v3-planet-card:hover {
          opacity: 1 !important;
          transform: translate(0, -50%) !important;
          pointer-events: auto !important;
        }
        @media (prefers-reduced-motion: reduce) {
          .v3-planet-card { transition: opacity 0ms !important; }
        }
        @media (hover: none) {
          /* Touch: no hover reveal — sections inline their own compact facts on mobile.
             Keep the card mounted but never show, so screen readers can still see it. */
          .v3-planet-hz { display: none; }
          .v3-planet-card { display: none; }
        }
      `}</style>
    </>
  );
}
