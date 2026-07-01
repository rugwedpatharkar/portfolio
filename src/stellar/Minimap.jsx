 
import { DESTINATIONS } from "./config/destinations";

/*
 * Top-right HUD showing all destinations and the visitor's current
 * focus. Always visible. Click any destination to jump scroll there.
 *
 * Style: minimal, monospace, no chrome. Reads as a navigation panel
 * from the ship.
 */

const Minimap = ({ activeIdx, onJump }) => (
  <div
    style={{
      position: "fixed",
      top: "16px",
      right: "16px",
      padding: "12px 14px",
      background: "rgba(5, 8, 22, 0.65)",
      backdropFilter: "blur(10px)",
      WebkitBackdropFilter: "blur(10px)",
      border: "1px solid rgba(255, 255, 255, 0.08)",
      borderRadius: "10px",
      fontFamily: "'Martian Mono', monospace",
      fontSize: "10px",
      color: "rgba(255, 255, 255, 0.65)",
      zIndex: 50,
      lineHeight: 1.7,
      pointerEvents: "auto",
      maxWidth: "180px",
    }}
  >
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "8px",
        fontSize: "9px",
        letterSpacing: "0.1em",
        color: "rgba(255, 255, 255, 0.4)",
      }}
    >
      <span>NAV</span>
      <span>{(activeIdx + 1).toString().padStart(2, "0")} / {DESTINATIONS.length.toString().padStart(2, "0")}</span>
    </div>
    {DESTINATIONS.map((d, i) => {
      const active = i === activeIdx;
      return (
        <div
          key={d.id}
          onClick={() => onJump?.(i)}
          style={{
            cursor: "pointer",
            color: active ? "white" : "rgba(255, 255, 255, 0.55)",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "2px 0",
            transition: "color 150ms ease",
          }}
        >
          <span
            style={{
              display: "inline-block",
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: active ? d.color : "rgba(255, 255, 255, 0.2)",
              flexShrink: 0,
            }}
          />
          <span>{d.id}</span>
        </div>
      );
    })}
  </div>
);

export default Minimap;
