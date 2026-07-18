/* eslint-disable react/no-unknown-property */
/*
 * 3I/ATLAS on its REAL hyperbolic orbit — the third interstellar object
 * (after 1I/'Oumuamua and 2I/Borisov), discovered 2025-07-01 as C/2025 N1.
 *
 * Orbital elements from JPL SBDB (epoch 2025-Nov, heliocentric ecliptic):
 *   q     = 1.357 AU     (perihelion distance)
 *   e     = 6.143         (strongly hyperbolic — leaving forever)
 *   i     = 175.1°        (nearly retrograde — coming almost head-on to us)
 *   Ω     = 322°          (longitude of ascending node, approx)
 *   ω     = 127°          (argument of periapsis, approx)
 *   T     = 2025-10-29    (perihelion date; passed 8-9 months before doc date)
 *   v∞    ≈ 60 km/s       (hyperbolic-excess velocity — the departure speed)
 *
 * Rendered with a real Kepler-hyperbolic solver: mean-anomaly M advances
 * uniformly with time, hyperbolic anomaly H is solved from
 * M = e·sinh(H) − H via Newton-Raphson, and true anomaly ν / distance r
 * follow from H. Position rotates orbital-plane → heliocentric-ecliptic via
 * the standard R_z(Ω) · R_x(i) · R_z(ω) chain. Result: 3I/ATLAS enters
 * from one direction, whips around perihelion, and departs on the correct
 * hyperbolic trajectory — the honest physics.
 *
 * Scene-time compression: 1 scene-second = 20 real days, so the full
 * observable pass (perihelion ± several months) takes ~1 minute of
 * scene-time to play out. Loops (M wraps) so the tour keeps showing it.
 *
 * Renders the standard comet package: bright compact nucleus, blue-green
 * C₂ coma (3I/ATLAS's signature), ion tail (dead anti-sunward, blue-white),
 * curved dust tail (yellow-white, velocity-lagged), plus a faint sunward
 * ANTI-TAIL that Vera Rubin/HST observed on this specific comet.
 *
 * Sources: docs/research/07-space-probes.md (indirectly) +
 * docs/research/02-small-bodies-and-interplanetary-medium.md §3.4;
 * ESA XMM-Newton observations, JPL Horizons vector solution.
 */
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useSceneClock } from "./SceneClock";
import { AU_UNIT } from "../config/destinations";

/* ── Orbital elements (JPL SBDB, epoch 2025-Nov) ── */
const Q_AU = 1.357;               // perihelion
const ECC = 6.143;                // hyperbolic
const INCL = 175.1 * Math.PI / 180;
const NODE = 322 * Math.PI / 180;
const ARGP = 127 * Math.PI / 180;
const A_AU = -Q_AU / (ECC - 1);   // semi-major axis (negative for hyperbolic)

/* ── Physics constants ── */
const MU_SUN = 1.32712440018e20;  // m³/s², GM_Sun
const AU_M = 1.495978707e11;      // meters per AU
const A_M = Math.abs(A_AU) * AU_M;
const N_RAD_PER_S = Math.sqrt(MU_SUN / (A_M ** 3)); // mean motion, rad/s
const N_RAD_PER_DAY = N_RAD_PER_S * 86400;

/* ── Scene-time compression ── */
const DAYS_PER_SCENE_SECOND = 20;
/* Start the animation ~200 days pre-perihelion so the visitor sees the
   inbound approach on their first look at the outer tour. Then it whips
   through perihelion and heads out toward the ~+800-day mark before the
   whole cycle re-seeds. */
const T0_DAYS = -200;
const T_LOOP_DAYS = 1000; // wrap the animation over ~1000 days of orbit

/* Rotate an orbital-plane position (x, y, 0) → heliocentric ecliptic frame
   via standard R_z(Ω) · R_x(i) · R_z(ω). All angles in radians. */
function orbitalToEcliptic(xOrb, yOrb, out) {
  const cosO = Math.cos(NODE), sinO = Math.sin(NODE);
  const cosI = Math.cos(INCL), sinI = Math.sin(INCL);
  const cosW = Math.cos(ARGP), sinW = Math.sin(ARGP);
  const x1 = xOrb * cosW - yOrb * sinW;
  const y1 = xOrb * sinW + yOrb * cosW;
  const y2 = y1 * cosI;
  const z2 = y1 * sinI;
  const x3 = x1 * cosO - y2 * sinO;
  const y3 = x1 * sinO + y2 * cosO;
  return out.set(x3, z2, y3); // (X, Y=north, Z) — swap so ecliptic-north is scene-Y
}

/* Solve M = e·sinh(H) - H for H via Newton-Raphson. Reasonable initial
   guess from Danby (1988) for hyperbolic Kepler. */
