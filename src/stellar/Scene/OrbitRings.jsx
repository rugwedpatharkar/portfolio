/* eslint-disable react/no-unknown-property */
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { DESTINATIONS } from "../config/destinations";
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
const INNER = 50; // compressed radius of the innermost orbit (Mercury)
const OUTER = 285; // outermost (Pluto) — wide enough that the flat rings span the full screen width

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
  const size = 4.6 + 9 * Math.sqrt(d.radius / MAX_R); // gas giants read bigger
  /* Synthetic revolve for the overview (true periods make outer planets look
     frozen). Golden-angle stagger so they never line up; inner planets faster
     (Keplerian feel) but ALL visibly moving — a loop takes ~30s (inner) to ~70s. */
  const theta0 = i * 2.39996;
  const omega = 0.22 * Math.sqrt(INNER / rc);
  return { id: d.id, dest: d, pts, rc, size, theta0, omega, tex: d.texture, rings: !!d.rings, ringColor: d.ringColor || "#f0d9a0" };
});

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

    /* revolve each proxy along its COMPRESSED circle at the synthetic angle, and
       spin it slowly on its axis — the whole system visibly turns within the frame. */
    const t = clock?.t || 0;
    if (marks) {
      marks.children.forEach((grp, i) => {
        const o = ORBITS[i];
        if (!o) return;
        const ang = o.theta0 + t * o.omega;
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
