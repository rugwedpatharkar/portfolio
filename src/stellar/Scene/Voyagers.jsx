/* eslint-disable react/no-unknown-property */
/*
 * Voyager 1 and Voyager 2 — the two farthest-flung objects humans have ever
 * built, and the only spacecraft currently in interstellar space.
 *
 *   Voyager 1 — launched 5 Sep 1977. Reached interstellar space 25 Aug 2012.
 *     Current (2026): ~166 AU from the Sun, heading toward Camelopardalis
 *     at 17.02 km/s. Fastest human-made object.
 *   Voyager 2 — launched 20 Aug 1977. Reached interstellar space 5 Nov 2018.
 *     Current (2026): ~139 AU from the Sun, heading toward the Sagittarius
 *     region at 15.34 km/s. Only spacecraft to visit Uranus + Neptune.
 *
 * At the tour's 1:1 AU × 95 scale, 166 AU = ~15,770 scene units — far
 * outside the 7,000-unit sky shell. That's the honest truth: they're
 * unrepresentable at true scale in the sightline. We compress their
 * positions to ~4,200u (between Kuiper and Oort) so they're VISIBLE
 * during the outer-system stops but stay in the correct direction
 * relative to the Sun (per JPL Horizons ecliptic-frame vectors, 2024).
 *
 * Each probe is a small warm sprite with a hairline label. Visible only
 * during the outer-Solar-System stops (Neptune / Pluto / Kuiper / Oort).
 */
import { useMemo } from "react";
import * as THREE from "three";
import { Html } from "@react-three/drei";
import { makeSoftDot } from "./shared/textures";
import { SKY_SCALE } from "../config/destinations";

/* Approximate ecliptic-frame direction vectors (unit) — the DIRECTION Voyager
   1/2 are HEADING from the Sun in the Solar System's ecliptic reference frame.
   Values are simplified from NASA JPL Horizons 2024 vectors. */
const V1_DIR = new THREE.Vector3(0.31, 0.42, 0.85).normalize();  // roughly out + north
const V2_DIR = new THREE.Vector3(-0.16, -0.63, 0.76).normalize(); // roughly out + south

/* Scale-compressed distance so the probes are visible in the outer-tour
   framings without leaving the sky shell. 4200u = between Kuiper Belt and
   Oort Cloud in scene space; the DIRECTION stays honest. */
const SCENE_DIST = 4200 * SKY_SCALE;

const PROBE_SPRITE = makeSoftDot({
  size: 64,
  stops: [
    [0, "rgba(255,255,255,1)"],
    [0.32, "rgba(255,238,200,0.9)"],
    [0.7, "rgba(255,210,150,0.20)"],
    [1, "rgba(255,180,100,0)"],
  ],
  mipmaps: true,
});

const Probe = ({ dir, label, distance, target, crossed, tint }) => {
  const pos = useMemo(() => dir.clone().multiplyScalar(SCENE_DIST).toArray(), [dir]);

  return (
    <group position={pos}>
      <sprite scale={[36, 36, 1]}>
        <spriteMaterial
          map={PROBE_SPRITE}
          color={tint}
          transparent
          opacity={1}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </sprite>
      <Html
        center
        position={[0, 22, 0]}
        style={{
          pointerEvents: "none",
          fontFamily: "'Space Mono', monospace",
          fontSize: 10,
          letterSpacing: "0.18em",
          color: "rgba(255, 224, 168, 0.85)",
          textTransform: "uppercase",
          textShadow: "0 0 8px rgba(0,0,0,0.85)",
          whiteSpace: "nowrap",
          textAlign: "center",
        }}
      >
        <div>{label}</div>
        <div style={{ opacity: 0.6, fontSize: 9, marginTop: 2 }}>
          {distance} AU · → {target}
        </div>
        <div style={{ opacity: 0.42, fontSize: 8, marginTop: 1 }}>
          {crossed}
        </div>
      </Html>
    </group>
  );
};

const Voyagers = () => (
  <>
    <Probe dir={V1_DIR} tint="#ffe0a0" label="Voyager 1" distance="166" target="Camelopardalis" crossed="shock 2004 · heliopause 2012" />
    <Probe dir={V2_DIR} tint="#ffe0a0" label="Voyager 2" distance="139" target="Sagittarius" crossed="shock 2007 · heliopause 2018" />
  </>
);

export default Voyagers;
