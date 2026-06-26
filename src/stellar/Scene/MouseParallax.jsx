 
import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

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
  const { pointer } = useThree();

  useFrame((_, dt) => {
    const d = Math.min(dt || 1 / 60, 1 / 20);
    /* pointer.x/y are normalised -1..1 across the canvas; y damped a touch */
    target.current.set(pointer.x, pointer.y * 0.6, 0);
    /* Frame-rate-independent so parallax feel matches every display. */
    offsetRef.current.lerp(target.current, 1 - Math.pow(1 - LERP_60, d * 60));
  });

  return null;
};

export default MouseParallax;
