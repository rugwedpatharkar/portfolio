/*
 * DossierHologram — RIGHT panel, Tier B (warm amber "crew dossier"). Default: a
 * bespoke one-line summary + the pickable item cluster. Pick an item → its full
 * ItemDossier readout (with a ‹ back). This is the résumé side of the bridge.
 */
import { useState, useEffect } from "react";
import HoloFrame from "./HoloFrame";
import DossierCluster from "./DossierCluster";
import ItemDossier from "../ItemDossier";
import { HOLO, FONT } from "./holoTokens";
import { summaryFor } from "../data/holoSummary";
import useViewport from "../useViewport";

export default function DossierHologram({ destination, section, items, booting, sectionLabel }) {
  const { reducedMotion, isMobile } = useViewport();
  const [picked, setPicked] = useState(-1);
  useEffect(() => { setPicked(-1); }, [section]);
  const depth = isMobile || reducedMotion ? 0 : 5;

  if (picked >= 0 && items?.[picked]) {
    return (
      <HoloFrame tint="amber" depth={depth} style={{ padding: "8px 0 0", width: "100%" }}>
        <button onClick={() => setPicked(-1)} style={{ all: "unset", cursor: "pointer", font: `400 10px ${FONT.mono}`, color: HOLO.amber, padding: "0 13px 4px", display: "block" }}>‹ back</button>
        <div style={{ padding: "0 13px 13px" }}>
          <ItemDossier item={items[picked]} index={picked} total={items.length} sectionLabel={sectionLabel} />
        </div>
      </HoloFrame>
    );
  }

  return (
    <HoloFrame tint="amber" booting={booting} depth={depth} style={{ padding: 13, width: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ font: `400 11px ${FONT.mono}`, color: HOLO.amber }}>// crew dossier</span>
        <span style={{ flex: 1, height: 1, background: HOLO.amberLine }} />
      </div>
      <div style={{ font: `500 18px ${FONT.display}`, color: "#f6efe2", marginTop: 6 }}>{sectionLabel || destination?.label}</div>
      <div style={{ font: `400 12px ${FONT.body}`, color: "#c7d2e8", lineHeight: 1.45, marginTop: 3 }}>{summaryFor(section)}</div>
      {items?.length > 0 && (
        <>
          <div style={{ font: `400 11px ${FONT.body}`, color: "#c79a5a", margin: "9px 0 2px" }}>{items.length} {items.length === 1 ? "entry" : "entries"} · pick any</div>
          <DossierCluster items={items} onPick={setPicked} />
        </>
      )}
    </HoloFrame>
  );
}
