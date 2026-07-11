/* eslint-disable react/no-unknown-property */
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { lumpyRock } from "./shared/geometry";

/*
 * Instanced belt — N spectral families rendered as N draw calls, each with its
 * own lumpy icosahedral geometry. Works for both the main asteroid belt
 * (rocky/metallic families with a radial C/S/M/D taxonomy) and the Kuiper belt
 * (icy/tholin families with the bimodal RR/BB colour split).
 *
 * Scientific accuracy references (docs/architecture/belt-research.md):
 *
 *   MAIN BELT
 *     Zonation is the belt's defining fingerprint. From inner (~2.1 AU) to
 *     outer (~3.3 AU): E/Hungaria bright silicate → S-type reddish silicate
 *     → M-type metallic grey → C-type dark carbonaceous → D-type dark
 *     reddish-brown. C dominates ~75% of catalogued members overall, but the
 *     spatial distribution is anything but uniform — S peaks inner, C peaks
 *     outer, so `weights` here is a FUNCTION of radial fraction, not a
 *     constant array.
 *
 *     Kirkwood gaps at the 4:1 (edge, 2.06 AU), 3:1 (2.50), 5:2 (2.82),
 *     7:3 (2.96), 2:1 (3.27) mean-motion resonances with Jupiter clear
 *     ~50-80% of bodies at those semi-major axes. Modelled here as spawn-
 *     time density notches — the belt in space isn't swept, but the
 *     initial-condition histogram is.
 *
 *   KUIPER BELT
 *     Two co-located populations with distinct colours: RR (cold classical,
 *     i<5°, rusty-red tholins) and BB (hot classical + resonant, neutral
 *     grey-blue). Resonance clumps appear at 39.4 AU (Plutinos, 3:2 with
 *     Neptune) and 47.7 AU (Twotinos, 2:1); the Kuiper Cliff drops density
 *     sharply near 48 AU. Modelled here as DENSITY SPIKES at the clump
 *     centres plus the cliff falloff.
 *
 * Per-instance orientation + non-uniform stretch + a fat-tailed size mix
 * (dust-grade gravel → a rare planetesimal) sell the "millions of bodies at
 * every scale" look without the false "dense shrapnel field" a naïve
 * rendering would produce. Real inter-object spacing is ~600,000 miles at
 * km-scale; here we exaggerate silhouette size by 3-4 orders of magnitude
 * so the belt is readable at all.
 */

/* Main-belt spectral families. Real reflectance colours from SDSS asteroid
   photometry + IR albedo surveys, hex-mapped for a lit-material render.
   0 = E/Hungaria bright, 1 = S-type reddish silicate, 2 = M-type metallic,
   3 = C-type dark carbonaceous, 4 = D-type dark reddish-brown outer. */
export const MAIN_FAMILIES = [
  { color: "#b8a888", metal: 0.06, rough: 0.72 }, // E / Hungaria (~1.9-2.0 AU)
  { color: "#a67a55", metal: 0.18, rough: 0.82 }, // S-type
  { color: "#7c7a76", metal: 0.55, rough: 0.42 }, // M-type
  { color: "#3a3530", metal: 0.04, rough: 0.96 }, // C-type
  { color: "#4a2f22", metal: 0.04, rough: 0.94 }, // D-type
];

/* Radial weight profile for the main belt — argument `frac` is the position
   0..1 across [innerRadius, outerRadius]. Returned array has one weight per
   family in MAIN_FAMILIES; caller normalises. Inner belt is S-dominated;
   outer belt is C-dominated; a D-type tail lives at the very outer edge. */
export const mainWeightsFor = (frac) => {
  if (frac < 0.05) return [0.70, 0.25, 0.05, 0.00, 0.00]; // inner Hungaria edge
  if (frac < 0.35) return [0.10, 0.55, 0.08, 0.25, 0.02]; // S-dominated
  if (frac < 0.60) return [0.02, 0.28, 0.05, 0.60, 0.05]; // mixed, C rising
  if (frac < 0.85) return [0.00, 0.10, 0.02, 0.78, 0.10]; // C-dominated
  return [0.00, 0.03, 0.01, 0.60, 0.36];                  // D-type outer edge
};

