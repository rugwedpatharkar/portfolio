/* eslint-disable react/no-unknown-property */
import { useMemo, useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/*
 * A periodic meteor shower — instanced bright streaks that all radiate from
 * one fixed radiant point (as real showers do: the Perseids etc. trace back
 * to a single spot on the sky), flash across, and fade. Staggered respawn
 * delays make it pulse in loose bursts rather than a steady drizzle.
 *
 * One InstancedMesh of thin elongated boxes; per-instance colour carries the
 * brightness fade (additive → fades to nothing). Cheap — same instancing
 * approach as AsteroidBelt.
 */

const COUNT = 64;
const RADIANT = new THREE.Vector3(10, 12, -20); // streaks appear to come from here
const FLOW = new THREE.Vector3(-0.32, -0.86, 0.94).normalize(); // mean travel dir
const SPREAD = 0.42;

const _m = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _scale = new THREE.Vector3();
const _up = new THREE.Vector3(0, 1, 0);
const _col = new THREE.Color();

function makeMeteor() {
  const dir = FLOW.clone();
  dir.x += (Math.random() - 0.5) * SPREAD;
  dir.y += (Math.random() - 0.5) * SPREAD * 0.5;
  dir.z += (Math.random() - 0.5) * SPREAD;
  dir.normalize();
  return {
    dir,
    start: RADIANT.clone().addScaledVector(dir, 1 + Math.random() * 7),
    pos: new THREE.Vector3(),
    speed: 26 + Math.random() * 20,
    len: 1.3 + Math.random() * 2.4,
    life: 0,
    maxLife: 0.6 + Math.random() * 0.7,
    delay: Math.random() * 7, // first appearance, staggered → bursts
  };
}

const Meteors = () => {
  const ref = useRef();
  const meteors = useMemo(() => Array.from({ length: COUNT }, makeMeteor), []);

  /* Hide all instances until their first burst. */
  useEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    meteors.forEach((mt, i) => {
      mt.pos.copy(mt.start);
      _m.makeScale(0, 0, 0);
      mesh.setMatrixAt(i, _m);
      mesh.setColorAt(i, _col.set(0, 0, 0));
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [meteors]);

  useFrame((_, delta) => {
    const mesh = ref.current;
    if (!mesh) return;
    const d = Math.min(delta, 1 / 20);
    for (let i = 0; i < COUNT; i++) {
      const mt = meteors[i];
      if (mt.delay > 0) {
        mt.delay -= d;
        continue;
      }
      mt.life += d;
      if (mt.life >= mt.maxLife) {
        // recycle with a fresh path + a short random delay → loose bursts
        Object.assign(mt, makeMeteor());
        mt.pos.copy(mt.start);
        _m.makeScale(0, 0, 0);
        mesh.setMatrixAt(i, _m);
        mesh.setColorAt(i, _col.set(0, 0, 0));
        continue;
      }
      mt.pos.addScaledVector(mt.dir, mt.speed * d);
      /* brightness: quick rise, long fade */
      const f = mt.life / mt.maxLife;
      const bright = Math.min(1, f * 6) * (1 - f) * 1.6;
      _q.setFromUnitVectors(_up, mt.dir);
      _scale.set(0.05, mt.len, 0.05);
      _m.compose(mt.pos, _q, _scale);
      mesh.setMatrixAt(i, _m);
      _col.setRGB(bright * 0.95, bright * 0.97, bright); // white-blue
      mesh.setColorAt(i, _col);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, COUNT]} frustumCulled={false}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial
        vertexColors
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </instancedMesh>
  );
};

export default Meteors;
