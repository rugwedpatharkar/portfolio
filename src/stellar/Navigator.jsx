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

const Navigator = ({ scrollTRef, onDestinationChange, velocityRef }) => {
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
      /* Let the left info column (overflow-y:auto) scroll natively under the
         wheel/touch, and CHAIN back to camera-navigation at its top/bottom
         edge. Without this Lenis swallows every wheel event for the camera,
         so the tall section content was unreachable ("half information"). */
      allowNestedScroll: true,
    });
    lenisRef.current = lenis;
    // Expose for debugging — usable in DevTools as `window.__lenis.scrollTo(targetY)`
    if (typeof window !== "undefined") window.__lenis = lenis;

    const raf = (time) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);

    const N = DESTINATIONS.length;
    let lastDest = -1;
    let snapTimer = null;

    /* Magnetic snap: when scrolling settles, glide to the EXACT nearest
       destination so you never rest parked between two bodies. Implemented
       as a debounce — the snap's own scroll keeps resetting the timer, so it
       only fires 150 ms after the last real scroll, then converges in one
       move (next fire finds the offset ~0 and does nothing). No lock flag
       needed, and a fresh user scroll simply restarts the debounce. */
    const trySnap = () => {
      const p = lenis.progress;
      const nearest = Math.round(p * (N - 1));
      const targetP = nearest / (N - 1);
      if (Math.abs(p - targetP) > 0.004) {
        const max =
          (document.scrollingElement || document.documentElement).scrollHeight -
          window.innerHeight;
        lenis.scrollTo(targetP * max, { duration: 0.5, easing: (t) => 1 - Math.pow(1 - t, 3) });
      }
    };

    const onScroll = () => {
      // Lenis v1.x: progress is a getter on the instance
      const progress = lenis.progress;
      scrollTRef.current = progress;
      /* Feed travel speed to the hyperspeed warp field (normalised). */
      if (velocityRef) velocityRef.current = Math.min(1, Math.abs(lenis.velocity || 0) / 55);
      invalidate(); // request a Three.js render

      // Detect which destination we're focused on
      const destIdx = Math.round(progress * (N - 1));
      if (destIdx !== lastDest) {
        lastDest = destIdx;
        onDestinationChange?.(DESTINATIONS[destIdx]);
      }

      if (snapTimer) clearTimeout(snapTimer);
      snapTimer = setTimeout(trySnap, 150);
    };
    lenis.on("scroll", onScroll);

    return () => {
      if (snapTimer) clearTimeout(snapTimer);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [scrollTRef, onDestinationChange, velocityRef]);

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
