/* eslint-disable react/no-unknown-property */
import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { DESTINATIONS } from "../config/destinations";

/*
 * Camera controller. Consumes a normalized scroll value (0..1) and
 * interpolates the camera between destination cameraTargets along the
 * tour route.
 *
 * Implementation: build a Catmull-Rom spline through all cameraTarget
 * positions + a parallel spline through all lookAt targets. Sample both
 * splines at the current scroll t. Smooth, continuous, no popping.
 *
 * Performance: this is the ONLY thing that mutates camera per frame.
 * Camera matrix update is ~0.1 ms. Cheap.
 */

const CameraRig = ({ scrollT, controlsEnabled }) => {
  const { camera } = useThree();
  const lookAtTarget = useRef(new THREE.Vector3(0, 0, 0));

  // Build splines once
  const splines = useRef(null);
  if (!splines.current) {
    const camPoints = DESTINATIONS.map(
      (d) => new THREE.Vector3(...d.cameraTarget.position)
    );
    const lookPoints = DESTINATIONS.map(
      (d) => new THREE.Vector3(...d.cameraTarget.lookAt)
    );
    splines.current = {
      cam: new THREE.CatmullRomCurve3(camPoints, false, "catmullrom", 0.4),
      look: new THREE.CatmullRomCurve3(lookPoints, false, "catmullrom", 0.4),
    };
  }

  // Initial pose
  useEffect(() => {
    const initial = DESTINATIONS[0].cameraTarget;
    camera.position.set(...initial.position);
    lookAtTarget.current.set(...initial.lookAt);
    camera.lookAt(lookAtTarget.current);
  }, [camera]);

  useFrame(() => {
    if (controlsEnabled) return; // OrbitControls owns the camera
    const t = THREE.MathUtils.clamp(scrollT.current ?? 0, 0, 1);
    const camP = splines.current.cam.getPoint(t);
    const lookP = splines.current.look.getPoint(t);

    // Smooth approach — damped lerp toward sampled point
    camera.position.lerp(camP, 0.18);
    lookAtTarget.current.lerp(lookP, 0.18);
    camera.lookAt(lookAtTarget.current);
  });

  return null;
};

export default CameraRig;
