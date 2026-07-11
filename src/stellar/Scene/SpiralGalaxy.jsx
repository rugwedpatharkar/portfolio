/* eslint-disable react/no-unknown-property */
/*
 * The Milky Way seen from OUTSIDE — a top-down/3-quarter view of the whole
 * galaxy that the tour scrolls into after Pluto. Four logarithmic spiral
 * arms (Perseus, Sagittarius, Scutum-Centaurus, Norma), a bright yellow-
 * white central bulge, a thick disc of ~15k background stars, and a Sol
 * pin at ~27% out on the Orion Spur so the visitor sees themselves in the
 * galaxy at the "You are here" moment.
 *
 * Not to physical scale — this is a stylised, cinematic reveal that reads
 * as "our galaxy" without demanding literal 100,000-ly units. Rotation is
 * a very slow drift so the galaxy feels alive without becoming a merry-
 * go-round.
 */
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { makeSoftDot } from "./shared/textures";
import { useSceneClock } from "./SceneClock";

const DISC_RADIUS = 200;
const BULGE_RADIUS = 32;
const ARM_COUNT = 4;
const ARM_PITCH = 0.32;           // logarithmic spiral tightness (radians per unit ln r)
const ARM_WIDTH = 0.28;           // stddev of the arm's angular spread (radians)
const ARM_STARS = 4000;           // stars per arm
const HALO_STARS = 4000;          // diffuse background stars in the disc
const BULGE_STARS = 3500;         // stars in the central bulge
const SOL_R = 0.55 * DISC_RADIUS; // Sun's position out from centre (~27,000 ly / 50,000 ly disc)
const SOL_ARM_OFFSET = 0.35;      // fractional radians past Sagittarius arm (Orion Spur is a minor arm here)

/* Warm yellow-white bulge → cool blue-white disc → dim edge — matches
   real Milky Way colour photography. */
const CORE_TINT   = new THREE.Color("#ffe8b8"); // core cream/gold
const ARM_TINT    = new THREE.Color("#c8dcff"); // arm blue-white
const DUST_TINT   = new THREE.Color("#4a3520"); // dust lane brown
const HALO_TINT   = new THREE.Color("#7a8298"); // disc background stars

const STAR_SPRITE = makeSoftDot({
  size: 64,
  stops: [
    [0, "rgba(255,255,255,1)"],
    [0.3, "rgba(255,255,255,0.7)"],
    [1, "rgba(255,255,255,0)"],
  ],
  mipmaps: true,
});

const BULGE_SPRITE = makeSoftDot({
  size: 256,
  stops: [
    [0, "rgba(255,255,255,1)"],
    [0.12, "rgba(255,240,200,0.9)"],
    [0.35, "rgba(255,220,150,0.4)"],
    [0.7, "rgba(255,200,120,0.10)"],
    [1, "rgba(255,180,90,0)"],
  ],
  mipmaps: true,
});

const SOL_PIN_SPRITE = makeSoftDot({
  size: 128,
  stops: [
    [0, "rgba(255,255,255,1)"],
    [0.2, "rgba(255,244,200,0.9)"],
    [0.5, "rgba(255,220,150,0.3)"],
    [1, "rgba(255,200,120,0)"],
  ],
  mipmaps: true,
});

/* Build the spiral galaxy point cloud. Four log-spiral arms + a spheroidal
   bulge + a diffuse disc halo of "field" stars filling the plane between
   arms. All in one geometry to save draw calls. */
