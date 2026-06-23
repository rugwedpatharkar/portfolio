/* eslint-disable react/no-unknown-property */
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { orbitalPosition } from "../config/orbits";
import { useSceneClock } from "./SceneClock";

/*
 * Revolves its children around the sun by driving the group's position
 * from the shared orbit model each frame. Used to wrap each planet (and
 * its aurora) so the whole body — surface, clouds, moons, atmosphere —
 * orbits as one. The camera reads the same orbit model (via the same
 * virtual clock) so framing stays locked on the planet at any time-scale.
 */
const OrbitGroup = ({ dest, children, animate = true }) => {
  const ref = useRef();
  const clock = useSceneClock();
  /* t=0 reproduces the authored layout, so freezing time (reduced-motion →
     clock.t pinned to 0) parks every planet at its hand-tuned spot — and
     CameraRig reads the same t, so framing stays locked. */
  useFrame(() => {
    if (ref.current) orbitalPosition(dest, animate ? clock.t : 0, ref.current.position);
  });
  return <group ref={ref}>{children}</group>;
};

export default OrbitGroup;
