/* eslint-disable react/no-unknown-property */
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/*
 * A hero comet on a long, slow crossing of the inner system — built with the
 * two REAL tails, which point in different directions:
 *
 *   - ion (gas) tail — blue, thin, dead straight, pointing DIRECTLY away from
 *     the sun: the solar wind sweeps ionised gas radially anti-solar.
 *   - dust tail — yellow-white, broader and CURVED, lagging back along the
 *     orbital path: heavier dust is left behind where the comet has been.
 *
 * Plus a bright nucleus and a soft coma. Tails are additive cones with a
 * gradient fade (bright at the head → transparent at the tip). Object-space
 * only — no postprocessing. Loops across the inner system on respawn.
 */

const TAIL_VERT = /* glsl */ `
  varying float vT;
  void main() { vT = uv.y; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
const TAIL_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vT;
  void main() {
    float a = pow(1.0 - vT, 1.7) * uOpacity;   // base (head) bright → apex (tip) gone
    if (a < 0.004) discard;
    gl_FragColor = vec4(uColor * a, a);
  }
`;

const UP = new THREE.Vector3(0, 1, 0);
const SUN = new THREE.Vector3(0, 0, 0);

/* Slow drift across the inner system (sun at origin), so it's on-frame during
   the inner stops. Respawns to the start when it runs out the far side. */
const START = new THREE.Vector3(20, 6, -12);
const VEL = new THREE.Vector3(-2.0, -1.05, 2.45); // ~3.4 u/s — lingering

const Comet = () => {
  const headRef = useRef();
  const ionRef = useRef();
  const dustRef = useRef();
  const pos = useRef(START.clone());

  const ionUniforms = useMemo(() => ({ uColor: { value: new THREE.Color("#7db4ff") }, uOpacity: { value: 0.9 } }), []);
  const dustUniforms = useMemo(() => ({ uColor: { value: new THREE.Color("#ffdfa0") }, uOpacity: { value: 0.62 } }), []);

  /* scratch */
  const antiSun = useMemo(() => new THREE.Vector3(), []);
  const antiVel = useMemo(() => new THREE.Vector3(), []);
  const dustDir = useMemo(() => new THREE.Vector3(), []);
  const q = useMemo(() => new THREE.Quaternion(), []);

  useFrame((_, delta) => {
    const d = Math.min(delta, 1 / 20);
    const p = pos.current;
    p.addScaledVector(VEL, d);
    /* Respawn once it has crossed to the far side. */
    if (p.x < -18 || p.z > 18 || p.y < -14) p.copy(START);

    if (headRef.current) headRef.current.position.copy(p);

    /* ion tail — straight, anti-solar */
    antiSun.copy(p).sub(SUN).normalize();
    if (ionRef.current) {
      ionRef.current.position.copy(p);
      q.setFromUnitVectors(UP, antiSun);
      ionRef.current.quaternion.copy(q);
    }
    /* dust tail — curved: blend of anti-solar and anti-velocity (the lag) */
    antiVel.copy(VEL).normalize().multiplyScalar(-1);
    dustDir.copy(antiSun).multiplyScalar(0.68).addScaledVector(antiVel, 0.55).normalize();
    if (dustRef.current) {
      dustRef.current.position.copy(p);
      q.setFromUnitVectors(UP, dustDir);
      dustRef.current.quaternion.copy(q);
    }
  });

  const ionLen = 5.2;
  const dustLen = 3.4;

  return (
    <group>
      {/* Nucleus + coma */}
      <mesh ref={headRef}>
        <sphereGeometry args={[0.12, 12, 12]} />
        <meshBasicMaterial color="#eaf4ff" toneMapped={false} />
      </mesh>

      {/* Ion tail — base at head (offset +len/2 so the cone base sits on the
          nucleus), apex out along the tail direction. */}
      <group ref={ionRef}>
        <mesh position={[0, ionLen / 2, 0]}>
          <coneGeometry args={[0.16, ionLen, 14, 1, true]} />
          <shaderMaterial
            vertexShader={TAIL_VERT}
            fragmentShader={TAIL_FRAG}
            uniforms={ionUniforms}
            transparent
            depthWrite={false}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </mesh>
      </group>

      {/* Dust tail — broader, shorter, curved. */}
      <group ref={dustRef}>
        <mesh position={[0, dustLen / 2, 0]}>
          <coneGeometry args={[0.42, dustLen, 16, 1, true]} />
          <shaderMaterial
            vertexShader={TAIL_VERT}
            fragmentShader={TAIL_FRAG}
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
