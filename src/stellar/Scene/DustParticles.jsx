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

/* Reduced from 220 → 70 and pushed farther out. The old dense field
   read as TV-static noise in the foreground. Now it's a sparse,
   subtle parallax layer. */
const COUNT = 70;
const SPAWN_RADIUS = 22;
const NEAR_CLEAR = 6; // keep dust out of this bubble around the camera
const DRIFT_SPEED = 0.4;

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
      const dist = p.position.distanceTo(cam);
      /* Respawn if drifted too far OR too close (keeps the near bubble
         clear so dust never smears across the lens). */
      if (dist > SPAWN_RADIUS || dist < NEAR_CLEAR) {
        const r = NEAR_CLEAR + Math.random() * (SPAWN_RADIUS - NEAR_CLEAR);
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        p.position.set(
          cam.x + r * Math.sin(phi) * Math.cos(theta),
          cam.y + r * Math.sin(phi) * Math.sin(theta) * 0.7,
          cam.z + r * Math.cos(phi)
        );
      }
      dummy.position.copy(p.position);
      dummy.lookAt(cam);
      /* Fade scale with distance so near dust is tiny, far dust larger
         — reads as depth, not noise. */
      const fade = THREE.MathUtils.clamp((dist - NEAR_CLEAR) / 8, 0, 1);
      dummy.scale.setScalar(p.scale * fade);
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
        opacity={0.18}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </instancedMesh>
  );
};

export default DustParticles;
