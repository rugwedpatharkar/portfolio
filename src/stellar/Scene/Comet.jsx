/* eslint-disable react/no-unknown-property */
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useSceneClock } from "./SceneClock";

/*
 * A hero comet on a long, slow crossing of the inner system — built with the
 * two REAL tails, which point in different directions:
 *
 *   - ion (gas) tail — blue, thin, dead straight, pointing DIRECTLY away from
 *     the sun: the solar wind sweeps ionised gas radially anti-solar. Faint
 *     longitudinal filaments (the streaky structure real ion tails show).
 *   - dust tail — yellow-white, broader and visibly CURVED, lagging back along
 *     the orbital path: heavier dust is left behind where the comet has been.
 *     The cone is bowed sideways in the vertex shader (∝ vT²) so its silhouette
 *     sweeps into the classic arc instead of a straight spike.
 *
 * Plus a bright nucleus and a soft coma. Tails are additive cones with a
 * gradient fade (bright at the head → transparent at the tip). Object-space
 * only — no postprocessing. Loops across the inner system on respawn.
 *
 * Reduced-motion: the only time-driven effect is a faint shimmer on the ion
 * filaments, driven by the shared virtual clock (sceneClock.t), which the
 * SceneClock holds at 0 under reduced-motion — so the tails freeze. The
 * comet's drift uses frame delta as before (orbital travel, not cosmetic).
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
const SUN = new THREE.Vector3(0, 0, 0);

/* Slow drift across the inner system (sun at origin), so it's on-frame during
   the inner stops. Respawns to the start when it runs out the far side. */
const START = new THREE.Vector3(22, 9, -16);
const VEL = new THREE.Vector3(-2.1, -0.7, 0.7); // crosses the mid-ground, not the foreground

const Comet = () => {
  const sceneClock = useSceneClock();
  const headRef = useRef();
  const ionRef = useRef();
  const dustRef = useRef();
  const pos = useRef(START.clone());

  const ionUniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color("#5fa8ff") },
      uOpacity: { value: 0.95 },
      uTime: { value: 0 },
    }),
    [],
  );
  const dustUniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color("#ffe6b0") },
      uOpacity: { value: 0.6 },
      uBend: { value: 0 },
      uBendAxis: { value: new THREE.Vector3(1, 0, 0) },
    }),
    [],
  );

  /* scratch */
  const antiSun = useMemo(() => new THREE.Vector3(), []);
  const antiVel = useMemo(() => new THREE.Vector3(), []);
  const dustDir = useMemo(() => new THREE.Vector3(), []);
  const bendWorld = useMemo(() => new THREE.Vector3(), []);
  const q = useMemo(() => new THREE.Quaternion(), []);
  const qInv = useMemo(() => new THREE.Quaternion(), []);

  useFrame((_, delta) => {
    const d = Math.min(delta, 1 / 20);
    const p = pos.current;
    p.addScaledVector(VEL, d);
    /* Respawn once it has crossed to the far side. */
    if (p.x < -20 || p.z > 16 || p.y < -12) p.copy(START);

    if (headRef.current) headRef.current.position.copy(p);

    /* Real two-tail physics: the ion (gas) tail points DIRECTLY anti-solar —
       the solar wind sweeps ionised gas radially away from the Sun regardless
       of which way the comet moves. The dust tail is heavier, lags along the
       orbital path (anti-velocity) and bows sideways toward anti-solar. */
    antiVel.copy(VEL).normalize().multiplyScalar(-1);
    antiSun.copy(p).sub(SUN).normalize();
    if (ionRef.current) {
      ionRef.current.position.copy(p);
      q.setFromUnitVectors(UP, antiSun);
      ionRef.current.quaternion.copy(q);
    }
    dustDir.copy(antiVel).multiplyScalar(0.8).addScaledVector(antiSun, 0.32).normalize();
    if (dustRef.current) {
      dustRef.current.position.copy(p);
      q.setFromUnitVectors(UP, dustDir);
      dustRef.current.quaternion.copy(q);
      /* Bow the dust tail toward where anti-solar pulls it away from pure
         velocity-lag — i.e. the component of antiSun perpendicular to the
         tail's own axis (dustDir). Expressed in the cone's LOCAL frame so the
         vertex shader can apply it regardless of orientation. */
      bendWorld
        .copy(antiSun)
        .addScaledVector(dustDir, -antiSun.dot(dustDir)) // strip the along-axis part
        .normalize();
      qInv.copy(q).invert();
      dustUniforms.uBendAxis.value.copy(bendWorld).applyQuaternion(qInv).normalize();
    }

    /* Cosmetic shimmer on the ion filaments — frozen under reduced-motion
       because sceneClock.t stays 0 there. */
    ionUniforms.uTime.value = sceneClock ? sceneClock.t : 0;
  });

  const ionLen = 8.5;
  const dustLen = 5.5;
  /* Lateral bow at the dust-tail tip (local units). Scaled to the length so the
     arc stays proportional. */
  dustUniforms.uBend.value = dustLen * 0.42;

  return (
    <group>
      {/* Nucleus + coma */}
      <mesh ref={headRef}>
        <sphereGeometry args={[0.12, 12, 12]} />
        <meshBasicMaterial color="#eaf4ff" toneMapped={false} />
      </mesh>

      {/* Ion tail — base at head (offset +len/2 so the cone base sits on the
          nucleus), apex out along the tail direction. Thin + long + straight. */}
      <group ref={ionRef}>
        <mesh position={[0, ionLen / 2, 0]}>
          <coneGeometry args={[0.08, ionLen, 16, 1, true]} />
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
          <coneGeometry args={[0.34, dustLen, 24, 24, true]} />
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
