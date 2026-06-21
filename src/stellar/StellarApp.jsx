import { useRef, useState, useCallback } from "react";
import BootSequence from "./BootSequence";
import Scene from "./Scene";
import Navigator from "./Navigator";
import Minimap from "./Minimap";
import { DESTINATIONS, SCROLL_LENGTH_PER_DESTINATION } from "./config/destinations";

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
  const [activeIdx, setActiveIdx] = useState(0);

  const handleSceneReady = useCallback(() => setSceneReady(true), []);
  const handleBootDone = useCallback(() => setBootDone(true), []);

  const handleDestinationChange = useCallback((dest) => {
    const idx = DESTINATIONS.findIndex((d) => d.id === dest.id);
    if (idx !== -1) setActiveIdx(idx);
  }, []);

  const handleJump = useCallback((idx) => {
    const totalScroll = (DESTINATIONS.length * SCROLL_LENGTH_PER_DESTINATION) / 100;
    const targetY = (idx / (DESTINATIONS.length - 1)) * window.innerHeight * totalScroll;
    window.scrollTo({ top: targetY, behavior: "smooth" });
  }, []);

  return (
    <>
      <Scene scrollT={scrollTRef} onReady={handleSceneReady} />
      <Navigator
        scrollTRef={scrollTRef}
        onDestinationChange={handleDestinationChange}
      />
      {bootDone && <Minimap activeIdx={activeIdx} onJump={handleJump} />}
      {!bootDone && (
        <BootSequence sceneReady={sceneReady} onComplete={handleBootDone} />
      )}
    </>
  );
};

export default StellarApp;
