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

const CameraRig = ({ scrollT, controlsEnabled, parallaxOffsetRef, freeRoamOffsetRef, freeRoamEnabled }) => {
  const { camera } = useThree();
  const lookAtTarget = useRef(new THREE.Vector3(0, 0, 0));
  const basePos = useRef(new THREE.Vector3());

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

  /* Custom ease curve: ease-out-quart for smoother destination arrival.
     Pure scroll-T sampling gives constant velocity (jarring at start/end).
     This re-maps t through a soft curve before sampling the spline. */
  const easeOutQuart = (x) => 1 - Math.pow(1 - x, 4);

  useFrame(() => {
    if (controlsEnabled) return;
    const rawT = THREE.MathUtils.clamp(scrollT.current ?? 0, 0, 1);
    /* Per-segment easing — eased curve softened from quart to cubic
       so arrival isn't as sluggish at the tail. */
    const segCount = DESTINATIONS.length - 1;
    const segT = rawT * segCount;
    const segIdx = Math.floor(segT);
    const innerT = THREE.MathUtils.clamp(segT - segIdx, 0, 1);
    const easedInner = 1 - Math.pow(1 - innerT, 3); // easeOutCubic — snappier than quart
    const t = THREE.MathUtils.clamp((segIdx + easedInner) / segCount, 0, 1);

    const camP = splines.current.cam.getPoint(t);
    const lookP = splines.current.look.getPoint(t);

    /* Build the base + parallax + free-roam composite. Parallax stays
       small; free-roam is unbounded but only when toggled on. */
    basePos.current.copy(camP);
    if (parallaxOffsetRef?.current) {
      basePos.current.x += parallaxOffsetRef.current.x;
      basePos.current.y += parallaxOffsetRef.current.y;
    }
    if (freeRoamEnabled && freeRoamOffsetRef?.current) {
      basePos.current.add(freeRoamOffsetRef.current);
    }

    /* Camera lerp bumped 0.12 → 0.18 — snappier settle, less "I'm
       still catching up to where I'm supposed to be looking". */
    camera.position.lerp(basePos.current, freeRoamEnabled ? 0.55 : 0.18);
    lookAtTarget.current.lerp(lookP, 0.18);
    camera.lookAt(lookAtTarget.current);
  });

  return null;
};

export default CameraRig;
