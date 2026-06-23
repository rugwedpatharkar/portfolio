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
const SPAWN_R = 60;
const SPEED_RANGE = [10, 18];
const TAIL_H = 2.6;
const UP = new THREE.Vector3(0, 1, 0);

/* Soft round glow for the comet head (replaces the hard little sphere). */
const HEAD_TEX = (() => {
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.35, "rgba(255,255,255,0.6)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c);
  t.needsUpdate = true;
  return t;
})();

/* Tapered tail — a cone whose alpha fades from the bright head (base) to a
   transparent point at the tail (apex). */
const TAIL_VERT = /* glsl */ `
  varying float vT;
  void main() {
    vT = (position.y + ${(TAIL_H / 2).toFixed(3)}) / ${TAIL_H.toFixed(3)};
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }`;
const TAIL_FRAG = /* glsl */ `
  varying float vT;
  uniform vec3 uColor;
  void main() {
    float a = pow(1.0 - vT, 1.35);
    gl_FragColor = vec4(uColor * a * 1.8, a * 0.9);
  }`;

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
  const groupRef = useRef();
  const headRef = useRef();
  const tailRef = useRef();
  const _vel = useMemo(() => new THREE.Vector3(), []);
  const _neg = useMemo(() => new THREE.Vector3(), []);
  const _col = useMemo(() => new THREE.Color(), []);
  const colorKey = useRef("");

  useFrame((_, dt) => {
    const s = state.current;
    s.life += dt;
    s.pos[0] += s.vel[0] * dt;
    s.pos[1] += s.vel[1] * dt;
    s.pos[2] += s.vel[2] * dt;

    if (s.life > s.maxLife || Math.abs(s.pos[0]) > 80 || Math.abs(s.pos[2]) > 80) {
      onRespawn();
      return;
    }

    const g = groupRef.current;
    if (!g) return;
    g.position.set(s.pos[0], s.pos[1], s.pos[2]);
    /* Orient so the cone's apex (local +Y, translated behind the head) points
       opposite the velocity — the tail streams straight back. */
    _vel.set(s.vel[0], s.vel[1], s.vel[2]).normalize();
    _neg.copy(_vel).negate();
    g.quaternion.setFromUnitVectors(UP, _neg);

    /* Recolour only when the slot cycles to a new commit. */
    if (colorKey.current !== s.color) {
      colorKey.current = s.color;
      _col.set(s.color);
      if (headRef.current) headRef.current.material.color.copy(_col);
      if (tailRef.current) tailRef.current.material.uniforms.uColor.value.copy(_col);
    }
  });

  const s = state.current;
  return (
    <group ref={groupRef}>
      <sprite ref={headRef} scale={[0.5, 0.5, 1]}>
        <spriteMaterial map={HEAD_TEX} color={s.color} transparent opacity={0.95} depthWrite={false} depthTest={false} blending={THREE.AdditiveBlending} />
      </sprite>
      <mesh ref={tailRef} position={[0, TAIL_H / 2, 0]}>
        <coneGeometry args={[0.14, TAIL_H, 18, 1, true]} />
        <shaderMaterial
          vertexShader={TAIL_VERT}
          fragmentShader={TAIL_FRAG}
          uniforms={{ uColor: { value: new THREE.Color(s.color) } }}
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
          toneMapped={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
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
