/* eslint-disable react/no-unknown-property */
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useSceneClock } from "./SceneClock";

/*
 * The sun — a LIVING star, not a textured ball.
 *
 * The surface is fully procedural: domain-warped FBM noise drives
 * convection granulation that churns over time, low-frequency noise
 * carves drifting sunspots (umbra + penumbra), a hot→cool colour ramp
 * paints the plasma, and limb darkening dims the edge the way a real
 * photosphere does. Output is over-bright + toneMapped:false so bloom
 * turns it into a true glowing star. Corona shells breathe around it and
 * a pointlight spills warm light onto the inner planets.
 */

const SUN_VERT = /* glsl */ `
  varying vec3 vPos;
  varying vec3 vNormal;
  varying vec3 vWorldPos;
  void main() {
    vPos = position;
    vNormal = normalize(normalMatrix * normal);
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorldPos = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

const SUN_FRAG = /* glsl */ `
  varying vec3 vPos;
  varying vec3 vNormal;
  varying vec3 vWorldPos;
  uniform float uTime;
  uniform vec3 uCameraPos;
  uniform vec3 uHot;
  uniform vec3 uMid;
  uniform vec3 uCool;

  vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
  vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
  vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
  vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
  float snoise(vec3 v){
    const vec2 C = vec2(1.0/6.0, 1.0/3.0); const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz); vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy); vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx; vec3 x2 = x0 - i2 + C.yyy; vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857; vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z); vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy; vec4 y = y_ * ns.x + ns.yyyy; vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy); vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0) * 2.0 + 1.0; vec4 s1 = floor(b1) * 2.0 + 1.0; vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy; vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x); vec3 p1 = vec3(a0.zw, h.y); vec3 p2 = vec3(a1.xy, h.z); vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0); m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
  }
  /* §7 Sun shader LOD: fbm loop count is uniform-controlled. High tier
     (uDetail > 0.5) runs 3 octaves; low tier runs 2. GLSL early-break on
     a uniform is coherent across the warp, so the GPU actually skips the
     extra snoise call in low tier. */
  uniform float uDetail;
  float fbm(vec3 p){
    float v=0.0, a=0.5;
    int oct = uDetail > 0.5 ? 3 : 2;
    for(int i=0;i<3;i++){
      if (i >= oct) break;
      v += a*snoise(p); p*=2.05; a*=0.5;
    }
    return v;
  }

  void main() {
    vec3 dir = normalize(vPos);

    /* Domain-warped convection granulation, slowly boiling. Warp uses two
       cheap snoise samples (not full FBM) to keep the fragment cost low —
       the sun fills the hero shot, so noise calls dominate the frame. */
    vec3 q = dir * 3.6;
    float w1 = snoise(q + vec3(0.0, uTime * 0.05, 0.0));
    float w2 = snoise(q * 1.3 + vec3(3.1, uTime * 0.04, 1.0));
    vec3 warp = vec3(w1, w2, w1 * w2);
    float gran = fbm(q * 2.2 + warp * 1.4 + vec3(uTime * 0.06)) * 0.5 + 0.5;
    /* Fine granulation — real granules are ~1000 km, so thousands of tiny cells
       across the disk. High frequency → the stippled 'rice-grain' photosphere
       texture rather than a few big marbled blobs. */
    float fine = snoise(dir * 17.0 + warp * 1.5 + vec3(uTime * 0.13)) * 0.5 + 0.5;
    /* Supergranulation network — large slow cells whose warped boundaries
       break up the convection into a richer, less uniform texture. One extra
       snoise call; folded in as a normalized DETAIL term so it adds structure
       without lifting overall brightness (keeps the bloom from blowing out).
       §7 Sun LOD: superg + detail SKIP when the Sun is far. The uniform
       branch is coherent so the snoise calls actually don't execute. */
    float superg = uDetail > 0.5
      ? snoise(q * 0.85 + warp * 0.7 + vec3(uTime * 0.025)) * 0.5 + 0.5
      : 0.5;
    float detail = uDetail > 0.5
      ? snoise(dir * 30.0 + warp * 2.2 + vec3(uTime * 0.09)) * 0.5 + 0.5
      : 0.5;
    float surface = mix(gran, fine, 0.35);
    surface = mix(surface, surface * (0.75 + 0.5 * superg), 0.5);
    surface = mix(surface, detail, 0.12);

    /* Active regions — the SOHO/EIT-304 reference has NO big black sunspots, just
       fine mottling with a few SMALL, soft, slightly-darker filament channels. So
       this is deliberately gentle: HIGH-freq mask (small cells) + HIGH thresholds
       (rare + tiny coverage) + shallow darkening (soft dim, never a black crater). */
    float spotN = snoise(dir * 3.9 + vec3(uTime * 0.015, 0.0, 0.0));
    float penumbra = smoothstep(0.55, 0.70, spotN);
    float umbra    = smoothstep(0.70, 0.84, spotN);
    float filament = snoise(dir * 38.0 + warp * 2.0) * 0.5 + 0.5;
    float spotDark = mix(1.0, 0.74 + 0.14 * filament, penumbra); // soft penumbral dimming
    spotDark *= mix(1.0, 0.5, umbra);                            // core — dimmer, not black

    /* Colour ramp cool → mid → hot. */
    vec3 col = mix(uCool, uMid, smoothstep(0.18, 0.55, surface));
    col = mix(col, uHot, smoothstep(0.55, 0.92, surface));
    col *= spotDark;

    /* Limb darkening — the classic quadratic law I(μ)/I(1) ≈ 0.3+0.93μ−0.23μ²
       (μ = cos of view angle). Drops the edge to ~0.35× centre, giving a real
       rounded sphere instead of a flat self-lit disc. */
    float ndv = max(dot(normalize(vNormal), normalize(uCameraPos - vWorldPos)), 0.0);
    col *= clamp(0.35 + 0.5 * ndv + 0.15 * ndv * ndv, 0.0, 1.0);

    /* Faculae — the bright magnetic network, most visible near the limb (where
       the photosphere is dimmer), giving the granular brightening seen around
       active regions. Added after limb darkening so it lifts the dim edge.
       §7 Sun LOD: faculae skip when the Sun is far — the limb-edge glow is
       a subtle enhancement that's imperceptible at distance. */
    if (uDetail > 0.5) {
      float net = pow(snoise(dir * 22.0 + warp) * 0.5 + 0.5, 3.0);
      float facula = net * pow(1.0 - ndv, 2.0);
      col += facula * vec3(1.0, 0.93, 0.78) * 0.30;
    }

    /* Over-bright so bloom blooms it into a warm glowing star; active regions
       stay only slightly under so they read as soft channels, not black holes. */
    col *= mix(1.9, 1.25, umbra);
    gl_FragColor = vec4(col, 1.0);
  }
