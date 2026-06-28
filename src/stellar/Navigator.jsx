 
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
    /* Lerp 0.13 — responsive scroll so the camera starts moving the instant you
       scroll (0.085 felt laggy/floaty). The magnetic snap still lands you exactly
       on each planet, and the warp streaks ramp from the resulting travel speed. */
    const lenis = new Lenis({
      smoothWheel: true,
      lerp: 0.13,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
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
        lenis.scrollTo(targetP * max, { duration: 0.9, easing: (t) => 1 - Math.pow(1 - t, 3) });
      }
    };

    const onScroll = () => {
      // Lenis v1.x: progress is a getter on the instance
      const progress = lenis.progress;
      scrollTRef.current = progress;
      invalidate(); // request a Three.js render

      /* Commit a destination only when we're solidly inside its zone (a deadband
         around the .5 boundary). The magnetic snap below animates the scroll ACROSS
         that boundary, which re-enters onScroll and made Math.round() oscillate
         (6→7→6→7) — firing onDestinationChange repeatedly and re-triggering the warp
         3× with a mid-flight reversal (the Saturn→Uranus glitch). Requiring progress
         to be within 0.35 of an integer index kills the oscillation: a glide that
         dips to 6.6 no longer flips the committed index. */
      const raw = progress * (N - 1);
      const nearest = Math.round(raw);
      if (nearest !== lastDest && Math.abs(raw - nearest) < 0.35) {
        lastDest = nearest;
        onDestinationChange?.(DESTINATIONS[nearest]);
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
