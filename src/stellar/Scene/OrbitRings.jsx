/* eslint-disable react/no-unknown-property */
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { DESTINATIONS } from "../config/destinations";
import { getOrbit, positionAtAngle } from "../config/orbits";

/*
 * True-scale system-overview orbit lines. Each planet's REAL Kepler ellipse
 * (Sun at focus, tilted by real inclination) — same params from `getOrbit()`
 * that the tour planets fly on — sampled into a thin gold line so the overview
 * exposes the actual solar-system layout at true AU distances.
 *
 * The real tour scene ALREADY renders the Sun + all planets at their true
 * positions on every frame; we just need to draw the trail lines here. No
 * synthetic proxies, no compressed radii. Shown on the v3 overview stop (via
 * `show`) — the true orbital structure, gently rendered.
 */
const SEG = 256;
const PLANETS = DESTINATIONS.filter((d) => d.kind === "planet");

const _v = new THREE.Vector3();

const ORBITS = PLANETS.map((d) => {
  const pts = new Float32Array(SEG * 3);
  for (let k = 0; k < SEG; k++) {
    const th = (k / (SEG - 1)) * Math.PI * 2;
    positionAtAngle(d, th, _v);
    pts[k * 3] = _v.x;
    pts[k * 3 + 1] = _v.y;
    pts[k * 3 + 2] = _v.z;
  }
  return { id: d.id, R: getOrbit(d).R, pts };
});

const OrbitRings = ({ show = false }) => {
  const linesRef = useRef();

  useFrame(() => {
    const lines = linesRef.current;
    if (!lines) return;
    lines.visible = show;
    if (!show) return;
    lines.children.forEach((c) => { if (c.material) c.material.opacity = 0.14; });
  });

  return (
    <group>
      <group ref={linesRef} visible={false}>
        {ORBITS.map((o) => (
          <line key={o.id} frustumCulled={false}>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" args={[o.pts, 3]} />
            </bufferGeometry>
            <lineBasicMaterial color="#d4af85" transparent opacity={0.14} toneMapped={false} depthWrite={false} blending={THREE.AdditiveBlending} />
          </line>
        ))}
      </group>
    </group>
  );
};

export default OrbitRings;