function solveHyperbolic(M, e) {
  let H = Math.log(2 * Math.abs(M) / e + 1.8);
  if (M < 0) H = -H;
  for (let k = 0; k < 8; k++) {
    const eSinH = e * Math.sinh(H);
    const eCosH = e * Math.cosh(H);
    const f = eSinH - H - M;
    const fp = eCosH - 1;
    if (Math.abs(fp) < 1e-12) break;
    const dH = f / fp;
    H -= dH;
    if (Math.abs(dH) < 1e-9) break;
  }
  return H;
}

/* Tail shader chunks — mirrored from AtlasComet.jsx so 3I/ATLAS has the
   same visual language as the generic hyperbolic-comet spawns. */
const ION_VERT = /* glsl */ `
  varying float vT; void main() { vT = uv.y; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
const ION_FRAG = /* glsl */ `
  uniform vec3 uColor; uniform float uOpacity; varying float vT;
  void main() { float a = pow(1.0 - vT, 1.6) * uOpacity; if (a < 0.004) discard; gl_FragColor = vec4(uColor * a, a); }
`;
const DUST_VERT = /* glsl */ `
  uniform float uBend; uniform vec3 uBendAxis; varying float vT;
  void main() { vT = uv.y; vec3 p = position + uBendAxis * (uBend * vT * vT); gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); }
`;
const DUST_FRAG = /* glsl */ `
  uniform vec3 uColor; uniform float uOpacity; varying float vT;
  void main() { float a = pow(1.0 - vT, 2.1) * uOpacity; if (a < 0.004) discard; gl_FragColor = vec4(uColor * a, a); }
