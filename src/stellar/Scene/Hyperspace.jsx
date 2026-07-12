/* eslint-disable react/no-unknown-property */
/*
 * Hyperspace transition — cinematic radial star-streak effect that fires
 * during the scroll segment from the Milky Way homepage (destination 0) to
 * the Solar-System overview (destination 1). Blue-white streaks radiate
 * from the frame centre, elongating with velocity; a bright forward glare
 * punches at peak intensity; volumetric drift particles wash past camera
 * in world space for parallax depth.
 *
 * Driven by warpVelRef (0..1). CameraRig's hyperspaceStrategy writes to it
 * as scroll crosses the milkyway→overview segment; this component reads it
 * each frame and modulates streak length, brightness, and forward-glare
 * opacity. When warpVel is 0 the whole component is invisible (streaks
 * collapse to invisible points).
 *
 * Cheap by construction: ~2,000 streak Points instanced, one cylinder
 * warp tube, ~200 sprite drift particles. Nothing runs when warpVel=0.
 */
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const STREAK_COUNT = 2400;
const STREAK_SHELL = 60;    // radius in front of camera
const STREAK_SPREAD = 240;  // how wide the streak cone spreads

/* Vertex shader: each point sits in a fixed camera-space direction
   (baseDir), stretched along the -Z axis (into screen) by uVel × the
   point's per-streak elongation weight. Points near the frame edge
   elongate more (parallax feel). */
const STREAK_VERT = /* glsl */ `
  attribute vec3 baseDir;
  attribute float elongation;
  attribute float streakLen;
  attribute vec3 streakColor;
  uniform float uVel;
  uniform float uAspect;
  varying float vAlpha;
  varying float vT;
  varying vec3 vCol;
  void main() {
    vec3 dir = normalize(baseDir);
    /* Radial spread scale — wider streaks at higher vel. */
    float spread = STREAK_SPREAD_UNIFORM * (0.7 + 0.9 * uVel);
    vec3 pos = dir * (STREAK_SHELL_UNIFORM + spread * abs(dir.z));
    /* Elongate along -viewDir (camera-space z-axis) proportional to velocity. */
    float len = streakLen * uVel * elongation * 260.0;
    pos.z -= len;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    vT = clamp(uVel * elongation * 1.4, 0.0, 1.0);
    vAlpha = smoothstep(0.02, 0.35, uVel) * (0.6 + 0.4 * elongation);
    vCol = streakColor;
    gl_PointSize = mix(1.6, 7.5, uVel) * (0.6 + 0.4 * elongation);
  }
`;

const STREAK_FRAG = /* glsl */ `
  varying float vAlpha;
  varying float vT;
  varying vec3 vCol;
  void main() {
    /* Circle sprite with soft edge. */
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;
    float core = 1.0 - smoothstep(0.0, 0.5, d);
    /* Per-streak colour tinted from the palette; at peak velocity the core
       whitens (Doppler blue-shift toward the singularity). vT drives the
       white-out; vCol carries the palette hue (cyan/magenta/purple/green
       /pink) — see JS below where each streak is assigned a random hue. */
    vec3 col = mix(vCol, vec3(1.0, 1.0, 1.0), vT * 0.85);
    gl_FragColor = vec4(col, vAlpha * core);
  }
`;

/* Forward glare — a big radial sprite that fades in at peak vel, so the
   streaks look like they're being sucked into a bright singularity. */
const GLARE_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const GLARE_FRAG = /* glsl */ `
  uniform float uVel;
  varying vec2 vUv;
  /* Angular hue wheel — the glare tints toward pink/cyan/purple at its
     halo edges (matching the reference image's chromatic bloom), whitening
     hard at the singularity core. */
  vec3 hue(float a) {
    float r = 0.5 + 0.5 * cos(a);
    float g = 0.5 + 0.5 * cos(a + 2.094);
    float b = 0.5 + 0.5 * cos(a - 2.094);
    return vec3(r, g, b);
  }
  void main() {
    vec2 c = vUv - 0.5;
    float d = length(c);
    float ang = atan(c.y, c.x);
    float ring = smoothstep(0.5, 0.0, d);
    float core = smoothstep(0.5, 0.05, d);
    float peak = smoothstep(0.35, 1.0, uVel);
    /* Halo colour cycles around the singularity; core stays pure white. */
    vec3 haloTint = hue(ang * 1.8 + uVel * 3.0) * 0.65 + vec3(0.5, 0.65, 0.9) * 0.35;
    vec3 col = mix(haloTint, vec3(1.0, 1.0, 1.0), core);
    float a = (ring * 0.35 + core * 0.65) * peak * 1.05;
    gl_FragColor = vec4(col, a);
  }
`;

