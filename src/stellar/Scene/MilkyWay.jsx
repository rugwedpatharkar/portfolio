/* eslint-disable react/no-unknown-property */
import { useMemo } from "react";
import * as THREE from "three";
import { GALAXY } from "../config/galaxy";
import { makeSoftDot } from "./shared/textures";
import { SKY_SCALE } from "../config/destinations";

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
const RADIUS = 6800 * SKY_SCALE;
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

/* §12.1 — arm-density peaks approximated as gaussians in galactic longitude λ.
   Rather than integrate each log-spiral along the sightline (r(θ) = refR·
   exp(tan(pitch)·(θ - refAz)) intersecting the Sun's radial line), we use the
   documented on-sky longitudes where the major arms visibly concentrate. Real
   naked-eye + long-exposure imagery of the Milky Way peaks at Sagittarius/
   Scutum toward the core, Cygnus at ~80°, Vela/Carina at ~-80°, and Perseus at
   the anticenter. Widths approximate each arm's spanDeg / 2. */
const ARM_PEAKS = [
  { name: "Scutum-Centaurus toward the core", lambdaDeg: -20, sigmaDeg: 22, weight: 0.55 },
  { name: "Cygnus (Orion-Spur outbound)",     lambdaDeg:  75, sigmaDeg: 26, weight: 0.42 },
  { name: "Vela/Carina",                       lambdaDeg: -95, sigmaDeg: 30, weight: 0.36 },
  { name: "Perseus (anticenter)",              lambdaDeg: 155, sigmaDeg: 40, weight: 0.24 },
  { name: "Sagittarius-Carina foreground",     lambdaDeg:  45, sigmaDeg: 18, weight: 0.30 },
];

/* Coalsack Nebula — a prominent dark nebula near Crux (RA 12h50m, Dec -63°).
   From the Sun's frame, Crux is at galactic longitude ~-58° (l ≈ 302°). Adds
   a small, sharp darkening on the band toward the southern arm. */
const COALSACK_LAMBDA_DEG = -58;
const COALSACK_SIGMA_DEG = 5;
const COALSACK_DEPTH = 0.55;

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

    /* Pre-convert arm peak angles to radians for the density sum below. */
    const armPeaks = ARM_PEAKS.map((a) => ({
      lambda: a.lambdaDeg * DegToRad,
      sigma: a.sigmaDeg * DegToRad,
      weight: a.weight,
    }));
    const coalsackLambda = COALSACK_LAMBDA_DEG * DegToRad;
    const coalsackSigma = COALSACK_SIGMA_DEG * DegToRad;

    /* Wrap two angles into [-π, π] and return the wrapped delta. Prevents
       gaussians near λ=±π from missing points on the far side. */
    const angDist = (a, b) => {
      let d = a - b;
      while (d > Math.PI) d -= 2 * Math.PI;
      while (d < -Math.PI) d += 2 * Math.PI;
      return d;
    };

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

      /* §12.1 arm-density boost: gaussians summed across the 5 documented arm
         longitudes. Multiplies onto the base brightness so arm-crossings light
         up (Cygnus, Vela/Carina, Perseus, Sagittarius); non-arm gaps darken
         gently. */
      let armBoost = 1.0;
      for (let a = 0; a < armPeaks.length; a++) {
        const p = armPeaks[a];
        const d = angDist(lambda, p.lambda);
        armBoost += p.weight * Math.exp(-(d * d) / (2 * p.sigma * p.sigma));
      }

      /* Coalsack — a hard darkening toward Crux, only on the band spine
         (|off| small) so it doesn't punch a hole out of the diffuse haze. */
      const cd = angDist(lambda, coalsackLambda);
      const coalsack = 1 - COALSACK_DEPTH * Math.exp(-(cd * cd) / (2 * coalsackSigma * coalsackSigma)) * Math.exp(-(off * off) / (0.04 * 0.04));

      // Colour: warm star-cloud core → cool disk → dim edge, by |spread| + longitude.
      const e = Math.min(1, Math.abs(spread));
      tint.copy(core).lerp(mid, e * 0.7).lerp(edge, (1 - towardCore) * 0.8);
      const bright = (0.42 + 0.95 * towardCore) * rift * coalsack * (0.6 + 0.4 * armBoost) * (1 - e * 0.32);
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
      {/* The `finale` prop is now the "make me the hero" prop — brightens
          size+opacity so the arching band is unmistakably the galaxy.
          Consumers: Milky Way homepage (isMilkyway=true), and the tour
          finale (finale=true). Names kept for continuity. */}
      <pointsMaterial
        size={finale ? 96 : 38}
        sizeAttenuation
        vertexColors
        transparent
        opacity={finale ? 1.0 : 0.24}
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