`;
const UP = new THREE.Vector3(0, 1, 0);

/* Activity thresholds — comet tails switch on inside the "active radius"
   and grow toward peak inside a narrower "peak" range. 3I/ATLAS was
   observed active out to ~4 AU pre-perihelion and remained active
   post-perihelion; using 6 AU as the visible-tail boundary. */
const ACTIVE_R_SU = 6.0 * AU_UNIT;
const PEAK_R_SU = 1.5 * AU_UNIT;

const ThreeIAtlas = ({ nucleusRadius = 0.5, comaRadius = 3, ionLen = 45, dustLen = 32, antiLen = 12 }) => {
  const sceneClock = useSceneClock();
  const headRef = useRef();
  const comaRef = useRef();
  const ionRef = useRef();
  const dustRef = useRef();
  const antiRef = useRef();

  const p = useMemo(() => new THREE.Vector3(), []);
  const prev = useMemo(() => new THREE.Vector3(), []);
  const antiSun = useMemo(() => new THREE.Vector3(), []);
  const sunward = useMemo(() => new THREE.Vector3(), []);
  const vel = useMemo(() => new THREE.Vector3(), []);
  const antiVel = useMemo(() => new THREE.Vector3(), []);
  const dustDir = useMemo(() => new THREE.Vector3(), []);
  const bendW = useMemo(() => new THREE.Vector3(), []);
  const q = useMemo(() => new THREE.Quaternion(), []);
  const qInv = useMemo(() => new THREE.Quaternion(), []);

  const ionMat = useMemo(
    () => new THREE.ShaderMaterial({
      vertexShader: ION_VERT, fragmentShader: ION_FRAG,
      uniforms: { uColor: { value: new THREE.Color("#bfe0ff") }, uOpacity: { value: 0 } },
      transparent: true, depthWrite: false, side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending, toneMapped: false,
    }),
    [],
  );
  const dustMat = useMemo(
    () => new THREE.ShaderMaterial({
      vertexShader: DUST_VERT, fragmentShader: DUST_FRAG,
      uniforms: {
        uColor: { value: new THREE.Color("#ffe6b0") },
        uOpacity: { value: 0 },
        uBend: { value: dustLen * 0.42 },
        uBendAxis: { value: new THREE.Vector3(1, 0, 0) },
      },
      transparent: true, depthWrite: false, side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending, toneMapped: false,
    }),
    [dustLen],
  );
  const antiMat = useMemo(
    () => new THREE.ShaderMaterial({
      vertexShader: ION_VERT, fragmentShader: ION_FRAG, // straight cone, same shape as ion
      uniforms: { uColor: { value: new THREE.Color("#ffe6c0") }, uOpacity: { value: 0 } },
      transparent: true, depthWrite: false, side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending, toneMapped: false,
    }),
    [],
  );

  useFrame(() => {
    /* Scene-time → days from perihelion, wrapped over T_LOOP_DAYS. */
    const rawDays = T0_DAYS + sceneClock.t * DAYS_PER_SCENE_SECOND;
    const loopedDays = ((rawDays - T0_DAYS) % T_LOOP_DAYS) + T0_DAYS;

    /* Mean anomaly M = n·(t − T). */
    const M = N_RAD_PER_DAY * loopedDays;

    /* Solve for hyperbolic anomaly H. */
    const H = solveHyperbolic(M, ECC);

    /* True anomaly ν from H. */
    const halfH = H / 2;
    const nu = 2 * Math.atan(Math.sqrt((ECC + 1) / (ECC - 1)) * Math.tanh(halfH));

    /* Distance from Sun (AU), then to scene units.
       For hyperbolic: r = a(1 − e·cosh(H)) with a < 0. */
    const rAU = A_AU * (1 - ECC * Math.cosh(H));
    const rSU = rAU * AU_UNIT;

    /* Orbital-plane position → heliocentric ecliptic → scene coords. */
    const xOrb = rSU * Math.cos(nu);
    const yOrb = rSU * Math.sin(nu);
    orbitalToEcliptic(xOrb, yOrb, p);

    if (headRef.current) headRef.current.position.copy(p);

    /* Velocity via finite difference (per-frame). */
    vel.copy(p).sub(prev);
    prev.copy(p);

    /* Real two-tail physics: ion tail dead anti-sunward, dust tail lags
       along the orbital path and bows toward anti-sunward. */
    antiSun.copy(p).normalize();
    sunward.copy(antiSun).multiplyScalar(-1);
    if (vel.lengthSq() > 1e-6) antiVel.copy(vel).normalize().multiplyScalar(-1);
    dustDir.copy(antiVel).multiplyScalar(0.8).addScaledVector(antiSun, 0.3).normalize();

    if (ionRef.current) {
      ionRef.current.position.copy(p);
      q.setFromUnitVectors(UP, antiSun);
      ionRef.current.quaternion.copy(q);
    }
    if (dustRef.current) {
      dustRef.current.position.copy(p);
      q.setFromUnitVectors(UP, dustDir);
      dustRef.current.quaternion.copy(q);
      bendW.copy(antiSun).addScaledVector(dustDir, -antiSun.dot(dustDir)).normalize();
      qInv.copy(q).invert();
      dustMat.uniforms.uBendAxis.value.copy(bendW).applyQuaternion(qInv).normalize();
    }
    if (antiRef.current) {
      antiRef.current.position.copy(p);
      q.setFromUnitVectors(UP, sunward);
      antiRef.current.quaternion.copy(q);
    }

    /* Activity envelope — tails ramp on inside ACTIVE_R and peak inside PEAK_R. */
    const rMagSU = p.length();
    const act = THREE.MathUtils.clamp((ACTIVE_R_SU - rMagSU) / (ACTIVE_R_SU - PEAK_R_SU), 0, 1);
    ionMat.uniforms.uOpacity.value = 0.55 * act;
    dustMat.uniforms.uOpacity.value = 0.78 * act;
    antiMat.uniforms.uOpacity.value = 0.14 * act; // faint, only visible near perihelion

    if (comaRef.current) {
      comaRef.current.scale.setScalar(0.7 + 0.95 * act);
      comaRef.current.material.opacity = 0.10 + 0.22 * act;
    }
  });

  return (
    <group>
      {/* Nucleus (bright compact) + blue-green C₂ coma */}
      <group ref={headRef}>
        <mesh>
          <sphereGeometry args={[nucleusRadius, 14, 14]} />
          <meshBasicMaterial color="#eafff2" toneMapped={false} />
        </mesh>
        <mesh ref={comaRef}>
          <sphereGeometry args={[comaRadius, 16, 16]} />
          <meshBasicMaterial color="#8fefc4" transparent opacity={0.12} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
        </mesh>
      </group>
      {/* Ion tail — thin, long, dead-straight, blue-white anti-sunward */}
      <group ref={ionRef}>
        <mesh position={[0, ionLen / 2, 0]} material={ionMat}>
          <coneGeometry args={[0.5, ionLen, 16, 1, true]} />
        </mesh>
      </group>
      {/* Dust tail — broad, long, curved (bowed toward anti-sunward) */}
      <group ref={dustRef}>
        <mesh position={[0, dustLen / 2, 0]} material={dustMat}>
          <coneGeometry args={[2.2, dustLen, 24, 24, true]} />
        </mesh>
      </group>
      {/* Sunward anti-tail — faint, brief, only visible near perihelion */}
      <group ref={antiRef}>
        <mesh position={[0, antiLen / 2, 0]} material={antiMat}>
          <coneGeometry args={[0.4, antiLen, 12, 1, true]} />
        </mesh>
      </group>
    </group>
  );
};

export default ThreeIAtlas;
