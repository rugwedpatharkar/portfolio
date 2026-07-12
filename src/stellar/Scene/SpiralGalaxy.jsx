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

const DISC_RADIUS = 220;
const BULGE_RADIUS = 30;          // smaller core so the ARMS dominate, not the bulge
const BAR_LENGTH = 90;            // central bar half-length (barred-spiral: arms spring from its ends)
const BAR_WIDTH = 16;
/* Milky Way = barred spiral: 2 MAJOR arms (Scutum-Centaurus, Perseus) off the
   bar ends + 2 MINOR arms (Norma, Sagittarius) between them. Per-arm weight
   makes the majors brighter/denser than the minors. */
const ARMS = [
  { offset: 0.0,            major: true },   // Scutum-Centaurus (off +bar end)
  { offset: Math.PI,        major: true },   // Perseus (off −bar end)
  { offset: Math.PI * 0.5,  major: false },  // Sagittarius
  { offset: Math.PI * 1.5,  major: false },  // Norma
];
const ARM_PITCH = 0.17;           // TIGHTER winding → each arm sweeps ~1.7 turns (more "waves")
const ARM_WIDTH = 0.30;           // arm angular spread
const ARM_STARS_MAJOR = 15000;    // per major arm
const ARM_STARS_MINOR = 8000;     // per minor arm
const SPUR_STARS = 4000;          // the Orion Spur sub-branch (Sun's home)
const HALO_STARS = 24000;         // diffuse inter-arm disc
const BULGE_STARS = 8000;         // central bulge + bar
const HII_REGIONS = 1400;         // pink star-forming knots along the arms
const ARM_STARS_TOTAL = ARM_STARS_MAJOR * 2 + ARM_STARS_MINOR * 2;
const SOL_R = 0.62 * DISC_RADIUS; // Sun ~27,000 ly out
const SOL_ARM_OFFSET = 0.35;      // Orion Spur sits just off the Sagittarius arm

/* Warm yellow-white bulge → cool blue-white disc → dim edge — matches real
   spiral-galaxy colour photography (Andromeda reference). */
const CORE_TINT   = new THREE.Color("#fff0cf"); // core cream/gold — brighter, more dominant
const ARM_TINT    = new THREE.Color("#bcd4ff"); // arm blue-white (young stars)
const DUST_TINT   = new THREE.Color("#3a2a1c"); // dust lane brown — darker, more opaque
const HALO_TINT   = new THREE.Color("#6d7590"); // disc background stars
const HII_TINT    = new THREE.Color("#ff5c9e"); // pink Hα star-forming regions

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

/* Log-spiral arm position at radius r on the arm at `armOffset`, with an
   optional cross-arm angular `scatter`. Shared by the star cloud, the HII
   knots, and the sibling nebula/supernova layers so everything traces the
   SAME arms. Exported for GalaxyNebulae / Supernovae. */
const _scratch = new THREE.Vector3();

export function armSpiralPoint(armOffset, r, scatter, out) {
  const theta = armOffset + Math.log(r / BULGE_RADIUS) / ARM_PITCH + scatter;
  return (out || new THREE.Vector3()).set(Math.cos(theta) * r, 0, Math.sin(theta) * r);
}

/* Pick a random point along a random arm (majors weighted 2:1 over minors),
   biased mid→outer disc where star formation happens. Returns the vec + the
   fractional radius t. Used by the gas + supernova layers. */
const _MAJ = ARMS.filter((a) => a.major);
export function randomArmPoint(out, minT = 0.2, maxT = 0.98) {
  const arm = Math.random() < 0.7
    ? _MAJ[(Math.random() * _MAJ.length) | 0]
    : ARMS[(Math.random() * ARMS.length) | 0];
  const t = minT + Math.pow(Math.random(), 0.85) * (maxT - minT);
  const r = BULGE_RADIUS + t * (DISC_RADIUS - BULGE_RADIUS);
  const scatter = (Math.random() - 0.5) * ARM_WIDTH * 0.6;
  armSpiralPoint(arm.offset, r, scatter, out);
  return t;
}

/* Build the galaxy point cloud: central BAR + spheroidal bulge, 4 weighted
   log-spiral arms (2 major + 2 minor) springing from the bar ends, the Orion
   Spur sub-branch, pink HII knots, and a diffuse inter-arm disc — one draw
   call. */
