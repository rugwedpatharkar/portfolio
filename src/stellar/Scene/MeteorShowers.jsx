/* eslint-disable react/no-unknown-property */
/*
 * MeteorShowers.jsx — meteor physics, done right.
 *
 * Replaces the earlier Meteors + ShootingStars files, which were
 * elongated boxGeometry rectangles that read as bars in the frame.
 *
 * Real astronomy in play:
 *
 *   1. RADIANTS. All meteors of a shower travel PARALLEL to Earth's motion
 *      through their parent comet's debris stream. Perspective makes those
 *      parallel paths appear to emanate from one point in the sky — the
 *      "radiant" — always inside its parent constellation. Below we carry
 *      the seven headline annual showers plus a Sporadic background from
 *      random directions. RA / Dec are the IAU-listed values.
 *
 *   2. STREAKS. A meteor is a MILLIMETRE-scale dust grain hitting the upper
 *      atmosphere at ~40–70 km/s. It ionises a thin column of air at ~90–120
 *      km altitude → a bright HEAD and a rapidly-fading TRAIN behind it.
 *      Nothing about the streak is rectangular. We render each meteor as
 *      a strip of soft additive sprites — the head is bright + tight, the
 *      trail's sprites step behind it at fading opacity and grow slightly,
 *      so the shape reads as a smooth glowing streak that thins into space.
 *
 *   3. COLOUR. Composition maps to visible colour. Sodium-rich chondritic
 *      dust glows YELLOW-ORANGE. Magnesium (in most stony fragments) burns
 *      cyan-white. Iron burns pale gold. Bolides can flare GREEN (mag).
 *      Each shower carries a base tint plus a small random hue shift.
 *
 *   4. BOLIDES. Roughly one meteor in 40 is bright enough (mag < −4) to be
 *      a fireball. Bolides get a bigger head, longer trail, and a chance to
 *      FRAGMENT near the end — a bright flash spawns two or three small
 *      offspring meteors that break away at slight angles.
 *
 *   5. GEOMETRY. Meteors near the radiant appear SHORT (foreshortened along
 *      the line of sight); meteors far from the radiant appear LONG. We
 *      spawn each streak at a random offset around the radiant direction
 *      and orient its travel outward from the radiant, so the geometry
 *      obeys this rule naturally.
 *
 *   6. FRAME. The radiant + meteors live in world space RELATIVE TO THE
 *      CAMERA (fixed offset applied each frame). At the AU-scale tour we're
 *      thousands of scene units from origin; a fixed absolute radiant would
 *      subtend a sub-degree arc and be invisible. Anchoring to the camera
 *      keeps the shower on-screen at every planet stop.
 *
 * See docs/architecture/knowledge-foundation.md for citation practice.
 * Refs:
 *   IAU Meteor Data Center — https://www.ta3.sk/IAUC22DB/MDC2007/
 *   Jenniskens, "Meteor Showers and their Parent Comets" (2006).
 */
