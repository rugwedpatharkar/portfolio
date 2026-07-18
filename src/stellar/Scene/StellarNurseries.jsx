/* eslint-disable react/no-unknown-property */
/*
 * STELLAR NURSERIES — subtle signatures of ongoing star and planet
 * formation, overlaid on the fixed sky at real J2000 RA/Dec:
 *
 *   HERBIG-HARO JETS — bipolar jets of ionized gas shot out by
 *   protostars accreting from their disks. HH 30, HH 34, HH 47 are the
 *   textbook examples. Rendered as tiny elongated bipolar streaks
 *   pointing away from a central bright point.
 *
 *   PROPLYDS — protoplanetary disks silhouetted against the bright
 *   backdrop of Orion Nebula (M42), first imaged by HST in 1993.
 *   Rendered as small dark oval sprites at Orion's location.
 *
 *   DEBRIS DISKS — dust rings around nearby main-sequence stars: real
 *   observed at Fomalhaut (HST), Vega (Herschel), Beta Pictoris (VLT).
 *   Rendered as tiny elliptical rings tinted rose/gold around known
 *   host stars' sky positions.
 *
 * All items sit on the sky-fixed shell alongside Nebulae + Clusters
 * so the sky agrees between layers. Additive small sprites — never
 * dominant, but present when you look for them.
 *
 * Sources: docs/research/04-nebulae.md; HST/JWST press-kit archives.
 */
import { useMemo } from "react";
import * as THREE from "three";
import { makeSoftDot } from "./shared/textures";
import { SKY_SCALE } from "../config/destinations";

const R = 6680 * SKY_SCALE;
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

const JET_SPRITE = makeSoftDot({
  size: 128,
  stops: [
    [0, "rgba(255,255,255,1)"],
    [0.30, "rgba(200,220,255,0.75)"],
    [1, "rgba(120,160,220,0)"],
  ],
});
const DISK_SPRITE = makeSoftDot({
  size: 128,
  stops: [
    [0, "rgba(255,240,220,0.9)"],
    [0.45, "rgba(255,220,180,0.45)"],
    [1, "rgba(200,160,120,0)"],
  ],
});

/* Herbig-Haro jets — real observed protostellar jets. */
const HH_JETS = [
  { name: "HH 30",  raHours:  4.5450, decDeg:  18.1200, size: 22 }, // Taurus dark cloud
  { name: "HH 34",  raHours:  5.5967, decDeg:   6.4550, size: 20 }, // Orion complex
  { name: "HH 47",  raHours:  8.4517, decDeg: -47.0500, size: 22 }, // Gum Nebula edge
  { name: "HH 111", raHours:  5.8700, decDeg:   2.8500, size: 26 }, // Orion — a long collimated jet
];

/* Proplyds cluster in Orion's core (M42). Positions all near ~5h35m, -5°23'. */
const PROPLYD_POSITIONS = Array.from({ length: 8 }, (_, i) => ({
  raHours: 5.588 + (Math.sin(i * 1.7) * 0.02),
  decDeg: -5.391 + (Math.cos(i * 1.3) * 0.02),
  size: 6 + (i % 3) * 2,
}));

/* Debris disks around specific well-imaged nearby stars. */
const DEBRIS_DISKS = [
  { name: "Fomalhaut ring", raHours: 22.9608, decDeg: -29.6222, size: 18 }, // HST-imaged
  { name: "Vega disk",      raHours: 18.6157, decDeg:  38.7836, size: 20 },
  { name: "β Pictoris",     raHours:  5.7817, decDeg: -51.0664, size: 16 },
  { name: "ε Eridani",      raHours:  3.5490, decDeg:  -9.4583, size: 14 },
];

const StellarNurseries = () => {
  const jets = useMemo(() => {
    const scratch = new THREE.Vector3();
    return HH_JETS.map((j) => {
      sceneVec(j.raHours, j.decDeg, scratch);
      return { ...j, pos: scratch.clone().multiplyScalar(R).toArray(), scale: j.size * SKY_SCALE * 3 };
    });
  }, []);
  const proplyds = useMemo(() => {
    const scratch = new THREE.Vector3();
    return PROPLYD_POSITIONS.map((p) => {
      sceneVec(p.raHours, p.decDeg, scratch);
      return { ...p, pos: scratch.clone().multiplyScalar(R).toArray(), scale: p.size * SKY_SCALE * 3 };
    });
  }, []);
  const disks = useMemo(() => {
    const scratch = new THREE.Vector3();
    return DEBRIS_DISKS.map((d) => {
      sceneVec(d.raHours, d.decDeg, scratch);
      return { ...d, pos: scratch.clone().multiplyScalar(R).toArray(), scale: d.size * SKY_SCALE * 3 };
    });
  }, []);

  return (
    <group frustumCulled={false}>
      {/* HH jets — thin bright bipolar streaks */}
      {jets.map((j, i) => (
        <sprite key={`hh${i}`} position={j.pos} scale={[j.scale * 0.35, j.scale * 1.6, 1]}>
          <spriteMaterial map={JET_SPRITE} color="#c8daff" transparent opacity={0.42} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
        </sprite>
      ))}
      {/* Proplyds — small warm-tinted dust discs in Orion's core */}
      {proplyds.map((p, i) => (
        <sprite key={`pr${i}`} position={p.pos} scale={[p.scale, p.scale * 0.7, 1]}>
          <spriteMaterial map={DISK_SPRITE} color="#ffe2c8" transparent opacity={0.38} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
        </sprite>
      ))}
      {/* Debris disks — rose/gold ovals around nearby stars */}
      {disks.map((d, i) => (
        <sprite key={`dd${i}`} position={d.pos} scale={[d.scale, d.scale * 0.42, 1]}>
          <spriteMaterial map={DISK_SPRITE} color="#f8dcb8" transparent opacity={0.35} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
        </sprite>
      ))}
    </group>
  );
};

export default StellarNurseries;
