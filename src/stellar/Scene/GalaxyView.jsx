/* eslint-disable react/no-unknown-property */
import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useSceneClock } from "./SceneClock";
import { GALAXY_PLANETS, helixPosition, sunPosition } from "../config/galaxy";
import HelixTrails from "./HelixTrails";

/*
 * Helical galaxy view — the Sun marching toward the solar apex (+Z) with the
 * planets tracing 60°-tilted helices around its line of travel (see
 * config/galaxy.js for the physics). Bodies are lightweight emissive spheres
 * (true radii would be invisible at this zoom); colours from the registry.
 * Mounts only while mode === "galaxy".
 */

const SUN_VIS = 13;
const bodyVis = (dest) => THREE.MathUtils.clamp(2.5 + Math.cbrt(dest.radius) * 5, 3.5, 11);

const GalaxyView = ({ reducedMotion = false }) => {
  const clock = useSceneClock();
  const sunRef = useRef();
  const instRef = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const _sun = useMemo(() => new THREE.Vector3(), []);
  const _pos = useMemo(() => new THREE.Vector3(), []);

  /* Per-body colour, set once. */
  useLayoutEffect(() => {
    const inst = instRef.current;
    if (!inst) return;
    const col = new THREE.Color();
    GALAXY_PLANETS.forEach((d, i) => {
      col.set(d.color || "#cfd6ff");
      inst.setColorAt(i, col);
    });
    if (inst.instanceColor) inst.instanceColor.needsUpdate = true;
  }, []);

  useFrame(() => {
    const t = reducedMotion ? 0 : clock.t;
    sunPosition(t, _sun);
    if (sunRef.current) sunRef.current.position.copy(_sun);
    const inst = instRef.current;
    if (inst) {
      for (let i = 0; i < GALAXY_PLANETS.length; i++) {
        helixPosition(GALAXY_PLANETS[i], t, _pos);
        dummy.position.copy(_pos);
        dummy.scale.setScalar(bodyVis(GALAXY_PLANETS[i]));
        dummy.updateMatrix();
        inst.setMatrixAt(i, dummy.matrix);
      }
      inst.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* The Sun, riding the apex line. */}
      <mesh ref={sunRef}>
        <sphereGeometry args={[SUN_VIS, 32, 32]} />
        <meshBasicMaterial color="#ffd9a0" toneMapped={false} />
      </mesh>
      {/* Planets — one instanced sphere per body, repositioned each frame. */}
      <instancedMesh ref={instRef} args={[undefined, undefined, GALAXY_PLANETS.length]} frustumCulled={false}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      {/* Helical trails. */}
      {GALAXY_PLANETS.map((d) => (
        <HelixTrails key={d.id} dest={d} reducedMotion={reducedMotion} />
      ))}
    </group>
  );
};

export default GalaxyView;