import { useMemo, useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { makeSoftDot } from "./shared/textures";

/* ────────────────────────────────────────────────────────────────────────
 * Shower catalogue — IAU annual majors + Sporadic background.
 *
 * `radiantRA` is in hours; `radiantDec` in degrees. Both in the equatorial
 * frame (ICRS/J2000). We convert to a scene unit vector below.
 * `zhrShare` is the relative rate — used to weight which shower a new
 * meteor draws from. Values are gentled from real ZHR so a busy Perseid
 * night doesn't drown the frame.
 * `tint` is the base head/train colour; per-instance the hue jitters ±small.
 * `parent` is the debris source (usually a comet; Geminids and Quadrantids
 * are asteroidal exceptions).
 */
const SHOWERS = [
  { name: "Perseids",      radiantRA: 3.12,  radiantDec:  58, zhrShare: 0.14, tint: "#e5f2ff", parent: "109P/Swift-Tuttle" },
  { name: "Geminids",      radiantRA: 7.47,  radiantDec:  32, zhrShare: 0.15, tint: "#ffe0a8", parent: "(3200) Phaethon" },
  { name: "Leonids",       radiantRA: 10.13, radiantDec:  22, zhrShare: 0.04, tint: "#a8e4ff", parent: "55P/Tempel-Tuttle" },
  { name: "Quadrantids",   radiantRA: 15.33, radiantDec:  49, zhrShare: 0.13, tint: "#c8ecff", parent: "(196256) 2003 EH1" },
  { name: "Lyrids",        radiantRA: 18.07, radiantDec:  34, zhrShare: 0.03, tint: "#fff2c8", parent: "C/1861 G1 (Thatcher)" },
  { name: "Orionids",      radiantRA: 6.33,  radiantDec:  16, zhrShare: 0.05, tint: "#d4f2c8", parent: "1P/Halley" },
  { name: "Eta Aquariids", radiantRA: 22.50, radiantDec:  -1, zhrShare: 0.06, tint: "#d0e0ff", parent: "1P/Halley" },
  /* Sporadic background — no radiant; each meteor picks a random direction
     biased toward the camera's forward hemisphere. Weighted highest because
     the tour camera aims in different directions at each stop, and shower
     radiants are only visible when the camera happens to face them. Real
     nights have roughly a 60/40 shower/sporadic split near a peak; the
     visitor's camera framing tilts this toward sporadic. */
  { name: "Sporadic",      radiantRA: null,  radiantDec: null, zhrShare: 0.40, tint: "#fff8e6", parent: "background" },
];

/* Pre-compute cumulative distribution so the per-meteor draw is O(log n). */
const CUM = (() => {
  const c = [];
  let sum = 0;
  for (const s of SHOWERS) { sum += s.zhrShare; c.push(sum); }
  return { totals: c, sum };
})();

const OBLIQUITY = 23.44 * Math.PI / 180;

/* Convert equatorial (RA hours, Dec deg) → unit vector in the scene frame.
   IDENTICAL to Stars.jsx / MilkyWay.jsx / LocalNeighborhood.jsx so every
   sky-fixed body agrees on where a direction points. */
function radiantVec(raH, decD, out) {
  const ra = raH * Math.PI / 12;
  const dec = decD * Math.PI / 180;
  const cd = Math.cos(dec);
  const xe = cd * Math.cos(ra);
  const ye = cd * Math.sin(ra);
  const ze = Math.sin(dec);
  const cosE = Math.cos(OBLIQUITY);
  const sinE = Math.sin(OBLIQUITY);
  return out.set(xe, -ye * sinE + ze * cosE, ye * cosE + ze * sinE).normalize();
}

/* ────────────────────────────────────────────────────────────────────────
 * Buffer sizing.
 *
 * Each meteor has HEAD + TRAIL_LEN sprites — one bright head sample and a
 * short train of decaying sprites just behind it. All meteors share a
 * single Points draw call.
 */
const METEORS = 120;         // active meteors in flight at once
const TRAIL_LEN = 14;         // trail samples per meteor
const POINTS_PER_METEOR = TRAIL_LEN + 1;
const TOTAL_POINTS = METEORS * POINTS_PER_METEOR;

/* Head sprite — a soft round dot with a bright core + short fade. Used for
   every point in the Points draw; each point picks its own size + colour +
   opacity via attributes. */
const HEAD_SPRITE = makeSoftDot({
  size: 96,
  stops: [
    [0, "rgba(255,255,255,1)"],
    [0.25, "rgba(255,255,255,0.6)"],
    [0.55, "rgba(255,255,255,0.14)"],
    [1, "rgba(255,255,255,0)"],
  ],
  mipmaps: true,
});

/* Vertex + fragment shaders. `aSize` sizes the head (bigger for bolides,
   smaller for trail samples). `aColor` carries the per-point RGB (fades
   along the trail); `aOpacity` decays with train position + meteor life. */
const VERT = /* glsl */ `
  attribute float aSize;
  attribute vec3 aColor;
  attribute float aOpacity;
  varying vec3 vColor;
  varying float vOpacity;
  void main() {
    vColor = aColor;
    vOpacity = aOpacity;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    /* Distance attenuation kept mild — meteors ride NEAR the camera, so a
       hard 1/z ramp would swell them uncontrollably. Clamped to avoid the
       pathological zoom-in size. */
    gl_PointSize = clamp(aSize * (200.0 / -mv.z), 1.5, 44.0);
    gl_Position = projectionMatrix * mv;
  }
`;
const FRAG = /* glsl */ `
  uniform sampler2D uMap;
  varying vec3 vColor;
  varying float vOpacity;
  void main() {
    float a = texture2D(uMap, gl_PointCoord).a * vOpacity;
    if (a < 0.02) discard;
    gl_FragColor = vec4(vColor * a, a);
  }
`;

/* ────────────────────────────────────────────────────────────────────────
 * Scratch — allocated once at module load so per-frame updates never GC. */
const _radiant = new THREE.Vector3();
const _cross1 = new THREE.Vector3();
const _cross2 = new THREE.Vector3();
const _spawnOffset = new THREE.Vector3();
const _headPos = new THREE.Vector3();
const _stepBack = new THREE.Vector3();
const _base = new THREE.Vector3();
const _tint = new THREE.Color();
const _WORLD_UP = new THREE.Vector3(0, 1, 0);

/* Pick a shower from the CDF. Sporadic pulls from `null` radiant → a
   fully random direction. */
function pickShower() {
  const r = Math.random() * CUM.sum;
  for (let i = 0; i < CUM.totals.length; i++) {
    if (r <= CUM.totals[i]) return SHOWERS[i];
  }
  return SHOWERS[SHOWERS.length - 1];
}

/* Fresh meteor state. Direction of travel + spawn point are computed
   RELATIVE to the radiant — the meteor emerges from a random point close
   to the radiant and streaks outward, so its angular distance from the
   radiant grows through its life (real perspective behaviour). Bolides
   are drawn ~2.5% of the time, brighter + longer + able to fragment. */
function spawn(m, cameraDir) {
  const shower = pickShower();
  m.shower = shower.name;

  /* Radiant unit vector in the sky. Sporadic → random. */
  if (shower.radiantRA === null) {
    /* Random unit vector, weighted a bit toward the FORWARD direction of
       the camera so the sporadic streaks are on-screen more often. */
    _radiant
      .set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5)
      .normalize()
      .lerp(cameraDir, 0.4)
      .normalize();
  } else {
    radiantVec(shower.radiantRA, shower.radiantDec, _radiant);
  }

  /* Build an in-plane basis {u, v} perpendicular to the radiant so we can
     offset the spawn point sideways from the radiant direction. */
  _cross1.copy(_WORLD_UP);
  if (Math.abs(_radiant.dot(_cross1)) > 0.98) _cross1.set(1, 0, 0);
  _cross1.crossVectors(_radiant, _cross1).normalize();
  _cross2.crossVectors(_radiant, _cross1).normalize();

  /* Radial offset ~5–35° from the radiant, azimuth uniform. Farther means
     longer visible streaks. */
  const ang = (5 + Math.random() * 30) * Math.PI / 180;
  const az = Math.random() * Math.PI * 2;
  _spawnOffset
    .copy(_radiant)
    .multiplyScalar(Math.cos(ang))
    .addScaledVector(_cross1, Math.sin(ang) * Math.cos(az))
    .addScaledVector(_cross2, Math.sin(ang) * Math.sin(az))
    .normalize();

  /* Physical distance from camera. Meteors are in the atmosphere (~100 km),
     but here we place them at ~80 scene units from the camera so they read
     as sky-fixed streaks against the star backdrop. */
  const RANGE = 80;
  m.spawnDir = _spawnOffset.clone();
  m.range = RANGE;
  /* Motion direction: outward from the radiant, tangent to the sky sphere
     at the spawn point (perpendicular to the spawn direction, toward the
     side away from the radiant). This gives the correct perspective:
     meteors move AWAY from the radiant across the sky. */
  const bolide = Math.random() < 0.025;
  m.bolide = bolide;
  m.travel = _spawnOffset.clone().addScaledVector(_radiant, -1).normalize();

  /* Life + speed: bolides last longer and travel more slowly (real
     fireballs are slower relative to typical meteor durations). */
  m.life = 0;
  m.maxLife = bolide ? (1.6 + Math.random() * 1.4) : (0.35 + Math.random() * 1.2);
  m.speed = bolide ? (18 + Math.random() * 14) : (34 + Math.random() * 32);

  /* Trail length in seconds (real trails persist briefly). Bolides carry
     longer, wider trains. */
  m.trailSeconds = bolide ? 0.55 : 0.22;
  m.headSize = bolide ? 26 : (8 + Math.random() * 6);

  /* Colour — base shower tint jittered slightly, then bolides can flash
     green/orange briefly at their brightest moments. */
  _tint.set(shower.tint);
  const hueJitter = (Math.random() - 0.5) * 0.05;
  const { h, s, l } = { h: 0, s: 0, l: 0 };
  _tint.getHSL({ h, s, l });
  _tint.setHSL(h + hueJitter, s, l);
  m.color = _tint.clone();
  m.bolideFlash = bolide && Math.random() < 0.55; // ~half of bolides flare

  /* Fragmentation — reserved so `update()` can spawn offspring. */
  m.fragmented = false;

  /* Startup delay — first appearance is staggered so meteors don't all
     ignite in unison at mount time. */
  m.delay = Math.random() * 4.5;
  m.spawned = false;
}

