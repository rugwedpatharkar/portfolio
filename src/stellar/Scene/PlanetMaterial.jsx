/* eslint-disable react/no-unknown-property */
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/*
 * Procedural planet surface shaders. One material per planet *type*; each
 * uses simplex-noise + banding + sun lighting in the fragment shader.
 *
 * No textures, no maps. ~3 KB of GLSL per planet. Fast everywhere.
 *
 * Types:
 *   rocky   — Mercury (gray, cratered)
 *   warm    — Venus (yellow + ochre bands)
 *   earth   — Earth (oceans + continents + night-side city lights)
 *   rust    — Mars (red + dust storm streaks)
 *   gas     — Jupiter (heavy horizontal bands, turbulence)
 *   golden  — Saturn (subtle bands + warm tones)
 *   ice     — Uranus (cool cyan, very smooth)
 *   abyss   — Neptune (deep blue + faint band hints)
 */

const VERTEX_SHADER = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vWorldNormal;
  varying vec3 vLocalPos;

  void main() {
    vLocalPos = position;
    vNormal = normal;
    vWorldNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Iqilezles snoise (3D simplex). Public-domain, small, fast.
const NOISE_SNIPPET = /* glsl */ `
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
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
    vec4 p = permute(permute(permute(
                i.z + vec4(0.0, i1.z, i2.z, 1.0))
              + i.y + vec4(0.0, i1.y, i2.y, 1.0))
              + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }
`;

const buildFragment = (typeName) => /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vWorldNormal;
  varying vec3 vLocalPos;

  uniform vec3 uColor;
  uniform vec3 uColorB;
  uniform float uTime;
  uniform vec3 uSunDir;

  ${NOISE_SNIPPET}

  void main() {
    vec3 p = normalize(vLocalPos);
    vec3 baseColor;

    ${
      typeName === "gas" || typeName === "golden" || typeName === "abyss"
        ? `
      // Banded gas giant — strong horizontal latitude bands plus turbulence
      float lat = p.y;
      float bands = sin(lat * ${typeName === "gas" ? "14.0" : typeName === "golden" ? "9.0" : "7.0"}) * 0.5 + 0.5;
      float turb = snoise(vec3(p.x * 3.5 + uTime * 0.05, lat * 5.0, p.z * 3.5)) * 0.35;
      float mixv = clamp(bands + turb, 0.0, 1.0);
      baseColor = mix(uColor, uColorB, mixv);
        `
        : typeName === "earth"
        ? `
      // Earth: continents via two octaves of noise, oceans where low
      float continent = snoise(p * 1.6) * 0.5 + 0.5;
      continent += snoise(p * 4.0) * 0.18;
      float landMask = smoothstep(0.48, 0.55, continent);
      vec3 ocean = vec3(0.10, 0.25, 0.50);
      vec3 land = vec3(0.18, 0.42, 0.22);
      vec3 ice = vec3(0.86, 0.92, 0.95);
      float polar = smoothstep(0.62, 0.85, abs(p.y));
      baseColor = mix(ocean, land, landMask);
      baseColor = mix(baseColor, ice, polar);
        `
        : typeName === "ice"
        ? `
      // Uranus: smooth pale cyan with faint axial bands
      float bands = sin(p.y * 5.0) * 0.5 + 0.5;
      float turb = snoise(p * 1.6 + uTime * 0.02) * 0.08;
      baseColor = mix(uColor, uColorB, bands * 0.4 + turb);
        `
        : typeName === "rust"
        ? `
      // Mars: rusty surface with dust storm streaks
      float craters = snoise(p * 4.5) * 0.5 + 0.5;
      float storms = snoise(vec3(p.x * 6.0, p.y * 12.0, p.z * 6.0 + uTime * 0.3)) * 0.4;
      float surface = clamp(craters + storms * 0.3, 0.2, 1.0);
      baseColor = mix(uColor * 0.6, uColor, surface);
      baseColor = mix(baseColor, uColorB, smoothstep(0.6, 0.85, craters));
        `
        : typeName === "warm"
        ? `
      // Venus: warm bands + heavy turbulence (clouds)
      float bands = sin(p.y * 10.0 + snoise(p * 2.0) * 2.0) * 0.5 + 0.5;
      float clouds = snoise(p * 3.0 + uTime * 0.1) * 0.4;
      baseColor = mix(uColor, uColorB, bands + clouds);
        `
        : `
      // Rocky default — Mercury-like
      float craters = snoise(p * 5.0) * 0.5 + 0.5;
      float dust = snoise(p * 14.0) * 0.2;
      baseColor = mix(uColor * 0.7, uColor, craters);
      baseColor *= 1.0 + dust * 0.4;
        `
    }

    // Sun lighting — directional from sun (origin) to fragment
    vec3 sunDir = normalize(uSunDir - vLocalPos);
    float sunDot = max(0.0, dot(vNormal, sunDir));
    float dayFactor = pow(sunDot, 0.85);
    vec3 lit = baseColor * (0.22 + dayFactor * 1.0);

    ${
      typeName === "earth"
        ? `
      // Night side: city lights as warm orange points
      float nightSide = 1.0 - dayFactor;
      float lights = snoise(p * 8.0) * 0.5 + 0.5;
      lights = smoothstep(0.78, 0.92, lights);
      vec3 cityGlow = vec3(1.0, 0.7, 0.3) * lights * nightSide * 0.85;
      lit += cityGlow;
        `
        : ""
    }

    // Rim light — subtle edge glow
    float rim = 1.0 - max(0.0, dot(vWorldNormal, vec3(0.0, 0.0, 1.0)));
    rim = pow(rim, 3.0) * 0.18;
    lit += uColor * rim;

    gl_FragColor = vec4(lit, 1.0);
  }
`;

const PLANET_TYPE_COLORS = {
  rocky:   { primary: "#7a7d85", secondary: "#3d3f45" },
  warm:    { primary: "#f8c555", secondary: "#c0852b" },
  earth:   { primary: "#3b6ea8", secondary: "#234a85" },
  rust:    { primary: "#c2553e", secondary: "#6b2818" },
  gas:     { primary: "#c9a06a", secondary: "#9a6a3c" }, // Jupiter — tan/brown
  golden:  { primary: "#e3c485", secondary: "#a07a3a" }, // Saturn — pale gold
  ice:     { primary: "#aad4cf", secondary: "#7ba8a0" }, // Uranus — greenish-cyan
  abyss:   { primary: "#5a8fc0", secondary: "#2e5a8a" }, // Neptune — muted greenish-blue
};

const PlanetMaterial = ({ type = "rocky", color, colorB }) => {
  const matRef = useRef();
  const palette = PLANET_TYPE_COLORS[type] || PLANET_TYPE_COLORS.rocky;
  const primary = color || palette.primary;
  const secondary = colorB || palette.secondary;

  const uniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color(primary) },
      uColorB: { value: new THREE.Color(secondary) },
      uTime: { value: 0 },
      uSunDir: { value: new THREE.Vector3(0, 0, 0) },
    }),
    [primary, secondary]
  );

  useFrame((_, delta) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value += delta;
    }
  });

  return (
    <shaderMaterial
      ref={matRef}
      vertexShader={VERTEX_SHADER}
      fragmentShader={buildFragment(type)}
      uniforms={uniforms}
    />
  );
};

export default PlanetMaterial;
