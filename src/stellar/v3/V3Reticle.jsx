/*
 * V3Reticle — a hairline FUI targeting reticle + mono label on the ACTIVE planet.
 * Projects the body's LIVE orbital position (the same orbitalPosition the camera
 * frames it by) through the live render camera each frame and pins a DOM bracket
 * to it. Sci-fi restraint: four corner brackets + the body name, fading in on
 * settle. Planet stops only (no Sun/overview/cosmic); off on mobile, reduced
 * motion, and during the fly-through (where the projected point would swim).
 */
import { memo, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { DESTINATIONS } from "../config/destinations";
import { orbitalPosition } from "../config/orbits";
import useViewport from "../useViewport";

const _v = new THREE.Vector3();

const Bracket = ({ corner }) => {
  const s = 13;
  const base = { position: "absolute", width: s, height: s, borderColor: "var(--v3-accent)", borderStyle: "solid", borderWidth: 0 };
  const map = {
    tl: { top: 0, left: 0, borderTopWidth: 1.5, borderLeftWidth: 1.5 },
    tr: { top: 0, right: 0, borderTopWidth: 1.5, borderRightWidth: 1.5 },
    bl: { bottom: 0, left: 0, borderBottomWidth: 1.5, borderLeftWidth: 1.5 },
    br: { bottom: 0, right: 0, borderBottomWidth: 1.5, borderRightWidth: 1.5 },
  };
  return <i style={{ ...base, ...map[corner] }} />;
};

/* memo: cameraRef + clock are stable refs; activeIdx is a per-hop primitive.
   Skips render on panelHidden / extrasPhase / scrollFinale — the reticle only
   needs to switch which body it tracks. */
function V3Reticle({ cameraRef, clock, activeIdx }) {
  const boxRef = useRef(null);
  const { isMobile, reducedMotion } = useViewport();
  const [flying, setFlying] = useState(false);
  const dest = DESTINATIONS[activeIdx];
  const show = !!dest && dest.kind === "planet" && !isMobile && !flying;

  /* Hide during the hyperspace fly-through (the point swims while the camera moves). */
  useEffect(() => {
    const onFlight = (e) => setFlying(!!e.detail?.flying);
    window.addEventListener("stellar:flight", onFlight);
    return () => window.removeEventListener("stellar:flight", onFlight);
  }, []);

  useEffect(() => {
    if (!show) return undefined;
    let raf;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const cam = cameraRef?.current;
      const box = boxRef.current;
      if (!cam || !box) return;
      orbitalPosition(dest, clock?.t || 0, _v);
      _v.project(cam);
      const onScreen = _v.z < 1 && Math.abs(_v.x) < 1.15 && Math.abs(_v.y) < 1.15;
      if (!onScreen) { box.style.opacity = "0"; return; }
      const sx = (_v.x * 0.5 + 0.5) * window.innerWidth;
      const sy = (-_v.y * 0.5 + 0.5) * window.innerHeight;
      box.style.transform = `translate(${sx}px, ${sy}px)`;
      box.style.opacity = "1";
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [show, dest, cameraRef, clock]);

  if (!show) return null;

  return (
    <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: 43, pointerEvents: "none" }}>
      <div ref={boxRef} style={{ position: "absolute", left: 0, top: 0, opacity: 0, transition: reducedMotion ? "none" : "opacity .5s ease", transform: "translate(-200px,-200px)" }}>
        {/* corner brackets, centred on the projected point */}
        <div style={{ position: "absolute", transform: "translate(-50%,-50%)", width: 58, height: 58 }}>
          <Bracket corner="tl" /><Bracket corner="tr" /><Bracket corner="bl" /><Bracket corner="br" />
        </div>
        {/* connector + mono label to the right */}
        <div style={{ position: "absolute", transform: "translate(38px,-50%)", display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap" }}>
          <span style={{ width: 18, height: 1, background: "var(--v3-accent)", opacity: 0.6 }} />
          <span style={{ font: `400 var(--v3-type-cap) var(--v3-font-mono)`, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--v3-accent)" }}>{dest.label}</span>
        </div>
      </div>
    </div>
  );
}

export default memo(V3Reticle);
