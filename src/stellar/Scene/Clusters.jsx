/* eslint-disable react/no-unknown-property */
/*
 * STAR CLUSTERS — real globular + open clusters at real J2000 RA/Dec on the
 * sky-fixed shell. Small compact fuzzy dots that fill the "empty" sky with
 * genuine astronomical detail: every one of these is a naked-eye or
 * binocular object with a rich history.
 *
 * GLOBULARS  (yellow-white, 10-11 Gyr, dense old-star swarms)
 *   M13  · Hercules Cluster — 25 kly, ~300k stars
 *   M22  · Sagittarius — 10.6 kly, brightest northern globular
 *   M4   · Antares neighbour — 7.2 kly, closest globular
 *   47 Tucanae · NGC 104 — 15 kly, second-brightest globular after ω Cen
 *   M3   · Canes Venatici — 34 kly
 *   M92  · Hercules — 27 kly
 *   M15  · Pegasus — 33 kly
 *   M5   · Serpens — 25 kly
 *   NGC 6752 · Pavo — 13 kly, third-brightest globular
 *
 * OPEN CLUSTERS  (blue-white, young 100 Myr, loose star groupings)
 *   M45  · Pleiades — 444 ly, seven sisters (already handled as reflection)
 *   Hyades — 153 ly, closest open cluster to Sol
 *   M44  · Beehive / Praesepe — 610 ly, in Cancer
 *   h + χ Persei · NGC 869/884 — 7,600 ly, double cluster
 *   M6   · Butterfly — 1,600 ly, in Scorpius
 *   M7   · Ptolemy — 980 ly, in Scorpius (bright naked-eye)
 *   M11  · Wild Duck — 6,200 ly, in Scutum (dense open cluster)
 *   M35  · Gemini — 2,800 ly
 *   Coma Star Cluster · Mel 111 — 280 ly
 *
 * Rendered as soft additive sprites with per-cluster tint. Globulars use a
 * tighter denser sprite (compact yellow-white core); opens use a looser
 * bluer sprite. Sky-fixed shell = the same shell as Stars.jsx / Nebulae.jsx
 * so everything agrees on where a real direction points.
 *
 * Sources: SEDS Messier catalogue + Wikipedia infoboxes.
 */
import { useMemo } from "react";
import * as THREE from "three";
import { makeSoftDot } from "./shared/textures";
import { SKY_SCALE } from "../config/destinations";

const R = 6650 * SKY_SCALE;  // just inside the Milky Way band shell
const OBLIQUITY = 23.44 * Math.PI / 180;

function sceneVec(raHours, decDeg, out) {
  const ra = raHours * Math.PI / 12;
  const dec = decDeg * Math.PI / 180;
  const cd = Math.cos(dec);
  const xe = cd * Math.cos(ra);
  const ye = cd * Math.sin(ra);
  const ze = Math.sin(dec);
  const cosE = Math.cos(OBLIQUITY);
  const sinE = Math.sin(OBLIQUITY);
  return out.set(xe, -ye * sinE + ze * cosE, ye * cosE + ze * sinE).normalize();
}

/* Dense globular sprite — tight compact core, quick falloff. */
const GLOBULAR_SPRITE = makeSoftDot({
  size: 128,
  stops: [
    [0, "rgba(255,255,255,1)"],
    [0.15, "rgba(255,244,214,0.95)"],
    [0.35, "rgba(255,222,164,0.55)"],
    [0.75, "rgba(220,180,120,0.14)"],
    [1, "rgba(180,140,90,0)"],
  ],
  mipmaps: true,
});

/* Looser open-cluster sprite — softer falloff, blue-white. */
const OPEN_SPRITE = makeSoftDot({
  size: 128,
  stops: [
    [0, "rgba(255,255,255,0.95)"],
    [0.30, "rgba(220,232,255,0.55)"],
    [0.65, "rgba(180,206,255,0.18)"],
    [1, "rgba(120,160,220,0)"],
  ],
  mipmaps: true,
});

