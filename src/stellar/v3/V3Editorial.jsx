/*
 * V3Editorial — the single "Planet Information" card. Docked FAR BOTTOM-RIGHT,
 * this merges what used to be two separate cards (the top-right Body Telemetry
 * V3PlanetCard + the bottom-right editorial quote) into one cohesive panel:
 *
 *   ◆ PLANET INFORMATION
 *   <Body name — classification>          (from PLANET_FACTS.body)
 *   DIAMETER / DISTANCE / GRAVITY rows    (from PLANET_FACTS)
 *   ── hairline ──
 *   "<historical quote>"  — attribution   (from PLANET_EDITORIAL)
 *   ◆ <rotating: Name → Discovered → each notable fact>
 *
 * Renders only on planet/beacon stops with data (hidden on the hero stop,
 * mobile, and during the fly-through via the `hidden` prop → panelHidden).
 * Right-aligned, glass backing, fades out with the section panel during flight.
 */
import { memo, useEffect, useMemo, useState } from "react";
import useViewport from "../useViewport";
import { DESTINATION_BY_ID } from "../config/destinations";

const TELEMETRY_ROWS = [
  ["Diameter", "diameter"],
  ["Distance", "distance"],
  ["Gravity", "gravity"],
];

/* memo: props are all primitives (destinationId, activeIdx, hidden). Shallow
   compare skips the render when none of them change — cuts the extrasPhase/
   scrollFinale-driven re-renders while still updating for panelHidden flights
   and per-body content swaps. */
