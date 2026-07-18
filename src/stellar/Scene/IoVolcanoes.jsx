/* eslint-disable react/no-unknown-property */
/*
 * IO VOLCANO PLUMES — Io is the most volcanically active world in the
 * solar system, with hundreds of active volcanoes. Voyager 1 (1979) and
 * Galileo (1995-2003) imaged 300+ km-high sulfur plumes rising from named
 * volcanoes like Pele, Prometheus, Loki, Amirani. Rendered as a handful
 * of bright orange plume sprites at surface positions on Io, riding the
 * moon's rotation.
 *
 * Sources: docs/research/00-MASTER.md; Galileo mission imagery archive.
 */
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useSceneClock } from "./SceneClock";
import { makeSoftDot } from "./shared/textures";

const PLUME_SPRITE = makeSoftDot({
  size: 128,
  stops: [
    [0, "rgba(255,240,180,1)"],
    [0.30, "rgba(255,200,120,0.85)"],
    [0.7, "rgba(255,120,60,0.30)"],
    [1, "rgba(180,60,20,0)"],
  ],
  mipmaps: true,
});

const IoVolcanoes = ({ radius = 0.02, animate = true }) => {
  const groupRef = useRef();
  const sceneClock = useSceneClock();

  /* Four real named volcano positions (approximate lat/long → surface
     unit vector). Amplified plume height so they're visible at moon scale. */
  const plumes = [
    { name: "Pele",       dir: [ 0.72, -0.10, 0.68], scale: radius * 60 },
    { name: "Prometheus", dir: [ 0.30, -0.06, 0.94], scale: radius * 46 },
    { name: "Loki",       dir: [-0.75,  0.55, 0.36], scale: radius * 52 },
    { name: "Amirani",    dir: [-0.60, -0.30, 0.74], scale: radius * 38 },
  ];

  useFrame(() => {
    if (!animate || !groupRef.current) return;
    const t = sceneClock.t;
    for (let i = 0; i < groupRef.current.children.length; i++) {
      const c = groupRef.current.children[i];
      const puls = 1 + 0.20 * Math.sin(t * 0.9 + i * 1.3);
      c.scale.setScalar(plumes[i].scale * puls);
    }
  });

  return (
    <group ref={groupRef}>
      {plumes.map((p, i) => (
        <sprite key={i} position={[p.dir[0] * radius, p.dir[1] * radius, p.dir[2] * radius]} scale={[p.scale, p.scale * 1.4, 1]}>
          <spriteMaterial
            map={PLUME_SPRITE}
            color="#ffd096"
            transparent
            opacity={0.70}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </sprite>
      ))}
    </group>
  );
};

export default IoVolcanoes;
