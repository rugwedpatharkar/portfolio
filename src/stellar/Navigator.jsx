 
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
    /* Natural Lenis scroll — no gesture base-hold, no ±1 cap. What actually caused
       "one swipe skips a planet" was the mag-snap's back-glide re-committing in the
       reverse direction as it settled (raw 6.7 → 7 → back to 6.9 → committed 6),
       which ALSO flipped every hop to inward and framed the camera behind the planet
       facing the Sun. Fix at the source: only commit when the current gesture is still
       moving in its established direction. The snap's back-glide then can't re-commit
       backwards → no skip, no inward camera flip. Programmatic jumps
       (window.__stellarJumping: deep-link / rail / palette / map / keys) bypass the
       direction check and land exactly on their target. */
    let committed = -1;
    let lastRaw = lenis.progress * (N - 1);
    let dir = 0; // +1 forward, -1 backward, 0 unknown
    let snapTimer = null;
    let idleTimer = null;

    const commitTo = (idx) => {
      if (idx === committed) return;
      committed = idx;
      onDestinationChange?.(DESTINATIONS[idx]);
    };

    /* Magnetic snap on settle: glide to the exact nearest stop so you never rest
       parked between two bodies. Debounced — the snap's own scroll keeps resetting
       the timer, converging in one move. */
    const trySnap = () => {
      const p = lenis.progress;
      const nearest = Math.max(0, Math.min(N - 1, Math.round(p * (N - 1))));
      commitTo(nearest);
      const targetP = nearest / (N - 1);
      if (Math.abs(p - targetP) > 0.004) {
        const max =
          (document.scrollingElement || document.documentElement).scrollHeight -
          window.innerHeight;
        lenis.scrollTo(targetP * max, { duration: 0.85, easing: (t) => 1 - Math.pow(1 - t, 3) });
      }
    };

    const onScroll = () => {
      // Lenis v1.x: progress is a getter on the instance
      const progress = lenis.progress;
      scrollTRef.current = progress;
      invalidate(); // request a Three.js render

      const raw = progress * (N - 1);
      const delta = raw - lastRaw;
      /* Track the gesture direction from the first sustained move; hysteresis avoids
         flipping on sub-pixel jitter. */
      if (Math.abs(delta) > 0.001) {
        if (dir === 0 || Math.sign(delta) !== dir) dir = Math.sign(delta) || dir;
      }
      lastRaw = raw;

      /* Commit within a deadband around the round(). The direction guard prevents the
         snap's back-glide from committing the previous stop while gliding backwards.
         Programmatic jumps bypass so they land exactly. */
      const nearest = Math.round(raw);
      const inBand = Math.abs(raw - nearest) < 0.35;
      const withDir = dir === 0 || Math.sign(nearest - (committed >= 0 ? committed : nearest)) === dir;
      if (inBand && (window.__stellarJumping || withDir)) {
        commitTo(Math.max(0, Math.min(N - 1, nearest)));
      }

      if (snapTimer) clearTimeout(snapTimer);
      snapTimer = setTimeout(trySnap, 200);
      /* End the gesture (and clear the jump flag) after the scroll has been idle a
         beat so the next flick can pick a fresh direction. */
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(() => { dir = 0; window.__stellarJumping = false; }, 260);
    };
    lenis.on("scroll", onScroll);

    return () => {
      if (snapTimer) clearTimeout(snapTimer);
      if (idleTimer) clearTimeout(idleTimer);
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
