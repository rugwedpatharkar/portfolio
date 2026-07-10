import { useRef, useState, useCallback, useEffect } from "react";
import { MotionConfig } from "motion/react";
import Scene from "./Scene";
import Navigator from "./Navigator";
import HoloBridge from "./holobridge/HoloBridge";
import { DESTINATIONS } from "./config/destinations";
import useViewport from "./useViewport";
import StellarGlare from "./StellarGlare";
import EclipseDimmer from "./EclipseDimmer";
import V3Style from "./v3/V3Style";
import V3Cursor from "./v3/V3Cursor";
import V3Hud from "./v3/V3Hud";
import V3Reticle from "./v3/V3Reticle";
import V3Editorial from "./v3/V3Editorial";

/* Section → document-title label (recruiter-facing tab title + a11y context). */
const DOC_SECTION = {
  hero: "", about: "About", funfacts: "Impact", experience: "Experience",
  projects: "Projects", achievements: "Achievements", skills: "Skills",
  notes: "Writing", education: "Education", hobbies: "Hobbies",
  testimonials: "Testimonials", contact: "Contact",
};
const DOC_DEFAULT_TITLE = "Rugwed Patharkar — Backend & Agentic AI Engineer";

/* Hash → destination index (deep-link + browser back/forward). The hash is always
   written as the destination `id` (handleDestinationChange), so match id ONLY —
   matching section too made `#v3/skills` resolve to Ceres (section:"skills")
   before Jupiter (id:"skills"), since id and section share a namespace offset by one. */
const findDestinationIndexByHash = (hash) => {
  const id = hash?.replace(/^#v3\/?/, "").replace(/^#\/?/, "");
  if (!id) return -1;
  return DESTINATIONS.findIndex((d) => d.id === id);
};

/* v3 readability scrim — a soft dark gradient behind the content column so text
   stays legible over the starfield / planet glow. Anchored to the info side
   (left on desktop, bottom when the panel stacks on mobile). */
const V3Scrim = () => {
  const { isCompact } = useViewport();
  const bg = isCompact
    ? "linear-gradient(to top, rgba(4,5,9,0.95) 0%, rgba(4,5,9,0.7) 34%, rgba(4,5,9,0) 62%)"
    : "linear-gradient(100deg, rgba(4,5,9,0.96) 0%, rgba(4,5,9,0.82) 26%, rgba(4,5,9,0.45) 45%, rgba(4,5,9,0) 60%)";
  return <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: 30, pointerEvents: "none", background: bg }} />;
};

/*
 * Root of the Stellar 3D portfolio — the single v3 scroll-tour through the
 * scientifically-accurate solar system. The scene loads straight in (no
 * countdown / warp intro): textures stream in behind the UI and the heavy
 * extras mount in tiers over the first ~2s.
 */