`;

const Sun = ({
  position = [0, 0, 0],
  radius = 2.2,
  animate = true,
  onClick,
  onPointerOver,
  onPointerOut,
}) => {
  const meshRef = useRef();
  const matRef = useRef();
  const sceneClock = useSceneClock();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uCameraPos: { value: new THREE.Vector3() },
      /* §7 Sun shader LOD control — 1.0 = full quality (near), 0.0 = reduced
         (far). Skips superg + detail + faculae + drops fbm from 3→2 octaves.
         Set per frame in the useFrame below based on camera distance. */
      uDetail: { value: 1.0 },
      /* ACCURATE visible-light G2V photosphere (per user — real colours). The Sun
         is yellow-white, not the EUV orange-red of a SOHO/EIT-304 image: bright
         convection granules = warm white, mid = pale gold, the cool
         intergranular lanes = soft orange. Over-bright so Bloom makes it glow. */
      uHot: { value: new THREE.Color("#fff6e8") },
      uMid: { value: new THREE.Color("#ffdca2") },
      uCool: { value: new THREE.Color("#e0954c") },
    }),
    []
  );

  /* Sun world-position vector — used for the LOD distance check below. Set
     once from the `position` prop since the Sun doesn't orbit. */
  const sunPos = useMemo(() => new THREE.Vector3(...position), [position]);

  useFrame(({ camera }) => {
    /* Reduced-motion: freeze the churn + spin (t pinned to 0 → static star).
       CHURN accelerates the convection so the photosphere visibly boils (the
       real granules turn over in minutes — too slow at 1:1), and the disc
       slowly rotates. */
    const t = animate ? sceneClock.t : 0;
    if (meshRef.current && animate) meshRef.current.rotation.y += 0.0011 * sceneClock.scale;
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = t * 2.6;
      matRef.current.uniforms.uCameraPos.value.copy(camera.position);
      /* §7 Sun LOD — 1.0 near, 0.0 far. Threshold 500u chosen because the
         inner planet stops all sit within 50u; the outer stops + overview
         beyond 500u where the fine granulation + faculae detail contributes
         only sub-pixel information. Snap boundary (0/1) — a smooth ramp
         would recompile the branch every frame near the threshold. */
      matRef.current.uniforms.uDetail.value =
        camera.position.distanceToSquared(sunPos) < 500 * 500 ? 1.0 : 0.0;
    }
  });

  return (
    <group position={position}>
      {/* Procedural photosphere */}
      <mesh ref={meshRef} onClick={onClick} onPointerOver={onPointerOver} onPointerOut={onPointerOut}>
        <sphereGeometry args={[radius, 64, 64]} />
        <shaderMaterial
          ref={matRef}
          vertexShader={SUN_VERT}
          fragmentShader={SUN_FRAG}
          uniforms={uniforms}
          toneMapped={false}
        />
      </mesh>
      {/* Corona shells + prominence flare-loops removed — a clean photosphere. Bloom
          on the over-bright surface gives it a natural glow on its own. */}
      <pointLight color="#ffb070" intensity={1.1} distance={600} decay={1.2} />
    </group>
  );
};

export default Sun;
