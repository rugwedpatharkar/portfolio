import { useRef, useState, useCallback, useEffect } from "react";
import Scene from "./Scene";
import Navigator from "./Navigator";
import Minimap from "./Minimap";
import ContentPanel from "./ContentPanel";
import EasterEgg from "./EasterEgg";
import Cursor from "./Cursor";
import PlanetHUD from "./PlanetHUD";
import MissionCountdown from "./MissionCountdown";
import SideRail from "./SideRail";
import WarpField from "./WarpField";
import AmbientAudio from "./AmbientAudio";
import CockpitFrame from "./CockpitFrame";
import StardustTrail from "./StardustTrail";
import Breadcrumb from "./Breadcrumb";
import LiveStats from "./LiveStats";
import Achievements from "./Achievements";
import SpeedRun from "./SpeedRun";
import QuoteFeed from "./QuoteFeed";
import VisitorLog from "./VisitorLog";
import AnswerListener from "./AnswerListener";
import VoiceNav from "./VoiceNav";
import FpsMonitor from "./FpsMonitor";
import HelpOverlay from "./HelpOverlay";
import CinematicLayer from "./CinematicLayer";
import { easterEggs } from "../content";
import { DESTINATIONS } from "./config/destinations";

/* Hash → destination utilities */
const findDestinationIndexByHash = (hash) => {
  const id = hash?.replace(/^#\/?stellar\/?/, "").replace(/^#/, "");
  if (!id) return -1;
  return DESTINATIONS.findIndex((d) => d.id === id || d.section === id);
};

/*
 * Root component of the Stellar 3D portfolio.
 *
 * Visitor flow:
 *   0. MissionCountdown (T-5 → GO) — FIRST, building anticipation.
 *   1. Launch warp — a hyperspeed fly-in from the edge of the system into
 *      Sol (WarpField streaks + the camera flying in).
 *   2. Main UI reveals — the scene mounts + loads textures behind the
 *      overlays the whole time, so it's ready when the warp ends.
 */

const StellarApp = () => {
  const scrollTRef = useRef(0);
  const [countdownDone, setCountdownDone] = useState(false);
  /* Cinematic launch after the countdown: warp (hyperspeed fly-in to Sol)
     → done (hand over to the tour). */
  const [launchPhase, setLaunchPhase] = useState(null);
  const [shipWarpDone, setShipWarpDone] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const activeIdxRef = useRef(0);
  /* Hyperspeed warp intensity (0..1): scroll velocity during the tour + a
     kick on far nav-jumps. Read by WarpField, written by Navigator. */
  const warpVelRef = useRef(0);
  const [freeRoam, setFreeRoam] = useState(false);
  const [cockpit, setCockpit] = useState(false);
  /* Wide pull-back mode — Z key toggle. Ref-driven so CameraRig can
     read it per frame without re-renders. */
  const wideRef = useRef(false);
  const [, forceWideRender] = useState(0);
  const consoleLoggedRef = useRef(false);

  /* Esc to exit free-roam */
  useEffect(() => {
    if (!freeRoam) return;
    const onKey = (e) => { if (e.key === "Escape") setFreeRoam(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [freeRoam]);

  /* Z toggles wide pull-back view */
  useEffect(() => {
    const onKey = (e) => {
      const inField = e.target?.tagName === "INPUT" || e.target?.tagName === "TEXTAREA";
      if (inField) return;
      if (e.key === "z" || e.key === "Z") {
        wideRef.current = !wideRef.current;
        forceWideRender((v) => v + 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* Scene mounts/loads textures behind the warp + countdown overlays,
     so we no longer need an explicit sceneReady gate. */
  const handleSceneReady = useCallback(() => {}, []);
  const handleCountdownDone = useCallback(() => setCountdownDone(true), []);

  /* Console easter egg for devs who open DevTools — once per session */
  useEffect(() => {
    if (consoleLoggedRef.current) return;
    consoleLoggedRef.current = true;
    console.log("%c\n" + easterEggs.ascii + "\n", "color: #ffb86b; font-size: 10px; font-family: monospace;");
    console.log(`%c${easterEggs.greeting}`, "color: #00cea8; font-size: 16px; font-weight: bold;");
    console.log(`%c${easterEggs.repoLink}`, "color: #aaa6c3; font-size: 12px;");
    console.log("%c🛸  Try the Konami code. Click the sun. Drag to explore.", "color: #bf61ff; font-size: 12px;");
  }, []);

  /* After the countdown, run the warp: a hyperspeed fly-in from the edge of
     the system into Sol (CameraRig drives the camera from the establishing
     pose → Sol; WarpField draws the streaks). Reduced-motion skips it.
     Duration matches CameraRig's WARP_DUR (2.2s). */
  useEffect(() => {
    if (!countdownDone) return undefined;
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setShipWarpDone(true);
      return undefined;
    }
    setLaunchPhase("warp");
    const t = setTimeout(() => {
      setLaunchPhase(null);
      setShipWarpDone(true);
    }, 2200);
    return () => clearTimeout(t);
  }, [countdownDone]);

  const handleDestinationChange = useCallback((dest) => {
    const idx = DESTINATIONS.findIndex((d) => d.id === dest.id);
    if (idx !== -1) {
      setActiveIdx(idx);
      activeIdxRef.current = idx;
      /* Sync URL hash without re-scrolling */
      const next = `#/stellar/${dest.id}`;
      if (window.location.hash !== next) {
        window.history.replaceState(null, "", next);
      }
      /* Audio cue — AmbientAudio listens if enabled */
      window.dispatchEvent(new CustomEvent("stellar:whoosh"));
      /* Visitor-log + achievements listen */
      window.dispatchEvent(new CustomEvent("stellar:destination", { detail: { id: dest.id, idx } }));
    }
  }, []);

  const handleJump = useCallback((idx) => {
    /* Far nav-jumps (>2 stops away) fly through many bodies fast — kick the
       hyperspeed warp field so the jump immediately reads as a warp (the
       continuous camera + scroll velocity carry the rest). */
    if (Math.abs(idx - activeIdxRef.current) > 2) {
      warpVelRef.current = 1;
    }
    /* Map destination index → exact scroll position. Progress runs 0..1
       over (scrollHeight − viewport), so targetY = frac × that range. The
       old formula scaled by the viewport-count (12) instead of the real
       scroll range and overshot by ~1 destination — the cause of jumps /
       hash nav landing one planet past the target. */
    const max =
      (document.scrollingElement || document.documentElement).scrollHeight -
      window.innerHeight;
    const targetY = (idx / (DESTINATIONS.length - 1)) * max;
    if (window.__lenis) {
      /* Jump duration 1.6 → 1.0s — feels like a punchier hyperjump */
      window.__lenis.scrollTo(targetY, { duration: 1.0 });
    } else {
      window.scrollTo({ top: targetY, behavior: "smooth" });
    }
    /* Camera shake on jump for tactile arrival */
    window.dispatchEvent(new CustomEvent("stellar:shake", { detail: { amp: 0.12, duration: 0.3 } }));
  }, []);

  /* Read URL hash once the countdown finishes (full intro complete),
     then jump there if it points to a non-Sol destination. */
  useEffect(() => {
    if (!shipWarpDone) return;
    const idx = findDestinationIndexByHash(window.location.hash);
    if (idx > 0) {
      const t = setTimeout(() => handleJump(idx), 350);
      return () => clearTimeout(t);
    }
  }, [shipWarpDone, handleJump]);

  /* Browser back/forward should also navigate */
  useEffect(() => {
    const onHash = () => {
      const idx = findDestinationIndexByHash(window.location.hash);
      if (idx !== -1) handleJump(idx);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [handleJump]);

  return (
    <>
      <Scene
        scrollT={scrollTRef}
        activeIdx={activeIdx}
        onJump={handleJump}
        onReady={handleSceneReady}
        freeRoamEnabled={freeRoam}
        wideRef={wideRef}
        showExtras={countdownDone}
        launchPhase={launchPhase}
      />
      <Navigator
        scrollTRef={scrollTRef}
        onDestinationChange={handleDestinationChange}
        velocityRef={warpVelRef}
      />
      {/* Hyperspeed streaks — driven by travel speed (scroll velocity +
          launch warp). Sits under the content overlay. */}
      <WarpField velocityRef={warpVelRef} launchPhase={launchPhase} />
      {shipWarpDone && (
        <>
          <Cursor />
          <StardustTrail />
          <Minimap activeIdx={activeIdx} onJump={handleJump} />
          <SideRail activeIdx={activeIdx} onJump={handleJump} />
          <Breadcrumb activeIdx={activeIdx} />
          <LiveStats />
          <Achievements activeIdx={activeIdx} />
          <SpeedRun activeIdx={activeIdx} />
          <QuoteFeed />
          <AnswerListener />
          <FpsMonitor />
          <HelpOverlay />
          <CinematicLayer getDestinationLabel={(id) => DESTINATIONS.find((d) => d.id === id)?.label} />
          <PlanetHUD destination={DESTINATIONS[activeIdx]} />
          <ContentPanel destination={DESTINATIONS[activeIdx]} />
          <CockpitFrame enabled={cockpit} scrollTRef={scrollTRef} />
          <EasterEgg />
          {/* Right-edge vertical control dock — single column for all
              toggles to avoid the previous horizontal collisions. */}
          <div className="stellar-control-dock">
            <AmbientAudio />
            <VoiceNav onJump={handleJump} />
            <VisitorLog />
            <button
              onClick={() => {
                setFreeRoam((v) => {
                  if (!v) window.dispatchEvent(new CustomEvent("stellar:freeroam"));
                  return !v;
                });
              }}
              aria-label={freeRoam ? "Exit free roam" : "Enter free roam"}
              title={freeRoam ? "Exit free roam (WASD + arrows)" : "Free roam — WASD/arrows to fly"}
              className="stellar-dock-btn"
              data-active={freeRoam}
              style={{
                background: freeRoam ? "rgba(255, 184, 107, 0.2)" : "rgba(6, 9, 22, 0.7)",
                border: freeRoam ? "1px solid rgba(255, 184, 107, 0.6)" : "1px solid rgba(255, 255, 255, 0.18)",
                color: freeRoam ? "#ffb86b" : "rgba(255, 255, 255, 0.6)",
              }}
            >⌖</button>
            <button
              onClick={() => setCockpit((v) => !v)}
              aria-label={cockpit ? "Disable cockpit" : "Enable cockpit"}
              title={cockpit ? "Hide cockpit HUD" : "Show cockpit HUD"}
              className="stellar-dock-btn"
              data-active={cockpit}
              style={{
                background: cockpit ? "rgba(0, 206, 168, 0.18)" : "rgba(6, 9, 22, 0.7)",
                border: cockpit ? "1px solid rgba(0, 206, 168, 0.55)" : "1px solid rgba(255, 255, 255, 0.18)",
                color: cockpit ? "#00cea8" : "rgba(255, 255, 255, 0.6)",
              }}
            >⊕</button>
          </div>
          <style>{`
            .stellar-control-dock {
              position: fixed;
              bottom: 18px;
              right: 18px;
              display: flex;
              flex-direction: column-reverse;
              gap: 8px;
              z-index: 50;
            }
            .stellar-dock-btn {
              width: 38px; height: 38px;
              border-radius: 50%;
              cursor: pointer;
              font-family: 'JetBrains Mono', monospace;
              font-size: 14px;
              backdrop-filter: blur(10px);
              -webkit-backdrop-filter: blur(10px);
              display: flex; align-items: center; justify-content: center;
              transition: background 200ms ease, border 200ms ease, color 200ms ease, transform 200ms ease;
            }
            .stellar-dock-btn:hover { transform: scale(1.06); }
          `}</style>
        </>
      )}
      {/* Countdown plays FIRST on mount; the warp fly-in (WarpField streaks
          + CameraRig) follows. Scene textures stream in behind both. */}
      {!countdownDone && <MissionCountdown onComplete={handleCountdownDone} />}
    </>
  );
};

export default StellarApp;