const StellarApp = () => {
  const scrollTRef = useRef(0);
  /* Progressive-mount tier (0→3) for the heavy extras suite — ramped BEHIND the
     first paint so the whole suite doesn't build in one frame-freezing commit. */
  const [extrasPhase, setExtrasPhase] = useState(0);
  const [activeIdx, setActiveIdx] = useState(0);
  const activeIdxRef = useRef(0);
  /* During the hyperspace fly-through the section info hides; it fades back in on
     arrival (settle). CameraRig edge-fires stellar:flight {flying}. Reduced-motion
     / mobile never fly, so the info stays visible there. */
  const [panelHidden, setPanelHidden] = useState(false);
  useEffect(() => {
    const onFlight = (e) => setPanelHidden(!!e.detail?.flying);
    window.addEventListener("stellar:flight", onFlight);
    return () => window.removeEventListener("stellar:flight", onFlight);
  }, []);
  const { reducedMotion } = useViewport();

  /* Camera framing refs — kept out of React state so per-frame reads never
     re-render the tree. CameraRig reads these each frame. */
  const focusRef = useRef(null);           // {live, target, from, fov} — planet framing on nav
  const cameraRef = useRef(null);
  const warpVelRef = useRef(0);            // hyperspace-tube intensity (CameraRig writes, StellarGlare reads)
  const prevTargetRef = useRef({ destId: DESTINATIONS[0].id, k: -1 });
  const eclipseRef = useRef(0);            // live eclipse totality (SolarEclipse → sky dimmer)
  /* Wide-pullback + orrery-orbit refs — no toggle in the minimal UI, but CameraRig
     still reads them every frame, so they stay as stable no-op defaults. */
  const wideRef = useRef(false);
  const wideOrbitRef = useRef({ az: 1.8, el: 0.6, radius: 120, panX: 0, panZ: 0 });
  /* Shared virtual-clock handle { t, scale, danger } — the scene writes t/danger,
     read across the canvas boundary by CameraRig / KeyLight / the reticle. */
  const sceneClockRef = useRef(null);
  if (!sceneClockRef.current) sceneClockRef.current = { t: 0, scale: 1, danger: 0 };

  /* Stream the heavy extras suite in tiers over the first ~1.7s so the core scene
     (sun + planets + stars) shows first and no single commit builds the whole
     suite (belts, deep-field, and the ~68k belt-dust are spread across 4 tiers).
     Mobile stages too — the one-commit build was the worst hitch on weak GPUs;
     reduced-motion mounts at once (there's no reveal animation to preserve). */
  useEffect(() => {
    if (reducedMotion) { setExtrasPhase(4); return undefined; }
    const timers = [
      setTimeout(() => setExtrasPhase(1), 150),
      setTimeout(() => setExtrasPhase(2), 500),
      setTimeout(() => setExtrasPhase(3), 1000),
      setTimeout(() => setExtrasPhase(4), 1700),
    ];
    return () => timers.forEach(clearTimeout);
  }, [reducedMotion]);

  const handleDestinationChange = useCallback((dest) => {
    const idx = DESTINATIONS.findIndex((d) => d.id === dest.id);
    if (idx === -1) return;
    setActiveIdx(idx);
    activeIdxRef.current = idx;
    /* Sync URL hash without re-scrolling (deep-link stays on #v3). */
    const next = `#v3/${dest.id}`;
    if (window.location.hash !== next) window.history.replaceState(null, "", next);
    /* Arrival beep (SoundManager listens). */
    window.dispatchEvent(new CustomEvent("stellar:destination", { detail: { id: dest.id, index: idx } }));
    /* Keep the tab title + a11y context in sync with the active section. */
    const sec = DOC_SECTION[dest.section];
    document.title = sec ? `${sec} · Rugwed Patharkar` : DOC_DEFAULT_TITLE;
  }, []);

  /* Arm the bridge hum once (audible only after the first user gesture). */
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("stellar:sound:hum"));
  }, []);

  const handleJump = useCallback((idx) => {
    /* Map destination index → exact scroll position. Progress runs 0..1 over
       (scrollHeight − viewport). */
    const max = (document.scrollingElement || document.documentElement).scrollHeight - window.innerHeight;
    const targetY = (idx / (DESTINATIONS.length - 1)) * max;
    /* Tell the Navigator this is a deliberate jump so its one-stop-per-swipe cap
       is bypassed and it lands EXACTLY here. Snap instantly — the camera travel
       is the warp-jump (CameraRig); an animated scroll fed intermediate positions
       back through handleDestinationChange and left the camera a planet behind. */
    window.__stellarJumping = true;
    if (window.__lenis) window.__lenis.scrollTo(targetY, { immediate: true });
    else window.scrollTo({ top: targetY, behavior: "auto" });
  }, []);

  /* Set the camera focus target SYNCHRONOUSLY on nav (not via an effect): the
     frame loop must see the new target the same tick, or the warp-jump's
     first-target guard strands the camera on the previous body. Travel framing —
     approach FROM the body we were last on. */
  const applyFocus = useCallback((planetIdx) => {
    const dest = DESTINATIONS[planetIdx];
    if (!dest) return;
    const target = { destId: dest.id, k: -1 };
    const from = prevTargetRef.current;
    const changed = from.destId !== target.destId;
    focusRef.current = { live: true, target, from: changed ? from : null, fov: 50 };
    prevTargetRef.current = target;
    if (changed) window.dispatchEvent(new CustomEvent("stellar:sound:jump"));
  }, []);

  /* ↑↓ planet hops — routed here so every entry point (keys, rail) sets state +
     focus + scroll the same way, synchronously. */
  const navTo = useCallback((idx) => {
    const n = Math.max(0, Math.min(DESTINATIONS.length - 1, idx));
    if (n === activeIdxRef.current) return;
    activeIdxRef.current = n;
    setActiveIdx(n);
    applyFocus(n);
    handleJump(n); // instant scroll → keeps scrollT / KeyLight on the active planet
  }, [applyFocus, handleJump]);

  const navPlanet = useCallback((dir) => navTo(activeIdxRef.current + dir), [navTo]);

  /* ←/→ steps the on-screen section accordion (V3Panel listens for v3:accordion). */
  const stepItem = useCallback((dir) => {
    window.dispatchEvent(new CustomEvent("v3:accordion", { detail: { dir } }));
  }, []);

  /* Keep the camera framed on the ACTIVE body for the nav paths that DON'T set
     focus synchronously — scroll (Lenis → handleDestinationChange) + URL hash.
     Idempotent with navTo's synchronous applyFocus (the `already` guard skips the
     redundant warp). Sol (idx 0) stays focus-free so the hero keeps its subtle
     pointer parallax. */
  useEffect(() => {
    if (activeIdx > 0) {
      const f = focusRef.current;
      const here = DESTINATIONS[activeIdx];
      const already = f && f.live && f.target && here && f.target.destId === here.id;
      if (!already) applyFocus(activeIdx);
    } else {
      focusRef.current = null;
      prevTargetRef.current = { destId: DESTINATIONS[0].id, k: -1 };
    }
  }, [activeIdx, applyFocus]);

  /* Deep-link: jump to the destination named in the URL hash on load. */
  useEffect(() => {
    const idx = findDestinationIndexByHash(window.location.hash);
    if (idx > 0) {
      const t = setTimeout(() => handleJump(idx), 350);
      return () => clearTimeout(t);
    }
  }, [handleJump]);

  /* Keyboard navigation — arrows / PageUp-Down / Home / End / WASD hop between
     stops; ←→ steps the section accordion. No text inputs exist in the tour, so
     capturing plain keys is safe (guarded against INPUT/TEXTAREA regardless). */
  useEffect(() => {
    const onKey = (e) => {
      const k = e.key.toLowerCase();
      const N = DESTINATIONS.length;
      const typing = e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA");
      if (typing) return;
      /* When focus is inside a section's content, let the SECTION own its keys
         (carousel / category nav). Otherwise ↑/↓ here double-fired with the
         section's own handler — advancing the category AND hopping the planet. */
      if (e.target?.closest?.(".stellar-dossier-frame")) return;
      if (k === "arrowdown" || k === "pagedown" || k === "s") { e.preventDefault(); navPlanet(1); }
      else if (k === "arrowup" || k === "pageup" || k === "w") { e.preventDefault(); navPlanet(-1); }
      else if (k === "arrowleft" || k === "a") { e.preventDefault(); stepItem(-1); }
      else if (k === "arrowright" || k === "d") { e.preventDefault(); stepItem(1); }
      else if (k === "home") { e.preventDefault(); navTo(0); }
      else if (k === "end") { e.preventDefault(); navTo(N - 1); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navTo, navPlanet, stepItem]);

  /* Browser back/forward should also navigate. */
  useEffect(() => {
    const onHash = () => {
      const idx = findDestinationIndexByHash(window.location.hash);
      if (idx !== -1) handleJump(idx);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [handleJump]);

  return (
    <MotionConfig reducedMotion="user">
      {/* Skip-to-content — first focusable element, bypasses the 3D canvas. */}
      <a className="stellar-skip" href="#main-content">Skip to content</a>
      {/* v3 skin — injects design tokens + tracks the per-body accent. */}
      <V3Style accentKey={DESTINATIONS[activeIdx]?.id} />
      {/* v3 dark scrim behind the content column (readability over the scene). */}
      <V3Scrim />
      {/* Hide the page scrollbar — scroll still drives the camera. */}
      <style>{`
        html { scrollbar-width: none !important; }
        html::-webkit-scrollbar, body::-webkit-scrollbar { width: 0 !important; height: 0 !important; display: none !important; }
        .stellar-content-left a:focus-visible, .stellar-content-left button:focus-visible,
        button:focus-visible, a:focus-visible, [tabindex]:focus-visible {
          outline: 2px solid var(--focus-ring, rgba(150, 195, 255, 0.95)) !important;
          outline-offset: 3px;
          border-radius: 5px;
        }
        .stellar-skip {
          position: fixed; left: 16px; top: -64px; z-index: 200;
          padding: 10px 16px; border-radius: 8px;
          background: var(--focus-ring, #915eff); color: #050609;
          font: 600 14px/1 'Manrope', system-ui, sans-serif; text-decoration: none;
          transition: top .2s ease;
        }
        .stellar-skip:focus { top: 16px; outline: none; }
        @keyframes stellarChevron { 0%, 100% { transform: translateY(0); opacity: 0.55; } 50% { transform: translateY(4px); opacity: 1; } }
        @keyframes stellarCaret { 50% { opacity: 0; } }
        @keyframes stellarStatusPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.45; } }
        @keyframes stellarGlow { 0%, 100% { box-shadow: 0 0 18px rgba(47, 224, 176,0.2); } 50% { box-shadow: 0 0 30px rgba(47, 224, 176,0.42); } }
        @media (prefers-reduced-motion: reduce) { * { animation-duration: 0.001ms !important; animation-iteration-count: 1 !important; } }
      `}</style>
      <Scene
        scrollT={scrollTRef}
        activeIdx={activeIdx}
        onJump={handleJump}
        eclipseRef={eclipseRef}
        wideRef={wideRef}
        wideOrbitRef={wideOrbitRef}
        focusRef={focusRef}
        warpVelRef={warpVelRef}
        cameraRef={cameraRef}
        clock={sceneClockRef.current}
        extrasPhase={extrasPhase}
        v3
      />
      <Navigator scrollTRef={scrollTRef} onDestinationChange={handleDestinationChange} />
      <V3Cursor />
      {/* Sky darkens toward totality during an eclipse (scene only; HUD stays lit). */}
      <EclipseDimmer eclipseRef={eclipseRef} />
      {/* The star's light floods the canopy on an inward approach. */}
      <StellarGlare cameraRef={cameraRef} warpVelRef={warpVelRef} reducedMotion={reducedMotion} />
      {/* Holo-Bridge — the info surface (V3Hero on the hero stop, V3Panel elsewhere).
          Hides during fly-through, reveals on arrival (panelHidden ← stellar:flight). */}
      <HoloBridge
        section={DESTINATIONS[activeIdx]?.section}
        bootNonce={activeIdx}
        panelHidden={panelHidden}
      />
      {/* v3 FUI chrome — hairline frame, stop counter, clickable system rail. */}
      <V3Hud stops={DESTINATIONS} activeIdx={activeIdx} label={DESTINATIONS[activeIdx]?.label} section={DESTINATIONS[activeIdx]?.section} onJump={handleJump} />
      {/* Focused-planet FUI reticle — tracks the active body via camera projection. */}
      <V3Reticle cameraRef={cameraRef} clock={sceneClockRef.current} activeIdx={activeIdx} />
      {/* Per-body editorial card — historical quote + rotating etymology / fact.
          Bottom-right; hidden on hero stop, mobile, or bodies without data. */}
      <V3Editorial destinationId={DESTINATIONS[activeIdx]?.id} activeIdx={activeIdx} hidden={panelHidden} />
    </MotionConfig>
  );
};

export default StellarApp;