function makeGalaxy() {
  const total = ARM_STARS_TOTAL + SPUR_STARS + HALO_STARS + BULGE_STARS + HII_REGIONS;
  const positions = new Float32Array(total * 3);
  const colors = new Float32Array(total * 3);
  const sizes = new Float32Array(total);
  const c = new THREE.Color();
  let idx = 0;

  const putArmStar = (armOffset, major) => {
    const t = Math.pow(Math.random(), 0.65);
    /* arms spring from the BAR ends, not the geometric centre */
    const r = BAR_LENGTH * 0.75 + t * (DISC_RADIUS - BAR_LENGTH * 0.75);
    const scatter = (Math.random() + Math.random() + Math.random() - 1.5) * ARM_WIDTH * (0.6 + 0.4 * (1 - t));
    armSpiralPoint(armOffset, r, scatter, _scratch);
    const zSpread = 3 + 7 * (1 - t);
    const z = (Math.random() + Math.random() + Math.random() - 1.5) * zSpread;
    positions[idx * 3    ] = _scratch.x;
    positions[idx * 3 + 1] = z;
    positions[idx * 3 + 2] = _scratch.z;
    const nearCore = 1 - t;
    /* young blue arm stars outer → warm cream toward the core */
    c.copy(ARM_TINT).lerp(CORE_TINT, nearCore * 0.65);
    /* dust lane along the inner edge of the arm */
    const dust = scatter < -ARM_WIDTH * 0.1 && scatter > -ARM_WIDTH * 0.95 && Math.random() < 0.4;
    if (dust) c.lerp(DUST_TINT, 0.82);
    const armW = major ? 1 : 0.66;
    const bright = (0.6 + 0.8 * nearCore) * (dust ? 0.2 : 1) * armW;
    colors[idx * 3    ] = c.r * bright;
    colors[idx * 3 + 1] = c.g * bright;
    colors[idx * 3 + 2] = c.b * bright;
    sizes[idx] = (2.4 + Math.random() * 4) * (0.7 + 0.3 * nearCore) * (major ? 1 : 0.85);
    idx++;
  };

  /* --- ARMS (2 major + 2 minor) --- */
  for (const arm of ARMS) {
    const n = arm.major ? ARM_STARS_MAJOR : ARM_STARS_MINOR;
    for (let i = 0; i < n; i++) putArmStar(arm.offset, arm.major);
  }

  /* --- ORION SPUR: a short bright sub-branch off the Sagittarius arm where
     the Sun lives — a small burst of young blue stars. */
  const sagArm = ARMS[2].offset;
  for (let i = 0; i < SPUR_STARS; i++) {
    const t = SOL_R / DISC_RADIUS + (Math.random() - 0.5) * 0.14;
    const r = t * DISC_RADIUS;
    const scatter = SOL_ARM_OFFSET + (Math.random() - 0.5) * 0.18;
    armSpiralPoint(sagArm, r, scatter, _scratch);
    positions[idx * 3    ] = _scratch.x;
    positions[idx * 3 + 1] = (Math.random() - 0.5) * 5;
    positions[idx * 3 + 2] = _scratch.z;
    c.copy(ARM_TINT).lerp(new THREE.Color("#e8f0ff"), Math.random() * 0.5);
    const bright = 0.7 + Math.random() * 0.4;
    colors[idx * 3    ] = c.r * bright;
    colors[idx * 3 + 1] = c.g * bright;
    colors[idx * 3 + 2] = c.b * bright;
    sizes[idx] = 2.2 + Math.random() * 3;
    idx++;
  }

  /* --- HII REGIONS strung along the arms (majors weighted) --- */
  for (let i = 0; i < HII_REGIONS; i++) {
    randomArmPoint(_scratch, 0.24, 0.96);
    positions[idx * 3    ] = _scratch.x;
    positions[idx * 3 + 1] = (Math.random() - 0.5) * 4;
    positions[idx * 3 + 2] = _scratch.z;
    c.copy(HII_TINT).lerp(new THREE.Color("#ff9ec4"), Math.random() * 0.5);
    const bright = 0.9 + Math.random() * 0.55;
    colors[idx * 3    ] = c.r * bright;
    colors[idx * 3 + 1] = c.g * bright;
    colors[idx * 3 + 2] = c.b * bright;
    sizes[idx] = 3.5 + Math.random() * 4.5;
    idx++;
  }

  /* --- BULGE + BAR: spheroidal core with an elongated bar through it (old
     gold stars). The bar is stretched along local X (arms spring from its
     ends at offset 0 / π). */
  for (let i = 0; i < BULGE_STARS; i++) {
    let x, y, zc;
    if (i % 5 < 2) {
      /* 40% → the BAR: long in X, narrow in Z, thin in Y */
      x = (Math.random() - 0.5) * 2 * BAR_LENGTH;
      zc = (Math.random() - 0.5) * 2 * BAR_WIDTH * (1 - Math.abs(x) / (BAR_LENGTH * 1.3));
      y = (Math.random() - 0.5) * BAR_WIDTH * 0.7;
    } else {
      /* 60% → the spheroidal bulge */
      const r = Math.pow(Math.random(), 1.7) * BULGE_RADIUS * 1.2;
      const phi = Math.random() * Math.PI * 2;
      const ct = 1 - Math.random() * 2;
      const st = Math.sqrt(1 - ct * ct);
      x = r * st * Math.cos(phi);
      zc = r * st * Math.sin(phi);
      y = r * ct * 0.5;
    }
    positions[idx * 3    ] = x;
    positions[idx * 3 + 1] = y;
    positions[idx * 3 + 2] = zc;
    const d = Math.hypot(x, zc) / BAR_LENGTH;
    const nearCentre = Math.max(0, 1 - d);
    c.copy(CORE_TINT).lerp(new THREE.Color("#ffc878"), 0.4 + 0.5 * (1 - nearCentre));
    const bright = 0.6 + 0.7 * nearCentre;
    colors[idx * 3    ] = c.r * bright;
    colors[idx * 3 + 1] = c.g * bright;
    colors[idx * 3 + 2] = c.b * bright;
    sizes[idx] = 2.2 + Math.random() * 3.5 + nearCentre * 2;
    idx++;
  }

  /* --- HALO/FIELD STARS: diffuse inter-arm disc so the plate reads filled. */
  for (let i = 0; i < HALO_STARS; i++) {
    const rt = Math.pow(Math.random(), 0.6);
    const r = BULGE_RADIUS + rt * (DISC_RADIUS - BULGE_RADIUS);
    const th = Math.random() * Math.PI * 2;
    const z = (Math.random() + Math.random() + Math.random() - 1.5) * 5;
    positions[idx * 3    ] = Math.cos(th) * r;
    positions[idx * 3 + 1] = z;
    positions[idx * 3 + 2] = Math.sin(th) * r;
    const nearCore = 1 - rt;
    c.copy(HALO_TINT).lerp(CORE_TINT, nearCore * 0.6);
    const bright = 0.7 + 0.4 * nearCore + Math.random() * 0.25;
    colors[idx * 3    ] = c.r * bright;
    colors[idx * 3 + 1] = c.g * bright;
    colors[idx * 3 + 2] = c.b * bright;
    sizes[idx] = 2 + Math.random() * 2.4 + nearCore * 1.2;
    idx++;
  }

  return { positions, colors, sizes };
}

