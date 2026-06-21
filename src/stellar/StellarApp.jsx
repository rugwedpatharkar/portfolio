import { useRef, useState, useCallback, useEffect } from "react";
import BootSequence from "./BootSequence";
import Scene from "./Scene";
import Navigator from "./Navigator";
import Minimap from "./Minimap";
import ContentPanel from "./ContentPanel";
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
  const [activeIdx, setActiveIdx] = useState(0);

  const handleSceneReady = useCallback(() => setSceneReady(true), []);
  const handleBootDone = useCallback(() => setBootDone(true), []);

  const handleDestinationChange = useCallback((dest) => {
    const idx = DESTINATIONS.findIndex((d) => d.id === dest.id);
    if (idx !== -1) {
      setActiveIdx(idx);
      /* Sync URL hash without re-scrolling */
      const next = `#/stellar/${dest.id}`;
      if (window.location.hash !== next) {
        window.history.replaceState(null, "", next);
      }
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
      <Scene scrollT={scrollTRef} onReady={handleSceneReady} />
      <Navigator
        scrollTRef={scrollTRef}
        onDestinationChange={handleDestinationChange}
      />
      {bootDone && <Minimap activeIdx={activeIdx} onJump={handleJump} />}
      {bootDone && <ContentPanel destination={DESTINATIONS[activeIdx]} />}
      {!bootDone && (
        <BootSequence sceneReady={sceneReady} onComplete={handleBootDone} />
      )}
    </>
  );
};

export default StellarApp;
