/* eslint-disable react/no-unknown-property */
/*
 * Voyager 1 and Voyager 2 — the two farthest-flung objects humans have ever
 * built, and the only spacecraft currently in interstellar space.
 *
 *   Voyager 1 — launched 5 Sep 1977. Reached interstellar space 25 Aug 2012.
 *     Current (2026-07-18): ~171 AU from the Sun, heading toward
 *     Camelopardalis at 17.0 km/s (~3.6 AU/yr escape). Fastest human-made
 *     object. Will pass ONE LIGHT-DAY from Earth on 18 Nov 2026.
 *   Voyager 2 — launched 20 Aug 1977. Reached interstellar space 5 Nov 2018.
 *     Current (2026-07-18): ~144 AU from the Sun, heading toward the
 *     Sagittarius region at 15.4 km/s (~3.1 AU/yr). Only spacecraft to
 *     visit Uranus + Neptune.
 *
 * At true 1:1 scale (AU_UNIT = 4274 scene units per AU) V1 sits at
 * 171 × 4274 = 730,854 scene units and V2 at 615,456 — both well past
 * Neptune (128,220u) and Pluto (168,731u), just short of the inner Oort
 * shell (2000 × 4274 = 8.5 M u). Rendered at true distances now — the
 * previous compression to 4200 × SKY_SCALE ≈ 189k u (~44 AU) was retired
 * per the user's "no compression" call. Directions per JPL Horizons
 * ecliptic-frame vectors (2024).
 *
 * Each probe is a small warm sprite with a hairline label. Visible only
 * during the outer-Solar-System stops (Neptune / Pluto / Kuiper / Oort).
 */
import { useMemo } from "react";
import * as THREE from "three";
import { Html } from "@react-three/drei";
import { makeSoftDot } from "./shared/textures";
import { AU_UNIT } from "../config/destinations";

/* Approximate ecliptic-frame direction vectors (unit) — the DIRECTION Voyager
   1/2 are HEADING from the Sun in the Solar System's ecliptic reference frame.
   Values are simplified from NASA JPL Horizons 2024 vectors. */
const V1_DIR = new THREE.Vector3(0.31, 0.42, 0.85).normalize();  // roughly out + north
const V2_DIR = new THREE.Vector3(-0.16, -0.63, 0.76).normalize(); // roughly out + south

/* Real heliocentric distances in AU (2026-07-18, NASA VIM extrapolated). Each
   probe positions at AU × AU_UNIT along its heading direction — the honest
   truth of where they actually are. */
const V1_AU = 171;
const V2_AU = 144;

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

const Probe = ({ dir, distanceAU, label, target, crossed, tint }) => {
  const pos = useMemo(() => dir.clone().multiplyScalar(distanceAU * AU_UNIT).toArray(), [dir, distanceAU]);
  const distance = String(distanceAU);

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
    <Probe dir={V1_DIR} distanceAU={V1_AU} tint="#ffe0a0" label="Voyager 1" target="Camelopardalis" crossed="shock 2004 · heliopause 2012" />
    <Probe dir={V2_DIR} distanceAU={V2_AU} tint="#ffe0a0" label="Voyager 2" target="Sagittarius" crossed="shock 2007 · heliopause 2018" />
  </>
);

export default Voyagers;
