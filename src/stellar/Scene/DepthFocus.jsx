/* eslint-disable react/no-unknown-property */
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { DESTINATIONS } from "../config/destinations";
import { orbitalPosition } from "../config/orbits";

/*
 * Drives the DepthOfField focus point onto the ACTIVE planet's live
 * position each frame, so the framed planet is always tack-sharp and the
 * sun / starfield / other planets fall softly out of focus.
 *
 * The earlier DOF attempt blacked the scene because focusDistance was 0;
 * focusing on a real world target (the planet) avoids that. DOF is a
 * convolution effect (own passes), so it does NOT merge with the single
 * mainImage CinematicGrade — no white-frame regression.
 */

export const DOF_TARGET = new THREE.Vector3(0, 0, 0);

const DepthFocus = ({ scrollT }) => {
  useFrame(({ clock }) => {
    const rawT = THREE.MathUtils.clamp(scrollT.current ?? 0, 0, 1);
    const idx = Math.round(rawT * (DESTINATIONS.length - 1));
    orbitalPosition(DESTINATIONS[idx], clock.elapsedTime, DOF_TARGET);
  });
  return null;
};

export default DepthFocus;
