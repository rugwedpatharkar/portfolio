import { useRef, useState, useCallback, useEffect } from "react";
import BootSequence from "./BootSequence";
import Scene from "./Scene";
import Navigator from "./Navigator";
import Minimap from "./Minimap";
import ContentPanel from "./ContentPanel";
import EasterEgg from "./EasterEgg";
import Cursor from "./Cursor";
import PlanetHUD from "./PlanetHUD";
import MissionCountdown from "./MissionCountdown";
import SideRail from "./SideRail";
import WarpOpening from "./WarpOpening";
import AmbientAudio from "./AmbientAudio";
import { easterEggs } from "../content";
import { DESTINATIONS, SCROLL_LENGTH_PER_DESTINATION } from "./config/destinations";

/* Hash → destination utilities */
const findDestinationIndexByHash = (hash) => {
  const id = hash?.replace(/^#\/?stellar\/?/, "").replace(/^#/, "");
  if (!id) return -1;
  return DESTINATIONS.findIndex((d) => d.id === id || d.section === id);
};

/*
 * Root component of the Stellar 3D portfolio.
 *
 * Layout layers (bottom → top):
 *   1. Three.js canvas (position: fixed inset)
 *   2. Navigator (invisible scroll sentinel, drives scroll progress)
 *   3. Minimap (top-right HUD)
 *   4. BootSequence (full-screen overlay, dismisses after scene mounts)
 *
 * Phase 5 adds the content overlay layer; for now we just have the scene
 * + navigation working.
 */

const StellarApp = () => {
  const scrollTRef = useRef(0);
  const [sceneReady, setSceneReady] = useState(false);
  const [bootDone, setBootDone] = useState(false);
  const [warpDone, setWarpDone] = useState(false);
  const [countdownDone, setCountdownDone] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const consoleLoggedRef = useRef(false);

  const handleSceneReady = useCallback(() => setSceneReady(true), []);
  const handleBootDone = useCallback(() => setBootDone(true), []);
  const handleWarpDone = useCallback(() => setWarpDone(true), []);
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

  const handleDestinationChange = useCallback((dest) => {
    const idx = DESTINATIONS.findIndex((d) => d.id === dest.id);
    if (idx !== -1) {
      setActiveIdx(idx);
      /* Sync URL hash without re-scrolling */
      const next = `#/stellar/${dest.id}`;
      if (window.location.hash !== next) {
        window.history.replaceState(null, "", next);
      }
      /* Audio cue — AmbientAudio listens if enabled */
      window.dispatchEvent(new CustomEvent("stellar:whoosh"));
    }
  }, []);

  const handleJump = useCallback((idx) => {
    const totalScroll = (DESTINATIONS.length * SCROLL_LENGTH_PER_DESTINATION) / 100;
    const targetY = (idx / (DESTINATIONS.length - 1)) * window.innerHeight * totalScroll;
    if (window.__lenis) {
      window.__lenis.scrollTo(targetY, { duration: 1.6 });
    } else {
      window.scrollTo({ top: targetY, behavior: "smooth" });
    }
  }, []);

  /* Read URL hash once boot is done, then jump there if matched */
  useEffect(() => {
    if (!bootDone) return;
    const idx = findDestinationIndexByHash(window.location.hash);
    if (idx > 0) {
      /* Small delay so the boot transition finishes before camera flies */
      const t = setTimeout(() => handleJump(idx), 350);
      return () => clearTimeout(t);
    }
  }, [bootDone, handleJump]);

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
      <Scene scrollT={scrollTRef} activeIdx={activeIdx} onJump={handleJump} onReady={handleSceneReady} />
      <Navigator
        scrollTRef={scrollTRef}
        onDestinationChange={handleDestinationChange}
      />
      {bootDone && countdownDone && (
        <>
          <Cursor />
          <Minimap activeIdx={activeIdx} onJump={handleJump} />
          <SideRail activeIdx={activeIdx} onJump={handleJump} />
          <PlanetHUD destination={DESTINATIONS[activeIdx]} />
          <ContentPanel destination={DESTINATIONS[activeIdx]} />
          <AmbientAudio />
          <EasterEgg />
        </>
      )}
      {bootDone && !warpDone && <WarpOpening onComplete={handleWarpDone} />}
      {bootDone && warpDone && !countdownDone && <MissionCountdown onComplete={handleCountdownDone} />}
      {!bootDone && (
        <BootSequence sceneReady={sceneReady} onComplete={handleBootDone} />
      )}
    </>
  );
};

export default StellarApp;
