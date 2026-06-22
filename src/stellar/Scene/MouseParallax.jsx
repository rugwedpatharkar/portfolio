/* eslint-disable react/no-unknown-property */
import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/*
 * Adds a subtle pointer-driven offset to the camera ("you breathe and
 * the camera shifts with you"). The actual position comes from
 * CameraRig — this only writes to an offsetRef the rig adds in.
 *
 * Strength is small (~0.45 world units max) so it never overpowers
 * the destination position. Lerped at 0.06 so it feels organic, not
 * jumpy.
 */

const MAX_OFFSET_XY = 0.45;
const LERP_60 = 0.06; // alpha at 60fps; rescaled by delta-time below

const MouseParallax = ({ offsetRef }) => {
  const target = useRef(new THREE.Vector3());
  const { pointer } = useThree();

  useFrame((_, dt) => {
    const d = Math.min(dt || 1 / 60, 1 / 20);
    /* pointer.x/y are normalised -1..1 across the canvas */
    target.current.set(
      pointer.x * MAX_OFFSET_XY,
      pointer.y * MAX_OFFSET_XY * 0.6,
      0
    );
    /* Frame-rate-independent so parallax feel matches every display. */
    offsetRef.current.lerp(target.current, 1 - Math.pow(1 - LERP_60, d * 60));
  });

  return null;
};

export default MouseParallax;
