/* eslint-disable react/no-unknown-property */
/*
 * Globular clusters — the ~150 ancient, tightly-bound star-balls that orbit
 * the Milky Way in its spheroidal HALO (not the disc). Rendered as small
 * dense fuzzy sprites scattered on a squashed sphere around the galaxy disc,
 * so they read as the old-star halo the real galaxy has.
 *
 * Mounts INSIDE the HomepageGalaxy transform (local galaxy coords, DISC_RADIUS
 * ~220), so it inherits the disc's tilt + scale + spin.
 *
 * Source: the Milky Way has ~150 known globular clusters in its halo
 * (NASA / EarthSky).
 */
import { useMemo } from "react";
import * as THREE from "three";
import { makeSoftDot } from "./shared/textures";

const COUNT = 150;
const DISC_RADIUS = 220;      // matches SpiralGalaxy local disc radius
const HALO_RADIUS = DISC_RADIUS * 1.7; // halo extends well past the disc

/* Fuzzy dense ball — bright compact core, quick fade. Old-star gold-white. */
const CLUSTER_SPRITE = makeSoftDot({
  size: 64,
  stops: [
    [0, "rgba(255,255,255,1)"],
    [0.22, "rgba(255,246,220,0.75)"],
    [0.55, "rgba(255,226,180,0.22)"],
    [1, "rgba(255,210,150,0)"],
  ],
  mipmaps: true,
});

const GalaxyGlobulars = () => {
  const items = useMemo(() => {
    const out = [];
    for (let i = 0; i < COUNT; i++) {
      /* Point on a squashed sphere — halo is roughly spherical, slightly
         flattened, concentrated toward the centre (r^0.7). */
      const r = Math.pow(Math.random(), 0.7) * HALO_RADIUS;
      const phi = Math.random() * Math.PI * 2;
      const ct = 1 - Math.random() * 2;
      const st = Math.sqrt(1 - ct * ct);
      out.push({
        pos: [r * st * Math.cos(phi), r * ct * 0.7, r * st * Math.sin(phi)],
        size: 4 + Math.random() * 9,
        op: 0.4 + Math.random() * 0.5,
      });
    }
    return out;
  }, []);

  return (
    <group>
      {items.map((g, i) => (
        <sprite key={i} position={g.pos} scale={[g.size, g.size, 1]}>
          <spriteMaterial
            map={CLUSTER_SPRITE}
            color="#ffe7c4"
            transparent
            opacity={g.op}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </sprite>
      ))}
    </group>
  );
};

export default GalaxyGlobulars;