const CLUSTERS = [
  /* GLOBULARS — yellow-white ancient-star swarms */
  { name: "M13 · Hercules",      raHours: 16.6949, decDeg:  36.4602, size: 42, tint: "#ffe4b8", opacity: 0.75, kind: "gc" },
  { name: "M22 · Sagittarius",   raHours: 18.6067, decDeg: -23.9046, size: 44, tint: "#ffe0b0", opacity: 0.80, kind: "gc" },
  { name: "M4 · Antares",        raHours: 16.3934, decDeg: -26.5286, size: 38, tint: "#ffdab0", opacity: 0.70, kind: "gc" },
  { name: "47 Tucanae",          raHours:  0.4014, decDeg: -72.0810, size: 48, tint: "#ffe8c0", opacity: 0.85, kind: "gc" },
  { name: "M3",                  raHours: 13.7031, decDeg:  28.3773, size: 34, tint: "#ffe0b0", opacity: 0.65, kind: "gc" },
  { name: "M92",                 raHours: 17.2851, decDeg:  43.1361, size: 30, tint: "#ffdca8", opacity: 0.60, kind: "gc" },
  { name: "M15 · Pegasus",       raHours: 21.4996, decDeg:  12.1670, size: 34, tint: "#ffe0b0", opacity: 0.65, kind: "gc" },
  { name: "M5 · Serpens",        raHours: 15.3092, decDeg:   2.0810, size: 36, tint: "#ffe4b8", opacity: 0.70, kind: "gc" },
  { name: "NGC 6752 · Pavo",     raHours: 19.1811, decDeg: -59.9847, size: 34, tint: "#ffe0b0", opacity: 0.72, kind: "gc" },
  /* OPEN CLUSTERS — blue-white young-star groups */
  { name: "Hyades",              raHours:  4.4700, decDeg:  15.8700, size: 78, tint: "#e8f0ff", opacity: 0.40, kind: "oc" },
  { name: "M44 · Beehive",       raHours:  8.6714, decDeg:  19.6217, size: 50, tint: "#e0ecff", opacity: 0.50, kind: "oc" },
  { name: "Double Cluster",      raHours:  2.3350, decDeg:  57.1667, size: 46, tint: "#dfe8ff", opacity: 0.60, kind: "oc" },
  { name: "M6 · Butterfly",      raHours: 17.6683, decDeg: -32.2533, size: 30, tint: "#dfe8ff", opacity: 0.55, kind: "oc" },
  { name: "M7 · Ptolemy",        raHours: 17.8967, decDeg: -34.7933, size: 42, tint: "#e0ecff", opacity: 0.62, kind: "oc" },
  { name: "M11 · Wild Duck",     raHours: 18.8517, decDeg:  -6.2717, size: 28, tint: "#e8f0ff", opacity: 0.55, kind: "oc" },
  { name: "M35 · Gemini",        raHours:  6.1483, decDeg:  24.3367, size: 34, tint: "#dfe8ff", opacity: 0.52, kind: "oc" },
  { name: "Coma Star Cluster",   raHours: 12.4167, decDeg:  25.9000, size: 56, tint: "#e6ecff", opacity: 0.42, kind: "oc" },
];

const Clusters = () => {
  const items = useMemo(() => {
    const scratch = new THREE.Vector3();
    return CLUSTERS.map((c) => {
      sceneVec(c.raHours, c.decDeg, scratch);
      return {
        ...c,
        pos: scratch.clone().multiplyScalar(R).toArray(),
        scale: c.size * SKY_SCALE * 3.5,
      };
    });
  }, []);

  return (
    <group frustumCulled={false}>
      {items.map((c, i) => (
        <sprite key={i} position={c.pos} scale={[c.scale, c.scale, 1]}>
          <spriteMaterial
            map={c.kind === "gc" ? GLOBULAR_SPRITE : OPEN_SPRITE}
            color={c.tint}
            transparent
            opacity={c.opacity}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </sprite>
      ))}
    </group>
  );
};

export default Clusters;
