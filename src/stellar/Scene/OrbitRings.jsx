/* eslint-disable react/no-unknown-property */
import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { DESTINATIONS } from "../config/destinations";
import { getOrbit, orbitalPosition } from "../config/orbits";
import { useSceneClock } from "./SceneClock";

/*
 * Faint orbital trails + revolving planet markers. Each planet's REAL eccentric
 * orbit (Sun at a focus, tilted by true inclination) sampled from the SAME Kepler
 * params the planets move on (config/orbits), so each line passes exactly through
 * its planet. In v3 the lines are a uniform premium gold hairline, and a small
 * glowing marker rides each orbit at the planet's LIVE position — so the whole
 * system visibly revolves on the overview. Shown in overview mode + the v3 hero.
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
  /* v3: a single premium faint-gold hairline for the orbit; the marker keeps the
     planet's real colour so it reads as that world revolving. */
  return { id: d.id, dest: d, pts, color: "#d4af85", dot: d.color || "#cfd6ff" };
});

const OrbitRings = ({ wideRef, show = false }) => {
  const linesRef = useRef();
  const markersRef = useRef();
  const { camera } = useThree();
  const clock = useSceneClock();

  useFrame(() => {
    const lines = linesRef.current, marks = markersRef.current;
    if (!lines) return;
    const on = !!wideRef?.current || show; // overview mode OR the v3 system-overview hero
    lines.visible = on;
    if (marks) marks.visible = on;
    if (!on) return;

    /* revolve the markers along their orbits at the live clock time */
    if (marks) {
      const t = clock?.t || 0;
      marks.children.forEach((m, i) => {
        if (ORBITS[i]) orbitalPosition(ORBITS[i].dest, t, m.position);
      });
    }

    /* v3 hero (show) → fixed faint opacity; overview → fade near edge-on. */
    if (show && !wideRef?.current) {
      lines.children.forEach((c) => { if (c.material) c.material.opacity = 0.16; });
      return;
    }
    const p = camera.position;
    const elevation = Math.abs(p.y) / (p.length() || 1);
    const fade = THREE.MathUtils.clamp((elevation - 0.12) / 0.33, 0, 1);
    lines.children.forEach((c) => { if (c.material) c.material.opacity = 0.24 * fade; });
  });

  return (
    <group>
      <group ref={linesRef} visible={false}>
        {ORBITS.map((o) => (
          <line key={o.id} frustumCulled={false}>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" args={[o.pts, 3]} />
            </bufferGeometry>
            <lineBasicMaterial color={o.color} transparent opacity={0.16} toneMapped={false} depthWrite={false} blending={THREE.AdditiveBlending} />
          </line>
        ))}
      </group>
      {/* revolving planet markers — a bright core + a soft additive halo (glows via Bloom) */}
      <group ref={markersRef} visible={false}>
        {ORBITS.map((o) => (
          <group key={o.id}>
            <mesh>
              <sphereGeometry args={[3.4, 16, 16]} />
              <meshBasicMaterial color={o.dot} toneMapped={false} />
            </mesh>
            <mesh>
              <sphereGeometry args={[7, 16, 16]} />
              <meshBasicMaterial color={o.dot} transparent opacity={0.28} toneMapped={false} depthWrite={false} blending={THREE.AdditiveBlending} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
};

export default OrbitRings;