/* ────────────────────────────────────────────────────────────────────────
 * Component. */
const MeteorShowers = ({ animate = true }) => {
  const geomRef = useRef();
  const matRef = useRef();

  /* Per-meteor state — parallel to the buffer geometry. */
  const meteors = useMemo(
    () => Array.from({ length: METEORS }, () => ({})),
    [],
  );

  /* Buffer attributes. Position holds the ACTUAL world position of every
     point (head + trail samples). aSize / aColor / aOpacity carry the
     per-point render params so the shader has everything it needs. */
  const positions = useMemo(() => new Float32Array(TOTAL_POINTS * 3), []);
  const sizes = useMemo(() => new Float32Array(TOTAL_POINTS), []);
  const colors = useMemo(() => new Float32Array(TOTAL_POINTS * 3), []);
  const opacities = useMemo(() => new Float32Array(TOTAL_POINTS), []);

  const cameraDirRef = useRef(new THREE.Vector3(0, 0, -1));

  useEffect(() => {
    /* Cold-start every meteor. We seed cameraDir with (0,0,-1) since we
       don't have the camera at effect time; the first useFrame will
       replace it. */
    meteors.forEach((m) => spawn(m, cameraDirRef.current));
  }, [meteors]);

  useFrame(({ camera }, delta) => {
    if (!animate) return;
    const d = Math.min(delta, 1 / 20);

    /* Camera forward direction (rough — for weighting sporadic direction
       and anchoring the shower to on-screen space). */
    camera.getWorldDirection(cameraDirRef.current);

    for (let i = 0; i < METEORS; i++) {
      const m = meteors[i];
      const base = i * POINTS_PER_METEOR;

      /* useFrame can fire on the first render before the mount-effect
         seeds the pool, so guard against uninitialised meteor state
         instead of dereferencing undefined spawnDir/travel vectors. */
      if (!m.spawnDir) {
        for (let k = 0; k <= TRAIL_LEN; k++) opacities[base + k] = 0;
        continue;
      }
      if (m.delay > 0) {
        m.delay -= d;
        for (let k = 0; k <= TRAIL_LEN; k++) opacities[base + k] = 0;
        continue;
      }
      if (!m.spawned) m.spawned = true;

      m.life += d;
      if (m.life >= m.maxLife) {
        /* Bolide fragmentation: at the end of a bolide's life, spawn 2-3
           small child meteors branching off from the head in slight-angle
           directions — the visible burst of a real fireball terminal flash.
           Approximated: we simply respawn nearby meteors (steal from the
           free pool) with short lifetimes + the parent's colour. */
        if (m.bolide && !m.fragmented) {
          m.fragmented = true;
          const shards = 1 + Math.floor(Math.random() * 3);
          for (let s = 0; s < shards; s++) {
            /* Find a free slot: nearest meteor whose delay hasn't started. */
            const victim = meteors[(i + 1 + s + Math.floor(Math.random() * 6)) % METEORS];
            spawn(victim, cameraDirRef.current);
            victim.color.copy(m.color);
            victim.headSize = 8 + Math.random() * 4;
            victim.maxLife = 0.35 + Math.random() * 0.25;
            victim.speed = 26 + Math.random() * 18;
            victim.delay = 0; // ignite now
            victim.spawned = true;
            victim.bolide = false;
            /* Nudge the child's direction sideways off the parent. */
            const jitter = new THREE.Vector3(
              (Math.random() - 0.5) * 0.4,
              (Math.random() - 0.5) * 0.4,
              (Math.random() - 0.5) * 0.4,
            );
            victim.travel.copy(m.travel).add(jitter).normalize();
          }
        }
        /* Respawn as a fresh meteor from the show catalogue. */
        spawn(m, cameraDirRef.current);
        continue;
      }

      /* Head position in world: (camera + spawnDir * range) + travel * (speed × life).
         Meteor sits on a sphere of radius `range` around the camera; travel
         steps it laterally across that sphere. Result reads as a fixed-
         distance sky-anchored streak. */
      _base.copy(m.spawnDir).multiplyScalar(m.range).add(camera.position);
      _headPos.copy(_base).addScaledVector(m.travel, m.speed * m.life);

      /* Brightness envelope: quick rise + long fade. Bolides ramp brighter
         at their mid-life and can flash. */
      const lifeFrac = m.life / m.maxLife;
      let rise = Math.min(1, lifeFrac * 10);
      let fade = 1 - lifeFrac;
      fade *= fade; // quadratic tail
      let bright = rise * fade * 1.4;
      if (m.bolide) {
        bright *= 1.9;
        if (m.bolideFlash && lifeFrac > 0.55 && lifeFrac < 0.72) bright *= 2.3; // terminal flash
      }
      bright = Math.max(0, bright);

      const r = m.color.r * bright;
      const g = m.color.g * bright;
      const b = m.color.b * bright;

      /* HEAD sample — index 0 of the meteor block. Bright, tight. */
      positions[base * 3 + 0] = _headPos.x;
      positions[base * 3 + 1] = _headPos.y;
      positions[base * 3 + 2] = _headPos.z;
      sizes[base] = m.headSize;
      colors[base * 3 + 0] = r;
      colors[base * 3 + 1] = g;
      colors[base * 3 + 2] = b;
      opacities[base] = Math.min(1, bright * 1.4);

      /* TRAIL samples — step backward from the head along `-travel`,
         with each sample carrying the head's position at a moment ago. */
      const stepDist = m.speed * (m.trailSeconds / TRAIL_LEN);
      _stepBack.copy(m.travel).multiplyScalar(-stepDist);
      let sx = _headPos.x;
      let sy = _headPos.y;
      let sz = _headPos.z;
      for (let k = 1; k <= TRAIL_LEN; k++) {
        sx += _stepBack.x;
        sy += _stepBack.y;
        sz += _stepBack.z;
        const idx = base + k;
        positions[idx * 3 + 0] = sx;
        positions[idx * 3 + 1] = sy;
        positions[idx * 3 + 2] = sz;
        /* Trail sprites shrink slightly toward the tip, opacity falls off
           faster than size so the trail thins into space. */
        const t = k / TRAIL_LEN;
        const decay = (1 - t) * (1 - t);
        sizes[idx] = m.headSize * (0.85 - 0.55 * t);
        opacities[idx] = decay * bright * 0.85;
        colors[idx * 3 + 0] = r * (0.85 + 0.15 * (1 - t));
        colors[idx * 3 + 1] = g * (0.85 + 0.15 * (1 - t));
        colors[idx * 3 + 2] = b * (0.85 + 0.15 * (1 - t));
      }
    }

    if (geomRef.current) {
      geomRef.current.attributes.position.needsUpdate = true;
      geomRef.current.attributes.aSize.needsUpdate = true;
      geomRef.current.attributes.aColor.needsUpdate = true;
      geomRef.current.attributes.aOpacity.needsUpdate = true;
    }
  });

  /* Dispose GPU resources on unmount (Scene toggles motion/reduced-motion
     gates via the SCENE_OBJECTS registry, so this can go away). */
  useEffect(() => () => {
    const geom = geomRef.current;
    const mat = matRef.current;
    if (geom) geom.dispose();
    if (mat) mat.dispose();
  }, []);

  return (
    <points frustumCulled={false}>
      <bufferGeometry ref={geomRef}>
        <bufferAttribute attach="attributes-position" count={TOTAL_POINTS} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-aSize" count={TOTAL_POINTS} array={sizes} itemSize={1} />
        <bufferAttribute attach="attributes-aColor" count={TOTAL_POINTS} array={colors} itemSize={3} />
        <bufferAttribute attach="attributes-aOpacity" count={TOTAL_POINTS} array={opacities} itemSize={1} />
      </bufferGeometry>
      <shaderMaterial
        ref={matRef}
        vertexShader={VERT}
        fragmentShader={FRAG}
        uniforms={{ uMap: { value: HEAD_SPRITE } }}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </points>
  );
};

export default MeteorShowers;
