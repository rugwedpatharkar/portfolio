/* eslint-disable react/prop-types */
import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { invalidate } from "@react-three/fiber";
import { DESTINATIONS, SCROLL_LENGTH_PER_DESTINATION } from "./config/destinations";

/*
 * Scroll → camera tour coordinator.
 *
 * Sets up Lenis for buttery smooth scroll, writes the current normalized
 * scroll position (0..1) to a ref that CameraRig consumes, and triggers a
 * Three.js render on every scroll event via invalidate().
 *
 * The page itself has a tall sentinel div (TOTAL_SCROLL_VH viewports) so
 * the browser has real scroll content to drive Lenis.
 */

const Navigator = ({ scrollTRef, onDestinationChange }) => {
  const lenisRef = useRef(null);

  useEffect(() => {
    /* Lerp bumped from 0.085 → 0.14 for snappier wheel response —
       still smooth but reaches target ~40% faster, removes the
       slightly molasses feel on fast scrolls. */
    const lenis = new Lenis({
      smoothWheel: true,
      lerp: 0.16,
      wheelMultiplier: 1.15,
      touchMultiplier: 1.6,
    });
    lenisRef.current = lenis;
    // Expose for debugging — usable in DevTools as `window.__lenis.scrollTo(targetY)`
    if (typeof window !== "undefined") window.__lenis = lenis;

    const raf = (time) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);

    let lastDest = -1;

    const onScroll = () => {
      // Lenis v1.x: progress is a getter on the instance
      const progress = lenis.progress;
      scrollTRef.current = progress;
      invalidate(); // request a Three.js render

      // Detect which destination we're focused on
      const destIdx = Math.round(progress * (DESTINATIONS.length - 1));
      if (destIdx !== lastDest) {
        lastDest = destIdx;
        onDestinationChange?.(DESTINATIONS[destIdx]);
      }
    };
    lenis.on("scroll", onScroll);

    return () => {
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [scrollTRef, onDestinationChange]);

  const totalVh = DESTINATIONS.length * SCROLL_LENGTH_PER_DESTINATION;

  // The sentinel must live in normal document flow (not absolute) so the
  // <body>'s scrollHeight extends and Lenis has real scrollable runway.
  return (
    <div
      aria-hidden="true"
      style={{
        width: "100%",
        height: `${totalVh}vh`,
        pointerEvents: "none",
      }}
    />
  );
};

export default Navigator;
