/* eslint-disable react/no-unknown-property */
import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { DESTINATIONS } from "../config/destinations";
import { getOrbit, orbitalPosition } from "../config/orbits";
import { useSceneClock } from "./SceneClock";

/*
 * Faint orbital trails + REAL revolving planets. Each planet's true eccentric
 * orbit (Sun at a focus, tilted by inclination) is sampled from the SAME Kepler
 * params the planets fly on (config/orbits), so each gold hairline passes exactly
 * through its planet. Riding each orbit is a small LIT planet proxy — a sphere
 * shaded by the Sun (real day/night terminator), sized by the planet's true
 * relative radius, with Saturn's ring — tracking its live orbital position so the
 * whole system visibly revolves. Shown in overview mode + the v3 hero.
 */
const SAMPLES = 256;

/* Sun-lit sphere: simple Lambert against the world-space direction to the Sun
   (at the scene origin) + a little ambient fill, so each proxy reads as a real
   little planet with a lit limb and a dark side — not a flat dot or a glow. */
const PLANET_VERT = /* glsl */ `
  varying vec3 vWN;
  void main() {
    vWN = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const PLANET_FRAG = /* glsl */ `
  varying vec3 vWN;
  uniform vec3 uColor;
  uniform vec3 uSunDir;
  uniform float uAmbient;
  void main() {
    float d = max(dot(normalize(vWN), normalize(uSunDir)), 0.0);
    float lit = uAmbient + (1.0 - uAmbient) * d;
    gl_FragColor = vec4(uColor * lit, 1.0);
  }
`;

const PLANETS = DESTINATIONS.filter((d) => d.kind === "planet");
const MAX_R = Math.max(...PLANETS.map((d) => d.radius));

const ORBITS = PLANETS.map((d) => {
  const o = getOrbit(d);
  const pts = new Float32Array(SAMPLES * 3);
  for (let k = 0; k < SAMPLES; k++) {
    const th = (k / (SAMPLES - 1)) * Math.PI * 2;
    const r = o.e ? o.p / (1 + o.e * Math.cos(th)) : o.p; // conic, Sun at focus
    const x = Math.cos(th) * r;
    const zp = Math.sin(th) * r;
    pts[k * 3] = x;
    pts[k * 3 + 1] = o.y + zp * o.sinInc; // lift by orbital inclination
    pts[k * 3 + 2] = zp * o.cosInc;
  }
  /* Compress the huge true radius spread (Jupiter 2.0 → Pluto 0.034) into a
     visible-but-still-ordered proxy size so gas giants read bigger. */
  const size = 3.2 + 8.4 * Math.sqrt(d.radius / MAX_R);
  return {
    id: d.id,
    dest: d,
    pts,
    color: "#d4af85", // uniform premium gold hairline
    body: d.color || "#cfd6ff",
    size,
    rings: !!d.rings,
    ringColor: d.ringColor || "#f0d9a0",
    tilt: d.axialTilt || 0,
  };
});

const _sun = new THREE.Vector3();

const OrbitRings = ({ wideRef, show = false }) => {
  const linesRef = useRef();
  const markersRef = useRef();
  const { camera } = useThree();
  const clock = useSceneClock();

  /* One sun-lit material per proxy (its uSunDir tracks the planet's live spot). */
  const mats = useMemo(
    () =>
      ORBITS.map(
        (o) =>
          new THREE.ShaderMaterial({
            vertexShader: PLANET_VERT,
            fragmentShader: PLANET_FRAG,
            uniforms: {
              uColor: { value: new THREE.Color(o.body) },
              uSunDir: { value: new THREE.Vector3(1, 0, 0) },
              uAmbient: { value: 0.16 },
            },
          })
      ),
    []
  );

  useFrame(() => {
    const lines = linesRef.current, marks = markersRef.current;
    if (!lines) return;
    const on = !!wideRef?.current || show; // overview mode OR the v3 system-overview hero
    lines.visible = on;
    if (marks) marks.visible = on;
    if (!on) return;

    /* revolve each proxy along its orbit + relight it from the Sun (origin) */
    if (marks) {
      const t = clock?.t || 0;
      marks.children.forEach((m, i) => {
        if (!ORBITS[i]) return;
        orbitalPosition(ORBITS[i].dest, t, m.position);
        _sun.copy(m.position).multiplyScalar(-1); // direction toward the Sun at origin
        mats[i].uniforms.uSunDir.value.copy(_sun);
      });
    }

    /* v3 hero (show) → fixed faint opacity; overview → fade near edge-on. */
    if (show && !wideRef?.current) {
      lines.children.forEach((c) => { if (c.material) c.material.opacity = 0.16; });
      return;
    }
    const p = camera.position;
    const elevation = Math.abs(p.y) / (p.length() || 1);
    const fade = THREE.MathUtils.clamp((elevation - 0.12) / 0.33, 0, 1);
    lines.children.forEach((c) => { if (c.material) c.material.opacity = 0.24 * fade; });
  });

  return (
    <group>
      <group ref={linesRef} visible={false}>
        {ORBITS.map((o) => (
          <line key={o.id} frustumCulled={false}>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" args={[o.pts, 3]} />
            </bufferGeometry>
            <lineBasicMaterial color={o.color} transparent opacity={0.16} toneMapped={false} depthWrite={false} blending={THREE.AdditiveBlending} />
          </line>
        ))}
      </group>
      {/* revolving planet proxies — sun-lit spheres at true relative size */}
      <group ref={markersRef} visible={false}>
        {ORBITS.map((o, i) => (
          <group key={o.id}>
            <mesh material={mats[i]}>
              <sphereGeometry args={[o.size, 24, 24]} />
            </mesh>
            {o.rings && (
              <mesh rotation={[Math.PI / 2 - 0.4, 0, 0.12]}>
                <ringGeometry args={[o.size * 1.45, o.size * 2.5, 48]} />
                <meshBasicMaterial color={o.ringColor} transparent opacity={0.6} side={THREE.DoubleSide} depthWrite={false} />
              </mesh>
            )}
          </group>
        ))}
      </group>
    </group>
  );
};

export default OrbitRings;
