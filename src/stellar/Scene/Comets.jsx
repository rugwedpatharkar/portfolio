/* eslint-disable react/no-unknown-property */
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/*
 * A small pool of comets that travel along randomized straight-line paths
 * across the system, each leaving a glowing trail. When a comet exits the
 * boundary box it respawns somewhere new with a fresh direction.
 *
 * Implementation: one buffer-attribute Line per comet (trail), plus a
 * point head. Cheap; pool fixed at COMET_COUNT.
 */

const COMET_COUNT = 3;
const BOUND = 60;
const TRAIL_LEN = 24;

function randomSpawn() {
  // Spawn on one face of the bounding cube, aim roughly toward opposite face
  const face = Math.floor(Math.random() * 6);
  const a = (Math.random() - 0.5) * BOUND * 1.2;
  const b = (Math.random() - 0.5) * BOUND * 1.2;
  let pos;
  switch (face) {
    case 0: pos = [BOUND, a, b]; break;
    case 1: pos = [-BOUND, a, b]; break;
    case 2: pos = [a, BOUND, b]; break;
    case 3: pos = [a, -BOUND, b]; break;
    case 4: pos = [a, b, BOUND]; break;
    default: pos = [a, b, -BOUND];
  }
  const targetJitter = () => (Math.random() - 0.5) * BOUND * 0.6;
  const target = [targetJitter(), targetJitter(), targetJitter()];
  const dx = target[0] - pos[0];
  const dy = target[1] - pos[1];
  const dz = target[2] - pos[2];
  const mag = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
  const speed = 14 + Math.random() * 8;
  const vel = [(dx / mag) * speed, (dy / mag) * speed, (dz / mag) * speed];
  return { pos, vel, life: 0, maxLife: 7 + Math.random() * 4 };
}

const Comet = ({ color = "#a4f9ff" }) => {
  const headRef = useRef();
  const lineRef = useRef();
  const stateRef = useRef(randomSpawn());

  const trailPositions = useMemo(() => new Float32Array(TRAIL_LEN * 3), []);
  const trailAlphas = useMemo(() => new Float32Array(TRAIL_LEN), []);

  useFrame((_, delta) => {
    const s = stateRef.current;
    s.life += delta;
    s.pos[0] += s.vel[0] * delta;
    s.pos[1] += s.vel[1] * delta;
    s.pos[2] += s.vel[2] * delta;

    // Respawn when comet leaves the box or expires
    const out = Math.abs(s.pos[0]) > BOUND + 5 || Math.abs(s.pos[1]) > BOUND + 5 || Math.abs(s.pos[2]) > BOUND + 5;
    if (out || s.life > s.maxLife) {
      stateRef.current = randomSpawn();
      // clear trail
      for (let i = 0; i < TRAIL_LEN; i++) {
        trailPositions[i * 3 + 0] = stateRef.current.pos[0];
        trailPositions[i * 3 + 1] = stateRef.current.pos[1];
        trailPositions[i * 3 + 2] = stateRef.current.pos[2];
      }
    }

    // Shift trail buffer
    for (let i = TRAIL_LEN - 1; i > 0; i--) {
      trailPositions[i * 3 + 0] = trailPositions[(i - 1) * 3 + 0];
      trailPositions[i * 3 + 1] = trailPositions[(i - 1) * 3 + 1];
      trailPositions[i * 3 + 2] = trailPositions[(i - 1) * 3 + 2];
    }
    trailPositions[0] = s.pos[0];
    trailPositions[1] = s.pos[1];
    trailPositions[2] = s.pos[2];

    if (headRef.current) headRef.current.position.set(s.pos[0], s.pos[1], s.pos[2]);
    if (lineRef.current) lineRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <>
      <mesh ref={headRef}>
        <sphereGeometry args={[0.14, 8, 8]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <line ref={lineRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={TRAIL_LEN}
            array={trailPositions}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color={color} transparent opacity={0.55} blending={THREE.AdditiveBlending} depthWrite={false} />
      </line>
    </>
  );
};

const Comets = () => (
  <>
    {Array.from({ length: COMET_COUNT }).map((_, i) => (
      <Comet key={i} color={["#a4f9ff", "#ffd2a8", "#d4a8ff"][i % 3]} />
    ))}
  </>
);

export default Comets;
