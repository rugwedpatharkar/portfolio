/* eslint-disable react/no-unknown-property */
/*
 * A DENSE deep field of distant galaxies scattered across the homepage sky —
 * small, faint, and slowly DRIFTING ("moving here and there in the distant
 * background"), like a JWST field behind the Milky Way. A mix of warm
 * ellipticals, cool blue-white spirals with a hot nucleus, and thin edge-on
 * slivers.
 *
 * Each galaxy is screen-anchored: its world position is the unprojection of a
 * (slowly wandering) NDC coordinate through the live camera every frame, so the
 * whole field holds its screen distribution through the intro fly-in while each
 * member drifts on its own slow Lissajous path. Kept EXTRA faint over the Milky
 * Way's bright footprint + the hero text so it reads as depth, never as part of
 * the galaxy or as clutter behind the type. Additive, depth-off → pure backdrop.
 */
import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { makeSoftDot } from "./shared/textures";

const DISC = makeSoftDot({
  size: 256,
  stops: [
    [0, "rgba(255,255,255,1)"],
    [0.2, "rgba(255,246,222,0.92)"],
    [0.42, "rgba(224,214,242,0.55)"],
    [0.72, "rgba(158,170,218,0.2)"],
    [1, "rgba(100,120,180,0)"],
  ],
  mipmaps: true,
});
const NUCLEUS = makeSoftDot({
  size: 128,
  stops: [
    [0, "rgba(255,255,255,1)"],
    [0.2, "rgba(255,246,216,0.95)"],
    [0.5, "rgba(255,220,164,0.32)"],
    [1, "rgba(255,200,140,0)"],
  ],
  mipmaps: true,
});

const DIST = 5000; // far out — reads as deep background (additive → depth is cosmetic)
const COUNT = 84;
const TAU = Math.PI * 2;

const ELLIPTICAL = ["#ffcf9e", "#ffbe86", "#f2b57e", "#ffd8b0", "#ffd7a8"]; // warm
const SPIRAL = ["#cfe0ff", "#dfe6ff", "#e6ecff", "#d4e4ff", "#ecdcff"];     // cool blue-white
const NUC_TINT = ["#fff0d8", "#ffe0b0", "#ffe4b0", "#ffe8c8"];

/* Milky-Way bright footprint on the homepage (screen ellipse, NDC): centre-right
   disc. Galaxies inside are dimmed + shrunk so they recede behind it. */
const inMilkyWay = (x, y) => ((x - 0.22) / 0.72) ** 2 + (y / 0.85) ** 2 < 1;
/* Hero name + buttons block, top-left — keep the type clean. */
const inText = (x, y) => x < -0.3 && y > 0.1;

const pick = (arr) => arr[(Math.random() * arr.length) | 0];

function makeField() {
  const out = [];
  for (let i = 0; i < COUNT; i++) {
    const bx = Math.random() * 2 - 1;
    const by = Math.random() * 2 - 1;
    const kind = Math.random();
    const edgeOn = kind < 0.28;
    const spiral = !edgeOn && kind < 0.6;
    const big = Math.random() < 0.14;
    const size = (44 + Math.random() * 78) * (big ? 1.7 : 1);
    let op = 0.26 + Math.random() * 0.3;
    let sizeMul = 1;
    if (inMilkyWay(bx, by)) { op *= 0.4; sizeMul = 0.72; } // recede behind the MW
    if (inText(bx, by)) op *= 0.5;                          // don't fight the type
    out.push({
      bx, by,
      size: size * sizeMul,
      aspect: edgeOn ? 0.12 + Math.random() * 0.14 : 0.5 + Math.random() * 0.45,
      roll: Math.random() * Math.PI,
      tint: spiral ? pick(SPIRAL) : pick(ELLIPTICAL),
      nuc: edgeOn ? null : (Math.random() < 0.7 ? pick(NUC_TINT) : null),
      op,
      /* gentle 2D Lissajous wander — enough amplitude to visibly drift "here and
         there" over ~10s, but slow enough to still read as a distant background. */
      ax: 0.05 + Math.random() * 0.13,
      ay: 0.05 + Math.random() * 0.13,
      sx: 0.03 + Math.random() * 0.06,
      sy: 0.03 + Math.random() * 0.06,
      px: Math.random() * TAU,
      py: Math.random() * TAU,
    });
  }
  return out;
}

const HomepageGalaxies = ({ reducedMotion = false }) => {
  const items = useMemo(() => makeField(), []);
  const refs = useRef([]);
  const camPos = useMemo(() => new THREE.Vector3(), []);
  const tmp = useMemo(() => new THREE.Vector3(), []);

  useFrame((state) => {
    const cam = state.camera;
    cam.getWorldPosition(camPos);
    const t = reducedMotion ? 0 : state.clock.elapsedTime;
    for (let i = 0; i < items.length; i++) {
      const grp = refs.current[i];
      if (!grp) continue;
      const g = items[i];
      const nx = g.bx + g.ax * Math.sin(t * g.sx + g.px);
      const ny = g.by + g.ay * Math.sin(t * g.sy + g.py);
      tmp.set(nx, ny, 0.5).unproject(cam);
      tmp.sub(camPos).normalize().multiplyScalar(DIST).add(camPos);
      grp.position.copy(tmp);
    }
  });

  return (
    <group frustumCulled={false}>
      {items.map((g, i) => (
        <group key={i} ref={(el) => { refs.current[i] = el; }}>
          <sprite scale={[g.size, g.size * g.aspect, 1]} material-rotation={g.roll}>
            <spriteMaterial map={DISC} color={g.tint} transparent opacity={g.op} depthWrite={false} depthTest={false} blending={THREE.AdditiveBlending} toneMapped={false} />
          </sprite>
          {g.nuc && (
            <sprite scale={[g.size * 0.26, g.size * 0.26, 1]}>
              <spriteMaterial map={NUCLEUS} color={g.nuc} transparent opacity={Math.min(1, g.op * 1.5)} depthWrite={false} depthTest={false} blending={THREE.AdditiveBlending} toneMapped={false} />
            </sprite>
          )}
        </group>
      ))}
    </group>
  );
};

export default HomepageGalaxies;
