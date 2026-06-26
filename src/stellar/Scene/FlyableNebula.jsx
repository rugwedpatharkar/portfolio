/* eslint-disable react/no-unknown-property */
import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useSceneClock } from "./SceneClock";

/*
 * A flyable, volumetric-feeling nebula cloud you can drift INTO.
 *
 * Two complementary readings of the same cloud:
 *
 *   - FROM OUTSIDE — a cluster of a few dozen soft additive billboards
 *     (canvas radial-gradient sprites, same recipe as Stars/Nebulae) packed
 *     into a rounded blob. Additive + low opacity + bloom gives it a glowing,
 *     gaseous body without a single hard edge.
 *
 *   - FROM INSIDE — once the camera crosses into the cloud radius, a colour
 *     veil locked to the camera fades in, ramping with how DEEP you are, so
 *     the screen softly hazes with the nebula's hue ("inside the cloud").
 *
 * HARD CONSTRAINT (see Scene/index.jsx): the inside-haze is IN-SCENE — a
 * sprite parented to the camera, NOT a postprocessing pass. A second post
 * effect stacks on the existing Bloom + CinematicGrade chain and whites out
 * the whole frame, so the veil MUST stay a scene-graph mesh.
 *
 * GPU-cheap: sprite positions + the texture are built once in useMemo; the
 * frame loop only writes existing object fields (no per-frame allocation —
 * scratch vectors are reused). Reduced-motion ⇒ no drift/shimmer, but the
 * proximity-driven veil stays (it's reactive to the pilot, not autonomous).
 */

/* Soft round puff — wide, gentle falloff so overlapping sprites melt into a
   continuous body rather than reading as distinct discs. White so the per-
   sprite tint (vertex/material colour) fully controls the hue. */
const PUFF_TEXTURE = (() => {
  if (typeof document === "undefined") return null;
  const size = 128;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,255,255,0.9)");
  g.addColorStop(0.25, "rgba(255,255,255,0.45)");
  g.addColorStop(0.55, "rgba(255,255,255,0.14)");
  g.addColorStop(0.8, "rgba(255,255,255,0.03)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c);
  t.minFilter = THREE.LinearMipmapLinearFilter;
  t.magFilter = THREE.LinearFilter;
  t.anisotropy = 4;
  t.needsUpdate = true;
  return t;
})();

/* Flat full-view veil for the "inside" haze — fully opaque-centre gradient
   that stays soft at the rim so the screen edges never show a sprite border
   when it's pulled right up to the near plane. */
const VEIL_TEXTURE = (() => {
  if (typeof document === "undefined") return null;
  const size = 128;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.6, "rgba(255,255,255,0.95)");
  g.addColorStop(1, "rgba(255,255,255,0.6)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c);
  t.needsUpdate = true;
  return t;
})();

/* Lush two-tone palette: cool teal/cyan body shading toward a violet/magenta
   core. Each puff samples a t along this ramp by its distance from centre. */
const RIM_COLOR = new THREE.Color("#2bd6c8"); // teal-cyan (outer)
const CORE_COLOR = new THREE.Color("#b65cff"); // violet-magenta (inner)
const VEIL_COLOR = new THREE.Color("#7be0e6"); // the hue you swim in

const PUFF_COUNT = 42;

