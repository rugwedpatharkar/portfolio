/* eslint-disable react/no-unknown-property */
import { useMemo } from "react";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { besidePlanet } from "../config/destinations";

/*
 * Humanity's robot fleet — real spacecraft at (close to) their true locations,
 * joining Voyager + the ISRO probes. Each is a small, recognisable craft with a
 * label, placed beside the body it's exploring so you spot it during that stop:
 *   JWST at Sun-Earth L2 · Parker Solar Probe skimming the Sun · Juno at Jupiter
 *   · Lucy heading to the Jupiter Trojans · New Horizons past Pluto.
 * Like the other discoverables, the craft are scaled up to be VISIBLE (true
 * metres would be invisible specks next to a planet); the labels carry the name.
 */

const v = (a) => new THREE.Vector3(a[0], a[1], a[2]);

function fleet() {
  return {
    // Each placed just beside its body, IN the backlit camera's view (toward the
    // camera + lateral), so it's spotted during that stop rather than hidden on
    // the radial axis or off at an odd azimuth.
    jwst: v(besidePlanet("experience", [1, -0.6])),                  // by Earth (Sun-Earth L2)
    parker: new THREE.Vector3(Math.cos(0.7) * 22, 1.4, Math.sin(0.7) * 22), // skimming the Sun's limb
    juno: v(besidePlanet("skills", [-1, -0.6], { lateral: 1.8 })),   // orbiting Jupiter
    lucy: v(besidePlanet("skills", [0.7, -1.2], { lateral: 2.1 })),  // out by Jupiter (the Trojans)
    nh: v(besidePlanet("testimonials", [1, 0.4])),                   // past Pluto (2015 flyby)
  };
}

const Label = ({ name, sub }) => (
  <Html
    center
    distanceFactor={16}
    style={{
      pointerEvents: "none", fontFamily: "'JetBrains Mono', monospace", fontSize: 8.5,
      color: "#a8d8ff", textShadow: "0 1px 6px rgba(0,0,0,0.75)", letterSpacing: "0.1em",
      whiteSpace: "nowrap", transform: "translateY(-13px)",
    }}
  >
    <div style={{ textAlign: "center" }}>
      <div style={{ color: "white", fontWeight: 600 }}>{name}</div>
      {sub && <div style={{ fontSize: 7.5, color: "rgba(168,216,255,0.8)" }}>{sub}</div>}
    </div>
  </Html>
);

const RobotFleet = () => {
  const P = useMemo(fleet, []);
  return (
    <>
      {/* JWST — gold hexagonal mirror + flat silver sunshield */}
      <group position={P.jwst.toArray()} rotation={[0.35, 0.4, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.02, 6]} />
          <meshStandardMaterial color="#e8b84a" metalness={0.9} roughness={0.3} emissive="#6a4a10" emissiveIntensity={0.35} />
        </mesh>
        <mesh position={[0, -0.07, 0]} rotation={[0.25, 0, 0]}>
          <boxGeometry args={[0.3, 0.008, 0.2]} />
          <meshStandardMaterial color="#b9c2cf" metalness={0.5} roughness={0.5} />
        </mesh>
        <Label name="JWST" sub="SUN–EARTH L2" />
      </group>

      {/* Parker Solar Probe — dark body behind a white heat shield facing the Sun */}
      <group position={P.parker.toArray()} rotation={[0, -0.7, 0]}>
        <mesh><boxGeometry args={[0.08, 0.11, 0.07]} /><meshStandardMaterial color="#2a2a2e" metalness={0.5} roughness={0.5} /></mesh>
        <mesh position={[0, 0.09, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.012, 20]} />
          <meshStandardMaterial color="#efe9da" emissive="#ffb060" emissiveIntensity={0.5} toneMapped={false} />
        </mesh>
        <pointLight color="#ffcaa0" intensity={0.5} distance={3} decay={2} />
        <Label name="PARKER SOLAR PROBE" sub="TOUCHING THE SUN" />
      </group>

      {/* Juno — hexagonal body + 3 radial solar panels */}
      <group position={P.juno.toArray()} rotation={[0.2, 0.5, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.07, 0.07, 0.1, 6]} /><meshStandardMaterial color="#caa86a" metalness={0.6} roughness={0.4} /></mesh>
        {[0, 1, 2].map((i) => {
          const a = i * 2.094;
          return (
            <mesh key={i} position={[Math.cos(a) * 0.26, 0, Math.sin(a) * 0.26]} rotation={[0, -a, 0]}>
              <boxGeometry args={[0.4, 0.012, 0.11]} />
              <meshStandardMaterial color="#1a2a4a" metalness={0.3} roughness={0.6} emissive="#0a1428" emissiveIntensity={0.3} />
            </mesh>
          );
        })}
        <Label name="JUNO" sub="ORBITING JUPITER" />
      </group>

      {/* Lucy — body + 2 big round solar arrays */}
      <group position={P.lucy.toArray()} rotation={[0.2, 0.8, 0]}>
        <mesh><boxGeometry args={[0.08, 0.1, 0.08]} /><meshStandardMaterial color="#cfd3d8" metalness={0.5} roughness={0.5} /></mesh>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.28, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.2, 0.2, 0.01, 24]} />
            <meshStandardMaterial color="#26324f" metalness={0.3} roughness={0.6} side={THREE.DoubleSide} />
          </mesh>
        ))}
        <Label name="LUCY" sub="→ JUPITER TROJANS" />
      </group>

      {/* New Horizons — triangular body + high-gain dish */}
      <group position={P.nh.toArray()} rotation={[0.3, 0.6, 0]}>
        <mesh><coneGeometry args={[0.1, 0.16, 3]} /><meshStandardMaterial color="#c9a86a" metalness={0.5} roughness={0.5} /></mesh>
        <mesh position={[0, 0.12, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 0.015, 20]} />
          <meshStandardMaterial color="#d8d2c4" metalness={0.4} roughness={0.5} />
        </mesh>
        <Label name="NEW HORIZONS" sub="FLEW PAST PLUTO" />
      </group>
    </>
  );
};

export default RobotFleet;
