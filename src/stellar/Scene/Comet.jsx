/* eslint-disable react/no-unknown-property */
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useSceneClock } from "./SceneClock";

/*
 * Halley's Comet (1P/Halley) — the hero comet, on its REAL true-scale orbit and
 * with the two REAL tails, which point in different directions:
 *
 *   - ion (gas) tail — blue, thin, dead straight, pointing DIRECTLY away from
 *     the sun: the solar wind sweeps ionised gas radially anti-solar. Faint
 *     longitudinal filaments (the streaky structure real ion tails show).
 *   - dust tail — yellow-white, broader and visibly CURVED, lagging back along
 *     the orbital path: heavier dust is left behind where the comet has been.
 *     The cone is bowed sideways in the vertex shader (∝ vT²) so its silhouette
 *     sweeps into the classic arc instead of a straight spike.
 *
 * Orbit: Halley's true ellipse at the scene's 1:1 AU scale (AU_UNIT = 95) —
 * a = 17.83 AU, e = 0.967, perihelion q ≈ 0.59 AU (≈56 u, just inside Venus),
 * aphelion Q ≈ 35 AU (≈3332 u, out past Neptune). Eccentric-anomaly
 * parametrisation with the Sun at the focus (origin); the MEAN anomaly advances
 * uniformly (Kepler's 2nd law), so it whips through perihelion and crawls at
 * aphelion exactly like the real comet. The tails switch ON only as it dives
 * sunward (inside ~6 AU) and fade out at aphelion — comets are active only near
 * the Sun.
 *
 * Reduced-motion: Scene does not mount the comet at all under reduced-motion, so
 * the orbital drift never runs there; the only clock-driven cosmetic is the ion
 * filament shimmer (sceneClock.t), which SceneClock holds at 0.
 */

const ION_VERT = /* glsl */ `
  varying float vT;
  varying float vU;
  void main() {
    vT = uv.y;
    vU = uv.x;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const ION_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uTime;
  varying float vT;
  varying float vU;
  void main() {
    float a = pow(1.0 - vT, 1.6) * uOpacity;        // head bright → tip gone
    // Streaky longitudinal filaments: faint bands around the tail, drifting
    // slowly along its length so the gas tail reads as structured, not solid.
    float fil = 0.78 + 0.22 * sin(vU * 26.0 + vT * 5.0 - uTime * 1.4);
    a *= fil;
    if (a < 0.004) discard;
    gl_FragColor = vec4(uColor * a, a);
  }
`;

const DUST_VERT = /* glsl */ `
  uniform float uBend;          // lateral bow amount (world units at the tip)
  uniform vec3  uBendAxis;      // bow direction, in the cone's LOCAL frame
  varying float vT;
  void main() {
    vT = uv.y;
    // Curve the cone: push every ring sideways by uBend * vT^2 so the tail
    // bows progressively toward the tip — the signature dust-tail arc. The
    // taper (cone radius) is preserved; only the spine bends.
    vec3 p = position + uBendAxis * (uBend * vT * vT);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;
const DUST_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vT;
  void main() {
    // Softer, more diffuse falloff than the ion tail so the dust reads broad
    // and hazy rather than a crisp beam.
    float a = pow(1.0 - vT, 2.1) * uOpacity;
    if (a < 0.004) discard;
    gl_FragColor = vec4(uColor * a, a);
  }
`;

const UP = new THREE.Vector3(0, 1, 0);

/* Halley's true-scale orbit (AU_UNIT = 95). */
const AU = 95;
const SEMI_MAJOR = 17.834 * AU;
const ECC = 0.967;
const FOCUS_OFFSET = SEMI_MAJOR * ECC; // centre-to-focus, so the Sun sits at the focus
const SEMI_MINOR = SEMI_MAJOR * Math.sqrt(1 - ECC * ECC);
const INCLINATION = 48 * (Math.PI / 180); // dramatised out-of-plane tilt (real i ≈ 162°)
const MEAN_MOTION = (Math.PI * 2) / 360; // one full orbit per ~360 virtual seconds
const ACTIVE_R = 6 * AU; // tails fully off beyond ~6 AU
const ACTIVE_PEAK = 1.2 * AU; // tails fully on inside ~1.2 AU

/* Eccentric-anomaly point on the ellipse, Sun at the focus (origin). */
function orbitAt(E, out) {
  const u = SEMI_MAJOR * Math.cos(E) - FOCUS_OFFSET; // perihelion axis (+x)
  const w = SEMI_MINOR * Math.sin(E);
  return out.set(u, w * Math.sin(INCLINATION), w * Math.cos(INCLINATION));
}