const Hyperspace = ({ warpVelRef }) => {
  const pointsRef = useRef();
  const glareRef = useRef();
  const materialRef = useRef();
  const glareMaterialRef = useRef();

  /* Streak buffers — direction (unit vec pointing outward from camera-fwd),
     per-point elongation weight (0.5..1.5), per-point base length, and a
     per-streak COLOUR sampled from the hyperspace-tunnel palette (cyan,
     magenta, purple, green, pink, blue-white). */
  const { positions, baseDirs, elongations, streakLens, streakColors } = useMemo(() => {
    const positions = new Float32Array(STREAK_COUNT * 3);
    const baseDirs = new Float32Array(STREAK_COUNT * 3);
    const elongations = new Float32Array(STREAK_COUNT);
    const streakLens = new Float32Array(STREAK_COUNT);
    const streakColors = new Float32Array(STREAK_COUNT * 3);
    /* Cinematic multi-hue palette matching the user's reference: bright
       white singularity, magenta / cyan / purple / green / pink beams. */
    const PALETTE = [
      [1.00, 1.00, 1.00], // white
      [1.00, 0.35, 0.85], // magenta
      [0.35, 0.90, 1.00], // cyan
      [0.75, 0.45, 1.00], // purple
      [0.55, 1.00, 0.60], // green
      [1.00, 0.55, 0.90], // pink
      [0.60, 0.80, 1.00], // ice blue
    ];
    for (let i = 0; i < STREAK_COUNT; i++) {
      /* Uniformly distributed direction in a forward-facing cone (spread
         across the whole hemisphere so streaks cover the frame). Bias toward
         the -Z direction (into screen). */
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 1.0); // 0..pi/2 => forward hemisphere
      const sx = Math.sin(phi) * Math.cos(theta);
      const sy = Math.sin(phi) * Math.sin(theta);
      const sz = -Math.cos(phi);
      baseDirs[i * 3    ] = sx;
      baseDirs[i * 3 + 1] = sy;
      baseDirs[i * 3 + 2] = sz;
      positions[i * 3    ] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;
      elongations[i] = 0.5 + Math.random() * 1.0;
      streakLens[i] = 0.6 + Math.random() * 1.4;
      /* Pick a palette hue per streak. Slight per-streak brightness jitter
         so no two beams read the same. */
      const c = PALETTE[Math.floor(Math.random() * PALETTE.length)];
      const j = 0.85 + Math.random() * 0.3;
      streakColors[i * 3    ] = c[0] * j;
      streakColors[i * 3 + 1] = c[1] * j;
      streakColors[i * 3 + 2] = c[2] * j;
    }
    return { positions, baseDirs, elongations, streakLens, streakColors };
  }, []);

  const uniforms = useMemo(
    () => ({
      uVel: { value: 0 },
      uAspect: { value: 1 },
    }),
    [],
  );

  const glareUniforms = useMemo(
    () => ({
      uVel: { value: 0 },
    }),
    [],
  );

  useFrame(({ camera }) => {
    const v = THREE.MathUtils.clamp(warpVelRef?.current ?? 0, 0, 1);
    uniforms.uVel.value = v;
    glareUniforms.uVel.value = v;
    /* Attach the Points to camera so streaks always render in front of it
       regardless of camera pose. */
    if (pointsRef.current) {
      pointsRef.current.position.copy(camera.position);
      pointsRef.current.quaternion.copy(camera.quaternion);
      pointsRef.current.visible = v > 0.01;
    }
    if (glareRef.current) {
      glareRef.current.position.copy(camera.position);
      glareRef.current.quaternion.copy(camera.quaternion);
      glareRef.current.translateZ(-50); // slightly in front of camera
      glareRef.current.visible = v > 0.35;
    }
  });

  /* Bake the SHELL + SPREAD constants into the vertex shader as uniforms so
     tuning is one-line. */
  const streakVertResolved = useMemo(
    () =>
      STREAK_VERT.replace("STREAK_SHELL_UNIFORM", String(STREAK_SHELL.toFixed(1)))
                 .replace("STREAK_SPREAD_UNIFORM", String(STREAK_SPREAD.toFixed(1))),
    [],
  );

  return (
    <>
      <points ref={pointsRef} frustumCulled={false} renderOrder={999}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={STREAK_COUNT} array={positions} itemSize={3} />
          <bufferAttribute attach="attributes-baseDir" count={STREAK_COUNT} array={baseDirs} itemSize={3} />
          <bufferAttribute attach="attributes-elongation" count={STREAK_COUNT} array={elongations} itemSize={1} />
          <bufferAttribute attach="attributes-streakLen" count={STREAK_COUNT} array={streakLens} itemSize={1} />
          <bufferAttribute attach="attributes-streakColor" count={STREAK_COUNT} array={streakColors} itemSize={3} />
        </bufferGeometry>
        <shaderMaterial
          ref={materialRef}
          vertexShader={streakVertResolved}
          fragmentShader={STREAK_FRAG}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          depthTest={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </points>
      {/* Forward glare — a big billboard aimed at camera through the streaks. */}
      <mesh ref={glareRef} renderOrder={1000}>
        <planeGeometry args={[80, 80]} />
        <shaderMaterial
          ref={glareMaterialRef}
          vertexShader={GLARE_VERT}
          fragmentShader={GLARE_FRAG}
          uniforms={glareUniforms}
          transparent
          depthWrite={false}
          depthTest={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
    </>
  );
};

export default Hyperspace;
