/* eslint-disable react/no-unknown-property */
/*
 * PROCEDURAL nebulae — the large, faint, textureless emission and
 * reflection nebulae that would otherwise need dedicated photo textures.
 * Rendered as very soft additive glow patches at real J2000 RA/Dec, so
 * the naked-eye Milky-Way glow now includes:
 *
 *   Barnard's Loop      — huge Hα arc around Orion, ~10° diameter, one
 *                         of the largest emission structures on the sky.
 *   Gum Nebula          — ~35° across in Vela/Puppis, ancient SNR
 *                         probably older than 1 Myr.
 *   Vela SNR            — ~8° across, filamentary reddish SNR beside Gum.
 *   Cygnus X complex    — huge star-forming region around Deneb, hot
 *                         pink OB association.
 *   Rho Ophiuchi        — colourful reflection+emission complex near
 *                         Antares (blue reflection + yellow dust cloud).
 *
 * Rendered as soft-disk sprites with per-nebula tint at real sky
 * positions. Placed on the sky-fixed shell alongside Nebulae.jsx.
 *
 * Sources: docs/research/04-nebulae.md §5.3 (extended sky candidates).
 */
import { useMemo } from "react";
import * as THREE from "three";
import { makeSoftDot } from "./shared/textures";
import { SKY_SCALE } from "../config/destinations";

const R = 6720 * SKY_SCALE; // just inside DistantGalaxies shell
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

/* Two texture variants — soft emission (pink-red) and softer reflection (blue). */
const EMISSION = makeSoftDot({
  size: 128,
  stops: [
    [0, "rgba(255,120,140,0.6)"],
    [0.28, "rgba(255,90,110,0.32)"],
    [0.7, "rgba(220,80,90,0.10)"],
    [1, "rgba(180,60,60,0)"],
  ],
});
const REFLECTION = makeSoftDot({
  size: 128,
  stops: [
    [0, "rgba(200,220,255,0.55)"],
    [0.35, "rgba(160,190,240,0.25)"],
    [1, "rgba(120,150,220,0)"],
  ],
});

const ITEMS = [
  { name: "Barnard's Loop",   raHours:  5.65, decDeg:  -4.0, size: 260, tint: "#ff5878", opacity: 0.28, kind: "em" },
  { name: "Gum Nebula",       raHours:  8.50, decDeg: -43.0, size: 480, tint: "#ff6a80", opacity: 0.14, kind: "em" },
  { name: "Vela SNR",         raHours:  8.58, decDeg: -45.0, size: 190, tint: "#ff5c72", opacity: 0.28, kind: "em" },
  { name: "Cygnus X",         raHours: 20.50, decDeg:  40.0, size: 220, tint: "#ff7290", opacity: 0.35, kind: "em" },
  { name: "Rho Ophiuchi",     raHours: 16.45, decDeg: -24.4, size: 130, tint: "#a8c4ff", opacity: 0.42, kind: "ref" },
  /* Antares itself — bright yellow star with a yellow reflection halo. */
  { name: "Antares dust",     raHours: 16.49, decDeg: -26.4, size: 100, tint: "#ffd580", opacity: 0.32, kind: "ref" },
];

const ProceduralNebulae = () => {
  const items = useMemo(() => {
    const scratch = new THREE.Vector3();
    return ITEMS.map((n) => {
      sceneVec(n.raHours, n.decDeg, scratch);
      return { ...n, pos: scratch.clone().multiplyScalar(R).toArray(), scale: n.size * SKY_SCALE * 3.5 };
    });
  }, []);

  return (
    <group frustumCulled={false}>
      {items.map((n, i) => (
        <sprite key={i} position={n.pos} scale={[n.scale, n.scale, 1]}>
          <spriteMaterial
            map={n.kind === "em" ? EMISSION : REFLECTION}
            color={n.tint}
            transparent
            opacity={n.opacity}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </sprite>
      ))}
    </group>
  );
};

export default ProceduralNebulae;
