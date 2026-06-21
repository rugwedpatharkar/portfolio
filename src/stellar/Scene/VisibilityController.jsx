import { useEffect } from "react";
import { useThree } from "@react-three/fiber";

/*
 * Pauses the Three.js render loop when the tab is hidden, resumes when
 * it comes back. Saves battery / GPU when the user is on another tab.
 *
 * Lives inside <Canvas>; uses R3F's setFrameloop to toggle between
 * "always" and "never". The first call on mount sets "always" explicitly
 * so we don't depend on initial Canvas prop ordering.
 */

const VisibilityController = () => {
  const setFrameloop = useThree((s) => s.setFrameloop);

  useEffect(() => {
    if (typeof document === "undefined") return;

    const apply = () => {
      if (document.hidden) setFrameloop("never");
      else setFrameloop("always");
    };
    apply();

    document.addEventListener("visibilitychange", apply);
    return () => document.removeEventListener("visibilitychange", apply);
  }, [setFrameloop]);

  return null;
};

export default VisibilityController;
