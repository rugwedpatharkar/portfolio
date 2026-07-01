import { useEffect, useRef, useState } from "react";
import OpeningCrawl from "./OpeningCrawl";
import NavicomputerCountdown from "./NavicomputerCountdown";
import HyperspaceArrival from "./HyperspaceArrival";

/*
 * PHASE 1 — THE ARRIVAL. Owns the FINE intro enum; StellarApp owns the COARSE
 * launchPhase + introDone. Beats:
 *
 *   crawl → countdown (over CameraRig's establishing pull-back) → warp (hyperspace
 *   dive) → arrive (drop-out + HUD boot) → done (hand to the tour)
 *
 * CameraRig drives the camera (establish/warp) and reports warp arrival via the
 * `stellar:intro:warpdone` event (clock-driven — no wall-timer mid-warp snap). A
 * SKIP pill finishes the whole intro at any beat. Reduced-motion + mobile never
 * mount this (StellarApp starts them `introDone` → instant tour). Sound cues are
 * dispatched per beat (hum is armed once in StellarApp).
 */

const COUNTDOWN_SAFETY_MS = 6000; // advance even if the countdown component dies
const WARP_SAFETY_MS = 6000; // finish even if CameraRig never reports arrival

const skipPill = {
  position: "fixed",
  bottom: "5vh",
  right: "4.5vw",
  zIndex: 90,
  pointerEvents: "auto",
  cursor: "pointer",
  fontFamily: "'Martian Mono', monospace",
  fontSize: 11,
  letterSpacing: "0.18em",
  color: "rgba(206,224,255,0.88)",
  background: "rgba(10,18,34,0.5)",
  border: "1px solid rgba(143,207,255,0.4)",
  borderRadius: 999,
  padding: "8px 16px",
  backdropFilter: "blur(6px)",
};

const IntroSequence = ({ onPhase, onFinish }) => {
  const [beat, setBeat] = useState("crawl");
  const finishedRef = useRef(false);

  const finish = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    onFinish?.();
  };

  useEffect(() => {
    if (beat === "countdown") {
      onPhase?.("establish"); // reveal the system behind the counting reticle
      const safety = setTimeout(() => setBeat((b) => (b === "countdown" ? "warp" : b)), COUNTDOWN_SAFETY_MS);
      return () => clearTimeout(safety);
    }
    if (beat === "warp") {
      onPhase?.("warp");
      window.dispatchEvent(new CustomEvent("stellar:sound:jump")); // the punch to lightspeed
      const onArrived = () => setBeat((b) => (b === "warp" ? "arrive" : b));
      window.addEventListener("stellar:intro:warpdone", onArrived);
      const safety = setTimeout(onArrived, WARP_SAFETY_MS);
      return () => {
        window.removeEventListener("stellar:intro:warpdone", onArrived);
        clearTimeout(safety);
      };
    }
    return undefined;
  }, [beat, onPhase]);

  return (
    <>
      {beat === "crawl" && <OpeningCrawl onDone={() => setBeat("countdown")} />}
      {beat === "countdown" && <NavicomputerCountdown onComplete={() => setBeat("warp")} />}
      {beat === "arrive" && <HyperspaceArrival onDone={finish} />}
      {/* Persistent whole-intro skip. stopPropagation so a pill click doesn't also
          trigger the crawl's gesture-advance (which only goes to the countdown). */}
      <button onPointerDown={(e) => { e.stopPropagation(); finish(); }} style={skipPill} aria-label="Skip intro">
        SKIP&nbsp;INTRO&nbsp;▸
      </button>
    </>
  );
};

export default IntroSequence;