/* Kuiper family palette — bimodal on colour (RR = red-red, BB = blue-blue in
   TNO taxonomy) plus an intermediate. Albedo of large classicals is around
   0.1; the biggest bodies (Eris, Makemake) reach 0.9 but those render as
   named meshes elsewhere, not in the belt scatter. */
export const KUIPER_FAMILIES = [
  { color: "#7a7a78", metal: 0.03, rough: 0.90 }, // BB neutral grey-blue
  { color: "#c05a3a", metal: 0.03, rough: 0.90 }, // RR rusty red tholins
  { color: "#a48068", metal: 0.05, rough: 0.85 }, // intermediate ochre
];

/* Cold classicals (42-48 AU) are almost exclusively RR-red; hot classicals
   spread grey-neutral across the whole belt. Interior sparse plutino zone
   picks up more BB; scattered edge trends mixed. */
export const kuiperWeightsFor = (frac) => {
  if (frac < 0.30) return [0.55, 0.15, 0.30]; // inner scattered / early plutinos
  if (frac < 0.85) return [0.28, 0.56, 0.16]; // classical belt: RR-dominant
  return [0.45, 0.30, 0.25];                  // outer edge / early scattered disc
};

/* Slight differential rotation per family so the belt doesn't drift as a
   rigid wheel — S/C rocks are on slightly different mean-motion regimes. */
const DEFAULT_DRIFTS = [0.010, 0.013, 0.016, 0.019, 0.022];

const Family = ({ instances, geometry, mat, drift, animate = true }) => {
  const groupRef = useRef();

  const fill = (mesh) => {
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    instances.forEach((a, i) => {
      dummy.position.set(Math.cos(a.angle) * a.radius, a.y, Math.sin(a.angle) * a.radius);
      dummy.rotation.set(a.rx, a.ry, a.rz);
      dummy.scale.set(a.scale * a.xStretch, a.scale * a.yStretch, a.scale * a.zStretch);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  };

  useFrame((_, delta) => {
    if (animate && groupRef.current) groupRef.current.rotation.y += delta * drift;
  });

  return (
    <group ref={groupRef}>
      <instancedMesh ref={fill} args={[undefined, undefined, instances.length]} frustumCulled={false}>
        <primitive object={geometry} attach="geometry" />
        <meshStandardMaterial color={mat.color} roughness={mat.rough} metalness={mat.metal} flatShading />
      </instancedMesh>
    </group>
  );
};

/* Kirkwood-gap sampler with optional resonance CLUMPS (density spikes) and
   Kuiper-cliff falloff. Gaps + clumps are arrays of fractional belt
   positions; a rejection-sampling pass discards ~90% of picks in gaps and
   over-samples near clumps by boosting the accept probability. All costs
   are at generation time — zero per-frame overhead. */
const GAP_HALF_WIDTH = 0.03;
const CLUMP_HALF_WIDTH = 0.02;
const sampleRadius = (innerRadius, outerRadius, gaps, clumps, cliff) => {
  for (let t = 0; t < 12; t++) {
    const radius = innerRadius + Math.random() * (outerRadius - innerRadius);
    const frac = (radius - innerRadius) / (outerRadius - innerRadius);

    /* Kirkwood-style gap: reject 90% of picks inside the notch. */
    if (gaps && gaps.some((g) => Math.abs(frac - g) < GAP_HALF_WIDTH) && Math.random() > 0.1) continue;

    /* Kuiper Cliff: sharp density drop near 48 AU. Cliff shoulder starts at
       frac 0.88 (~47.6 AU) and reaches near-zero by 0.94 (~48.8 AU) so the
       transition matches OSSOS/DES observations, not a gentle taper. */
    if (cliff) {
      const keep = frac < 0.88 ? 1 : Math.max(0.02, 1 - (frac - 0.88) / 0.05);
      if (Math.random() > keep) continue;
    }

    /* Resonance clumps: OVER-accept picks near clump centres so the belt
       shows density spikes at the Plutino / Twotino radii. */
    if (clumps) {
      let bonus = 0;
      for (const c of clumps) {
        const d = Math.abs(frac - c);
        if (d < CLUMP_HALF_WIDTH) bonus = Math.max(bonus, 1 - d / CLUMP_HALF_WIDTH);
      }
      /* Accept the pick, but re-roll if it's a "normal" background sample and
         we WANTED a clump-boost — this makes clumps ~1.4× denser than the
         local background without ballooning body count. */
      if (bonus > 0 && Math.random() < 0.4 * (1 - bonus)) continue;
    }
    return { radius, frac };
  }
  const radius = innerRadius + Math.random() * (outerRadius - innerRadius);
  return { radius, frac: (radius - innerRadius) / (outerRadius - innerRadius) };
};

/* Weighted family pick — accepts an arbitrary-length weights array. */
const pickFamily = (weights) => {
  let sum = 0;
  for (let i = 0; i < weights.length; i++) sum += weights[i];
  let r = Math.random() * sum;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r <= 0) return i;
  }
  return weights.length - 1;
};

