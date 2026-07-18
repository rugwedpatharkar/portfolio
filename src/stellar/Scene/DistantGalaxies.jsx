/* eslint-disable react/no-unknown-property */
/*
 * The naked-eye + notable-photo galaxies of the sky, placed at their real
 * RA/Dec on the same distant sphere the star field + Milky Way band ride
 * on. Rendered as additive sprites with real NASA/ESA/ESO photos — no
 * geometry, no lights, no per-frame cost. Same equatorial ↔ scene
 * transform Stars.jsx / MilkyWay.jsx use, so every sky-fixed layer agrees.
 *
 * Angular sizes are the real values (M31 is 3° across on the sky!), scaled
 * to the shell radius so the fuzzy discs look right at the tour's overview
 * framing. Elongation is baked into each photo, so the sprite is square.
 *
 *   M31 (Andromeda)  — RA 00h42.7m, Dec +41.3°, ~3.0° major axis (2.5 Mly)
 *   M33 (Triangulum) — RA 01h33.9m, Dec +30.7°, ~1.2° major     (2.7 Mly)
 *   LMC              — RA 05h23.6m, Dec −69.8°, ~10° across     (163 kly)
 *   SMC              — RA 00h52.7m, Dec −72.8°, ~5° across      (200 kly)
 *   M51 (Whirlpool)  — RA 13h29.9m, Dec +47.2°, ~11' major      (23 Mly)
 *   M104 (Sombrero)  — RA 12h39.9m, Dec −11.6°, ~8.7' major     (29 Mly)
 *
 * Also renders a procedural Virgo Cluster marker at RA 12h27m, Dec +12°43'
 * — the nearest rich galaxy cluster (~54 Mly, hosts M87 = the first EHT
 * black-hole image target); no photo texture — a faint warm cluster glow.
 *
 * The Milky Way band (MilkyWay.jsx) sits at r=6800 on the same shell; we
 * ride at 6700 so the galaxies sit just inside the band and blend with it
 * naturally rather than clipping through.
 */
import { useMemo } from "react";
import { useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { makeSoftDot } from "./shared/textures";
import { ktx2Url } from "./shared/textureUrl";
import { SKY_SCALE } from "../config/destinations";

const R = 6700 * SKY_SCALE;
/* Real NASA/ESA/ESO photos for named galaxies. Index-aligned to GALAXIES
   below. First 4 are the naked-eye set (M31, M33, LMC, SMC); the next 2
   are notable-photo deep-field neighbours (M51 Whirlpool, M104 Sombrero). */
const NAMED_URLS = ["andromeda", "triangulum", "lmc", "smc", "whirlpool", "sombrero"].map((t) => `/textures/galaxies/${t}.webp`);
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

/* Sprite side length per galaxy at the render shell. Elongation and orientation
   are BAKED INTO EACH PHOTO — the sprite is square and only the `size` scalar
   matters. Sizes are bumped from raw sky degrees so they're visible at the
   tour's overview framing (a true 3° M31 reads sub-pixel against the nebula
   backdrop). Ordering + tex mapping follow NAMED_URLS above. */
const GALAXIES = [
  { name: "M31 · Andromeda",              raHours: 0.7117,  decDeg:  41.269,  size: 900 },  // 2.5 Mly, biggest on sky
  { name: "M33 · Triangulum",             raHours: 1.5642,  decDeg:  30.660,  size: 520 },  // 2.7 Mly, bound to M31
  { name: "LMC · Large Magellanic Cloud", raHours: 5.3936,  decDeg: -69.756,  size: 640 },  // 163 kly, MW satellite
  { name: "SMC · Small Magellanic Cloud", raHours: 0.8778,  decDeg: -72.828,  size: 400 },  // 200 kly, MW satellite
  { name: "M51 · Whirlpool",              raHours: 13.4979, decDeg:  47.195,  size: 180 },  // 23 Mly, ~460 R_MW deep-field
  { name: "M104 · Sombrero",              raHours: 12.6663, decDeg: -11.623,  size: 160 },  // 29 Mly, ~586 R_MW deep-field
];

/* Procedural deep-field cluster markers — no photo, rendered as a faint warm
   glow at real RA/Dec. Currently only the Virgo Cluster (nearest rich cluster,
   ~54 Mly, ~1300 members, hosts M87 — the first EHT black-hole image target). */
const CLUSTERS = [
  { name: "Virgo Cluster", raHours: 12.4500, decDeg: 12.7167, size: 260, tint: "#ffe8c8", opacity: 0.16 },
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
    } else if (kind < 0.95) {
      /* edge-on sliver — high aspect ratio, thin streak */
      base = 60 + Math.random() * 90;
      tint = Math.random() < 0.5 ? ELLIPTICAL[0] : SPIRAL[0];
      aspect = 0.14 + Math.random() * 0.12;
      hasNucleus = Math.random() < 0.4;
    } else {
      /* gravitational-lens arc — a thin, bright, blue-white curved sliver, the
         JWST deep-field signature (a background galaxy smeared by a foreground
         cluster's gravity). Rendered as a very high-aspect bright streak. */
      base = 90 + Math.random() * 70;
      tint = "#dCEBFF";
      aspect = 0.07 + Math.random() * 0.06;
      hasNucleus = false;
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
  const namedTex = useLoader(THREE.TextureLoader, NAMED_URLS.map(ktx2Url));
  useMemo(() => { for (const t of namedTex) t.colorSpace = THREE.SRGBColorSpace; }, [namedTex]);
  const items = useMemo(() => {
    const scratch = new THREE.Vector3();
    /* Named galaxies — real NASA/ESA/ESO photos. Square sprite sized to the
       galaxy's largest angular extent; the true shape/inclination is baked into
       the photo, so no elongation/rotation needed. */
    const named = GALAXIES.map((g, idx) => {
      sceneVec(g.raHours, g.decDeg, scratch);
      return {
        pos: scratch.clone().multiplyScalar(R).toArray(),
        texIndex: idx,
        scale: g.size * 1.15 * SKY_SCALE,
        opacity: 0.92,
        name: g.name,
      };
    });
    /* Procedural galaxy-cluster markers — no photo, warm cluster glow at real
       RA/Dec. Rendered via the same "no texIndex → soft procedural disc" path
       as the deep-field scatter. */
    const clusters = CLUSTERS.map((c) => {
      sceneVec(c.raHours, c.decDeg, scratch);
      return {
        pos: scratch.clone().multiplyScalar(R).toArray(),
        scale: [c.size, c.size, c.size].map((s) => s * SKY_SCALE),
        rotation: 0,
        tint: c.tint,
        opacity: c.opacity,
        nucleusScale: 0,
        nucleusTint: c.tint,
        name: c.name,
      };
    });
    /* Homepage → add the deep-field scatter behind the galaxy. Tour → the
       named + cluster set only. */
    return deepField ? [...named, ...clusters, ...makeDeepField(360)] : [...named, ...clusters];
  }, [deepField]);

  return (
    <group frustumCulled={false}>
      {items.map((g, i) =>
        g.texIndex != null ? (
          /* Named naked-eye galaxy — real photo. */
          <sprite key={i} position={g.pos} scale={[g.scale, g.scale, 1]}>
            <spriteMaterial
              map={namedTex[g.texIndex]}
              transparent
              opacity={g.opacity}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              toneMapped={false}
            />
          </sprite>
        ) : (
          /* Deep-field smudge — soft procedural disc + optional nucleus. */
          <group key={i}>
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
        )
      )}
    </group>
  );
};

export default DistantGalaxies;
