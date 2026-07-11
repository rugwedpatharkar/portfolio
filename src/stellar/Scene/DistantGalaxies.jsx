/* eslint-disable react/no-unknown-property */
/*
 * The four naked-eye galaxies of the sky, placed at their real RA/Dec on
 * the same distant sphere the star field + Milky Way band ride on.
 * Rendered as additive elongated sprites with a soft-dot texture — no
 * geometry, no lights, no per-frame cost. Same equatorial ↔ scene
 * transform Stars.jsx / MilkyWay.jsx use, so every sky-fixed layer agrees.
 *
 * Angular sizes are the real values (M31 is 3° across on the sky!), scaled
 * to the shell radius so the fuzzy discs look right at the tour's overview
 * framing. Elongation matches the real inclination as seen from Earth:
 *
 *   M31 (Andromeda)  — RA 00h42.7m, Dec +41.3°, ~3.0° major axis, 3.6:1 e-w
 *   M33 (Triangulum) — RA 01h33.9m, Dec +30.7°, ~1.2° major, 1.7:1
 *   LMC              — RA 05h23.6m, Dec -69.8°, ~10° across, 1.4:1
 *   SMC              — RA 00h52.7m, Dec -72.8°, ~5° across, 2:1
 *
 * The Milky Way band (MilkyWay.jsx) sits at r=6800 on the same shell; we
 * ride at 6700 so the galaxies sit just inside the band and blend with it
 * naturally rather than clipping through.
 */
import { useMemo } from "react";
import * as THREE from "three";
import { makeSoftDot } from "./shared/textures";

const R = 6700;
const OBLIQUITY = 23.44 * Math.PI / 180;

/* Same equatorial → scene transform Stars.jsx uses so this shares the sky
   with the star catalogue. */
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

/* Fuzzy disc sprite — bright core, quick fade, long faint halo so the
   sprite reads as a lit smear of stars rather than a hard circle. */
const GALAXY_SPRITE = makeSoftDot({
  size: 256,
  stops: [
    [0, "rgba(255,255,255,1)"],
    [0.10, "rgba(255,244,220,0.85)"],
    [0.28, "rgba(220,210,240,0.45)"],
    [0.55, "rgba(160,170,220,0.12)"],
    [1, "rgba(100,120,180,0)"],
  ],
  mipmaps: true,
});

const GALAXIES = [
  {
    name: "M31 · Andromeda",
    raHours: 0.7117, decDeg: 41.269,
    /* Andromeda spans ~3° on the sky — the biggest naked-eye galaxy. Its
       apparent inclination is ~77° so it reads highly elongated. */
    scale: [230, 60, 60],
    tint: "#f0e5d0",
    rotation: 2.1, // major-axis tilt on the sky (radians)
  },
  {
    name: "M33 · Triangulum",
    raHours: 1.5642, decDeg: 30.660,
    scale: [110, 65, 65],
    tint: "#e6ded0",
    rotation: 1.7,
  },
  {
    name: "LMC · Large Magellanic Cloud",
    raHours: 5.3936, decDeg: -69.756,
    scale: [180, 140, 140],
    tint: "#eaddc0",
    rotation: 0.6,
  },
  {
    name: "SMC · Small Magellanic Cloud",
    raHours: 0.8778, decDeg: -72.828,
    scale: [110, 60, 60],
    tint: "#ddd4bb",
    rotation: 1.1,
  },
];

const DistantGalaxies = () => {
  const items = useMemo(() => {
    const scratch = new THREE.Vector3();
    return GALAXIES.map((g) => {
      sceneVec(g.raHours, g.decDeg, scratch);
      return {
        pos: scratch.clone().multiplyScalar(R).toArray(),
        scale: g.scale,
        tint: g.tint,
        rotation: g.rotation,
        name: g.name,
      };
    });
  }, []);

  return (
    <group frustumCulled={false}>
      {items.map((g, i) => (
        <sprite key={i} position={g.pos} scale={g.scale} material-rotation={g.rotation}>
          <spriteMaterial
            map={GALAXY_SPRITE}
            color={g.tint}
            transparent
            opacity={0.55}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </sprite>
      ))}
    </group>
  );
};

export default DistantGalaxies;
