/* eslint-disable react/prop-types */
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

/*
 * Interactive system-overview map. While the wide overview is active, projects
 * every registered object to screen space and shows a clickable hotspot; hover
 * for a detailed info card, click to visit (planets → their résumé stop,
 * anomalies → a free fly-to). A DOM overlay outside the Canvas — reads the live
 * camera via cameraRef and moves hotspots imperatively each frame (no React
 * re-render per frame; only hover changes re-render).
 */

const OverviewMap = ({ objects, cameraRef, visible, onPick }) => {
  const nodeRefs = useRef([]);
  const [hovered, setHovered] = useState(-1);
  const _v = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    if (!visible) return undefined;
    let raf;
    const loop = () => {
      const cam = cameraRef.current;
      if (cam) {
        const w = window.innerWidth;
        const h = window.innerHeight;
        for (let i = 0; i < objects.length; i++) {
          const node = nodeRefs.current[i];
          if (!node) continue;
          const o = objects[i];
          _v.set(o.position[0], o.position[1], o.position[2]).project(cam);
          const onScreen = _v.z < 1 && _v.x > -1.08 && _v.x < 1.08 && _v.y > -1.08 && _v.y < 1.08;
          if (!onScreen) {
            node.style.opacity = "0";
            node.style.pointerEvents = "none";
          } else {
            node.style.transform = `translate(${(_v.x * 0.5 + 0.5) * w}px, ${(-_v.y * 0.5 + 0.5) * h}px)`;
            node.style.opacity = "1";
            node.style.pointerEvents = "auto";
          }
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [visible, objects, cameraRef, _v]);

  if (!visible) return null;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 48, pointerEvents: "none" }}>
      {objects.map((o, i) => (
        <div
          key={o.id}
          ref={(el) => { nodeRefs.current[i] = el; }}
          style={{ position: "absolute", left: 0, top: 0, transform: "translate(-9999px,-9999px)", opacity: 0, willChange: "transform" }}
        >
          <button
            onClick={() => onPick(o)}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered((p) => (p === i ? -1 : p))}
            onFocus={() => setHovered(i)}
            onBlur={() => setHovered((p) => (p === i ? -1 : p))}
            aria-label={`Visit ${o.label}`}
            style={{ all: "unset", cursor: "pointer", position: "absolute", left: -8, top: -8, width: 16, height: 16, display: "grid", placeItems: "center" }}
          >
            <span
              style={{
                width: hovered === i ? 11 : 7,
                height: hovered === i ? 11 : 7,
                borderRadius: "50%",
                background: o.color || "#cfd6ff",
                boxShadow: hovered === i ? `0 0 13px ${o.color || "#cfd6ff"}` : `0 0 5px ${o.color || "#cfd6ff"}99`,
                border: "1px solid rgba(255,255,255,0.6)",
                transition: "all 0.15s ease",
              }}
            />
          </button>
          {hovered === i && (
            <div
              style={{
                position: "absolute",
                left: 15,
                top: -10,
                width: 232,
                pointerEvents: "none",
                background: "rgba(8,11,24,0.85)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: `1px solid ${o.color || "#cfd6ff"}55`,
                borderRadius: 11,
                padding: "11px 13px",
                boxShadow: "0 16px 44px rgba(0,0,0,0.55)",
              }}
            >
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
                <span style={{ fontFamily: "'Michroma', sans-serif", fontSize: 12, color: "white", textTransform: "uppercase", letterSpacing: "0.03em" }}>{o.label}</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8.5, color: o.color || "#cfd6ff", textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>{o.category}</span>
              </div>
              <div style={{ fontFamily: "'Exo 2', sans-serif", fontSize: 11.5, color: "rgba(255,255,255,0.84)", lineHeight: 1.46, marginTop: 6 }}>{o.info}</div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "rgba(255,255,255,0.5)", marginTop: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>click to visit →</div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default OverviewMap;
