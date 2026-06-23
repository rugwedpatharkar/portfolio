/* eslint-disable react/prop-types */
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { chartedSet } from "./data/explorer";

/*
 * Cockpit proximity radar (shown while piloting). Plots every object on a
 * top-down sweep relative to the ship's heading — "up" = forward. Blips are
 * positioned imperatively each frame (no per-frame React re-render); clicking a
 * blip target-locks + warps to it. Uncharted anomalies show as masked "?" pings.
 */

const RANGE = 60; // world units mapped to the radar edge
const R = 52; // radar radius (px)

const Radar = ({ objects, cameraRef, visible, onPick }) => {
  const blipRefs = useRef([]);
  const [charted, setCharted] = useState(() => chartedSet());
  const scratch = useMemo(() => ({ fwd: new THREE.Vector3(), right: new THREE.Vector3(), d: new THREE.Vector3() }), []);

  useEffect(() => {
    const refresh = () => setCharted(chartedSet());
    window.addEventListener("stellar:progress", refresh);
    return () => window.removeEventListener("stellar:progress", refresh);
  }, []);

  useEffect(() => {
    if (!visible) return undefined;
    let raf;
    const loop = () => {
      const cam = cameraRef.current;
      if (cam) {
        cam.getWorldDirection(scratch.fwd); scratch.fwd.y = 0; scratch.fwd.normalize();
        scratch.right.set(scratch.fwd.z, 0, -scratch.fwd.x);
        for (let i = 0; i < objects.length; i++) {
          const node = blipRefs.current[i];
          if (!node) continue;
          const o = objects[i];
          scratch.d.set(o.position[0], o.position[1], o.position[2]).sub(cam.position);
          const dist = scratch.d.length();
          if (dist > RANGE) { node.style.opacity = "0"; continue; }
          const f = scratch.d.dot(scratch.fwd);
          const r = scratch.d.dot(scratch.right);
          const bx = (r / RANGE) * R;
          const by = -(f / RANGE) * R;
          node.style.transform = `translate(${bx}px, ${by}px)`;
          node.style.opacity = String(0.4 + 0.6 * (1 - dist / RANGE));
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [visible, objects, cameraRef, scratch]);

  if (!visible) return null;

  return (
    <div style={{
      position: "fixed", bottom: 22, right: 22, width: R * 2, height: R * 2, zIndex: 37,
      borderRadius: "50%", background: "radial-gradient(circle, rgba(0,206,168,0.07), rgba(6,9,22,0.7))",
      border: "1px solid rgba(0,206,168,0.4)", boxShadow: "0 0 24px rgba(0,206,168,0.12)",
      overflow: "hidden",
    }}>
      {/* rings + crosshair */}
      <div style={{ position: "absolute", inset: "25%", borderRadius: "50%", border: "1px solid rgba(0,206,168,0.18)" }} />
      <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 1, background: "rgba(0,206,168,0.14)" }} />
      <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 1, background: "rgba(0,206,168,0.14)" }} />
      {/* sweep */}
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "conic-gradient(rgba(0,206,168,0.32), rgba(0,206,168,0) 60deg)", animation: "radarSweep 3.2s linear infinite" }} />
      {/* center (ship) */}
      <div style={{ position: "absolute", left: "50%", top: "50%", width: 4, height: 4, marginLeft: -2, marginTop: -2, borderRadius: "50%", background: "#00cea8" }} />
      {/* blips */}
      <div style={{ position: "absolute", left: "50%", top: "50%" }}>
        {objects.map((o, i) => {
          const masked = o.visit.kind === "focus" && !charted.has(o.id);
          const color = masked ? "#8893a8" : (o.color || "#cfd6ff");
          return (
            <button
              key={o.id}
              ref={(el) => { blipRefs.current[i] = el; }}
              onClick={() => onPick(o)}
              aria-label={masked ? "Warp to unknown contact" : `Warp to ${o.label}`}
              title={masked ? "Unknown contact" : o.label}
              style={{ all: "unset", cursor: "pointer", position: "absolute", left: -4, top: -4, width: 8, height: 8, opacity: 0 }}
            >
              <span style={{ display: "block", width: 6, height: 6, margin: 1, borderRadius: o.visit.kind === "stop" ? "50%" : 1, background: color, boxShadow: `0 0 5px ${color}` }} />
            </button>
          );
        })}
      </div>
      <style>{`@keyframes radarSweep { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Radar;
