/* eslint-disable react/no-unknown-property */
import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { fetchGithubEvents, repoColor } from "../data/github";

/*
 * Real GitHub commits rendered as comets streaking past the system.
 * Each commit has a deterministic spawn position + trajectory based on
 * its sha hash, so visiting the page twice gives consistent visuals.
 *
 * Comets are drawn as a point head + a Line trail. We cap at 8
 * simultaneously visible; older commits cycle in as newer ones leave.
 */

const VISIBLE_AT_ONCE = 8;
const TRAIL_LEN = 18;
const SPAWN_R = 60;
const SPEED_RANGE = [10, 18];

const hash01 = (str, salt = 0) => {
  let h = 2166136261 ^ salt;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 0xffffffff;
};

const spawnFor = (commit) => {
  const azimuth = hash01(commit.sha, 1) * Math.PI * 2;
  const elevation = (hash01(commit.sha, 2) - 0.5) * Math.PI * 0.45;
  const spawn = [
    Math.cos(azimuth) * Math.cos(elevation) * SPAWN_R,
    Math.sin(elevation) * SPAWN_R,
    Math.sin(azimuth) * Math.cos(elevation) * SPAWN_R,
  ];
  /* Target: a random point near the system centre */
  const target = [
    (hash01(commit.sha, 3) - 0.5) * 20,
    (hash01(commit.sha, 4) - 0.5) * 6,
    (hash01(commit.sha, 5) - 0.5) * 20,
  ];
  const dir = [target[0] - spawn[0], target[1] - spawn[1], target[2] - spawn[2]];
  const len = Math.hypot(...dir) || 1;
  const speed = SPEED_RANGE[0] + hash01(commit.sha, 6) * (SPEED_RANGE[1] - SPEED_RANGE[0]);
  return {
    pos: spawn.slice(),
    vel: [dir[0] / len * speed, dir[1] / len * speed, dir[2] / len * speed],
    color: repoColor(commit.repo),
    life: 0,
    maxLife: 7 + hash01(commit.sha, 7) * 3,
    commit,
  };
};

const Comet = ({ state, onRespawn }) => {
  const headRef = useRef();
  const lineRef = useRef();
  const trail = useMemo(() => new Float32Array(TRAIL_LEN * 3), []);

  useFrame((_, dt) => {
    const s = state.current;
    s.life += dt;
    s.pos[0] += s.vel[0] * dt;
    s.pos[1] += s.vel[1] * dt;
    s.pos[2] += s.vel[2] * dt;

    if (s.life > s.maxLife || Math.abs(s.pos[0]) > 80 || Math.abs(s.pos[2]) > 80) {
      onRespawn();
      for (let i = 0; i < TRAIL_LEN; i++) {
        trail[i * 3] = state.current.pos[0];
        trail[i * 3 + 1] = state.current.pos[1];
        trail[i * 3 + 2] = state.current.pos[2];
      }
      return;
    }

    for (let i = TRAIL_LEN - 1; i > 0; i--) {
      trail[i * 3] = trail[(i - 1) * 3];
      trail[i * 3 + 1] = trail[(i - 1) * 3 + 1];
      trail[i * 3 + 2] = trail[(i - 1) * 3 + 2];
    }
    trail[0] = s.pos[0];
    trail[1] = s.pos[1];
    trail[2] = s.pos[2];

    if (headRef.current) headRef.current.position.set(s.pos[0], s.pos[1], s.pos[2]);
    if (lineRef.current?.geometry?.attributes?.position) {
      lineRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  const s = state.current;
  return (
    <>
      <mesh ref={headRef}>
        <sphereGeometry args={[0.11, 8, 8]} />
        <meshBasicMaterial color={s.color} toneMapped={false} />
      </mesh>
      <line ref={lineRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={TRAIL_LEN} array={trail} itemSize={3} />
        </bufferGeometry>
        <lineBasicMaterial color={s.color} transparent opacity={0.7} blending={THREE.AdditiveBlending} depthWrite={false} />
      </line>
    </>
  );
};

const CommitComets = () => {
  const [commits, setCommits] = useState([]);
  const indexRef = useRef(0);
  const stateRefs = useRef([]);

  useEffect(() => {
    fetchGithubEvents()
      .then((events) => {
        if (events?.length) setCommits(events);
      })
      .catch(() => { /* render nothing — graceful no-op */ });
  }, []);

  /* Initialise comet states whenever commits load */
  useEffect(() => {
    if (!commits.length) return;
    stateRefs.current = Array.from({ length: VISIBLE_AT_ONCE }).map((_, i) => ({
      current: spawnFor(commits[i % commits.length]),
    }));
    indexRef.current = VISIBLE_AT_ONCE % commits.length;
  }, [commits]);

  const handleRespawn = (slot) => {
    if (!commits.length) return;
    const c = commits[indexRef.current % commits.length];
    indexRef.current++;
    stateRefs.current[slot].current = spawnFor(c);
  };

  if (!commits.length) return null;
  return (
    <>
      {stateRefs.current.map((stateRef, i) => (
        <Comet key={i} state={stateRef} onRespawn={() => handleRespawn(i)} />
      ))}
    </>
  );
};

export default CommitComets;
