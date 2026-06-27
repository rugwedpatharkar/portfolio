/* eslint-disable react/no-unknown-property */
import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { DESTINATIONS } from "../config/destinations";
import { getOrbit } from "../config/orbits";

/*
 * Faint orbital trails — each planet's REAL orbit, not a circle: the eccentric
 * ellipse (Sun at a focus) tilted by the planet's true inclination, sampled
 * once from the SAME Kepler params the planets actually move on (config/orbits),
 * so each line passes exactly through its planet. Reveals the system's real
 * structure; shown only while the wide pull-back (overview) is active.
 */
const SAMPLES = 256;

const ORBITS = DESTINATIONS.filter((d) => d.kind === "planet").map((d) => {
  const o = getOrbit(d);
  const pts = new Float32Array(SAMPLES * 3);
  for (let k = 0; k < SAMPLES; k++) {
    const th = (k / (SAMPLES - 1)) * Math.PI * 2;
    const r = o.e ? o.p / (1 + o.e * Math.cos(th)) : o.p; // conic, Sun at focus
    const x = Math.cos(th) * r;
    const zp = Math.sin(th) * r;
    pts[k * 3] = x;
    pts[k * 3 + 1] = o.y + zp * o.sinInc; // lift by orbital inclination
    pts[k * 3 + 2] = zp * o.cosInc;
  }
  return { id: d.id, pts, color: d.color || "#cfd6ff" };
});

const OrbitRings = ({ wideRef }) => {
  const groupRef = useRef();
  const { camera } = useThree();
  useFrame(() => {
    const g = groupRef.current;
    if (!g) return;
    const on = !!wideRef?.current; // overview-only; never shown in the tour
    g.visible = on;
    if (!on) return;
    /* Fade out as the camera nears the orbit plane (edge-on), so the ellipses only
       show when they read cleanly from above and never collapse into the stray
       converging lines you get edge-on. elevation: 0 = in-plane, 1 = straight down. */
    const p = camera.position;
    const elevation = Math.abs(p.y) / (p.length() || 1);
    const fade = THREE.MathUtils.clamp((elevation - 0.12) / 0.33, 0, 1);
    g.children.forEach((c) => { if (c.material) c.material.opacity = 0.24 * fade; });
  });
  return (
    <group ref={groupRef} visible={false}>
      {ORBITS.map((o) => (
        <line key={o.id} frustumCulled={false}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[o.pts, 3]} />
          </bufferGeometry>
          <lineBasicMaterial
            color={o.color}
            transparent
            opacity={0.24}
            toneMapped={false}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </line>
      ))}
    </group>
  );
};

export default OrbitRings;
