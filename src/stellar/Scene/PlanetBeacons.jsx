/* eslint-disable react/no-unknown-property */
/*
 * Colored beacon dot at each planet's LIVE orbital position (same
 * orbitalPosition the tour camera + KeyLight track), sized to a fixed pixel
 * count regardless of distance so the planets are actually READABLE from the
 * overview framing (~2200u out) where a real 0.07u Mercury renders as a
 * sub-pixel void.
 *
 * Colors use each destination's palette so the overview reads as the real
 * system: the tiny grey Mercury dot, the cream-yellow Venus, the blue Earth,
 * butterscotch Mars, tan Ceres, banded gold Jupiter, golden Saturn, muted
 * cyan Uranus, deep blue Neptune, pale Pluto.
 *
 * Uses sizeAttenuation={false} so pixel size is constant — at the overview
 * they're clean dots, at a tour stop they read as a soft colour highlight
 * on the actual planet and never fight the real render.
 */
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { DESTINATIONS } from "../config/destinations";
import { orbitalPosition } from "../config/orbits";
import { useSceneClock } from "./SceneClock";
import { makeSoftDot } from "./shared/textures";

const BODIES = DESTINATIONS.filter((d) => d.kind === "planet");

const BEACON = makeSoftDot({
  size: 64,
  stops: [
    [0, "rgba(255,255,255,1)"],
    [0.28, "rgba(255,255,255,0.85)"],
    [0.65, "rgba(255,255,255,0.25)"],
    [1, "rgba(255,255,255,0)"],
  ],
  mipmaps: true,
});

const _v = new THREE.Vector3();

const PlanetBeacons = () => {
  const geomRef = useRef();
  const clock = useSceneClock();

  const positions = useMemo(() => new Float32Array(BODIES.length * 3), []);
  const colors = useMemo(() => {
    const arr = new Float32Array(BODIES.length * 3);
    BODIES.forEach((b, i) => {
      const c = new THREE.Color(b.color || "#ffffff");
      arr[i * 3    ] = c.r;
      arr[i * 3 + 1] = c.g;
      arr[i * 3 + 2] = c.b;
    });
    return arr;
  }, []);

  useFrame(() => {
    const t = clock?.t || 0;
    for (let i = 0; i < BODIES.length; i++) {
      orbitalPosition(BODIES[i], t, _v);
      positions[i * 3    ] = _v.x;
      positions[i * 3 + 1] = _v.y;
      positions[i * 3 + 2] = _v.z;
    }
    if (geomRef.current) geomRef.current.attributes.position.needsUpdate = true;
  });

  return (
    <points frustumCulled={false} renderOrder={2}>
      <bufferGeometry ref={geomRef}>
        <bufferAttribute
          attach="attributes-position"
          count={BODIES.length}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={BODIES.length}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        map={BEACON}
        size={14}
        sizeAttenuation={false}
        vertexColors
        transparent
        opacity={0.9}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </points>
  );
};

export default PlanetBeacons;