function makeGalaxy() {
  const total = ARM_STARS * ARM_COUNT + HALO_STARS + BULGE_STARS;
  const positions = new Float32Array(total * 3);
  const colors = new Float32Array(total * 3);
  const sizes = new Float32Array(total);
  const c = new THREE.Color();
  let idx = 0;

  /* --- ARMS: r = R0·exp(pitch · θ), each arm offset by 2π/N in θ. Sample
     stars along ln(r) uniformly to get natural log-spiral density that's
     bright inside and thins outward. */
  for (let a = 0; a < ARM_COUNT; a++) {
    const armOffset = (a / ARM_COUNT) * Math.PI * 2;
    for (let i = 0; i < ARM_STARS; i++) {
      /* Distribute along the arm: t in [0,1], radius grows exponentially. */
      const t = Math.pow(Math.random(), 0.6); // more density near centre
      const r = BULGE_RADIUS + t * (DISC_RADIUS - BULGE_RADIUS);
      /* Log-spiral phase along the arm. */
      const theta = armOffset + Math.log(r / BULGE_RADIUS) / ARM_PITCH;
      /* Cross-arm scatter (perpendicular to arm direction) — gaussian-ish. */
      const scatter = (Math.random() + Math.random() + Math.random() - 1.5) * ARM_WIDTH * (0.6 + 0.4 * (1 - t));
      const th = theta + scatter;
      /* Off-plane thickness thins outward — real spirals are dead-flat in
         the outer disc, puff up near the core. */
      const zSpread = 3 + 8 * (1 - t);
      const z = (Math.random() + Math.random() + Math.random() - 1.5) * zSpread;

      positions[idx * 3    ] = Math.cos(th) * r;
      positions[idx * 3 + 1] = z;
      positions[idx * 3 + 2] = Math.sin(th) * r;

      /* Colour: warm cream near core, cool blue-white in the arms, occasional
         reddish-brown dust patch where the arm ridge is (small scatter). */
      const nearCore = 1 - t;
      c.copy(ARM_TINT).lerp(CORE_TINT, nearCore * 0.7);
      /* Dust lane on the inner edge of the arm — dim + brownward. */
      const dustBias = Math.abs(scatter) < ARM_WIDTH * 0.35 ? Math.random() < 0.18 : false;
      if (dustBias) c.lerp(DUST_TINT, 0.6);
      const bright = (0.55 + 0.85 * nearCore) * (dustBias ? 0.4 : 1);
      colors[idx * 3    ] = c.r * bright;
      colors[idx * 3 + 1] = c.g * bright;
      colors[idx * 3 + 2] = c.b * bright;

      sizes[idx] = (2.2 + Math.random() * 3.8) * (0.7 + 0.3 * nearCore);
      idx++;
    }
  }

  /* --- BULGE: dense spheroidal star cloud in the centre. */
  for (let i = 0; i < BULGE_STARS; i++) {
    const r = Math.pow(Math.random(), 1.8) * BULGE_RADIUS * 1.15;
    const phi = Math.random() * Math.PI * 2;
    const costheta = 1 - Math.random() * 2;
    const sintheta = Math.sqrt(1 - costheta * costheta);
    /* Squash to an oblate spheroid: half as thick as it is wide. */
    positions[idx * 3    ] = r * sintheta * Math.cos(phi);
    positions[idx * 3 + 1] = r * costheta * 0.5;
    positions[idx * 3 + 2] = r * sintheta * Math.sin(phi);

    /* Core is hot yellow-white, edges warmer/dimmer. */
    const nearCentre = 1 - (r / (BULGE_RADIUS * 1.15));
    c.copy(CORE_TINT).lerp(new THREE.Color("#ffcf88"), 1 - nearCentre);
    const bright = 0.7 + 0.9 * nearCentre;
    colors[idx * 3    ] = c.r * bright;
    colors[idx * 3 + 1] = c.g * bright;
    colors[idx * 3 + 2] = c.b * bright;

    sizes[idx] = (2.4 + Math.random() * 4) * (0.7 + 0.3 * nearCentre);
    idx++;
  }

  /* --- HALO/FIELD STARS: thin, diffuse disc filling the space between arms. */
  for (let i = 0; i < HALO_STARS; i++) {
    const r = BULGE_RADIUS + Math.pow(Math.random(), 0.7) * (DISC_RADIUS - BULGE_RADIUS);
    const th = Math.random() * Math.PI * 2;
    const z = (Math.random() + Math.random() + Math.random() - 1.5) * 5;
    positions[idx * 3    ] = Math.cos(th) * r;
    positions[idx * 3 + 1] = z;
    positions[idx * 3 + 2] = Math.sin(th) * r;

    c.copy(HALO_TINT);
    const bright = 0.35 + Math.random() * 0.4;
    colors[idx * 3    ] = c.r * bright;
    colors[idx * 3 + 1] = c.g * bright;
    colors[idx * 3 + 2] = c.b * bright;
    sizes[idx] = 1.6 + Math.random() * 2.2;
    idx++;
  }

  return { positions, colors, sizes };
}

