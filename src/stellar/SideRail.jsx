/* eslint-disable react/prop-types */
import { DESTINATIONS } from "./config/destinations";

/*
 * Left-edge vertical destination index. Mission-roster style: numbered
 * markers stacked vertically with the active one highlighted by its
 * destination colour and a filled circle. Click to fly.
 *
 * Companion to the top-right Minimap — together they bracket the
 * canvas and reinforce the "spaceship UI" feel.
 */

const SideRail = ({ activeIdx, onJump }) => (
  <div
    style={{
      position: "fixed",
      left: 18,
      top: "50%",
      transform: "translateY(-50%)",
      display: "flex",
      flexDirection: "column",
      gap: 4,
      zIndex: 30,
      pointerEvents: "auto",
      fontFamily: "'JetBrains Mono', monospace",
    }}
  >
    {DESTINATIONS.map((d, i) => {
      const active = i === activeIdx;
      return (
        <button
          key={d.id}
          onClick={() => onJump?.(i)}
          aria-label={`Jump to ${d.label}`}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "4px 8px",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            fontFamily: "inherit",
            color: active ? "white" : "rgba(255,255,255,0.32)",
            transition: "color 220ms ease",
            outline: "none",
          }}
        >
          <span
            style={{
              fontSize: 9,
              fontWeight: 500,
              minWidth: 18,
              color: active ? d.color : "rgba(255,255,255,0.25)",
            }}
          >
            {String(i + 1).padStart(2, "0")}
          </span>
          <span
            style={{
              width: active ? 28 : 8,
              height: 1,
              background: active ? d.color : "rgba(255,255,255,0.18)",
              transition: "width 260ms ease, background 220ms ease",
            }}
          />
          <span
            style={{
              fontSize: 10,
              opacity: active ? 1 : 0,
              transform: active ? "translateX(0)" : "translateX(-4px)",
              transition: "opacity 220ms ease, transform 220ms ease",
              letterSpacing: "0.06em",
              color: d.color,
              textTransform: "uppercase",
              whiteSpace: "nowrap",
            }}
          >
            {d.label}
          </span>
        </button>
      );
    })}
  </div>
);

export default SideRail;
