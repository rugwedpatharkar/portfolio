/* eslint-disable react/no-unknown-property */
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useSceneClock } from "./SceneClock";

/*
 * Animated solar prominences — bright arcing flares that flicker off
 * the sun's limb. Implemented as a custom shader on a thin shell that
 * surrounds the sun: noise-driven displacement of opacity + colour
 * over the surface, with a brightness boost at random "flare hot spots"
 * that drift around the sphere.
 *
 * On top of the constant seething, a periodic CME flare erupts: roughly
 * every ~10–18s a hot spot on the limb swells, peaks, and fades on a slow
 * envelope — a tasteful eruption, not a constant blaze. Driven by the
 * shared virtual clock so time-control (pause/×2) affects it too.
 *
 * The shader is additive so it stacks cleanly on bloom.
 */

const VERTEX = `
varying vec3 vNormal;
varying vec3 vWorldPos;
varying vec3 vLocalPos;
varying vec2 vUv;
uniform vec3 uFlareDir;
uniform float uFlareAmp;
void main() {
  vLocalPos = position;
  vUv = uv;
  /* CME bulge — near the eruption hot spot, push the shell radially OUT so the
     prominence physically ARCS off the limb (a real silhouette against space,
     not just a brightening). */
  float aim = max(dot(normalize(normal), normalize(uFlareDir)), 0.0);
  float bulge = uFlareAmp * pow(aim, 5.0) * 0.45;
  vec3 displaced = position * (1.0 + bulge);
  vNormal = normalize(normalMatrix * normal);
  vec4 wp = modelMatrix * vec4(displaced, 1.0);
  vWorldPos = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

const FRAGMENT = `
varying vec3 vNormal;
varying vec3 vWorldPos;
varying vec3 vLocalPos;
varying vec2 vUv;
uniform float uTime;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uCameraPos;
uniform vec3 uFlareDir;    // unit dir of the current CME eruption on the limb
uniform float uFlareAmp;   // 0..1 rise→peak→fade envelope of the eruption

/* iqilez 3D simplex noise — compact */
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0); const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857; vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z); vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy; vec4 y = y_ * ns.x + ns.yyyy; vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy); vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0; vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy; vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x); vec3 p1 = vec3(a0.zw, h.y); vec3 p2 = vec3(a1.xy, h.z); vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0); m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

void main() {
  vec3 viewDir = normalize(uCameraPos - vWorldPos);
  /* Rim mask — brightest at the limb, fades inward */
  float rim = pow(1.0 - max(dot(normalize(vNormal), viewDir), 0.0), 1.6);
  /* Turbulent noise keyed to LOCAL position (anchored to the shell, not world)
     so the plasma seethes in place rather than swimming. */
  vec3 p = vLocalPos * 0.6 + vec3(uTime * 0.08);
  float n = snoise(p) * 0.5 + 0.5;
  float n2 = snoise(p * 2.3 + vec3(uTime * 0.2, 0.0, 0.0)) * 0.5 + 0.5;
  float noise = (n * 0.6 + n2 * 0.4);
  /* Punch up the limb where rim is strong */
  float intensity = rim * (0.55 + noise * 1.05);

  /* CME flare — a localized eruption arcing off the limb. uFlareDir marks
     the hot spot; flare fades with angular distance from it and rides the
     uFlareAmp rise→peak→fade envelope. Fine turbulence makes the loop
     seethe; the rim mask keeps it hugging the limb like a real prominence. */
  float aim = max(dot(normalize(vNormal), normalize(uFlareDir)), 0.0);
  float spot = pow(aim, 8.0);
  float loop = snoise(p * 1.7 + vec3(0.0, uTime * 0.5, 0.0)) * 0.5 + 0.5;
  float flare = uFlareAmp * spot * rim * (0.6 + loop * 0.9);
  intensity += flare * 2.4;

  vec3 col = mix(uColorB, uColorA, smoothstep(0.3, 1.0, noise + flare));
  /* The eruption itself glows the deep H-alpha crimson of a real prominence. */
  col = mix(col, vec3(1.0, 0.2, 0.26), clamp(flare * 0.8, 0.0, 0.7));
  gl_FragColor = vec4(col * intensity * 1.9, intensity);
}
`;

const SolarProminences = ({ position = [0, 0, 0], radius = 1.6, animate = true }) => {
  const matRef = useRef();
  const sceneClock = useSceneClock();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      /* H-alpha chromosphere/prominence palette — pink-orange seething base,
         deep crimson cores (real prominences glow red, not gold). */
      uColorA: { value: new THREE.Color("#ff9a6a") },
      uColorB: { value: new THREE.Color("#ff3a44") },
      uCameraPos: { value: new THREE.Vector3() },
      uFlareDir: { value: new THREE.Vector3(1, 0, 0) },
      uFlareAmp: { value: 0 },
    }),
    []
  );

  useFrame(({ camera }) => {
    if (!matRef.current) return;
    const t = animate ? sceneClock.t : 0;
    matRef.current.uniforms.uTime.value = t;
    matRef.current.uniforms.uCameraPos.value.copy(camera.position);

    /* Periodic CME flare. One eruption per CYCLE seconds; a new random
       limb direction is chosen each cycle (seeded by the cycle index so it
       stays deterministic under virtual time). The envelope is a single
       smooth rise→peak→fade hump occupying the first BURST seconds of the
       cycle, so the sun is quiet between eruptions. Frozen when !animate. */
    const CYCLE = 8.0; // flares erupt more often (was 14s) so the limb stays alive
    const BURST = 6.0; // eruption lasts longer relative to the cycle → almost always some activity
    const cycle = Math.floor(t / CYCLE);
    const phase = (t / CYCLE - cycle) * CYCLE; // 0..CYCLE
    const env = phase < BURST ? Math.sin((phase / BURST) * Math.PI) : 0;
    matRef.current.uniforms.uFlareAmp.value = animate ? env * env : 0;
    if (env > 0) {
      // Deterministic pseudo-random direction per cycle.
      const a = Math.sin(cycle * 12.9898) * 43758.5453;
      const b = Math.sin(cycle * 78.233) * 43758.5453;
      const u = a - Math.floor(a);
      const v = b - Math.floor(b);
      const theta = u * Math.PI * 2;
      const z = v * 2 - 1;
      const s = Math.sqrt(Math.max(0, 1 - z * z));
      matRef.current.uniforms.uFlareDir.value.set(s * Math.cos(theta), s * Math.sin(theta), z);
    }
  });

  return (
    <mesh position={position}>
      <sphereGeometry args={[radius * 1.12, 64, 48]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={VERTEX}
        fragmentShader={FRAGMENT}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.FrontSide}
      />
    </mesh>
  );
};

export default SolarProminences;
