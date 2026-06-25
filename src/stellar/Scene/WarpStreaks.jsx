/* eslint-disable react/no-unknown-property */
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/*
 * Hyperspace warp — a GPU light-speed streak tunnel (Star Wars jump).
 *
 * Replaces the old main-thread 2D-canvas WarpField (which allocated ~540 canvas
 * gradients PER FRAME and hung at startup). This is ONE instanced draw call whose
 * geometry is computed entirely in the vertex shader from a single uTime uniform
 * — zero per-frame CPU work, so it stays buttery even while the app boots.
 *
 * How the tunnel works: each streak has a FIXED lateral (x,y) in VIEW space and a
 * z that loops far→near over time. Because (x,y) is fixed while z sweeps toward
 * the camera, perspective makes every streak appear to rush radially OUTWARD from
 * the centre and accelerate — the exact hyperspace look, for free. Each streak is
 * a thin screen-space quad from head→tail (length ∝ intensity = the motion blur).
 * In-scene + additive + toneMapped:false → the existing Bloom turns them into a
 * glowing tunnel. A dim quad behind them darkens the scene so they dominate.
 *
 * Driven by the SAME intensity sources as travel: launchPhase (the intro warp)
 * and warpVelRef (live travel speed, written by CameraRig). Mounted only when
 * motion is allowed (gated by the caller).
 */

const COUNT = 2600;
const NEAR = 1.5;
const FAR = 46;
const SPEED = 0.5; // loops per second (per streak, offset by phase)
const MAX_LEN = 30; // view-units of streak at full intensity (long light-speed motion blur)
const WIDTH = 0.0038; // streak half-width in NDC (≈ constant screen px)
const RADIUS = 0.95; // lateral spread of the streak field (view units)
const DIM_MAX = 0.6; // how dark the tunnel background gets at full warp

const STREAK_VERT = /* glsl */ `
  attribute vec2 aCorner;   // x = along (0 tail → 1 head), y = side (-1 / +1)
  attribute vec2 aLateral;  // fixed view-space x,y (per streak)
  attribute float aPhase;   // per streak
  uniform float uTime;
  uniform float uIntensity;
  varying float vAlong;
  varying float vP;
  void main() {
    float p = fract(uTime * ${SPEED.toFixed(3)} + aPhase);
    float zHead = -${FAR.toFixed(1)} + p * (${FAR.toFixed(1)} - ${NEAR.toFixed(1)});
    float len = ${MAX_LEN.toFixed(1)} * clamp(uIntensity, 0.0, 1.6);
    float zTail = zHead - len;
    float zPos = mix(zTail, zHead, aCorner.x);

    /* Project head + tail to find the streak's on-screen direction, then offset
       the corner perpendicular to it by a ~constant NDC width. */
    vec4 cH = projectionMatrix * vec4(aLateral, zHead, 1.0);
    vec4 cT = projectionMatrix * vec4(aLateral, zTail, 1.0);
    vec2 sH = cH.xy / cH.w;
    vec2 sT = cT.xy / cT.w;
    vec2 d = sH - sT;
    float dl = length(d);
    vec2 dir = dl > 1e-4 ? d / dl : normalize(sH + vec2(1e-4));
    vec2 perp = vec2(-dir.y, dir.x);

    vec4 c = projectionMatrix * vec4(aLateral, zPos, 1.0);
    vec2 s = c.xy / c.w + perp * aCorner.y * ${WIDTH.toFixed(4)};
    gl_Position = vec4(s * c.w, c.z, c.w);
    vAlong = aCorner.x;
    vP = p;
  }
`;

const STREAK_FRAG = /* glsl */ `
  precision highp float;
  uniform vec3 uColor;
  uniform float uIntensity;
  varying float vAlong;
  varying float vP;
  void main() {
    /* Hot leading head, fading tail (motion blur); fade the just-spawned far end
       and the about-to-pass near end so they don't pop. */
    float a = uIntensity * (0.12 + 0.88 * vAlong);
    a *= smoothstep(0.0, 0.10, vP) * (1.0 - smoothstep(0.92, 1.0, vP));
    if (a < 0.01) discard;
    gl_FragColor = vec4(uColor * a * 1.9, a);
  }
`;

