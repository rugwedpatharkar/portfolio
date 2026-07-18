/* eslint-disable react/no-unknown-property */
/*
 * NEAREST-STAR PROPER MOTION — the "living sky" overlay for the finale.
 *
 * The main star field (Stars.jsx / LocalNeighborhood.jsx) is a snapshot: the
 * sky as it looks at J2000. In reality every star is moving, and the closest
 * ones move fastest across our sky — Barnard's Star drifts 10.36"/yr, the
 * highest known proper motion of any star. Over 1,000 years that's ~2.9° —
 * more than five full-Moon diameters. On real astronomical timescales the
 * "fixed" sky is anything but.
 *
 * This overlay renders the top ~6 highest-proper-motion nearby stars as
 * distinct small markers that visibly drift across the sky over scene-time,
 * with each second of scene-time compressed to ~200 real years. It's a subtle
 * effect — the markers move slowly through the fixed-sky backdrop — but it
 * makes the sky demonstrably ALIVE.
 *
 * Values: SIMBAD/Gaia DR3-derived, verified against Wikipedia infoboxes for
 * each star. RA/Dec are J2000; pmRA/pmDec are given in mas/yr (milliarcsec
 * per year) — pmRA is already the pre-multiplied component (cos(dec) baked
 * in, as SIMBAD reports it).
 *
 * Only mounts in the finale (`active` prop) — inside the AU regime this
 * would collide with the planetary layer.
 *
 * Sources: docs/research/06-stars-and-constellations.md §3;
 * docs/research/00-MASTER.md Appendix A #18 ("real proper motion").
 */
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useSceneClock } from "./SceneClock";
import { LY_UNIT } from "../config/scaleRegimes";
import { makeSoftDot } from "./shared/textures";

/* Scene-time compression — 1 scene-second = SECONDS_PER_YEAR years of real
   proper motion. At 200 yr/sec, Barnard's 10.36"/yr becomes ~2073"/sec ≈
   0.58° per scene-second — a visible-but-not-frantic drift. Held reasonably
   modest so the effect reads as "the sky quietly evolves," not "star field
   panicking." */
const YEARS_PER_SCENE_SECOND = 200;
const MAS_TO_RAD = Math.PI / (180 * 3600 * 1000); // milliarcsec → radians

/* Top-6 nearest high-proper-motion stars (SIMBAD/Gaia DR3, verified).
   raHours / decDeg are J2000. pmRA_mas / pmDec_mas already include the
   cos(dec) pre-multiplication (SIMBAD convention). */
const STARS = [
  { name: "Barnard's Star",  raHours: 17.9636, decDeg:   4.6933, distLy:  5.96, pmRA_mas:  -798.7, pmDec_mas: +10328.1, mag: 9.5,  tint: "#ff9a6a" }, // M4V dwarf, ~1/2 % of Sun
  { name: "Kapteyn's Star",  raHours:  5.1957, decDeg: -45.0186, distLy: 12.83, pmRA_mas: +6491.2, pmDec_mas:  -5709.8, mag: 8.9,  tint: "#ffb47a" }, // M1V subdwarf, halo-population
  { name: "Groombridge 1830",raHours: 11.8817, decDeg:  37.7202, distLy: 29.83, pmRA_mas: +4003.7, pmDec_mas:  -5813.6, mag: 6.4,  tint: "#ffe0aa" }, // G8V halo
  { name: "61 Cygni A",      raHours: 21.1153, decDeg:  38.7517, distLy: 11.41, pmRA_mas: +4155.1, pmDec_mas:  +3259.0, mag: 5.2,  tint: "#ffcf8f" }, // K5V, first star with a measured parallax (Bessel 1838)
  { name: "Lalande 21185",   raHours: 11.0553, decDeg:  35.9698, distLy:  8.29, pmRA_mas:  -580.0, pmDec_mas:  -4767.1, mag: 7.5,  tint: "#ffb877" }, // M2V, ~3rd-closest system
  { name: "α Cen A/B",       raHours: 14.6603, decDeg: -60.8354, distLy:  4.37, pmRA_mas: -3608.2, pmDec_mas:   +686.4, mag: 0.0,  tint: "#fff2d8" }, // G2V+K1V, closest star system
];

const OBLIQUITY = 23.44 * (Math.PI / 180);

/* Equatorial (RA/Dec radians) → scene-frame unit vector — identical transform
   to Stars.jsx / LocalNeighborhood.jsx so this overlay agrees with the rest of
   the sky. */
function sceneVec(ra, dec, out) {
  const cd = Math.cos(dec);
  const xe = cd * Math.cos(ra);
  const ye = cd * Math.sin(ra);
  const ze = Math.sin(dec);
  const cosE = Math.cos(OBLIQUITY);
  const sinE = Math.sin(OBLIQUITY);
  return out.set(xe, -ye * sinE + ze * cosE, ye * cosE + ze * sinE);
}

const SPRITE = makeSoftDot({
  size: 64,
  stops: [
    [0, "rgba(255,255,255,1)"],
    [0.28, "rgba(255,255,255,0.85)"],
    [0.6, "rgba(255,255,255,0.18)"],
    [1, "rgba(255,255,255,0)"],
  ],
});

const NearStarsMotion = ({ active = false }) => {
  const groupRef = useRef();
  const spriteRefs = useRef([]);
  const sceneClock = useSceneClock();

  /* Prepare each star's base J2000 direction + its proper-motion vector in
     RA/Dec radians per real year (mas → radians). */
  const stars = useMemo(
    () =>
      STARS.map((s) => ({
        ...s,
        raRad0: s.raHours * Math.PI / 12,
        decRad0: s.decDeg * Math.PI / 180,
        pmRA_rad: s.pmRA_mas * MAS_TO_RAD, // per real year (already cos-corrected)
        pmDec_rad: s.pmDec_mas * MAS_TO_RAD,
        distSU: s.distLy * LY_UNIT,
        /* Marker size scales by apparent magnitude — brighter stars read bigger.
           Range: mag 0 → ~5, mag 9 → ~1.5 (compressed relative to Stars.jsx
           because this overlay is deliberately more prominent). */
        size: Math.max(1.5, 5 - s.mag * 0.35) * LY_UNIT * 0.08,
      })),
    [],
  );

  const scratch = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    if (!active) return;
    /* Real years elapsed at the scene-time compression rate. */
    const yr = sceneClock.t * YEARS_PER_SCENE_SECOND;
    for (let i = 0; i < stars.length; i++) {
      const spr = spriteRefs.current[i];
      if (!spr) continue;
      const s = stars[i];
      /* Advance the sky position by proper motion. pmRA is already
         cos(dec)-multiplied, so we divide it back out when adding to RA. */
      const dec = s.decRad0 + s.pmDec_rad * yr;
      const ra = s.raRad0 + (s.pmRA_rad / Math.max(Math.cos(dec), 1e-6)) * yr;
      sceneVec(ra, dec, scratch).multiplyScalar(s.distSU);
      spr.position.copy(scratch);
    }
  });

  if (!active) return null;

  return (
    <group ref={groupRef}>
      {stars.map((s, i) => (
        <sprite key={s.name} ref={(el) => { spriteRefs.current[i] = el; }} scale={[s.size, s.size, 1]}>
          <spriteMaterial
            map={SPRITE}
            color={s.tint}
            transparent
            opacity={0.9}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </sprite>
      ))}
    </group>
  );
};

export default NearStarsMotion;
