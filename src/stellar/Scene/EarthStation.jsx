/* eslint-disable react/no-unknown-property */
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

/*
 * The ISS on low Earth orbit.
 *
 * Mounted INSIDE Earth's OrbitGroup, so it inherits Earth's live solar
 * position for free and only has to drive its own fast, inclined orbit
 * around the planet's local centre — LEO completes in ~90 min, so it
 * tracks visibly quicker than the Moon. Modular build (central truss +
 * pressurised module stack + four emissive solar-array wings + a radiator)
 * keeps it recognisable while staying low-poly. Desktop-gated; the orbit
 * freezes under reduced-motion.
 */

const ORBIT_TILT = 51.6 * (Math.PI / 180); // real ISS orbital inclination
const PANEL = "#15324f"; // dark photovoltaic blue

const EarthStation = ({ planetRadius = 0.75, animate = true }) => {
  const orbitRef = useRef();
  const bodyRef = useRef();
  const tRef = useRef(1.7); // fixed phase start — keeps the craft off Earth's limb
  const orbitR = planetRadius * 1.42;

  /* Place it once for the reduced-motion (frozen) case. */
  const place = (a) => {
    const ring = Math.sin(a) * orbitR;
    orbitRef.current?.position.set(
      Math.cos(a) * orbitR,
      ring * Math.sin(ORBIT_TILT),
      ring * Math.cos(ORBIT_TILT)
    );
  };
  if (!animate && orbitRef.current && orbitRef.current.position.lengthSq() === 0) {
    place(tRef.current);
    if (bodyRef.current) bodyRef.current.rotation.y = tRef.current;
  }

  useFrame((_, dt) => {
    if (!animate) return;
    tRef.current += Math.min(dt, 1 / 20) * 0.55;
    place(tRef.current);
    if (bodyRef.current) {
      bodyRef.current.rotation.y = tRef.current;           // keep panels broadside to travel
      bodyRef.current.rotation.z = Math.sin(tRef.current * 0.5) * 0.12; // lazy attitude drift
    }
  });

  return (
    <group ref={orbitRef}>
      <group ref={bodyRef} scale={planetRadius}>
        {/* Main integrated truss */}
        <mesh>
          <boxGeometry args={[0.34, 0.016, 0.016]} />
          <meshStandardMaterial color="#c2c2be" roughness={0.5} metalness={0.7} />
        </mesh>

        {/* Pressurised module stack along the truss centre */}
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.028, 0.028, 0.15, 14]} />
          <meshStandardMaterial color="#ddd8c9" roughness={0.55} metalness={0.35} />
        </mesh>
        <mesh position={[0.06, 0, 0.04]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.08, 12]} />
          <meshStandardMaterial color="#cdc8b8" roughness={0.55} metalness={0.35} />
        </mesh>
        <mesh position={[-0.05, 0, -0.035]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.018, 0.018, 0.07, 12]} />
          <meshStandardMaterial color="#cdc8b8" roughness={0.55} metalness={0.35} />
        </mesh>

        {/* Four solar-array wings — two pairs at the truss ends. Emissive so
            they read as catching the sun even on Earth's night side. */}
        {[-1, 1].map((sx) => (
          <group key={sx} position={[0.14 * sx, 0, 0]}>
            {[-1, 1].map((sz) => (
              <mesh key={sz} position={[0, 0, 0.055 * sz]}>
                <boxGeometry args={[0.085, 0.005, 0.092]} />
                <meshStandardMaterial
                  color={PANEL}
                  emissive="#1f5388"
                  emissiveIntensity={0.55}
                  roughness={0.4}
                  metalness={0.3}
                />
              </mesh>
            ))}
            {/* slim mast connecting the wing pair to the truss */}
            <mesh>
              <boxGeometry args={[0.006, 0.006, 0.11]} />
              <meshStandardMaterial color="#9a9a96" roughness={0.5} metalness={0.6} />
            </mesh>
          </group>
        ))}

        {/* White thermal radiator, canted off the truss */}
        <mesh position={[0, 0.03, 0]} rotation={[0.5, 0, 0]}>
          <boxGeometry args={[0.06, 0.004, 0.05]} />
          <meshStandardMaterial color="#eceae4" roughness={0.65} metalness={0.15} />
        </mesh>
      </group>
    </group>
  );
};

export default EarthStation;