/* Sol's position — on the Orion Spur, ~27,000 ly out, just off the
   Sagittarius arm. */
function solPosition(out) {
  return armSpiralPoint(ARMS[2].offset, SOL_R, SOL_ARM_OFFSET, out);
}

const SpiralGalaxy = ({ animate = true, solPulse = false }) => {
  const groupRef = useRef();
  const solRef = useRef();
  const clock = useSceneClock();

  const { positions, colors, sizes } = useMemo(() => makeGalaxy(), []);
  const solPos = useMemo(() => solPosition(new THREE.Vector3()), []);

  useFrame((state) => {
    if (animate && groupRef.current) {
      /* Slow rotation about the galactic pole. Sceneclock-driven so the
         reduced-motion consumer freezes it. */
      const t = clock?.t || 0;
      groupRef.current.rotation.y = t * 0.017;
    }
    /* Sol "you are here" pulse — gentle breathe on the pin. */
    if (solPulse && solRef.current) {
      const p = 1 + Math.sin(state.clock.elapsedTime * 1.8) * 0.28;
      solRef.current.scale.setScalar(11 * p);
      solRef.current.material.opacity = 0.75 + 0.25 * (p - 0.72);
    }
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
          size={6.2}
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

      {/* Core bulge — TAMED so the arms are the hero (was a frame-flooding
          3-layer blaze). A soft warm halo + a smaller bright core; the bar
          star cloud carries the rest of the centre's light. */}
      <sprite position={[0, 0, 0]} scale={[BULGE_RADIUS * 3.4, BULGE_RADIUS * 3.4, 1]}>
        <spriteMaterial map={BULGE_SPRITE} transparent opacity={0.42} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </sprite>
      <sprite position={[0, 0, 0]} scale={[BULGE_RADIUS * 1.7, BULGE_RADIUS * 1.7, 1]}>
        <spriteMaterial map={BULGE_SPRITE} color="#fff6e0" transparent opacity={0.8} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </sprite>

      {/* SOL PIN — a hot pinprick at the Sun's position on the Orion Spur;
          gently pulses when solPulse is on ("you are here"). */}
      <sprite ref={solRef} position={[solPos.x, solPos.y + 6, solPos.z]} scale={[11, 11, 1]}>
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

/* Shared arm geometry so sibling layers (DustLanes) trace the SAME arms. */
export const GALAXY_ARMS = ARMS;
export const GALAXY_DISC_RADIUS = DISC_RADIUS;
export const GALAXY_BULGE_RADIUS = BULGE_RADIUS;

export default SpiralGalaxy;
