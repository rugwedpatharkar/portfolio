/* eslint-disable react/no-unknown-property */
/*
 * A deliberate scatter of distant galaxies across the EMPTY regions of the
 * homepage frame — the left column + lower band, never over the Milky Way's
 * footprint (a galaxy behind the MW just reads as part of it) nor the hero
 * text. Each one is screen-PINNED: its position is the unprojection of a fixed
 * NDC coordinate through the live camera every frame, so it stays locked to its
 * empty gap regardless of the intro fly-in or camera breathing.
 *
 * Mix of types like a real deep field: warm ellipticals, cool blue-white
 * spirals with a hot nucleus, and thin edge-on slivers. Additive so they never
 * occlude — only their screen position matters, which we control directly.
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

/* ndc [x,y] in −1..1 (y up). size = disc major-axis (world units at DIST) —
   small so they read as FAR-away background galaxies. aspect < 1 squashes the
   minor axis (low = edge-on sliver). nuc = bulge tint or null.
   Spread across ALL the frame's empty pockets — the top gap, the far-left
   column at every height, the top-right corner above the disc, and the bottom
   strip — while staying clear of the Milky Way's bright footprint (centre-right)
   and the hero text/buttons (top-left). */
const GALAXIES = [
  { ndc: [-0.14,  0.80], size: 230, aspect: 0.5,  roll: 2.7,  tint: "#dfe6ff", nuc: "#fff0d8" }, // top-centre gap
  { ndc: [-0.96,  0.46], size: 300, aspect: 0.15, roll: 1.2,  tint: "#d4e4ff", nuc: null },      // far-left upper sliver
  { ndc: [ 0.90,  0.66], size: 210, aspect: 0.85, roll: 0.4,  tint: "#ffcf9e", nuc: "#fff0d8" }, // top-right corner (above disc)
  { ndc: [-0.97,  0.00], size: 220, aspect: 0.8,  roll: 0.6,  tint: "#ffd7a8", nuc: "#fff0d8" }, // far-left mid, beside buttons
  { ndc: [-0.70, -0.20], size: 190, aspect: 0.45, roll: 1.9,  tint: "#ecdcff", nuc: "#ffe8c8" }, // left-mid below buttons
  { ndc: [-0.90, -0.60], size: 300, aspect: 0.15, roll: 0.95, tint: "#e6ecff", nuc: null },      // left-lower sliver
  { ndc: [-0.42, -0.52], size: 250, aspect: 0.55, roll: 2.75, tint: "#fff0d2", nuc: "#ffe0b0" }, // lower-centre-left spiral
  { ndc: [-0.64, -0.88], size: 200, aspect: 0.82, roll: 0.2,  tint: "#ffc890", nuc: "#ffe4b0" }, // bottom-left elliptical
  { ndc: [-0.12, -0.90], size: 230, aspect: 0.18, roll: 0.35, tint: "#cfe0ff", nuc: null },      // bottom-centre sliver
];

const HomepageGalaxies = () => {
  const refs = useRef([]);
  const camPos = useMemo(() => new THREE.Vector3(), []);
  const tmp = useMemo(() => new THREE.Vector3(), []);

  useFrame((state) => {
    const cam = state.camera;
    cam.getWorldPosition(camPos);
    for (let i = 0; i < GALAXIES.length; i++) {
      const grp = refs.current[i];
      if (!grp) continue;
      tmp.set(GALAXIES[i].ndc[0], GALAXIES[i].ndc[1], 0.5).unproject(cam);
      tmp.sub(camPos).normalize().multiplyScalar(DIST).add(camPos);
      grp.position.copy(tmp);
    }
  });

  return (
    <group frustumCulled={false}>
      {GALAXIES.map((g, i) => (
        <group key={i} ref={(el) => { refs.current[i] = el; }}>
          <sprite scale={[g.size, g.size * g.aspect, 1]} material-rotation={g.roll}>
            <spriteMaterial map={DISC} color={g.tint} transparent opacity={0.6} depthWrite={false} depthTest={false} blending={THREE.AdditiveBlending} toneMapped={false} />
          </sprite>
          {g.nuc && (
            <sprite scale={[g.size * 0.28, g.size * 0.28, 1]}>
              <spriteMaterial map={NUCLEUS} color={g.nuc} transparent opacity={0.8} depthWrite={false} depthTest={false} blending={THREE.AdditiveBlending} toneMapped={false} />
            </sprite>
          )}
        </group>
      ))}
    </group>
  );
};

export default HomepageGalaxies;
