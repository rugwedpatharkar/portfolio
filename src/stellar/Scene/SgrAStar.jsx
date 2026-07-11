/* eslint-disable react/no-unknown-property */
/*
 * Sagittarius A* — the 4.15-million solar mass supermassive black hole at
 * the centre of the Milky Way. Imaged by the Event Horizon Telescope in
 * 2022 (Astrophys. J. Lett. 930 L12).
 *
 * Placed on the sky shell at its REAL J2000 celestial coordinates
 * (RA 17h45m40s, Dec −29°00′28″) — same equatorial→scene transform
 * MilkyWay.jsx and Stars.jsx use — so it lines up with the Sagittarius
 * core glow the Milky Way band renders. Not a real object in the Solar
 * System — this is a sky marker, visible only on the Milky Way homepage
 * (index 0).
 *
 * Rendered as a warm-gold additive sprite with a bright core + soft halo
 * so it reads as a distinct star-like point on the band, not a fuzzy
 * smudge that blends with the Sagittarius glow.
 */
import { useMemo } from "react";
import * as THREE from "three";
import { GALAXY } from "../config/galaxy";
import { makeSoftDot } from "./shared/textures";

/* Same shell radius Constellations + StarLabels ride on so the marker sits
   at the same effective distance as the sky field it references. */
const SHELL_R = 6710;
const OBLIQUITY = 23.44 * Math.PI / 180;

function sceneVec(raHours, decDeg) {
  const ra = raHours * Math.PI / 12;
  const dec = decDeg * Math.PI / 180;
  const cd = Math.cos(dec);
  const xe = cd * Math.cos(ra);
  const ye = cd * Math.sin(ra);
  const ze = Math.sin(dec);
  const cosE = Math.cos(OBLIQUITY);
  const sinE = Math.sin(OBLIQUITY);
  return new THREE.Vector3(xe, -ye * sinE + ze * cosE, ye * cosE + ze * sinE).normalize();
}

const SGR_A_SPRITE = makeSoftDot({
  size: 128,
  stops: [
    [0, "rgba(255,255,255,1)"],
    [0.14, "rgba(255,244,200,0.95)"],
    [0.4, "rgba(255,215,140,0.35)"],
    [0.75, "rgba(255,180,100,0.10)"],
    [1, "rgba(255,150,80,0)"],
  ],
  mipmaps: true,
});

const SgrAStar = () => {
  const pos = useMemo(() => {
    const dir = sceneVec(GALAXY.sgrA.raHours, GALAXY.sgrA.decDeg);
    return dir.multiplyScalar(SHELL_R).toArray();
  }, []);

  return (
    <sprite position={pos} scale={[110, 110, 1]} renderOrder={5}>
      <spriteMaterial
        map={SGR_A_SPRITE}
        color="#ffe0a0"
        transparent
        opacity={1}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </sprite>
  );
};

export default SgrAStar;
