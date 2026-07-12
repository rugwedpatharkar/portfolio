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

/* Bright compact "nucleus" — the yellow-white central bulge every real
   galaxy has. Tighter falloff than the body sprite so it reads as a hot
   pinprick riding on top of the diffuse disc — the visual signature that
   makes M31/M33 photograph as clearly-identifiable galaxies rather than
   fuzzy smudges. */
const NUCLEUS_SPRITE = makeSoftDot({
  size: 128,
  stops: [
    [0, "rgba(255,255,255,1)"],
    [0.18, "rgba(255,248,220,0.95)"],
    [0.45, "rgba(255,220,170,0.35)"],
    [1, "rgba(255,200,140,0)"],
  ],
  mipmaps: true,
});

/* Scales bumped dramatically — previous values were true-to-sky at 3°, but
   at the tour's overview framing that reads as a sub-pixel smear against
   the bright nebula backdrop. Boosted so galaxies are CLEARLY visible as
   fuzzy elongated smears from the hero framing. */
const GALAXIES = [
  {
    name: "M31 · Andromeda",
    raHours: 0.7117, decDeg: 41.269,
    /* Andromeda is the visual star of this layer. Big elongated disc,
       high aspect ratio. */
    scale: [900, 230, 230],
    nucleusScale: 90,
    tint: "#fff2d0",
    nucleusTint: "#ffe4b0",
    rotation: 2.1,
  },
  {
    name: "M33 · Triangulum",
    raHours: 1.5642, decDeg: 30.660,
    scale: [520, 280, 280],
    nucleusScale: 60,
    tint: "#f2e8d0",
    nucleusTint: "#ffd8a0",
    rotation: 1.7,
  },
  {
    name: "LMC · Large Magellanic Cloud",
    raHours: 5.3936, decDeg: -69.756,
    scale: [640, 480, 480],
    nucleusScale: 130,
    tint: "#f8e8c8",
    nucleusTint: "#ffe0a8",
    rotation: 0.6,
  },
  {
    name: "SMC · Small Magellanic Cloud",
    raHours: 0.8778, decDeg: -72.828,
    scale: [400, 260, 260],
    nucleusScale: 70,
    tint: "#ecdcbc",
    nucleusTint: "#ffd8a0",
    rotation: 1.1,
  },
];

/* JWST-deep-field scatter — many small distant galaxies strewn across the
   whole sky shell (the homepage background, replacing the nebulae which now
   live inside the galaxy / behind the solar-system tour). Types match a real
   deep field: warm orange ellipticals (the redshifted majority), a few
   blue-white spirals, and thin edge-on slivers. Small + faint so they read
   as depth, not foreground. Positions on a random unit-sphere; slightly
   inside the named-galaxy shell so they never clip the Milky Way band. */
function makeDeepField(count) {
  const out = [];
  const ELLIPTICAL = ["#ffcf9e", "#ffbe86", "#f2b57e", "#e8a878", "#ffd8b0"]; // warm/orange
  const SPIRAL = ["#cfe0ff", "#e6ecff", "#dfe6f5", "#f0f2ff"];               // cool blue-white
  for (let i = 0; i < count; i++) {
    /* uniform point on the sphere */
    const u = Math.random() * 2 - 1;
    const th = Math.random() * Math.PI * 2;
    const s = Math.sqrt(1 - u * u);
    const dir = [s * Math.cos(th), u, s * Math.sin(th)];
    const r = R * (0.94 + Math.random() * 0.05); // slightly inside the shell, jittered depth
    const pos = [dir[0] * r, dir[1] * r, dir[2] * r];

    const roll = Math.random() * Math.PI;
    const kind = Math.random();
    let base, tint, aspect, hasNucleus;
    if (kind < 0.62) {
      /* elliptical / distant smudge — round-ish, warm, faint */
      base = 26 + Math.random() * 46;
      tint = ELLIPTICAL[(Math.random() * ELLIPTICAL.length) | 0];
      aspect = 0.75 + Math.random() * 0.25;
      hasNucleus = Math.random() < 0.5;
    } else if (kind < 0.86) {
      /* small spiral — mild elongation, cool, tiny bright nucleus */
      base = 34 + Math.random() * 60;
      tint = SPIRAL[(Math.random() * SPIRAL.length) | 0];
      aspect = 0.45 + Math.random() * 0.35;
      hasNucleus = true;
    } else {
      /* edge-on sliver — high aspect ratio, thin streak */
      base = 60 + Math.random() * 90;
      tint = Math.random() < 0.5 ? ELLIPTICAL[0] : SPIRAL[0];
      aspect = 0.14 + Math.random() * 0.12;
      hasNucleus = Math.random() < 0.4;
    }
    out.push({
      pos,
      scale: [base, base * aspect, base],
      rotation: roll,
      tint,
      opacity: 0.32 + Math.random() * 0.4,
      nucleusScale: hasNucleus ? base * (0.32 + Math.random() * 0.2) : 0,
      nucleusTint: "#fff0d8",
    });
  }
  return out;
}

const DistantGalaxies = ({ deepField = false }) => {
  const items = useMemo(() => {
    const scratch = new THREE.Vector3();
    const named = GALAXIES.map((g) => {
      sceneVec(g.raHours, g.decDeg, scratch);
      return {
        pos: scratch.clone().multiplyScalar(R).toArray(),
        scale: g.scale,
        nucleusScale: g.nucleusScale,
        tint: g.tint,
        nucleusTint: g.nucleusTint,
        rotation: g.rotation,
        opacity: 1.0,
        name: g.name,
      };
    });
    /* Homepage → add the deep-field scatter behind the galaxy. Tour → just
       the four real naked-eye galaxies. */
    return deepField ? [...named, ...makeDeepField(80)] : named;
  }, [deepField]);

  return (
    <group frustumCulled={false}>
      {items.map((g, i) => (
        <group key={i}>
          {/* Diffuse galactic disc — the elongated smear of stars */}
          <sprite position={g.pos} scale={g.scale} material-rotation={g.rotation}>
            <spriteMaterial
              map={GALAXY_SPRITE}
              color={g.tint}
              transparent
              opacity={g.opacity ?? 1.0}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              toneMapped={false}
            />
          </sprite>
          {/* Hot compact nucleus / bulge — the visual signature that turns
              a fuzzy smudge into an identifiable galaxy. Skipped for the
              nucleus-less distant ellipticals (nucleusScale 0). */}
          {g.nucleusScale > 0 && (
            <sprite position={g.pos} scale={[g.nucleusScale, g.nucleusScale, g.nucleusScale]}>
              <spriteMaterial
                map={NUCLEUS_SPRITE}
                color={g.nucleusTint}
                transparent
                opacity={g.opacity ?? 1.0}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                toneMapped={false}
              />
            </sprite>
          )}
        </group>
      ))}
    </group>
  );
};

export default DistantGalaxies;
