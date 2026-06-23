/* eslint-disable react/no-unknown-property */
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { orbitalPosition } from "../config/orbits";

/*
 * Revolves its children around the sun by driving the group's position
 * from the shared orbit model each frame. Used to wrap each planet (and
 * its aurora) so the whole body — surface, clouds, moons, atmosphere —
 * orbits as one. The camera reads the same orbit model so framing stays
 * locked on the planet.
 */
const OrbitGroup = ({ dest, children, animate = true }) => {
  const ref = useRef();
  /* t=0 reproduces the authored layout, so freezing time (reduced-motion)
     parks every planet at its hand-tuned spot — and CameraRig freezes the
     same way, so framing stays locked. */
  useFrame(({ clock }) => {
    if (ref.current) orbitalPosition(dest, animate ? clock.elapsedTime : 0, ref.current.position);
  });
  return <group ref={ref}>{children}</group>;
};

export default OrbitGroup;
