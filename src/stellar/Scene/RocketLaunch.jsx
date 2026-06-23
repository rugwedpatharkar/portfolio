/* eslint-disable react/no-unknown-property, react/prop-types */
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/*
 * A periodic PSLV-style launch from Earth's surface.
 *
 * Mounted INSIDE Earth's OrbitGroup, like EarthStation, so it rides Earth
 * around the sun for free and only drives its own launch in Earth-local
 * space. The pad sits on Pune (matching HomeMarker's location + texture
 * calibration); the rocket rises along the local surface normal, arcs
 * slightly downrange, accelerates, fades out at altitude, then waits a few
 * seconds and goes again — a gentle, continuous loop.
 *
 * One reusable rocket group (slim body + nose cone + fins + emissive plume)
 * plus a short tapered smoke trail are built once and only transformed in
 * useFrame — no per-frame allocation. The ascent timer is driven by the
 * frame delta (real time, like EarthStation's `dt`), clamped to 1/20s.
 * Desktop-gated; under reduced-motion (`animate` false) the component renders
 * nothing, so there's no launch.
 */

const DEG = Math.PI / 180;
const PUNE = { lat: 18.52, lon: 73.86 };
// Longitude calibration to align with India on earth_atmos.jpg (from HomeMarker).
const LON_OFFSET = -90;
const FLAME = "#ff8a3c";

const ASCENT = 4.2; // seconds of powered flight per launch
const HOLD = 5.5; // seconds on the pad between launches
const CYCLE = ASCENT + HOLD;
const MAX_ALT = 0.55; // peak altitude above the surface, in Earth radii
const DOWNRANGE = 0.13; // lateral arc at apoapsis, in Earth radii

const latLonToVec3 = (lat, lon, r) => {
  const phi = (90 - lat) * DEG;
  const theta = (lon + 180 + LON_OFFSET) * DEG;
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  );
};

const RocketLaunch = ({ earthRadius = 0.75, animate = true }) => {
  const liftRef = useRef(); // travels outward along the surface normal (+Y)
  const arcRef = useRef(); // tangential downrange offset (+X)
  const flameRef = useRef(); // plume; scaled/dimmed with thrust
  const trailRef = useRef(); // tapered smoke column behind the rocket
  const stackRef = useRef(); // visible body+plume; hidden while on the pad
  const tRef = useRef(HOLD * 0.6); // start mid-hold so the first launch isn't instant

  // Place the pad on Pune and orient its local +Y to the surface normal, so
  // the rocket rises in local +Y and arcs in local +X (matches HomeMarker).
  const { position, quaternion } = useMemo(() => {
    const pos = latLonToVec3(PUNE.lat, PUNE.lon, earthRadius * 1.001);
    const q = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      pos.clone().normalize()
    );
    return { position: pos.toArray(), quaternion: q.toArray() };
  }, [earthRadius]);

  useFrame((_, dt) => {
    if (!animate) return;
    tRef.current = (tRef.current + Math.min(dt, 1 / 20)) % CYCLE;
    const t = tRef.current;

    if (t > ASCENT) {
      // On the pad between launches: reset to launch height, hide the stack.
      if (liftRef.current) liftRef.current.position.y = 0;
      if (arcRef.current) arcRef.current.position.x = 0;
      if (stackRef.current) stackRef.current.visible = false;
      if (trailRef.current) trailRef.current.material.opacity = 0;
      return;
    }

    const p = t / ASCENT; // 0 → 1 over the ascent
    const ease = p * p; // accelerate: slow off the pad, fast at altitude
    if (liftRef.current) liftRef.current.position.y = ease * MAX_ALT;
    if (arcRef.current) arcRef.current.position.x = Math.sin(p * Math.PI * 0.5) * DOWNRANGE;
    if (stackRef.current) stackRef.current.visible = true;

    // Plume pulses with thrust and dies out over the last fifth of the burn.
    const thrust = (1 - Math.min(p / 0.8, 1)) * (0.85 + Math.sin(t * 40) * 0.15);
    // Whole-stack fade as it nears apoapsis (last 30% of the climb).
    const fade = p < 0.7 ? 1 : 1 - (p - 0.7) / 0.3;
    if (flameRef.current) {
      flameRef.current.scale.set(1, 0.6 + thrust, 1);
      flameRef.current.material.opacity = thrust * fade;
    }
    // Smoke trail lengthens as it climbs, then fades with the rest of the stack.
    if (trailRef.current) {
      trailRef.current.scale.y = 0.4 + ease * 6;
      trailRef.current.material.opacity = 0.28 * fade * thrust;
    }
  });

  // Reduced motion: render nothing — no launch (hooks above stay unconditional).
  if (!animate) return null;

  const s = earthRadius * 0.18; // rocket scale → ~0.135 tall on a 0.75 Earth

  return (
    <group position={position} quaternion={quaternion}>
      <group ref={arcRef}>
        <group ref={liftRef}>
          <group ref={stackRef} scale={s}>
            {/* Body — slim white cylinder */}
            <mesh position={[0, 0.4, 0]}>
              <cylinderGeometry args={[0.05, 0.05, 0.7, 12]} />
              <meshStandardMaterial color="#eef0f2" roughness={0.5} metalness={0.2} />
            </mesh>
            {/* Nose cone */}
            <mesh position={[0, 0.83, 0]}>
              <coneGeometry args={[0.05, 0.18, 12]} />
              <meshStandardMaterial color="#d8dde2" roughness={0.45} metalness={0.25} />
            </mesh>
            {/* Thin orange band near the base for a PSLV feel */}
            <mesh position={[0, 0.13, 0]}>
              <cylinderGeometry args={[0.052, 0.052, 0.06, 12]} />
              <meshStandardMaterial color={FLAME} roughness={0.6} metalness={0.1} />
            </mesh>
            {/* Four fins at the base */}
            {[0, 1, 2, 3].map((i) => (
              <mesh key={i} position={[0, 0.08, 0]} rotation={[0, (i * Math.PI) / 2, 0]}>
                <boxGeometry args={[0.14, 0.12, 0.012]} />
                <meshStandardMaterial color="#c4c9ce" roughness={0.5} metalness={0.2} />
              </mesh>
            ))}
            {/* Bright emissive exhaust plume at the base */}
            <mesh ref={flameRef} position={[0, -0.12, 0]}>
              <coneGeometry args={[0.06, 0.32, 12, 1, true]} />
              <meshBasicMaterial color={FLAME} transparent opacity={0.9} toneMapped={false} />
            </mesh>
          </group>

          {/* Tapered smoke trail behind the rocket — grows downward in local
              -Y as the stack climbs. Scaled per frame, never rebuilt. */}
          <mesh ref={trailRef} position={[0, -s * 0.1, 0]} scale={[s, 1, s]}>
            <cylinderGeometry args={[0.01, 0.07, 0.1, 8, 1, true]} />
            <meshBasicMaterial color="#cfd4da" transparent opacity={0} depthWrite={false} toneMapped={false} />
          </mesh>
        </group>
      </group>
    </group>
  );
};

export default RocketLaunch;
