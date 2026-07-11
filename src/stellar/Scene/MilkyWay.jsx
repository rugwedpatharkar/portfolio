/* eslint-disable react/no-unknown-property */
import { useMemo } from "react";
import * as THREE from "three";
import { GALAXY } from "../config/galaxy";
import { makeSoftDot } from "./shared/textures";

/*
 * The galactic band — the Milky Way as it TRULY appears from our solar system:
 * the disk seen edge-on from inside, a band arching across the sky. Unlike the
 * old arbitrary-diagonal version, this is placed on the REAL galactic great
 * circle (from galaxy.js: the galactic pole + center directions), brightest
 * toward the Sagittarius core/bulge and feathering to the faint anticenter,
 * split by the Great Rift dust lane. Backdrop shell at ~6800 (behind the
 * true-scale system + Stars, inside the skybox at 7000); additive + subtle so
 * it reads as grandeur, not clutter. Static like the star field (the sky sits
 * at infinity). No post pass (the scene allows exactly one).
 *
 * Data-driven: change galaxy.js and the band re-places itself. See
 * docs/galaxy/technical-scale-regimes.md §3.
 */

const POINT_COUNT = 11000;
const RADIUS = 6800;
const OBLIQUITY = 23.44 * (Math.PI / 180);
const HgToRad = Math.PI / 12; // hours → radians
const DegToRad = Math.PI / 180;

/* Equatorial RA/Dec (radians) → scene-frame unit vector. IDENTICAL transform to
   Scene/Stars.jsx so the band, the real star field and the skybox share one sky:
   equatorial → ecliptic (obliquity ε) → scene [x=xe, y=eclNorth, z=yEcl]. */
function sceneVec(raRad, decRad, out) {
  const cd = Math.cos(decRad);
  const xe = cd * Math.cos(raRad);
  const ye = cd * Math.sin(raRad);
  const ze = Math.sin(decRad);
  const cosE = Math.cos(OBLIQUITY);
  const sinE = Math.sin(OBLIQUITY);
  const yEcl = ye * cosE + ze * sinE;
  const zEcl = -ye * sinE + ze * cosE;
  return out.set(xe, zEcl, yEcl);
}

const DUST_TEXTURE = makeSoftDot({
  size: 64,
  stops: [
    [0, "rgba(255,255,255,1)"],
    [0.4, "rgba(255,255,255,0.35)"],
    [1, "rgba(255,255,255,0)"],
  ],
  mipmaps: true,
});

const MilkyWay = ({ finale = false }) => {
  const { positions, colors, sizes } = useMemo(() => {
    const { galacticNorthPole: pole, galacticCenter: center } = GALAXY.orientation;

    // Real galactic frame in scene space: P = pole (band-plane normal),
    // C = galactic-center direction. U spans the plane pointing at the core, V
    // completes the right-handed basis. Points ride the great circle ⊥ P.
    const P = sceneVec(pole.raHours * HgToRad, pole.decDeg * DegToRad, new THREE.Vector3()).normalize();
    const C = sceneVec(center.raHours * HgToRad, center.decDeg * DegToRad, new THREE.Vector3()).normalize();
    const U = C.clone().addScaledVector(P, -C.dot(P)).normalize(); // core direction, in-plane
    const V = new THREE.Vector3().crossVectors(P, U).normalize();

    const positions = new Float32Array(POINT_COUNT * 3);
    const colors = new Float32Array(POINT_COUNT * 3);
    const sizes = new Float32Array(POINT_COUNT);
    const dir = new THREE.Vector3();

    // Accurate naked-eye/long-exposure Milky Way: a pale cream-white band, very
    // slightly warm toward the star-cloud bulge, cooling to a faint pale blue —
    // NOT the vivid blue/gold of the earlier stylised pass.
    const core = new THREE.Color("#f6ecd8"); // warm cream star clouds toward the bulge
    const mid = new THREE.Color("#d3d9e2"); // pale blue-white disk
    const edge = new THREE.Color("#9199a6"); // muted grey-blue toward the anticenter
    const tint = new THREE.Color();

    for (let i = 0; i < POINT_COUNT; i++) {
      // Galactic longitude λ measured from the core (λ=0 → Sagittarius). Bias the
      // SAMPLING toward the core so density peaks at the bulge (sample two angles,
      // keep the one nearer 0) — cheap importance sampling.
      const a = Math.random() * 2 * Math.PI - Math.PI;
      const b = Math.random() * 2 * Math.PI - Math.PI;
      const lambda = Math.abs(a) < Math.abs(b) ? a : b;
      const towardCore = 0.5 + 0.5 * Math.cos(lambda); // 1 at core, 0 at anticenter

      // Gaussian-ish thickness off the plane; the disk is thinner toward the core.
      const spread = (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;
      const halfWidth = 0.16 + 0.14 * (1 - towardCore); // radians; flares to the anticenter
      const off = spread * halfWidth;

      // point on the sphere: in-plane direction tilted off-plane toward ±P
      dir.copy(U).multiplyScalar(Math.cos(lambda)).addScaledVector(V, Math.sin(lambda));
      dir.multiplyScalar(Math.cos(off)).addScaledVector(P, Math.sin(off)).normalize();
      const r = RADIUS * (0.985 + Math.random() * 0.03);
      positions[i * 3] = dir.x * r;
      positions[i * 3 + 1] = dir.y * r;
      positions[i * 3 + 2] = dir.z * r;

      // Great Rift: a dark dust lane along the spine, strongest toward the core.
      const rift = 1 - 0.7 * towardCore * Math.exp(-(off * off) / (0.05 * 0.05));

      // Colour: warm star-cloud core → cool disk → dim edge, by |spread| + longitude.
      const e = Math.min(1, Math.abs(spread));
      tint.copy(core).lerp(mid, e * 0.7).lerp(edge, (1 - towardCore) * 0.8);
      const bright = (0.42 + 0.95 * towardCore) * rift * (1 - e * 0.32);
      colors[i * 3] = tint.r * bright;
      colors[i * 3 + 1] = tint.g * bright;
      colors[i * 3 + 2] = tint.b * bright;

      sizes[i] = 1.6 + Math.random() * 3.4 + towardCore * 2.6;
    }
    return { positions, colors, sizes };
  }, []);

  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={POINT_COUNT} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={POINT_COUNT} array={colors} itemSize={3} />
        <bufferAttribute attach="attributes-size" count={POINT_COUNT} array={sizes} itemSize={1} />
      </bufferGeometry>
      <pointsMaterial
        size={finale ? 58 : 38}
        sizeAttenuation
        vertexColors
        transparent
        opacity={finale ? 0.55 : 0.24}
        depthWrite={false}
        map={DUST_TEXTURE}
        alphaTest={0.01}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </points>
  );
};

export default MilkyWay;
