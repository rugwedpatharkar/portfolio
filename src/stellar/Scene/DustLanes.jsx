/* eslint-disable react/no-unknown-property */
/*
 * Dark dust lanes threading the spiral arms — the cold molecular clouds that
 * silhouette against the bright disc in every edge-lit spiral photo (the
 * Andromeda "cracks"). Chains of soft dark-brown blobs seeded just INSIDE each
 * arm ridge (via armSpiralPoint) so they follow the arm curve; NormalBlending
 * (not additive) so they DARKEN the star light behind them rather than adding
 * to it. Mounts inside the HomepageGalaxy transform → rotates across the arms
 * with the disc.
 */
import { useMemo } from "react";
import * as THREE from "three";
import { makeSoftDot } from "./shared/textures";
import { armSpiralPoint, GALAXY_ARMS, GALAXY_DISC_RADIUS, GALAXY_BULGE_RADIUS } from "./SpiralGalaxy";

/* Soft round blob, opaque-ish centre → transparent edge. Tinted dark by the
   material colour; alpha comes from the texture. */
const DUST_SPRITE = makeSoftDot({
  size: 128,
  stops: [
    [0, "rgba(255,255,255,0.85)"],
    [0.45, "rgba(255,255,255,0.45)"],
    [0.8, "rgba(255,255,255,0.12)"],
    [1, "rgba(255,255,255,0)"],
  ],
  mipmaps: true,
});

const DUST_TINT = "#160d07"; // near-black warm brown

const PER_ARM = 30; // blobs walked along each arm's inner edge

const DustLanes = () => {
  const items = useMemo(() => {
    const scratch = new THREE.Vector3();
    const out = [];
    for (const arm of GALAXY_ARMS) {
      for (let i = 0; i < PER_ARM; i++) {
        /* walk the arm from inner→outer; dust thins toward the rim */
        const t = 0.12 + (i / PER_ARM) * 0.82 + (Math.random() - 0.5) * 0.04;
        const r = GALAXY_BULGE_RADIUS + t * (GALAXY_DISC_RADIUS - GALAXY_BULGE_RADIUS);
        const scatter = -0.16 + (Math.random() - 0.5) * 0.14; // just inside the arm ridge
        armSpiralPoint(arm.offset, r, scatter, scratch);
        out.push({
          pos: [scratch.x, (Math.random() - 0.5) * 3, scratch.z],
          size: (10 + t * 26 + Math.random() * 10) * (arm.major ? 1 : 0.7),
          op: (0.5 + Math.random() * 0.3) * (1 - t * 0.4) * (arm.major ? 1 : 0.7),
          rot: Math.random() * Math.PI,
        });
      }
    }
    return out;
  }, []);

  return (
    <group renderOrder={3}>
      {items.map((d, i) => (
        <sprite key={i} position={d.pos} scale={[d.size, d.size * 0.6, 1]} material-rotation={d.rot} renderOrder={3}>
          <spriteMaterial
            map={DUST_SPRITE}
            color={DUST_TINT}
            transparent
            opacity={d.op}
            depthWrite={false}
            depthTest={false}
            blending={THREE.NormalBlending}
            toneMapped={false}
          />
        </sprite>
      ))}
    </group>
  );
};

export default DustLanes;
