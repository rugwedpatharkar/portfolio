 
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
    /* `settled` = the stop the user is currently resting on. A single user swipe/
       scroll gesture may only advance the committed stop by ONE from here — so a
       fast flick's momentum can't skip a planet (the "one swipe lands two planets
       ahead" bug). Programmatic jumps (handleJump → deep-link / rail / palette /
       overview-map, flagged via window.__stellarJumping) are followed EXACTLY, uncapped. */
    let settled = Math.round(lenis.progress * (N - 1)) || 0;
    let committed = -1;
    let snapTimer = null;

    const commitTo = (idx) => {
      if (idx === committed) return;
      committed = idx;
      onDestinationChange?.(DESTINATIONS[idx]);
    };
    /* Target stop for the current scroll position: a programmatic jump takes the
       exact nearest; a user gesture is capped to settled ± 1. */
    const targetFor = (raw) => {
      const nearest = Math.round(raw);
      return window.__stellarJumping ? nearest : Math.max(settled - 1, Math.min(settled + 1, nearest));
    };

    /* Magnetic snap on settle: glide to the (capped) target so you never rest parked
       between two bodies, and lock it in as the new `settled` base. Debounced — the
       snap's own scroll keeps resetting the timer, converging in one move. */
    const trySnap = () => {
      const p = lenis.progress;
      const target = Math.max(0, Math.min(N - 1, targetFor(p * (N - 1))));
      settled = target;
      commitTo(target);
      window.__stellarJumping = false; // jump consumed once we settle
      const targetP = target / (N - 1);
      if (Math.abs(p - targetP) > 0.004) {
        const max =
          (document.scrollingElement || document.documentElement).scrollHeight -
          window.innerHeight;
        lenis.scrollTo(targetP * max, { duration: 0.7, easing: (t) => 1 - Math.pow(1 - t, 3) });
      }
    };

    const onScroll = () => {
      // Lenis v1.x: progress is a getter on the instance
      const progress = lenis.progress;
      scrollTRef.current = progress;
      invalidate(); // request a Three.js render

      /* Commit within a deadband around the target (kills the round() oscillation at
         the .5 boundary that used to re-fire the warp). The target is capped to
         settled±1 for user gestures, so a fast swipe commits at most one stop ahead
         and the snap below glides any overshoot back. */
      const raw = progress * (N - 1);
      const target = Math.max(0, Math.min(N - 1, targetFor(raw)));
      if (Math.abs(raw - target) < 0.35) commitTo(target);

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