/* Sol's position in the galaxy — on the Orion Spur, ~27,000 ly from centre
   ≈ 55% of the way out to the visible disc edge. Placed on the trailing
   side of the Sagittarius arm (where the real Orion Spur is). */
function solPosition(out) {
  const arm = 1; // second arm = Sagittarius (0=Perseus, 1=Sag, 2=Scutum, 3=Norma)
  const armOffset = (arm / ARM_COUNT) * Math.PI * 2;
  const theta = armOffset + Math.log(SOL_R / BULGE_RADIUS) / ARM_PITCH + SOL_ARM_OFFSET;
  return out.set(Math.cos(theta) * SOL_R, 0, Math.sin(theta) * SOL_R);
}

const SpiralGalaxy = ({ animate = true }) => {
  const groupRef = useRef();
  const clock = useSceneClock();

  const { positions, colors, sizes } = useMemo(() => makeGalaxy(), []);
  const solPos = useMemo(() => solPosition(new THREE.Vector3()), []);

  useFrame(() => {
    if (!animate || !groupRef.current) return;
    /* Slow rotation about the galactic pole. Sceneclock-driven so the
       reduced-motion consumer freezes it. Full turn ≈ 6 minutes at scale
       1 — glacial but not motionless. */
    const t = clock?.t || 0;
    groupRef.current.rotation.y = t * 0.017;
  });

  return (
    <group ref={groupRef}>
      {/* Star point cloud — arms + bulge + halo, one draw call. */}
      <points frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
          <bufferAttribute attach="attributes-color" count={colors.length / 3} array={colors} itemSize={3} />
          <bufferAttribute attach="attributes-size" count={sizes.length} array={sizes} itemSize={1} />
        </bufferGeometry>
        <pointsMaterial
          size={4.6}
          sizeAttenuation
          vertexColors
          transparent
          opacity={0.95}
          depthWrite={false}
          map={STAR_SPRITE}
          alphaTest={0.01}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </points>

      {/* Soft central bulge glow — an additive sprite that gives the core
          the diffuse yellow-white blaze real spirals photograph with. */}
      <sprite position={[0, 0, 0]} scale={[BULGE_RADIUS * 3.4, BULGE_RADIUS * 3.4, 1]}>
        <spriteMaterial
          map={BULGE_SPRITE}
          transparent
          opacity={0.9}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </sprite>

      {/* SOL PIN — a hot yellow-white pinprick at the Sun's position, riding
          on the Orion Spur. This is the "you are here" moment. */}
      <sprite position={[solPos.x, solPos.y + 6, solPos.z]} scale={[9, 9, 1]}>
        <spriteMaterial
          map={SOL_PIN_SPRITE}
          color="#fff2a8"
          transparent
          opacity={1.0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </sprite>
    </group>
  );
};

/* Sol's live world-space position on the galaxy disc — exposed so the
   camera pose can frame the pin cleanly. */
SpiralGalaxy.SOL = solPosition(new THREE.Vector3());
SpiralGalaxy.DISC_RADIUS = DISC_RADIUS;

export default SpiralGalaxy;
