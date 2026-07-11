/*
 * V3Frame — the section chrome for every résumé stop in the Planetary Dossier.
 *
 * Full-viewport wrapper with corner tick brackets, hairline zone dividers and a
 * labelled top rule. Reads as an instrument view drawn AROUND the planet, not on
 * top of it. Owns the arrival scan-reveal (passes direction down via context).
 *
 * Layout is CSS Grid with named areas: `top | left | right-top | right-bottom |
 * bottom`. Each section opts into the cells it uses; unused cells stay empty so
 * the planet has visual room. On compact/mobile the grid collapses to a single
 * stack. Reduced-motion → no reveal, static.
 */
import { createContext, useContext } from "react";
import useViewport from "../../useViewport";

/* Passes the current scan direction to V3Scan / arrival-choreography children. */
export const V3ScanContext = createContext({ dir: "horizontal", key: 0 });
export const useV3Scan = () => useContext(V3ScanContext);

export default function V3Frame({
  section,
  planet,           // "MERCURY" etc.
  scanDir = "horizontal",
  scanKey = 0,      // change to re-fire the reveal (e.g. bootNonce)
  children,
  gridAreas,        // optional override; defaults to full L-wrap
}) {
  /* Note: `index` used to be part of the top label strip ("PLANET · SECTION ·
     INDEX") that was removed with the decluttered layout — the section's own
     kicker/heading now rise to the top of the frame. Sections should not pass
     an `index` prop through anymore; it's a no-op. */
  const { isCompact } = useViewport();
  const defaultAreas = isCompact
    ? `"top" "left" "right-top" "right-bottom" "bottom"`
    : `"top top top" "left right-top right-top" "left right-bottom right-bottom" "bottom bottom bottom"`;
  /* Grid ratio locked to 40/20/40 (col1/col2/col3) so a section using the
     standard `"top top top" "left left ."` grid area picks up exactly 60 %
     of the frame width for content and leaves 40 % for the planet + Body
     Telemetry corner card. Rule change vs. earlier 47/33/20 ratio: content
     panels are now a consistent 60% of the screen at every viewport. */
  const gridCols = isCompact ? "1fr" : "minmax(0, 1.2fr) minmax(0, 0.6fr) minmax(0, 1.2fr)";
  const gridRows = isCompact ? "auto" : "auto 1fr auto auto";

  return (
    <V3ScanContext.Provider value={{ dir: scanDir, key: scanKey }}>
      <div
        role="region"
        aria-label={`${planet} ${section}`}
        style={{
          /* pointerEvents:none so empty grid cells (e.g. the planet-zone column)
             pass pointer-move through to the 3D canvas — MouseParallax uses
             canvas pointer, and without this the sun never sways. Each section's
             content children opt back in with pointerEvents:auto on their own
             wrappers (see className="v3-section-content"). */
          pointerEvents: "none",
          position: "relative",
          width: "100%",
          height: isCompact ? "auto" : "min(88vh, 900px)",
          display: "grid",
          gridTemplateAreas: gridAreas || defaultAreas,
          gridTemplateColumns: gridCols,
          gridTemplateRows: gridRows,
          columnGap: isCompact ? 0 : 22,
          rowGap: isCompact ? 14 : 10,
          padding: isCompact ? "6px 2px" : "10px 22px 12px 6px",
        }}
      >
        {/* Top label strip ("PLANET · SECTION · INDEX" + hairline + corner ticks)
            removed per the decluttered layout — each section's own kicker +
            heading now rise to the top of the frame, and the planet name lives
            in the Planet Information card. The "top" grid row simply collapses. */}
        {children}
      </div>
    </V3ScanContext.Provider>
  );
}
