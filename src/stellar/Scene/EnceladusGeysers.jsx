/* eslint-disable react/no-unknown-property */
/*
 * ENCELADUS SOUTH-POLE GEYSERS — the iconic Cassini image: bright plumes of
 * water ice shooting from the "tiger stripe" fissures near the south pole,
 * feeding Saturn's E-ring. First detected 2005 by Cassini's magnetometer,
 * imaged in 2005-2015 by the imaging camera. Plumes reach 400 km high on
 * average and deposit ~200 kg/s of water into orbit.
 *
 * Rendered as a small cluster of feathered bright sprites clustered at the
 * moon's south pole (−Y in local frame, inheriting the moon's parent orbit).
 * Meant to be mounted as a child of Enceladus's mesh in Planet.jsx moonSet
 * or as a stand-alone component next to Enceladus's live position.
 *
 * Sources: docs/research/01-sun-and-planets.md §3.6 (Saturn moon fact
 * cards); NASA/JPL/SSI Cassini imaging archive.
 */
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useSceneClock } from "./SceneClock";
import { makeSoftDot } from "./shared/textures";

const PLUME_SPRITE = makeSoftDot({
  size: 128,
  stops: [
    [0, "rgba(255,255,255,1)"],
    [0.30, "rgba(230,244,255,0.8)"],
    [0.7, "rgba(160,200,240,0.20)"],
    [1, "rgba(80,120,200,0)"],
  ],
  mipmaps: true,
});

const EnceladusGeysers = ({ radius = 0.02, position = [0, 0, 0], animate = true }) => {
  const groupRef = useRef();
  const sceneClock = useSceneClock();

  /* Three plume jets at the south pole — tiger stripe positions. */
  const jets = [
    { offset: [ 0.0,   -radius * 1.0, 0.0], scale: radius * 30 },
    { offset: [ radius * 0.2, -radius * 0.92, 0.0], scale: radius * 24 },
    { offset: [-radius * 0.15, -radius * 0.94, radius * 0.1], scale: radius * 22 },
  ];

  useFrame(() => {
    if (!animate || !groupRef.current) return;
    /* Subtle plume flicker — real Cassini imagery shows the plumes are
       variable on hour timescales. */
    const t = sceneClock.t;
    for (let i = 0; i < groupRef.current.children.length; i++) {
      const c = groupRef.current.children[i];
      const puls = 1 + 0.14 * Math.sin(t * 1.3 + i * 1.7);
      c.scale.setScalar(jets[i].scale * puls);
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {jets.map((j, i) => (
        <sprite key={i} position={j.offset} scale={[j.scale, j.scale * 1.6, 1]}>
          <spriteMaterial
            map={PLUME_SPRITE}
            color="#dcecff"
            transparent
            opacity={0.65}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </sprite>
      ))}
    </group>
  );
};

export default EnceladusGeysers;
