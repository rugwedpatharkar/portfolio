/*
 * DossierCluster — the pickable item grid for a section (no forced ←→ arrowing;
 * every entry is visible at once, pick any). Amber chips; click → onPick(index).
 */
import { FONT, HOLO } from "./holoTokens";

export default function DossierCluster({ items, onPick }) {
  if (!items?.length) return null;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
      {items.map((it, i) => {
        const d = it.dossier || {};
        return (
          <button
            key={i}
            onClick={() => onPick(i)}
            style={{ all: "unset", cursor: "pointer", font: `400 11px ${FONT.body}`, color: "#f0e2c9", border: `1px solid ${HOLO.amberLine}`, background: "rgba(255,180,84,0.08)", borderRadius: 5, padding: "4px 9px", transition: "background .15s, border-color .15s" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,180,84,0.18)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,180,84,0.08)"; }}
          >
            {d.title || it.label}
          </button>
        );
      })}
    </div>
  );
}