function V3Editorial({ destinationId, activeIdx, hidden = false }) {
  const { isCompact, isMobile } = useViewport();
  const [subIdx, setSubIdx] = useState(0);

  /* §6.3: read facts + editorial from the joined destination row. */
  const dest = destinationId ? DESTINATION_BY_ID[destinationId] : null;
  const editorial = dest?.editorial || null;
  const facts = dest?.factCard || null;

  /* Sub-line rotation: etymology → discovery → each notable fact. Reset to
     first slot on body change so arrival always leads with the etymology. */
  const subLines = useMemo(() => {
    if (!editorial) return [];
    const out = [];
    if (editorial.etymology) out.push({ label: "Name", text: editorial.etymology });
    if (editorial.discovered) out.push({ label: "Discovered", text: editorial.discovered });
    (editorial.facts || []).forEach((f) => out.push({ label: "Note", text: f }));
    return out;
  }, [editorial]);

  useEffect(() => {
    setSubIdx(0);
    if (subLines.length < 2) return undefined;
    const id = window.setInterval(() => setSubIdx((i) => i + 1), 8000);
    return () => window.clearInterval(id);
  }, [destinationId, subLines.length]);

  if ((!editorial && !facts) || activeIdx === 0 || isCompact || isMobile) return null;

  const sub = subLines[subIdx % subLines.length];
  const telemetry = facts ? TELEMETRY_ROWS.filter(([, k]) => facts[k]) : [];

  return (
    <aside
      key={destinationId}
      aria-label="Planet information"
      className={`v3-editorial-fadein${hidden ? " v3-editorial-hidden" : ""}`}
      style={{
        position: "fixed",
        right: "clamp(20px, 2.4vw, 44px)",
        bottom: "clamp(20px, 3vh, 40px)",
        width: "min(360px, 30vw)",
        zIndex: 41,
        pointerEvents: "none",
        display: "flex",
        flexDirection: "column",
        gap: 9,
        padding: "14px 16px 14px 16px",
        /* SAME frosted glass as the résumé content cards (V3Style neutral rule),
           set inline here because this card is fixed OUTSIDE .stellar-dossier-frame
           so the global selector can't reach it. Keeps both surfaces identical. */
        background: "linear-gradient(157deg, rgba(30, 34, 46, 0.72), rgba(15, 18, 27, 0.82))",
        border: "1px solid color-mix(in oklab, var(--v3-fg) 17%, transparent)",
        boxShadow: "0 8px 26px rgba(0, 0, 0, 0.40), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
        backdropFilter: "blur(11px) saturate(135%)",
        WebkitBackdropFilter: "blur(11px) saturate(135%)",
        borderRadius: 8,
        textAlign: "right",
        transition: "opacity 360ms ease",
      }}
    >
      <style>{`
        @keyframes v3EditorialIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .v3-editorial-fadein { animation: v3EditorialIn 0.55s var(--v3-ease-smooth) 0.2s both; }
        /* Flight hide — important-author opacity beats the entry animation fill. */
        .v3-editorial-hidden { opacity: 0 !important; }
        @media (prefers-reduced-motion: reduce) {
          .v3-editorial-fadein { animation: none; opacity: 1; }
        }
      `}</style>

      {/* Kicker */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 9 }}>
        <span style={{ fontFamily: "var(--v3-font-mono)", fontWeight: 400, fontSize: 9, letterSpacing: ".26em", textTransform: "uppercase", color: "var(--v3-fg-mute)" }}>
          Planet Information
        </span>
        <span aria-hidden="true" style={{ width: 14, height: 1, background: "var(--v3-accent)", opacity: 0.75 }} />
      </div>

      {/* Body name / classification */}
      {facts?.body && (
        <div style={{ fontFamily: "var(--v3-font-display)", fontStyle: "normal", fontWeight: 340, fontSize: "1rem", lineHeight: 1.2, letterSpacing: "-.005em", color: "var(--v3-fg)", fontOpticalSizing: "auto" }}>
          {facts.body}
        </div>
      )}

      {/* Telemetry rows — label left, value right */}
      {telemetry.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 1 }}>
          {telemetry.map(([label, k]) => (
            <div key={k} style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 14 }}>
              <span style={{ flexShrink: 0, fontFamily: "var(--v3-font-mono)", fontSize: 9, letterSpacing: ".16em", textTransform: "uppercase", color: "var(--v3-fg-mute)" }}>
                {label}
              </span>
              <span style={{ fontFamily: "var(--v3-font-mono)", fontSize: "0.72rem", fontVariantNumeric: "tabular-nums", color: "var(--v3-fg)", textAlign: "right", lineHeight: 1.3 }}>
                {facts[k]}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Quote + attribution (only if editorial data exists) */}
      {editorial && (
        <div style={{ marginTop: 3, paddingTop: 10, borderTop: "1px solid var(--v3-line)", display: "flex", flexDirection: "column", gap: 6 }}>
          <blockquote
            style={{
              margin: 0,
              fontFamily: "var(--v3-font-display)",
              fontStyle: "italic",
              fontWeight: 340,
              fontSize: "0.86rem",
              lineHeight: 1.28,
              letterSpacing: "-.005em",
              color: "var(--v3-fg)",
              fontOpticalSizing: "auto",
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            <span aria-hidden="true" style={{ color: "var(--v3-accent)", opacity: 0.7, marginRight: 1 }}>“</span>
            {editorial.quote}
            <span aria-hidden="true" style={{ color: "var(--v3-accent)", opacity: 0.7, marginLeft: 1 }}>”</span>
          </blockquote>
          <div style={{ fontFamily: "var(--v3-font-mono)", fontWeight: 400, fontSize: 9.5, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--v3-fg-mute)", lineHeight: 1.35 }}>
            — {editorial.quoteBy}
          </div>
        </div>
      )}

      {/* Rotating sub-line — etymology / discovery / each notable fact */}
      {sub && (
        <div
          key={`${destinationId}-${subIdx}`}
          style={{ marginTop: 1, paddingTop: 9, borderTop: "1px solid var(--v3-line)", display: "flex", alignItems: "baseline", justifyContent: "flex-end", gap: 8, lineHeight: 1.35 }}
        >
          <span style={{ fontFamily: "var(--v3-font-mono)", fontSize: 9, letterSpacing: ".22em", textTransform: "uppercase", color: "var(--v3-fg-mute)", flexShrink: 0 }}>
            {sub.label}
          </span>
          <span
            style={{
              fontFamily: "var(--v3-font-ui)",
              fontSize: "0.76rem",
              color: "var(--v3-fg-dim)",
              lineHeight: 1.35,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textAlign: "right",
              flex: "0 1 auto",
              minWidth: 0,
            }}
          >
            {sub.text}
          </span>
          <span aria-hidden="true" style={{ color: "var(--v3-accent)", fontSize: 8, alignSelf: "center" }}>◆</span>
        </div>
      )}
    </aside>
  );
}

export default memo(V3Editorial);
