/* eslint-disable react/no-unknown-property */
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/*
 * Interstellar comets sweeping the inner system on unbound hyperbolic paths.
 * Parameterised so it serves both real visitors:
 *
 *  • 3I/ATLAS (C/2025 N1, default) — 3rd interstellar object, first active
 *    interstellar comet: a blue-GREEN C₂ coma, an anti-solar ion tail, a
 *    velocity-lagged dust tail, AND a rare SUNWARD ANTI-TAIL (a spike toward the
 *    Sun) genuinely observed on it. Perihelion ~1.4 AU, just inside Mars.
 *  • 2I/Borisov — 2nd interstellar object, a ~1 km CO-rich comet; reddish coma,
 *    a single anti-solar tail, no anti-tail. Completes the trio with 1I/'Oumuamua.
 *
 * Tails orient by the live Sun direction each frame (Sun at origin). Motion-gated
 * by the caller (Scene doesn't mount these under reduced-motion).
 */

const TAIL_VERT = /* glsl */ `
  uniform float uBend; uniform vec3 uBendAxis;
  varying float vT;
  void main() {
    vT = uv.y;
    vec3 p = position + uBendAxis * (uBend * vT * vT);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;
const TAIL_FRAG = /* glsl */ `
  uniform vec3 uColor; uniform float uOpacity; uniform float uPow;
  varying float vT;
  void main() {
    float a = pow(1.0 - vT, uPow) * uOpacity;
    if (a < 0.004) discard;
    gl_FragColor = vec4(uColor * a, a);
  }
`;

const UP = new THREE.Vector3(0, 1, 0);

const AtlasComet = ({
  start = [560, 34, -210],
  vel = [-150, -7, 52], // retrograde sweep inward then out
  coma = "#7fffb0", // 3I/ATLAS green C₂ coma
  ion = "#6fffc0",
  dust = "#ffe6b0",
  antiTail = true, // the rare sunward spike (ATLAS only)
  comaR = 7,
  respawn = 760,
}) => {
  const headRef = useRef();
  const ionRef = useRef();
  const dustRef = useRef();
  const antiRef = useRef();
  const START = useMemo(() => new THREE.Vector3(...start), [start]);
  const VEL = useMemo(() => new THREE.Vector3(...vel), [vel]);
  const pos = useRef(START.clone());
  const prev = useRef(START.clone());
  const ACTIVE_R = 4.2 * 95;
  const PEAK_R = 1.2 * 95;

  const mk = (color, opacity, pow, bend) =>
    new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color(color) }, uOpacity: { value: opacity },
        uPow: { value: pow }, uBend: { value: bend }, uBendAxis: { value: new THREE.Vector3(1, 0, 0) },
      },
      vertexShader: TAIL_VERT, fragmentShader: TAIL_FRAG,
      transparent: true, depthWrite: false, side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending, toneMapped: false,
    });
  const ionMat = useMemo(() => mk(ion, 0, 1.6, 0), [ion]);
  const dustMat = useMemo(() => mk(dust, 0, 2.1, 0), [dust]);
  const antiMat = useMemo(() => mk("#cfeecf", 0, 2.4, 0), []);

  const antiSun = useMemo(() => new THREE.Vector3(), []);
  const sunward = useMemo(() => new THREE.Vector3(), []);
  const velV = useMemo(() => new THREE.Vector3(), []);
  const antiVel = useMemo(() => new THREE.Vector3(1, 0, 0), []);
  const dustDir = useMemo(() => new THREE.Vector3(), []);
  const q = useMemo(() => new THREE.Quaternion(), []);

  const ionLen = 120, dustLen = 80, antiLen = 34;
  dustMat.uniforms.uBend.value = dustLen * 0.4;

  useFrame((_, delta) => {
    const d = Math.min(delta, 1 / 20);
    const p = pos.current;
    p.addScaledVector(VEL, d);
    if (p.length() > respawn) { p.copy(START); prev.current.copy(START); }
    velV.copy(p).sub(prev.current); prev.current.copy(p);

    if (headRef.current) headRef.current.position.copy(p);
    antiSun.copy(p).normalize();
    sunward.copy(antiSun).multiplyScalar(-1);
    if (velV.lengthSq() > 1e-6) antiVel.copy(velV).normalize().multiplyScalar(-1);
    dustDir.copy(antiVel).multiplyScalar(0.8).addScaledVector(antiSun, 0.3).normalize();

    if (ionRef.current) { ionRef.current.position.copy(p); q.setFromUnitVectors(UP, antiSun); ionRef.current.quaternion.copy(q); }
    if (dustRef.current) { dustRef.current.position.copy(p); q.setFromUnitVectors(UP, dustDir); dustRef.current.quaternion.copy(q); }
    if (antiRef.current) { antiRef.current.position.copy(p); q.setFromUnitVectors(UP, sunward); antiRef.current.quaternion.copy(q); }

    const act = THREE.MathUtils.clamp((ACTIVE_R - p.length()) / (ACTIVE_R - PEAK_R), 0, 1);
    ionMat.uniforms.uOpacity.value = 0.85 * act;
    dustMat.uniforms.uOpacity.value = 0.6 * act;
    antiMat.uniforms.uOpacity.value = (antiTail ? 0.32 : 0) * act;
  });

  return (
    <group>
      <group ref={headRef}>
        <mesh><sphereGeometry args={[1.6, 14, 14]} /><meshBasicMaterial color="#eafff2" toneMapped={false} /></mesh>
        <mesh><sphereGeometry args={[comaR, 16, 16]} /><meshBasicMaterial color={coma} transparent opacity={0.22} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} /></mesh>
      </group>
      <group ref={ionRef}><mesh position={[0, ionLen / 2, 0]} material={ionMat}><coneGeometry args={[2.0, ionLen, 16, 1, true]} /></mesh></group>
      <group ref={dustRef}><mesh position={[0, dustLen / 2, 0]} material={dustMat}><coneGeometry args={[6.5, dustLen, 24, 24, true]} /></mesh></group>
      {antiTail && (
        <group ref={antiRef}><mesh position={[0, antiLen / 2, 0]} material={antiMat}><coneGeometry args={[1.4, antiLen, 12, 1, true]} /></mesh></group>
      )}
    </group>
  );
};

export default AtlasComet;
