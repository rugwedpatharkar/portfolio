/* eslint-disable react/no-unknown-property */
/*
 * Textured planet-thumbnail sprites at each planet's LIVE orbital position —
 * the overview view now reads as ACTUAL planets arranged along their orbits,
 * not sci-fi glow dots. Each sprite billboards the planet's real surface
 * texture (same file the tour's Planet component loads, hits the Three.js
 * texture cache so no duplicate GPU memory).
 *
 * Per-frame scaling keeps each sprite at a constant on-screen pixel size
 * regardless of camera distance — so from the overview's 2200u out you still
 * see recognisable little discs, and the sprite doesn't try to compete with
 * the real planet render when the tour zooms in.
 *
 * A subtle additive halo behind each disc gives gas giants + inner planets a
 * gentle glow that reads as the planet's palette accent — without turning
 * back into the plain-dot look.
 */
import { useMemo, useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { DESTINATIONS } from "../config/destinations";
import { orbitalPosition } from "../config/orbits";
import { useSceneClock } from "./SceneClock";
import { makeSoftDot } from "./shared/textures";

const BODIES = DESTINATIONS.filter((d) => d.kind === "planet" && d.texture);
const TEXTURE_URLS = BODIES.map((b) => b.texture);

/* Target on-screen size. Discs at 26px are big enough to READ as planet
   textures (not just dots) but small enough not to fight the real system
   layout at overview. */
const DISC_PX = 26;
const HALO_PX = 44;

const HALO_SPRITE = makeSoftDot({
  size: 64,
  stops: [
    [0, "rgba(255,255,255,1)"],
    [0.32, "rgba(255,255,255,0.55)"],
    [0.7, "rgba(255,255,255,0.10)"],
    [1, "rgba(255,255,255,0)"],
  ],
  mipmaps: true,
});

/* Circular alpha mask so the planet texture reads as a DISC, not a square
   (spriteMaterial+map alone shows the full rectangular texture). Slight
   anti-aliased edge so the disc doesn't look pixelated at small size. */
const DISC_MASK = makeSoftDot({
  size: 128,
  stops: [
    [0, "rgba(255,255,255,1)"],
    [0.86, "rgba(255,255,255,1)"],
    [0.98, "rgba(255,255,255,0.4)"],
    [1, "rgba(255,255,255,0)"],
  ],
  mipmaps: true,
});

const PlanetBeacons = () => {
  const clock = useSceneClock();
  const textures = useLoader(THREE.TextureLoader, TEXTURE_URLS);
  const discRefs = useRef([]);
  const haloRefs = useRef([]);
  const _pos = useMemo(() => new THREE.Vector3(), []);

  /* Fix loaded textures for sprite use — no colorSpace mangling, no wrap. */
  useMemo(() => {
    textures.forEach((tex) => {
      if (!tex) return;
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 4;
    });
  }, [textures]);

  useFrame(({ camera, size }) => {
    const t = clock?.t || 0;
    const halfTan = Math.tan((camera.fov * Math.PI / 180) / 2);
    for (let i = 0; i < BODIES.length; i++) {
      const disc = discRefs.current[i];
      const halo = haloRefs.current[i];
      if (!disc) continue;
      orbitalPosition(BODIES[i], t, _pos);
      disc.position.copy(_pos);
      if (halo) halo.position.copy(_pos);
      const dist = camera.position.distanceTo(_pos);
      const worldPerPx = (2 * halfTan * dist) / size.height;
      const discSize = DISC_PX * worldPerPx;
      const haloSize = HALO_PX * worldPerPx;
      disc.scale.set(discSize, discSize, 1);
      if (halo) halo.scale.set(haloSize, haloSize, 1);
    }
  });

  return (
    <group frustumCulled={false} renderOrder={2}>
      {BODIES.map((b, i) => (
        <group key={b.id}>
          {/* soft coloured halo behind the disc — reads as the planet's
              palette accent without dominating the sprite */}
          <sprite
            ref={(el) => { haloRefs.current[i] = el; }}
            renderOrder={2}
          >
            <spriteMaterial
              map={HALO_SPRITE}
              color={b.accent || b.color || "#ffffff"}
              transparent
              opacity={0.55}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              toneMapped={false}
            />
          </sprite>
          {/* the planet's actual surface texture, billboarded, clipped
              to a circular disc via alphaMap */}
          <sprite
            ref={(el) => { discRefs.current[i] = el; }}
            renderOrder={3}
          >
            <spriteMaterial
              map={textures[i]}
              alphaMap={DISC_MASK}
              transparent
              depthWrite={false}
              toneMapped
            />
          </sprite>
        </group>
      ))}
    </group>
  );
};

export default PlanetBeacons;
