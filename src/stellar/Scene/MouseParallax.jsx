
import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useSceneClock } from "./SceneClock";

/*
 * Adds a subtle pointer-driven offset to the camera ("you breathe and
 * the camera shifts with you"). The actual position comes from
 * CameraRig — this only writes to an offsetRef the rig adds in.
 *
 * Writes a NORMALISED pointer offset (-1..1); CameraRig scales it by the
 * framing distance so the sway is identical on every planet (small and large)
 * instead of violent up close and invisible far out. Lerped so it feels
 * organic, not jumpy.
 */

const LERP_60 = 0.06; // alpha at 60fps; rescaled by delta-time below

const MouseParallax = ({ offsetRef }) => {
  const target = useRef(new THREE.Vector3());
  const sceneClock = useSceneClock();
  const { pointer } = useThree();

  useFrame((_, dt) => {
    const d = Math.min(dt || 1 / 60, 1 / 20);
    /* §4.4: use the shared SceneClock time for the drift so the "handheld
       breath" wobble pauses coherently with everything else on time-scale
       change. (MouseParallax is already unmounted in reduced-motion so
       scale=0 doesn't apply here — but the shared clock keeps ×0.5 / ×2 /
       pause consistent across the app.) */
    const T = sceneClock.t;
    /* A slow, low-amplitude "handheld" drift layered under the pointer sway so a
       settled shot never feels frozen (documentary breath). Tiny, and only on
       desktop (this component is unmounted in reduced-motion / mobile). */
    const driftX = Math.sin(T * 0.23) * 0.11 + Math.sin(T * 0.07 + 1.3) * 0.05;
    const driftY = Math.cos(T * 0.19) * 0.07;
    /* pointer.x/y are normalised -1..1 across the canvas; y damped a touch */
    target.current.set(pointer.x + driftX, pointer.y * 0.6 + driftY, 0);
    /* Frame-rate-independent so parallax feel matches every display. */
    offsetRef.current.lerp(target.current, 1 - Math.pow(1 - LERP_60, d * 60));
  });

  return null;
};

export default MouseParallax;
