/* eslint-disable react/no-unknown-property */
/*
 * The Local Interstellar Cloud ("Local Fluff") — the warm (~7,000 K), tenuous
 * (~0.3 atoms/cm³) wisp of interstellar gas, ~30 ly across, that the whole
 * heliosphere is currently plowing through. The Sun entered it ~10,000 yr ago
 * and will leave in a few thousand more.
 *
 * It is vastly larger than everything else in the scene, so an honest render is
 * "barely anything": a faint warm haze on the NOSE side (+Z, toward Scorpius/
 * Ophiuchus — the direction the interstellar wind blows FROM), just beyond the
 * heliopause, plus a hairline label. Shown with the heliosphere at the outer
 * stops + finale. Static, additive, cheap.
 */
import { useMemo } from "react";
import * as THREE from "three";
import { Html } from "@react-three/drei";
import { makeSoftDot } from "./shared/textures";
import { SKY_SCALE } from "../config/destinations";

const HAZE = makeSoftDot({
  size: 128,
  stops: [
    [0, "rgba(255,244,224,0.7)"],
    [0.45, "rgba(232,208,176,0.28)"],
    [1, "rgba(200,176,150,0)"],
  ],
  mipmaps: true,
});

/* A few overlapping soft warm patches clustered around the nose direction. */
const PUFFS = [
  { p: [0, 0, 5700], s: 4200, o: 0.09 },
  { p: [-1800, 900, 5400], s: 2800, o: 0.06 },
  { p: [1600, -700, 5500], s: 2600, o: 0.06 },
  { p: [400, 1500, 5300], s: 2400, o: 0.05 },
];

const LocalInterstellarCloud = () => {
  const puffs = useMemo(
    () => PUFFS.map((q) => ({ pos: q.p.map((v) => v * SKY_SCALE), scale: q.s * SKY_SCALE, opacity: q.o })),
    [],
  );
  return (
    <group>
      {puffs.map((q, i) => (
        <sprite key={i} position={q.pos} scale={[q.scale, q.scale, 1]}>
          <spriteMaterial map={HAZE} color="#f0dcc0" transparent opacity={q.opacity} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
        </sprite>
      ))}
      <Html
        center
        position={[0, 1400 * SKY_SCALE, 5700 * SKY_SCALE]}
        style={{
          pointerEvents: "none",
          fontFamily: "'Space Mono', monospace",
          fontSize: 10,
          letterSpacing: "0.18em",
          color: "rgba(240, 220, 192, 0.7)",
          textTransform: "uppercase",
          textShadow: "0 0 8px rgba(0,0,0,0.85)",
          whiteSpace: "nowrap",
          textAlign: "center",
        }}
      >
        <div>Local Interstellar Cloud</div>
        <div style={{ opacity: 0.55, fontSize: 8, marginTop: 2 }}>~7,000 K wisp · ~30 ly · the wind we sail</div>
      </Html>
    </group>
  );
};

export default LocalInterstellarCloud;
