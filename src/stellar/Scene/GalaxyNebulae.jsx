/* eslint-disable react/no-unknown-property */
/*
 * Nebular gas glowing along the spiral arms — the interstellar clouds where
 * stars are born. Soft additive colour clouds (pink Hα, teal O-III, gold
 * reflection) seeded on the SAME log-spiral arms the star cloud traces
 * (via randomArmPoint from SpiralGalaxy), so the arms shimmer with gas, not
 * just star dots.
 *
 * Mounts INSIDE the HomepageGalaxy transform (local galaxy coords).
 */
import { useMemo } from "react";
import * as THREE from "three";
import { makeSoftDot } from "./shared/textures";
import { randomArmPoint } from "./SpiralGalaxy";

const COUNT = 90;

/* Very soft, wide cloud — no hard core, just a diffuse glow. */
const GAS_SPRITE = makeSoftDot({
  size: 128,
  stops: [
    [0, "rgba(255,255,255,0.9)"],
    [0.3, "rgba(255,255,255,0.32)"],
    [0.7, "rgba(255,255,255,0.08)"],
    [1, "rgba(255,255,255,0)"],
  ],
  mipmaps: true,
});

/* Hα pink dominates (star-forming), with teal O-III and warm gold accents. */
const PALETTE = [
  "#ff5c9e", "#ff77ad", "#ff5c9e", "#ff88b8", // pink Hα (weighted)
  "#4fd4c4", "#5ce0d0",                       // teal O-III
  "#ffcf8a", "#ffdca0",                        // gold reflection
];

const GalaxyNebulae = () => {
  const items = useMemo(() => {
    const scratch = new THREE.Vector3();
    const out = [];
    for (let i = 0; i < COUNT; i++) {
      const t = randomArmPoint(scratch, 0.28, 0.95);
      out.push({
        pos: [scratch.x, (Math.random() - 0.5) * 5, scratch.z],
        /* bigger clouds further out where star formation is richer */
        size: 22 + t * 40 + Math.random() * 26,
        color: PALETTE[(Math.random() * PALETTE.length) | 0],
        op: 0.16 + Math.random() * 0.22,
        rot: Math.random() * Math.PI,
      });
    }
    return out;
  }, []);

  return (
    <group>
      {items.map((n, i) => (
        <sprite key={i} position={n.pos} scale={[n.size, n.size, 1]} material-rotation={n.rot}>
          <spriteMaterial
            map={GAS_SPRITE}
            color={n.color}
            transparent
            opacity={n.op}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </sprite>
      ))}
    </group>
  );
};

export default GalaxyNebulae;
