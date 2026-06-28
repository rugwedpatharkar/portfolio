/*
 * FactsHologram — LEFT panel, Tier A (cold cyan telemetry). The scanned planet's
 * real facts from PLANET_FACTS + a wireframe tactical globe. No facts (e.g. Sol) →
 * renders nothing so the bridge just shows the dossier.
 */
import HoloFrame from "./HoloFrame";
import TacticalGlobe from "./TacticalGlobe";
import { HOLO, FONT } from "./holoTokens";
import { PLANET_FACTS } from "../data/planetFacts";
import useViewport from "../useViewport";

const ROWS = [["diameter", "DIA"], ["distance", "DIST"], ["day", "DAY"], ["year", "YEAR"], ["gravity", "GRAV"], ["moons", "MOONS"]];

export default function FactsHologram({ destination, booting }) {
  const { reducedMotion, isMobile } = useViewport();
  const f = destination && PLANET_FACTS[destination.id];
  if (!f) return null;
  const name = (f.body || destination.label || "").split("—")[0].trim();
  const depth = isMobile || reducedMotion ? 0 : 5;

  return (
    <HoloFrame tint="cyan" booting={booting} depth={depth} style={{ padding: 13, width: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
        <i className="ti ti-focus-2" aria-hidden="true" style={{ fontSize: 15, color: HOLO.cyan }} />
        <span style={{ font: `600 15px ${FONT.display}`, color: "#cfe6fb", letterSpacing: ".5px" }}>{name}</span>
        <span style={{ marginLeft: "auto", font: `400 10px ${FONT.mono}`, color: HOLO.cyan, border: `1px solid ${HOLO.cyanLine}`, borderRadius: 3, padding: "1px 6px" }}>SCAN</span>
      </div>
      <div style={{ display: "flex", justifyContent: "center", margin: "8px 0 4px" }}>
        <TacticalGlobe color={HOLO.cyan} size={52} spinning={!reducedMotion && !isMobile} />
      </div>
      <div style={{ font: `400 10px ${FONT.mono}`, color: HOLO.cyan, letterSpacing: "1px", margin: "2px 0 6px" }}>SENSOR READOUT</div>
      {ROWS.map(([k, lab]) => f[k] ? (
        <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 8, padding: "2.5px 0", borderBottom: "1px solid rgba(120,170,230,.08)" }}>
          <span style={{ font: `400 11px ${FONT.mono}`, color: "#7f9ec0" }}>{lab}</span>
          <span style={{ font: `400 11px ${FONT.mono}`, color: "#d3e6fb", textAlign: "right" }}>{f[k]}</span>
        </div>
      ) : null)}
      {f.wow && (
        <div style={{ display: "flex", gap: 5, marginTop: 8 }}>
          <span style={{ color: HOLO.cyan, fontSize: 12, lineHeight: 1.4 }}>◊</span>
          <span style={{ font: `400 11px ${FONT.body}`, color: "#b9c6e0", lineHeight: 1.4 }}>{f.wow}</span>
        </div>
      )}
    </HoloFrame>
  );
}
