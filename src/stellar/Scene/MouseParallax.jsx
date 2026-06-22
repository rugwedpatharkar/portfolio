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
const LERP = 0.06;

const MouseParallax = ({ offsetRef }) => {
  const target = useRef(new THREE.Vector3());
  const { pointer } = useThree();

  useFrame(() => {
    /* pointer.x/y are normalised -1..1 across the canvas */
    target.current.set(
      pointer.x * MAX_OFFSET_XY,
      pointer.y * MAX_OFFSET_XY * 0.6,
      0
    );
    offsetRef.current.lerp(target.current, LERP);
  });

  return null;
};

export default MouseParallax;
