/* eslint-disable react/no-unknown-property */
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/*
 * Foreground dust particles — small bright specks drifting around the
 * camera. Gives the scene parallax depth (they pass between the camera
 * and the planets, making the whole system feel "thicker").
 *
 * The particles re-spawn behind the camera as they drift past, so the
 * field stays dense regardless of where the camera flies.
 */

const COUNT = 220;
const SPAWN_RADIUS = 14;
const DRIFT_SPEED = 0.6;

const SPRITE_TEXTURE = (() => {
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = c.height = 32;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.5, "rgba(255,255,255,0.4)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 32, 32);
  const t = new THREE.CanvasTexture(c);
  t.needsUpdate = true;
  return t;
})();

const DustParticles = () => {
  const meshRef = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() => {
    const arr = [];
    for (let i = 0; i < COUNT; i++) {
      arr.push({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * SPAWN_RADIUS * 2,
          (Math.random() - 0.5) * SPAWN_RADIUS,
          (Math.random() - 0.5) * SPAWN_RADIUS * 2
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * DRIFT_SPEED,
          (Math.random() - 0.5) * DRIFT_SPEED * 0.4,
          (Math.random() - 0.5) * DRIFT_SPEED
        ),
        scale: 0.012 + Math.random() * 0.028,
      });
    }
    return arr;
  }, []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const cam = state.camera.position;
    particles.forEach((p, i) => {
      p.position.add(p.velocity.clone().multiplyScalar(delta));
      /* Respawn if drifted too far from camera */
      if (p.position.distanceTo(cam) > SPAWN_RADIUS) {
        p.position.copy(cam);
        p.position.x += (Math.random() - 0.5) * SPAWN_RADIUS;
        p.position.y += (Math.random() - 0.5) * SPAWN_RADIUS * 0.7;
        p.position.z += (Math.random() - 0.5) * SPAWN_RADIUS;
      }
      dummy.position.copy(p.position);
      /* Always face camera (sprite-like) by zeroing rotation */
      dummy.lookAt(cam);
      dummy.scale.setScalar(p.scale);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, COUNT]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        map={SPRITE_TEXTURE}
        transparent
        opacity={0.4}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </instancedMesh>
  );
};

export default DustParticles;