const AsteroidBelt = ({
  count = 600,
  innerRadius = 18.5,
  outerRadius = 20.5,
  size = 0.08,
  thickness = 0.5,
  /* Kirkwood gap fractional positions (0..1 across the belt width). */
  gaps = null,
  /* Resonance-clump fractional positions (0..1). Optional; Kuiper uses this
     to boost the Plutinos + Twotinos density spikes. */
  clumps = null,
  /* Sharp density falloff toward the outer edge (Kuiper Cliff). */
  cliff = false,
  /* Spectral family palette + radial weight profile. Both defaultable to
     the main-belt values so unadorned callers keep working. */
  families = MAIN_FAMILIES,
  weights = mainWeightsFor,
  animate = true,
}) => {
  /* One lumpy geometry per family (different seed → different silhouette).
     Larger families get slightly higher subdivision detail so the very
     lumpiest rocks read at the closest zoom. */
  const geometries = useMemo(
    () => families.map((_, i) => lumpyRock({ detail: 1, seed: 11.3 + i * 27.5, amp: 0.5 + (i % 3) * 0.1 })),
    [families]
  );

  const buckets = useMemo(() => {
    const out = families.map(() => []);
    const weightsFn = typeof weights === "function" ? weights : () => weights;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const { radius, frac } = sampleRadius(innerRadius, outerRadius, gaps, clumps, cliff);
      /* Rayleigh-esque vertical dispersion (sum of two uniforms) matches the
         real inclination profile — peak near the mid-plane, sparse outliers
         at high inclination. Scale height compressed for tour readability. */
      const y = (Math.random() + Math.random() - 1) * 0.5 * thickness;
      /* Multi-tier fat-tailed size mix: mostly gravel, a third small, ~7%
         large, ~0.8% giant. Fits the real N ~ D^-3 power law loosely. */
      const r = Math.random();
      let baseScale;
      if (r > 0.992)      baseScale = size * (5.0 + Math.random() * 7.0);   // rare giants
      else if (r > 0.93)  baseScale = size * (2.2 + Math.random() * 2.6);   // large
      else if (r > 0.62)  baseScale = size * (0.7 + Math.random() * 1.3);   // small
      else                baseScale = size * (0.16 + Math.random() * 0.5); // gravel
      const familyIdx = pickFamily(weightsFn(frac));
      out[familyIdx].push({
        angle, radius, y, scale: baseScale,
        xStretch: 0.65 + Math.random() * 0.7,
        yStretch: 0.65 + Math.random() * 0.7,
        zStretch: 0.65 + Math.random() * 0.7,
        rx: Math.random() * Math.PI * 2,
        ry: Math.random() * Math.PI * 2,
        rz: Math.random() * Math.PI * 2,
      });
    }
    return out;
  }, [count, innerRadius, outerRadius, size, thickness, gaps, clumps, cliff, weights, families]);

  return (
    <>
      {buckets.map((instances, family) =>
        instances.length > 0 ? (
          <Family
            key={family}
            instances={instances}
            geometry={geometries[family]}
            mat={families[family]}
            drift={DEFAULT_DRIFTS[family % DEFAULT_DRIFTS.length]}
            animate={animate}
          />
        ) : null
      )}
    </>
  );
};

export default AsteroidBelt;