const Comet = () => {
  const sceneClock = useSceneClock();
  const headRef = useRef();
  const ionRef = useRef();
  const dustRef = useRef();
  const mean = useRef(0.18); // start just past perihelion → active + visible immediately
  const pos = useRef(new THREE.Vector3());
  const prev = useRef(new THREE.Vector3());

  const ionUniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color("#5fa8ff") },
      uOpacity: { value: 0.0 },
      uTime: { value: 0 },
    }),
    [],
  );
  const dustUniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color("#ffe6b0") },
      uOpacity: { value: 0.0 },
      uBend: { value: 0 },
      uBendAxis: { value: new THREE.Vector3(1, 0, 0) },
    }),
    [],
  );

  /* scratch */
  const antiSun = useMemo(() => new THREE.Vector3(), []);
  const antiVel = useMemo(() => new THREE.Vector3(1, 0, 0), []);
  const vel = useMemo(() => new THREE.Vector3(), []);
  const dustDir = useMemo(() => new THREE.Vector3(), []);
  const bendWorld = useMemo(() => new THREE.Vector3(), []);
  const q = useMemo(() => new THREE.Quaternion(), []);
  const qInv = useMemo(() => new THREE.Quaternion(), []);

  useFrame((_, delta) => {
    const d = Math.min(delta, 1 / 20);
    mean.current += d * MEAN_MOTION;

    /* Solve Kepler's equation M = E − e·sinE for the eccentric anomaly. */
    const M = mean.current % (Math.PI * 2);
    let E = M;
    for (let k = 0; k < 6; k++) E -= (E - ECC * Math.sin(E) - M) / (1 - ECC * Math.cos(E));

    const p = pos.current;
    orbitAt(E, p);
    vel.copy(p).sub(prev.current);
    prev.current.copy(p);

    if (headRef.current) headRef.current.position.copy(p);

    /* Real two-tail physics: the ion (gas) tail points DIRECTLY anti-solar —
       the solar wind sweeps ionised gas radially away from the Sun regardless
       of which way the comet moves. The dust tail is heavier, lags along the
       orbital path (anti-velocity) and bows sideways toward anti-solar. */
    antiSun.copy(p).normalize();
    if (ionRef.current) {
      ionRef.current.position.copy(p);
      q.setFromUnitVectors(UP, antiSun);
      ionRef.current.quaternion.copy(q);
    }
    if (vel.lengthSq() > 1e-6) antiVel.copy(vel).normalize().multiplyScalar(-1);
    dustDir.copy(antiVel).multiplyScalar(0.8).addScaledVector(antiSun, 0.32).normalize();
    if (dustRef.current) {
      dustRef.current.position.copy(p);
      q.setFromUnitVectors(UP, dustDir);
      dustRef.current.quaternion.copy(q);
      /* Bow the dust tail toward the component of anti-solar perpendicular to
         the tail's own axis, expressed in the cone's LOCAL frame. */
      bendWorld
        .copy(antiSun)
        .addScaledVector(dustDir, -antiSun.dot(dustDir))
        .normalize();
      qInv.copy(q).invert();
      dustUniforms.uBendAxis.value.copy(bendWorld).applyQuaternion(qInv).normalize();
    }

    /* Activity: tails grow as it dives sunward, vanish at aphelion. */
    const act = THREE.MathUtils.clamp((ACTIVE_R - p.length()) / (ACTIVE_R - ACTIVE_PEAK), 0, 1);
    ionUniforms.uOpacity.value = 0.95 * act;
    dustUniforms.uOpacity.value = 0.62 * act;

    /* Cosmetic shimmer on the ion filaments — frozen under reduced-motion
       because sceneClock.t stays 0 there. */
    ionUniforms.uTime.value = sceneClock ? sceneClock.t : 0;
  });

  const ionLen = 150;
  const dustLen = 95;
  /* Lateral bow at the dust-tail tip, scaled to length so the arc stays
     proportional. */
  dustUniforms.uBend.value = dustLen * 0.42;

  return (
    <group>
      {/* Nucleus + soft coma */}
      <group ref={headRef}>
        <mesh>
          <sphereGeometry args={[3.4, 16, 16]} />
          <meshBasicMaterial color="#eaf4ff" toneMapped={false} />
        </mesh>
        <mesh>
          <sphereGeometry args={[9, 16, 16]} />
          <meshBasicMaterial
            color="#bfe0ff"
            transparent
            opacity={0.16}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </mesh>
      </group>

      {/* Ion tail — base at head (offset +len/2 so the cone base sits on the
          nucleus), apex out along the tail direction. Thin + long + straight. */}
      <group ref={ionRef}>
        <mesh position={[0, ionLen / 2, 0]}>
          <coneGeometry args={[2.4, ionLen, 16, 1, true]} />
          <shaderMaterial
            vertexShader={ION_VERT}
            fragmentShader={ION_FRAG}
            uniforms={ionUniforms}
            transparent
            depthWrite={false}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </mesh>
      </group>

      {/* Dust tail — broad, long, curved. More radial segments so the bowed
          silhouette stays smooth. */}
      <group ref={dustRef}>
        <mesh position={[0, dustLen / 2, 0]}>
          <coneGeometry args={[8.5, dustLen, 24, 24, true]} />
          <shaderMaterial
            vertexShader={DUST_VERT}
            fragmentShader={DUST_FRAG}
            uniforms={dustUniforms}
            transparent
            depthWrite={false}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </mesh>
      </group>
    </group>
  );
};

export default Comet;
