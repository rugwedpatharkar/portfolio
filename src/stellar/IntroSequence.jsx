import { useEffect, useRef } from "react";

/*
 * PHASE 1 — THE ARRIVAL (beats 1A + 1B).
 *
 * The cinematic gate the visitor must pass before the tour: a black bridge-hum
 * hold, then CameraRig's ESTABLISH pull-back (reveal the tilted system), then the
 * WARP dive into Sol. This component owns only the COARSE launch phase + the black
 * curtain that lifts as the reveal begins; it never times the warp's END — that is
 * clock-driven inside CameraRig (onLaunchComplete → StellarApp.finishIntro), so a
 * slow load can't snap mid-warp.
 *
 * Skippable by any gesture (click / key / wheel / touch). A safety net finishes
 * the intro if the camera never reports arrival. Reduced-motion + mobile never
 * mount this (StellarApp starts them `introDone`), so the tour is instant there.
 *
 * Later beats (1C crawl, 1D countdown, 1E sound) slot in between BLACK and WARP.
 */

const BLACK_MS = 700; // bridge-hum black hold before the reveal
/* Must exceed CameraRig's ESTABLISH_DUR (2.2s) so the pull-back fully arrives at
   ESTABLISH_POS before the warp begins — the warp hardcodes its start there, so a
   shorter dwell would snap the camera at the hand-off. */
const ESTABLISH_MS = 2400; // dwell on the establishing shot before the dive
const SAFETY_MS = 10000; // hard finish if CameraRig never reports arrival (very slow load)

const IntroSequence = ({ onPhase, onFinish }) => {
  const doneRef = useRef(false);
  const curtainRef = useRef(null);

  useEffect(() => {
    const finish = () => {
      if (doneRef.current) return;
      doneRef.current = true;
      onFinish?.();
    };

    const timers = [
      /* beat: lift the black curtain + start the establishing pull-back. */
      setTimeout(() => {
        onPhase?.("establish");
        if (curtainRef.current) curtainRef.current.style.opacity = "0";
      }, BLACK_MS),
      /* beat: hyperspeed dive into Sol (CameraRig drives + signals completion). */
      setTimeout(() => onPhase?.("warp"), BLACK_MS + ESTABLISH_MS),
      /* safety net — never strand the visitor on the intro. */
      setTimeout(finish, SAFETY_MS),
    ];

    /* Any deliberate gesture skips straight to the tour. */
    const skip = () => finish();
    window.addEventListener("pointerdown", skip);
    window.addEventListener("keydown", skip);
    window.addEventListener("wheel", skip, { passive: true });
    window.addEventListener("touchstart", skip, { passive: true });

    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener("pointerdown", skip);
      window.removeEventListener("keydown", skip);
      window.removeEventListener("wheel", skip);
      window.removeEventListener("touchstart", skip);
    };
  }, [onPhase, onFinish]);

  return (
    <div
      ref={curtainRef}
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 80,
        background: "#03050d",
        opacity: 1,
        transition: "opacity 1.1s ease-out",
        pointerEvents: "none",
      }}
    />
  );
};

export default IntroSequence;
