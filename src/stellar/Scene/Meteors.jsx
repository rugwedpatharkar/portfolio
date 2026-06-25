/* eslint-disable react/no-unknown-property */
import { useMemo, useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/*
 * A periodic meteor shower — instanced bright streaks that all radiate from one
 * radiant point (as real showers do: the Perseids etc. trace back to a single
 * spot on the sky), flash across, and fade. Staggered respawn delays make it
 * pulse in loose bursts rather than a steady drizzle.
 *
 * The radiant RIDES WITH THE CAMERA (a fixed world offset, upper-left of view),
 * so the shower is always playing out in the deep field the viewer is looking at
 * — at every planet stop, not just near the Sun. Previously it was pinned to a
 * tiny bubble at the origin and was a sub-degree speck (or off-screen) from the
 * far-out planet stops, so it was effectively invisible.
 *
 * One InstancedMesh of thin elongated boxes; per-instance colour carries the
 * brightness fade (additive → fades to nothing). Cheap — same instancing
 * approach as AsteroidBelt.
 */

const COUNT = 90;
const SHOWER_OFFSET = new THREE.Vector3(-120, 90, -70); // radiant relative to the camera (upper-left deep field)
const FLOW = new THREE.Vector3(0.35, -0.92, 0.5).normalize(); // mean travel dir (raining down-and-across)
const SPREAD = 0.5;

const _m = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _scale = new THREE.Vector3();
const _up = new THREE.Vector3(0, 1, 0);
const _col = new THREE.Color();
const _radiant = new THREE.Vector3();

function makeMeteor() {
  const dir = FLOW.clone();
  dir.x += (Math.random() - 0.5) * SPREAD;
  dir.y += (Math.random() - 0.5) * SPREAD * 0.5;
  dir.z += (Math.random() - 0.5) * SPREAD;
  dir.normalize();
  return {
    dir,
    offset: 4 + Math.random() * 40, // distance from the radiant along dir at spawn
    pos: new THREE.Vector3(),
    speed: 30 + Math.random() * 34,
    len: 7 + Math.random() * 16, // long bright streaks (scaled for the deep-field distance)
    width: 0.22 + Math.random() * 0.3,
    life: 0,
    maxLife: 0.8 + Math.random() * 1.0,
    delay: Math.random() * 6, // first appearance, staggered → bursts
    spawned: false,
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
      _m.makeScale(0, 0, 0);
      mesh.setMatrixAt(i, _m);
      mesh.setColorAt(i, _col.set(0, 0, 0));
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [meteors]);

  useFrame(({ camera }, delta) => {
    const mesh = ref.current;
    if (!mesh) return;
    const d = Math.min(delta, 1 / 20);
    /* Anchor the radiant to the camera so the shower always plays on-screen. */
    _radiant.copy(camera.position).add(SHOWER_OFFSET);
    for (let i = 0; i < COUNT; i++) {
      const mt = meteors[i];
      if (mt.delay > 0) {
        mt.delay -= d;
        continue;
      }
      if (!mt.spawned) {
        mt.spawned = true;
        mt.pos.copy(_radiant).addScaledVector(mt.dir, mt.offset);
      }
      mt.life += d;
      if (mt.life >= mt.maxLife) {
        // recycle with a fresh path + a short random delay → loose bursts
        Object.assign(mt, makeMeteor(), { delay: Math.random() * 3.5 });
        _m.makeScale(0, 0, 0);
        mesh.setMatrixAt(i, _m);
        mesh.setColorAt(i, _col.set(0, 0, 0));
        continue;
      }
      mt.pos.addScaledVector(mt.dir, mt.speed * d);
      /* brightness: quick rise, long fade */
      const f = mt.life / mt.maxLife;
      const bright = Math.min(1, f * 6) * (1 - f) * 1.7;
      _q.setFromUnitVectors(_up, mt.dir);
      _scale.set(mt.width, mt.len, mt.width);
      _m.compose(mt.pos, _q, _scale);
      mesh.setMatrixAt(i, _m);
      _col.setRGB(bright * 0.96, bright * 0.98, bright); // white-blue
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
