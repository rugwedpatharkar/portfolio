/* eslint-disable react/no-unknown-property */
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { DESTINATIONS } from "../config/destinations";
import { orbitalPosition } from "../config/orbits";
import { useSceneClock } from "./SceneClock";

/*
 * Drives the DepthOfField focus point onto the ACTIVE planet's live
 * position each frame, so the framed planet is always tack-sharp and the
 * sun / starfield / other planets fall softly out of focus.
 *
 * CRITICAL: it MUST read the orbit off the same `sceneClock.t` the planets and
 * CameraRig render with (NOT clock.elapsedTime) — otherwise under reduced-motion
 * (sceneClock frozen at 0) the focus point tracks where the planet WOULD be in
 * live time while the planet sits frozen, and DOF blurs the actual subject.
 *
 * The earlier DOF attempt blacked the scene because focusDistance was 0;
 * focusing on a real world target (the planet) avoids that. DOF is a convolution
 * effect (own passes), so it never merges with the single mainImage
 * CinematicGrade — no white-frame regression.
 */

export const DOF_TARGET = new THREE.Vector3(0, 0, 0);

/* Focus on the ACTIVE stop, not a scrollT-derived index: hash navigation (and
   the headless verifier) jump the camera via activeIdx without moving the scroll
   position, so a scrollT-based target would lock onto Sol while the camera frames
   another planet — blurring the actual subject. activeIdx is the true subject. */
const DepthFocus = ({ activeIdx = 0 }) => {
  const sceneClock = useSceneClock();
  useFrame(() => {
    const dst = DESTINATIONS[Math.max(0, Math.min(DESTINATIONS.length - 1, activeIdx))];
    orbitalPosition(dst, sceneClock ? sceneClock.t : 0, DOF_TARGET);
  });
  return null;
};

export default DepthFocus;