const FlyableNebula = ({
  position = [-14, 6, -10],
  radius = 7,
  animate = true,
}) => {
  const sceneClock = useSceneClock();
  const { camera } = useThree();
  const groupRef = useRef();
  const veilRef = useRef();

  /* Scratch vectors — reused every frame, never reallocated. */
  const center = useMemo(() => new THREE.Vector3(...position), [position]);
  const scratch = useMemo(() => new THREE.Vector3(), []);
  const camLocal = useMemo(() => new THREE.Vector3(), []);

  /* Build the blob ONCE: per-puff local offset (inside `radius`), scale,
     tint along the rim→core ramp, and a phase for the drift shimmer. A
     deterministic LCG (seeded constant) keeps it stable across reloads and
     avoids Math.random() at module scope. */
  const puffs = useMemo(() => {
    let seed = 0x9e3779b1;
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 0xffffffff;
    };
    const out = [];
    const color = new THREE.Color();
    for (let i = 0; i < PUFF_COUNT; i++) {
      /* Cube-root radius ⇒ roughly uniform fill of the sphere (denser core
         falls out naturally from the colour ramp, not from clustering). */
      const u = rand();
      const v = rand();
      const r = radius * Math.cbrt(rand()) * 0.92;
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      scratch.setFromSphericalCoords(r, phi, theta);
      /* Squash vertically a touch so the cloud reads as a drifting bank,
         not a perfect ball. */
      const offset = [scratch.x, scratch.y * 0.72, scratch.z];
      const tNorm = r / radius; // 0 core … 1 rim
      color.copy(CORE_COLOR).lerp(RIM_COLOR, tNorm);
      out.push({
        offset,
        baseOffset: [...offset],
        scale: radius * (0.5 + rand() * 0.7),
        color: color.clone(),
        phase: rand() * Math.PI * 2,
        drift: 0.18 + rand() * 0.22,
      });
    }
    return out;
  }, [radius, scratch]);

  useFrame(() => {
    const t = animate && sceneClock ? sceneClock.t : 0;

    /* Gentle per-puff shimmer — sprites bob around their authored offset on
       the shared virtual clock, so it freezes under reduced-motion / pause
       and respects time control. Pure field writes, no allocation. */
    if (t > 0 && groupRef.current) {
      const kids = groupRef.current.children;
      for (let i = 0; i < kids.length; i++) {
        const p = puffs[i];
        const b = p.baseOffset;
        kids[i].position.set(
          b[0] + Math.sin(t * p.drift + p.phase) * 0.5,
          b[1] + Math.cos(t * p.drift * 0.8 + p.phase) * 0.4,
          b[2] + Math.sin(t * p.drift * 0.6 + p.phase * 1.7) * 0.5,
        );
      }
    }

    /* INSIDE-HAZE: how deep is the camera inside the cloud? 0 at the rim,
       1 near the core. The veil sprite is locked to the camera each frame
       (a hair in front of the near plane) so it fills the view — an in-scene
       mesh, never a post pass. */
    if (!veilRef.current) return;
    const dist = scratch.copy(camera.position).sub(center).length();
    const depth = THREE.MathUtils.clamp(1 - dist / radius, 0, 1);
    /* Ease so the veil only really blooms once you're properly inside, and
       cap it low so it hazes without blowing out the planets or bloom. */
    const opacity = depth * depth * 0.5;
    veilRef.current.material.opacity = opacity;
    veilRef.current.visible = opacity > 0.002;
    if (opacity > 0.002) {
      /* Park the veil just ahead of the camera in camera-local space, then
         convert to world — keeps it glued to the view at any orientation
         without parenting surgery on the shared camera. */
      camLocal.set(0, 0, -0.2).applyQuaternion(camera.quaternion).add(camera.position);
      veilRef.current.position.copy(camLocal);
      veilRef.current.quaternion.copy(camera.quaternion);
    }
  });

  return (
    <group>
      <group ref={groupRef} position={position}>
        {puffs.map((p, i) => (
          <sprite key={i} position={p.offset} scale={[p.scale, p.scale, 1]}>
            <spriteMaterial
              map={PUFF_TEXTURE}
              color={p.color}
              transparent
              opacity={0.16}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              toneMapped={false}
            />
          </sprite>
        ))}
      </group>

      {/* Inside-the-cloud colour veil — locked to the camera in useFrame.
          Normal blending (a soft tint, not additive) so it reads as haze you
          look THROUGH rather than a glow that washes the frame white. */}
      <sprite ref={veilRef} scale={[2.4, 2.4, 1]} renderOrder={9999} visible={false}>
        <spriteMaterial
          map={VEIL_TEXTURE}
          color={VEIL_COLOR}
          transparent
          opacity={0}
          depthWrite={false}
          depthTest={false}
          blending={THREE.NormalBlending}
          toneMapped={false}
        />
      </sprite>
    </group>
  );
};

export default FlyableNebula;
