/* eslint-disable react/no-unknown-property */
/*
 * DeepStars — a DENSE procedural twinkling star haze layered on top of the real
 * catalogue (Stars.jsx). These are anonymous faint field stars whose only job is
 * depth + density + life: thousands of tiny points, each twinkling on its own
 * phase, in one draw call. Sits on the same celestial shell as the real sky so
 * they parallax together. Frozen under reduced motion.
 */
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { makeSoftDot } from "./shared/textures";

const R = 6600; // just inside the skybox / real-star shell
const TAU = Math.PI * 2;

const SPRITE = makeSoftDot({
  size: 64,
  stops: [
    [0, "rgba(255,255,255,1)"],
    [0.3, "rgba(255,255,255,0.65)"],
    [0.7, "rgba(255,255,255,0.12)"],
    [1, "rgba(255,255,255,0)"],
  ],
  mipmaps: true,
});

/* Subtle stellar tints — mostly white, a spread of blue-white and warm. */
const TINTS = [
  [0.85, 0.9, 1.0], [0.78, 0.85, 1.0], [1, 1, 1], [1, 0.98, 0.92],
  [1, 0.92, 0.8], [0.92, 0.95, 1.0], [1, 0.86, 0.7], [0.7, 0.8, 1.0],
];

/* Every star twinkles (unlike the real field, where only the bright ones do) —
   a wide brightness + size pulse on a per-star phase so the whole haze shimmers. */
const VERT = /* glsl */ `
  attribute float aSize;
  attribute vec3 aColor;
  uniform float uTime;
  varying vec3 vColor;
  varying float vTw;
  void main() {
    float phase = fract(sin(dot(position, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
    float tw = 0.55 + 0.45 * sin(uTime * 2.7 + phase * 6.2831);   // 0.1 .. 1.0
    vTw = tw;
    vColor = aColor;
    gl_PointSize = aSize * (0.65 + 0.55 * tw);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const FRAG = /* glsl */ `
  uniform sampler2D uMap;
  varying vec3 vColor;
  varying float vTw;
  void main() {
    float a = texture2D(uMap, gl_PointCoord).a * (0.3 + 0.6 * vTw);
    if (a < 0.01) discard;
    gl_FragColor = vec4(vColor, a);
  }
`;

function build(count) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    /* uniform point on the sphere */
    const u = Math.random() * 2 - 1;
    const th = Math.random() * TAU;
    const s = Math.sqrt(1 - u * u);
    positions[i * 3] = s * Math.cos(th) * R;
    positions[i * 3 + 1] = u * R;
    positions[i * 3 + 2] = s * Math.sin(th) * R;
    const tint = TINTS[(Math.random() * TINTS.length) | 0];
    const b = 0.4 + Math.random() * 0.5; // dim so the haze reads as depth, not glare
    colors[i * 3] = tint[0] * b;
    colors[i * 3 + 1] = tint[1] * b;
    colors[i * 3 + 2] = tint[2] * b;
    /* mostly tiny points, a scatter of slightly larger ones */
    sizes[i] = Math.random() < 0.88 ? 0.6 + Math.random() * 1.7 : 2.4 + Math.random() * 3.2;
  }
  return { positions, colors, sizes };
}

const DeepStars = ({ count = 16000, reducedMotion = false }) => {
  const { positions, colors, sizes } = useMemo(() => build(count), [count]);
  const uniforms = useMemo(() => ({ uMap: { value: SPRITE }, uTime: { value: 0 } }), []);
  const groupRef = useRef();

  useFrame((_, dt) => {
    if (!reducedMotion) uniforms.uTime.value += dt;
    /* same slow sidereal drift as the real sky so the two rotate together */
    if (groupRef.current && !reducedMotion) groupRef.current.rotation.y += dt * 7.27e-5;
  });

  return (
    <group ref={groupRef}>
      <points frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
          <bufferAttribute attach="attributes-aColor" count={colors.length / 3} array={colors} itemSize={3} />
          <bufferAttribute attach="attributes-aSize" count={sizes.length} array={sizes} itemSize={1} />
        </bufferGeometry>
        <shaderMaterial
          uniforms={uniforms}
          vertexShader={VERT}
          fragmentShader={FRAG}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </points>
    </group>
  );
};

export default DeepStars;
