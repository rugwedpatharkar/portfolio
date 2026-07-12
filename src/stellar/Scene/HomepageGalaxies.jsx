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

const DIST = 3200; // distance from camera along each NDC ray (additive → depth is cosmetic)

/* ndc [x,y] in −1..1 (y up). size = disc major-axis (world units at DIST).
   aspect < 1 squashes the minor axis (low = edge-on sliver). nuc = bulge tint
   or null (nucleus-less elliptical / edge-on). All kept in the left + lower
   empties: x ≤ −0.2 (clear of the Milky Way on the right) and y ≤ −0.28 (clear
   of the hero text + buttons top-left). */
const GALAXIES = [
  { ndc: [-0.78, -0.32], size: 560, aspect: 0.42, roll: 2.3,  tint: "#fff0d2", nuc: "#ffe0b0" }, // Andromeda-ish spiral (biggest)
  { ndc: [-0.42, -0.30], size: 300, aspect: 0.88, roll: 0.5,  tint: "#ffcf9e", nuc: "#fff0d8" }, // warm elliptical
  { ndc: [-0.93, -0.62], size: 420, aspect: 0.15, roll: 1.05, tint: "#d4e4ff", nuc: null },      // edge-on sliver
  { ndc: [-0.30, -0.52], size: 380, aspect: 0.5,  roll: 2.75, tint: "#dfe6ff", nuc: "#fff0d8" }, // blue spiral
  { ndc: [-0.60, -0.70], size: 300, aspect: 0.8,  roll: 0.9,  tint: "#ffc890", nuc: "#ffe4b0" }, // elliptical
  { ndc: [-0.26, -0.84], size: 330, aspect: 0.18, roll: 0.35, tint: "#e6ecff", nuc: null },      // edge-on sliver
  { ndc: [-0.48, -0.88], size: 320, aspect: 0.55, roll: 1.7,  tint: "#ecdcff", nuc: "#ffe8c8" }, // spiral
  { ndc: [-0.82, -0.90], size: 260, aspect: 0.82, roll: 0.2,  tint: "#ffd7a8", nuc: "#fff0d8" }, // elliptical
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
            <spriteMaterial map={DISC} color={g.tint} transparent opacity={0.95} depthWrite={false} depthTest={false} blending={THREE.AdditiveBlending} toneMapped={false} />
          </sprite>
          {g.nuc && (
            <sprite scale={[g.size * 0.36, g.size * 0.36, 1]}>
              <spriteMaterial map={NUCLEUS} color={g.nuc} transparent opacity={1.0} depthWrite={false} depthTest={false} blending={THREE.AdditiveBlending} toneMapped={false} />
            </sprite>
          )}
        </group>
      ))}
    </group>
  );
};

export default HomepageGalaxies;
