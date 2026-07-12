/* eslint-disable react/no-unknown-property */
/*
 * §6.4 / Phase 4 — shared additive 3D primitives.
 *
 * <PulseRing> — a thin expanding ring that fades to zero. Used for
 * the "shock front" / "expanding wavefront" pattern that appears in
 * Kilonova, GravWaveChirp, and DeepFieldMysteries.wowRing. The
 * component owns its own phase clock via useSceneClock so the caller
 * just declares "cycle every N seconds" and moves on. If you need to
 * gate visibility on a slice of the cycle (Kilonova only shows the
 * ring for phase < 0.32), pass `visibleWhile` — the mesh unmounts
 * outside the window instead of drawing at zero opacity.
 *
 * <Glow> — an additive spherical glow whose size + opacity you drive
 * from the outside (typically hooked to the same phase as a
 * PulseRing). Standard billboard behavior — always faces the camera
 * conceptually (a sphere works from any angle).
 *
 * Both primitives assume additive blending + depthWrite:false so they
 * layer cleanly with the Bloom pass. No mainImage of their own.
 */
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useSceneClock } from "../SceneClock";

/**
 * @param {object}   props
 * @param {string}   props.color        — ring color
 * @param {number}   props.period       — seconds per cycle (interval between ring births)
 * @param {number}   [props.activeFraction=1] — fraction of the period during which the ring is
 *                                              visible + expanding (default 1 = expands the whole
 *                                              cycle). Kilonova uses 0.32: a 14s cycle with the
 *                                              ring active for the first ~4.5s.
 * @param {number}   [props.startScale] — starting scale at localPh=0 (default 1)
 * @param {number}   [props.endScale]   — ending scale at localPh=1 (default 60)
 * @param {number}   [props.maxOpacity] — peak opacity at localPh=0 (default 0.55)
 * @param {boolean}  [props.flat]       — use flat ringGeometry instead of torus (DeepFieldMysteries.wowRing).
 * @param {number}   [props.innerR]     — flat ring inner radius (default 0.9) — only when flat
 * @param {number}   [props.outerR]     — flat ring outer radius (default 1.0) — only when flat
 * @param {number}   [props.tubeR]      — torus tube radius (default 0.04) — only when NOT flat
 * @param {number}   [props.radial]     — torus radial segments (default 8) — only when NOT flat
 * @param {number}   [props.tubular]    — segments count (radial for flat, tubular for torus; default 72)
 * @param {[number,number,number]} [props.rotation] — mesh rotation (default flat XZ)
 * @param {boolean}  [props.animate]    — reduced-motion pauses via SceneClock; extra kill-switch (default true)
 */
export function PulseRing({
  color,
  period,
  activeFraction = 1,
  startScale = 1,
  endScale = 60,
  maxOpacity = 0.55,
  flat = false,
  innerR = 0.9,
  outerR = 1.0,
  tubeR = 0.04,
  radial = 8,
  tubular = 72,
  rotation = [Math.PI / 2, 0, 0],
  animate = true,
}) {
  const ref = useRef();
  const sceneClock = useSceneClock();

  useFrame(() => {
    if (!ref.current || !animate) return;
    const rawPh = (sceneClock.t % period) / period;
    const on = rawPh < activeFraction;
    if (ref.current.visible !== on) ref.current.visible = on;
    if (!on) return;
    /* Local phase: normalize the active portion of the cycle to [0, 1] so
       the scale/opacity ramps span the "burst" window regardless of what
       fraction of the parent cycle it occupies. */
    const localPh = activeFraction >= 1 ? rawPh : rawPh / activeFraction;
    ref.current.scale.setScalar(startScale + (endScale - startScale) * localPh);
    ref.current.material.opacity = Math.max(0, 1 - localPh) * maxOpacity;
  });

  return (
    <mesh ref={ref} rotation={rotation}>
      {flat ? (
        <ringGeometry args={[innerR, outerR, tubular]} />
      ) : (
        <torusGeometry args={[1, tubeR, radial, tubular]} />
      )}
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0}
        side={flat ? THREE.DoubleSide : THREE.FrontSide}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

/**
 * Additive spherical glow. Static — the caller drives the scale + opacity
 * (usually from a shared phase computed elsewhere). Falls back to a sensible
 * default color if omitted.
 * @param {object} props
 * @param {string} [props.color="#ffffff"]
 * @param {number} [props.radius=1]
 * @param {number} [props.opacity=0.3]
 * @param {number} [props.segments=16]
 * @param {React.Ref} [props.innerRef] — expose the mesh ref to drive animation
 */
export function Glow({ color = "#ffffff", radius = 1, opacity = 0.3, segments = 16, innerRef }) {
  const geo = useMemo(
    () => new THREE.SphereGeometry(radius, segments, segments),
    [radius, segments]
  );
  return (
    <mesh ref={innerRef}>
      <primitive attach="geometry" object={geo} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}
