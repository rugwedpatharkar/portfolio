/* eslint-disable react/no-unknown-property */
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { DESTINATIONS } from "../config/destinations";
import { orbitalPosition } from "../config/orbits";
import { useSceneClock } from "./SceneClock";

/*
 * v3 SYSTEM-OVERVIEW MAP (first page). The tour is true 1:1 scale, so Neptune sits
 * ~77× farther than Mercury — at real distance only the inner planets fit on one
 * screen. So the OVERVIEW uses a COMPRESSED radial layout: evenly-spaced concentric
 * orbits (anchored to the inner-system distance range that already frames well) so
 * ALL planets are visible small — an artistic system map for stop 0 ONLY. The tour
 * itself still flies to each body at its true distance (unchanged).
 *
 * Each proxy is TEXTURED with the planet's real NASA map (so it reads as a miniature
 * of what you see in that planet's section), sized by true relative radius, revolving
 * at its live orbital angle around the Sun at the origin; Saturn keeps its ring.
 *
 * INNER/OUTER are the tuning knobs for how tightly the map packs into the frame.
 */
const SEG = 128;
const INNER = 45; // compressed radius of the innermost orbit (Mercury)
const OUTER = 300; // outermost (Pluto) — within the range that frames cleanly

const PLANETS = DESTINATIONS.filter((d) => d.kind === "planet");
const MAX_R = Math.max(...PLANETS.map((d) => d.radius));
const N = PLANETS.length;

const ORBITS = PLANETS.map((d, i) => {
  const rc = N > 1 ? INNER + (OUTER - INNER) * (i / (N - 1)) : INNER; // compressed radius
  const pts = new Float32Array(SEG * 3);
  for (let k = 0; k < SEG; k++) {
    const th = (k / (SEG - 1)) * Math.PI * 2;
    pts[k * 3] = Math.cos(th) * rc;
    pts[k * 3 + 1] = 0; // flat ecliptic circle; the high overview camera renders it as an ellipse
    pts[k * 3 + 2] = Math.sin(th) * rc;
  }
  const size = 3.5 + 7.5 * Math.sqrt(d.radius / MAX_R); // gas giants read bigger
  return { id: d.id, dest: d, pts, rc, size, tex: d.texture, rings: !!d.rings, ringColor: d.ringColor || "#f0d9a0" };
});

const _p = new THREE.Vector3();

const OrbitRings = ({ wideRef, show = false }) => {
  const linesRef = useRef();
  const markersRef = useRef();
  const clock = useSceneClock();
  /* Reuse each planet's real map — same URLs the full planets load, so drei's
     loader cache dedupes (no extra download). */
  const textures = useTexture(ORBITS.map((o) => o.tex));
  useMemo(() => {
    (Array.isArray(textures) ? textures : [textures]).forEach((t) => {
      if (t) t.colorSpace = THREE.SRGBColorSpace;
    });
  }, [textures]);

  useFrame(() => {
    const lines = linesRef.current, marks = markersRef.current;
    if (!lines) return;
    const on = !!wideRef?.current || show; // overview map / the v3 system-overview hero
    lines.visible = on;
    if (marks) marks.visible = on;
    if (!on) return;

    /* revolve each proxy: take the planet's LIVE orbital angle, place it on the
       COMPRESSED circle, and spin it slowly on its axis. */
    const t = clock?.t || 0;
    if (marks) {
      marks.children.forEach((grp, i) => {
        const o = ORBITS[i];
        if (!o) return;
        orbitalPosition(o.dest, t, _p);
        const ang = Math.atan2(_p.z, _p.x);
        grp.position.set(Math.cos(ang) * o.rc, 0, Math.sin(ang) * o.rc);
        const sphere = grp.children[0];
        if (sphere) sphere.rotation.y = t * 0.04 + i;
      });
    }
    lines.children.forEach((c) => { if (c.material) c.material.opacity = 0.16; });
  });

  return (
    <group>
      <group ref={linesRef} visible={false}>
        {ORBITS.map((o) => (
          <line key={o.id} frustumCulled={false}>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" args={[o.pts, 3]} />
            </bufferGeometry>
            <lineBasicMaterial color="#d4af85" transparent opacity={0.16} toneMapped={false} depthWrite={false} blending={THREE.AdditiveBlending} />
          </line>
        ))}
      </group>
      {/* revolving TEXTURED planet proxies at true relative size */}
      <group ref={markersRef} visible={false}>
        {ORBITS.map((o, i) => (
          <group key={o.id}>
            <mesh>
              <sphereGeometry args={[o.size, 32, 32]} />
              <meshBasicMaterial map={Array.isArray(textures) ? textures[i] : textures} color="#d8d8d8" />
            </mesh>
            {o.rings && (
              <mesh rotation={[Math.PI / 2 - 0.4, 0, 0.12]}>
                <ringGeometry args={[o.size * 1.5, o.size * 2.6, 48]} />
                <meshBasicMaterial color={o.ringColor} transparent opacity={0.65} side={THREE.DoubleSide} depthWrite={false} />
              </mesh>
            )}
          </group>
        ))}
      </group>
    </group>
  );
};

export default OrbitRings;