/* Fullscreen NDC dim quad — darkens the scene behind the streaks. */
const DIM_VERT = /* glsl */ `
  attribute vec2 aPos;
  void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;
const DIM_FRAG = /* glsl */ `
  precision highp float;
  uniform vec3 uColor;
  uniform float uOpacity;
  void main() {
    if (uOpacity < 0.004) discard;
    gl_FragColor = vec4(uColor, uOpacity);
  }
`;

const WarpStreaks = ({ launchPhase = null, warpVelRef, color = "#bfe0ff" }) => {
  const cur = useRef(0);
  const t = useRef(0);
  const phaseRef = useRef(launchPhase);
  phaseRef.current = launchPhase;
  const streakMat = useRef();
  const dimMat = useRef();

  const streakGeo = useMemo(() => {
    const g = new THREE.InstancedBufferGeometry();
    // base quad: 2 tris, (along, side)
    const corners = new Float32Array([
      0, -1, 1, -1, 1, 1,
      0, -1, 1, 1, 0, 1,
    ]);
    g.setAttribute("aCorner", new THREE.BufferAttribute(corners, 2));
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(18), 3)); // vertex-count hint
    const lateral = new Float32Array(COUNT * 2);
    const phase = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * RADIUS; // uniform disc
      lateral[i * 2] = Math.cos(a) * r;
      lateral[i * 2 + 1] = Math.sin(a) * r;
      phase[i] = Math.random();
    }
    g.setAttribute("aLateral", new THREE.InstancedBufferAttribute(lateral, 2));
    g.setAttribute("aPhase", new THREE.InstancedBufferAttribute(phase, 1));
    g.instanceCount = COUNT;
    return g;
  }, []);

  const dimGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("aPos", new THREE.BufferAttribute(new Float32Array([-1, -1, 3, -1, -1, 3]), 2));
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(9), 3));
    return g;
  }, []);

  const streakUniforms = useMemo(
    () => ({ uTime: { value: 0 }, uIntensity: { value: 0 }, uColor: { value: new THREE.Color(color) } }),
    [color]
  );
  const dimUniforms = useMemo(
    () => ({ uOpacity: { value: 0 }, uColor: { value: new THREE.Color("#04060f") } }),
    []
  );

  useFrame((_, dt) => {
    const d = Math.min(dt || 1 / 60, 1 / 20);
    /* introBoost: full warp during the intro fly-in; otherwise track live travel
       speed. Asymmetric ease — punch IN fast, snap OUT (slam to lightspeed, then
       suddenly stop). */
    const target = Math.max(phaseRef.current === "warp" ? 1.35 : 0, warpVelRef?.current || 0);
    cur.current += (target - cur.current) * (target > cur.current ? 0.34 : 0.16);
    t.current += d;
    if (streakMat.current) {
      streakMat.current.uniforms.uTime.value = t.current;
      streakMat.current.uniforms.uIntensity.value = cur.current;
    }
    if (dimMat.current) dimMat.current.uniforms.uOpacity.value = Math.min(DIM_MAX, cur.current * DIM_MAX);
  });

  return (
    <group>
      {/* Dim tunnel background — behind the streaks, dims the scene. */}
      <mesh geometry={dimGeo} renderOrder={9998} frustumCulled={false}>
        <shaderMaterial
          ref={dimMat}
          vertexShader={DIM_VERT}
          fragmentShader={DIM_FRAG}
          uniforms={dimUniforms}
          transparent
          depthTest={false}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      {/* Streaks — on top, additive, bloom-glowed. */}
      <mesh geometry={streakGeo} renderOrder={9999} frustumCulled={false}>
        <shaderMaterial
          ref={streakMat}
          vertexShader={STREAK_VERT}
          fragmentShader={STREAK_FRAG}
          uniforms={streakUniforms}
          transparent
          depthTest={false}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
};

export default WarpStreaks;
