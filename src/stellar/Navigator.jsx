 
import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { invalidate } from "@react-three/fiber";
import { DESTINATIONS, SCROLL_LENGTH_PER_DESTINATION, FINALE_SCROLL_VH, TOUR_END_FRACTION } from "./config/destinations";

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

const Navigator = ({ scrollTRef, finaleTRef, onDestinationChange, onFinaleContent }) => {
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

    let rafId;
    const raf = (time) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

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
    /* Split the runway: [0, TOUR_END] is the destination tour, (TOUR_END, 1] is
       the pull-back finale. scrollTRef stays "tour progress 0→1" (pinned at 1
       through the finale) so every existing tour consumer is unchanged; the
       finale rides its own finaleTRef 0→1. */
    const TOUR_END = TOUR_END_FRACTION;
    const toTourT = (raw) => (TOUR_END > 0 ? Math.min(1, raw / TOUR_END) : raw);

    let committed = -1;
    let lastRaw = toTourT(lenis.progress) * (N - 1);
    let dir = 0; // +1 forward, -1 backward, 0 unknown
    let finaleContentOn = false; // has the solar↔finale content swap fired?
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
      const raw = lenis.progress;
      /* In the finale zone the reveal scrubs freely — no magnetic snap (it would
         yank you back to the last planet). */
      if (raw > TOUR_END + 0.006) return;
      const tourT = toTourT(raw);
      const nearest = Math.max(0, Math.min(N - 1, Math.round(tourT * (N - 1))));
      commitTo(nearest);
      // The destination's position in RAW runway progress (tour occupies [0, TOUR_END]).
      const targetRaw = (nearest / (N - 1)) * TOUR_END;
      if (Math.abs(raw - targetRaw) > 0.004) {
        const max =
          (document.scrollingElement || document.documentElement).scrollHeight -
          window.innerHeight;
        lenis.scrollTo(targetRaw * max, { duration: 0.85, easing: (t) => 1 - Math.pow(1 - t, 3) });
      }
    };

    const onScroll = () => {
      // Lenis v1.x: progress is a getter on the instance
      const rawProgress = lenis.progress;
      /* Tour progress saturates at 1 once you cross into the finale, so the
         camera + all tour consumers hold at the last destination while the
         finale reveal takes over on its own axis. */
      scrollTRef.current = toTourT(rawProgress);
      const finaleT = TOUR_END < 1 ? Math.max(0, Math.min(1, (rawProgress - TOUR_END) / (1 - TOUR_END))) : 0;
      if (finaleTRef) finaleTRef.current = finaleT;
      /* Swap the scene content (solar system ↔ local neighbourhood) once, at the
         mid-point of the reveal where the grade dips to black — hides the cut. */
      const wantFinale = finaleT > 0.5;
      if (wantFinale !== finaleContentOn) {
        finaleContentOn = wantFinale;
        onFinaleContent?.(wantFinale);
      }
      invalidate(); // request a Three.js render

      const raw = scrollTRef.current * (N - 1);
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
        /* Clear the jump-bypass flag AS SOON AS it has committed the target once.
           The old approach cleared it 260 ms after the last scroll event, which
           re-armed on every subsequent wheel nudge — so a "jump + immediate scroll"
           left the direction guard bypassed for extra frames it wasn't authored
           for. Clearing on the very commit the flag was meant to enable removes
           the race entirely. */
        if (window.__stellarJumping) window.__stellarJumping = false;
      }

      if (snapTimer) clearTimeout(snapTimer);
      snapTimer = setTimeout(trySnap, 200);
      /* Reset the gesture direction after idle so the next flick picks a fresh one. */
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(() => { dir = 0; }, 260);
    };
    lenis.on("scroll", onScroll);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (snapTimer) clearTimeout(snapTimer);
      if (idleTimer) clearTimeout(idleTimer);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [scrollTRef, finaleTRef, onDestinationChange, onFinaleContent]);

  const totalVh = DESTINATIONS.length * SCROLL_LENGTH_PER_DESTINATION + FINALE_SCROLL_VH;

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
