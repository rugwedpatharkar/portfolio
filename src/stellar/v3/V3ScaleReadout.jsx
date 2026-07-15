/*
 * V3ScaleReadout — a live "powers of ten" distance readout during the tour.
 * Reads the live camera distance from the Sun (origin) each frame and prints it
 * in the biggest sensible unit, so as you scroll outward the number climbs
 * through the regimes: million km → AU + light-minutes → light-hours →
 * light-days → approaching a light-year at the Oort edge. Makes the true scale
 * FELT as a number, not just a framing.
 *
 * Shows DURING the fly-throughs (panelHidden ← the stellar:flight event), which
 * is exactly "during the outward scroll": a flight instrument that ticks up as
 * you cross the void, then hands off to the settled planet card (which carries
 * the same distance). Solar-system tour only — the finale is a different scale
 * regime with its own Local-Group context. Pure DOM + one rAF loop reading
 * cameraRef imperatively (no React re-render), mirroring V3Reticle.
 */
import { memo, useEffect, useRef } from "react";
import { AU_UNIT } from "../config/destinations";

const AU_PER_LY = 63241.1;
const LIGHTMIN_PER_AU = 8.3167; // 1 AU = 499 light-seconds

/* → [primary, secondary] strings for a distance in AU. */
function format(au) {
  const ly = au / AU_PER_LY;
  const lightMin = au * LIGHTMIN_PER_AU;
  if (ly >= 0.5) return [`${ly.toFixed(2)} light-years`, `${Math.round(au).toLocaleString()} AU`];
  if (lightMin >= 2880) return [`${(lightMin / 1440).toFixed(1)} light-days`, `${Math.round(au).toLocaleString()} AU`];
  if (lightMin >= 100) return [`${(lightMin / 60).toFixed(1)} light-hours`, `${au.toFixed(1)} AU`];
  if (au >= 0.1) return [`${lightMin.toFixed(1)} light-minutes`, `${au.toFixed(2)} AU`];
  return [`${(au * 149.6).toFixed(1)} million km`, `${Math.round(lightMin * 60)} light-seconds`];
}

function V3ScaleReadout({ cameraRef, activeIdx = 0, finale = false, flying = false }) {
  const priRef = useRef(null);
  const secRef = useRef(null);
  /* Show while flying between stops (the outward scroll), when the résumé panel
     + planet card have faded out and the bottom-left is clear. */
  const show = activeIdx >= 1 && !finale && flying;

  useEffect(() => {
    if (!show) return undefined;
    let raf;
    let last = "";
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const cam = cameraRef?.current;
      if (!cam || !priRef.current) return;
      const au = cam.position.length() / AU_UNIT;
      const [primary, secondary] = format(au);
      if (primary === last) return; // skip DOM writes when the string is unchanged
      last = primary;
      priRef.current.textContent = primary;
      if (secRef.current) secRef.current.textContent = secondary;
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [show, cameraRef]);

  if (!show) return null;

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        left: "clamp(28px, 4vw, 52px)",
        bottom: "clamp(26px, 4vh, 44px)",
        zIndex: 44,
        pointerEvents: "none",
        fontFamily: "var(--v3-font-mono, monospace)",
        textTransform: "uppercase",
        lineHeight: 1.5,
      }}
    >
      <div style={{ fontSize: "clamp(8px, 0.25vw + 6px, 10px)", letterSpacing: ".22em", color: "var(--v3-fg-mute, #7c8391)" }}>
        Distance from the Sun
      </div>
      <div ref={priRef} style={{ fontSize: "clamp(12px, 0.5vw + 9px, 16px)", letterSpacing: ".08em", color: "var(--v3-accent, #cdb891)", marginTop: 3 }} />
      <div ref={secRef} style={{ fontSize: "clamp(8px, 0.25vw + 6px, 10px)", letterSpacing: ".16em", color: "var(--v3-fg-dim, #b3b9c7)", marginTop: 1 }} />
    </div>
  );
}

export default memo(V3ScaleReadout);
