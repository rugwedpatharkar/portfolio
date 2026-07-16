import { useRef, useState, useCallback, useEffect } from "react";
import { MotionConfig } from "motion/react";
import Scene from "./Scene";
import Navigator from "./Navigator";
import HoloBridge from "./holobridge/HoloBridge";
import { DESTINATIONS, stopScrollFraction } from "./config/destinations";
import useViewport, { ViewportProvider } from "./useViewport";
import StellarGlare from "./StellarGlare";
import EclipseDimmer from "./EclipseDimmer";
import V3Style from "./v3/V3Style";
import V3Cursor from "./v3/V3Cursor";
import V3Hud from "./v3/V3Hud";
import V3Reticle from "./v3/V3Reticle";
import V3Editorial from "./v3/V3Editorial";
import V3FinaleOverlay from "./v3/V3FinaleOverlay";
import V3ScaleAnnotations from "./v3/V3ScaleAnnotations";
import V3ScaleReadout from "./v3/V3ScaleReadout";
import V3TheEdgeQuote from "./v3/V3TheEdgeQuote";
import { preloadSection, preloadAllSections } from "./v3/V3Panel";
import BootLoader from "./v3/BootLoader";

/* Section → document-title label (recruiter-facing tab title + a11y context). */
/* §6.3: docTitle lives on each destination row now — see DESTINATIONS in
   config/destinations.js. Blank/missing → the default site title. */
const DOC_DEFAULT_TITLE = "Rugwed Patharkar — Backend & Agentic AI Engineer";

/* Sections that render as an editorial spread (redesign 2026-07). On those stops
   the tour's per-body V3Editorial "Planet Information" card is redundant — the
   spread carries all the identity + data — so we hide it. Grow this set as more
   sections port to the spread format in Phase 3. */
const SPREAD_SECTIONS = new Set(["experience", "projects", "funfacts"]);

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
  /* Pull-back finale: `finaleTRef` (0→1) is the continuous scrub the camera +
     grade read each frame; `scrollFinale` is the discrete solar↔neighbourhood
     content swap Navigator fires at the mid-point (in the grade's black dip).
     `?finale=1` forces the finale for standalone preview. */
  const urlFinale =
    typeof window !== "undefined" &&
    (window.location.search.includes("finale") || window.location.hash.includes("finale"));
  const finaleTRef = useRef(urlFinale ? 1 : 0);
  const [scrollFinale, setScrollFinale] = useState(false);
  const showFinaleContent = scrollFinale || urlFinale;
  /* Progressive-mount tier (0→3) for the heavy extras suite — ramped BEHIND the
     first paint so the whole suite doesn't build in one frame-freezing commit. */
  const [extrasPhase, setExtrasPhase] = useState(0);
  /* Boot gate — a "systems calibrating" screen covers the first load while
     textures stream in, the tour pre-mounts + GPU-warms, and the intro settles;
     it lifts to reveal an already-settled homepage (see BootLoader). */
  const [booting, setBooting] = useState(true);
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

  /* Freeze scroll (so the reveal is always the settled hero, never a stray
     mid-tour position) while the boot screen is up; release on reveal. Lenis is
     mounted by Navigator; poll briefly for it since it may not exist on the very
     first commit. */
  useEffect(() => {
    if (booting) {
      let tries = 0;
      const id = setInterval(() => {
        if (window.__lenis) { window.__lenis.scrollTo(0, { immediate: true }); window.__lenis.stop(); clearInterval(id); }
        else if (++tries > 60) clearInterval(id);
      }, 16);
      return () => clearInterval(id);
    }
    window.__lenis?.start();
    return undefined;
  }, [booting]);

  /* Camera framing refs — kept out of React state so per-frame reads never
     re-render the tree. CameraRig reads these each frame. */
  const focusRef = useRef(null);           // {live, target, from, fov} — planet framing on nav
  const cameraRef = useRef(null);
  const warpVelRef = useRef(0);            // hyperspace-tube intensity (CameraRig writes, StellarGlare reads)
  const prevTargetRef = useRef({ destId: DESTINATIONS[0].id, k: -1 });
  const eclipseRef = useRef(0);            // live eclipse totality (SolarEclipse → sky dimmer)
  /* Shared virtual-clock handle { t, scale, danger } — the scene writes t/danger,
     read across the canvas boundary by CameraRig / KeyLight / the reticle. */
  const sceneClockRef = useRef(null);
  if (!sceneClockRef.current) sceneClockRef.current = { t: 0, scale: 1, targetScale: 1, danger: 0 };

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
    document.title = dest.docTitle ? `${dest.docTitle} · Rugwed Patharkar` : DOC_DEFAULT_TITLE;
  }, []);

  /* Arm the bridge hum once (audible only after the first user gesture). */
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("stellar:sound:hum"));
  }, []);

  /* Warm the résumé-section chunks so scrolling to a stop never pays a dynamic-
     import + lazy-mount frame hitch. The first three go immediately (the opening
     stops); the rest are staggered ~1.2s later — during the intro, behind the
     boot loader — so they never compete with the critical first scene build but
     are all cached well before the visitor reaches them. */
  useEffect(() => {
    ["about", "funfacts", "experience"].forEach(preloadSection);
    const id = setTimeout(preloadAllSections, 1200);
    return () => clearTimeout(id);
  }, []);

  /* Boost the shared virtual clock at the Solar-System overview stop (index 1)
     so planetary orbital motion is VISIBLE while the visitor lingers. No
     camera locks to a planet there, so a 10× boost is safe — inner planets
     visibly sweep the Sun. NOT at index 0 — that's now the Milky Way homepage
     (no planets; a 10× clock would just over-speed the ambient FX). Scale is
     1 everywhere else. */
  useEffect(() => {
    if (!sceneClockRef.current) return;
    /* Set the TARGET; SceneClock ramps `scale` toward it (~0.5s) so orbital
       velocity doesn't snap ×10/÷10 at the 0→1 / 1→2 boundaries (a visible jerk).
       t integrates delta*scale, so this stays position-continuous. */
    sceneClockRef.current.targetScale = activeIdx === 1 ? 10 : 1;
  }, [activeIdx]);

  const handleJump = useCallback((idx) => {
    /* Map destination index → exact scroll position via stopScrollFraction — the
       shared index↔scroll mapping (accounts for the stretched opening dive +
       finale split). Navigator.trySnap uses the SAME helper, so a jump (rail,
       keys, deep-link, back/forward) lands exactly where the magnetic snap rests;
       a mismatched mapping overshot mid-tour jumps by 1–2 planets. */
    const max = (document.scrollingElement || document.documentElement).scrollHeight - window.innerHeight;
    const targetY = stopScrollFraction(idx) * max;
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
    /* Bodyless / origin-anchored stops (kind "overview" / "hero" / "star") have
       no meaningful orbital position — focusStrategy's `radius / tan(halfAngle)`
       standoff misframes them, and a live focus arms a hyperspace jump. The Sun
       ("star") sits at the origin and is static, so a live focus buys nothing but
       a degenerate warp + a retarget away from the authored pose. Skip focus for
       all three so scrollStrategy's authored cameraTarget renders as a clean
       far→near dolly-in (the "zoom toward the Sun"). */
    if (dest.kind === "overview" || dest.kind === "hero" || dest.kind === "star") {
      focusRef.current = null;
      prevTargetRef.current = { destId: dest.id, k: -1 };
      return;
    }
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

  /* Deep-link: jump to the destination named in the URL hash on load.
     Waits for the scroll runway to actually exist before calling handleJump —
     otherwise `max = scrollHeight - innerHeight` reads 0 and the jump lands at
     y=0 (hero) regardless of the hash. Two signals both need to be true:
       · Navigator's Lenis instance is mounted (window.__lenis exists — it's
         the scroll driver handleJump ends up calling).
       · The sentinel div has laid out — scrollHeight materially exceeds
         innerHeight, i.e. there's real runway.
     Poll each rAF up to a safety cap (~1 s at 60 fps) so a slow first paint
     doesn't strand the deep-link. Previous 350 ms setTimeout usually worked
     but was a guess; on a slow device / cold cache it could fire early. */
  useEffect(() => {
    const idx = findDestinationIndexByHash(window.location.hash);
    if (idx <= 0) return undefined;
    let raf;
    let attempts = 0;
    const MAX_ATTEMPTS = 60; // ≈1 s at 60 fps
    const check = () => {
      attempts++;
      const el = document.scrollingElement || document.documentElement;
      const runway = (el?.scrollHeight || 0) - window.innerHeight;
      if ((window.__lenis && runway > window.innerHeight) || attempts >= MAX_ATTEMPTS) {
        handleJump(idx);
        return;
      }
      raf = requestAnimationFrame(check);
    };
    raf = requestAnimationFrame(check);
    return () => {
      if (raf) cancelAnimationFrame(raf);
    };
  }, [handleJump]);

  /* Keyboard navigation — arrows / PageUp-Down / Home / End / WASD hop between
     stops. ←→ / A / D navigate the tour the same as ↑↓ / W / S so every arrow
     key does the sensible thing (the section-accordion dispatch that used to
     own ←→ had no listener — that path was dead). Sections still own their own
     keys when focused inside `.stellar-dossier-frame`. No text inputs live in
     the tour so capturing plain keys is safe (guarded on INPUT/TEXTAREA regardless). */
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
      if (k === "arrowdown" || k === "pagedown" || k === "arrowright" || k === "s" || k === "d") {
        e.preventDefault(); navPlanet(1);
      } else if (k === "arrowup" || k === "pageup" || k === "arrowleft" || k === "w" || k === "a") {
        e.preventDefault(); navPlanet(-1);
      } else if (k === "home") { e.preventDefault(); navTo(0); }
      else if (k === "end") { e.preventDefault(); navTo(N - 1); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navTo, navPlanet]);

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
    <ViewportProvider>
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
          font: 600 14px/1 'Sora', system-ui, sans-serif; text-decoration: none;
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
        finaleT={finaleTRef}
        finale={showFinaleContent}
        activeIdx={activeIdx}
        onJump={handleJump}
        eclipseRef={eclipseRef}
        focusRef={focusRef}
        warpVelRef={warpVelRef}
        cameraRef={cameraRef}
        clock={sceneClockRef.current}
        extrasPhase={extrasPhase}
        v3
      />
      <Navigator
        scrollTRef={scrollTRef}
        finaleTRef={finaleTRef}
        onDestinationChange={handleDestinationChange}
        onFinaleContent={setScrollFinale}
      />
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
      <V3Hud stops={DESTINATIONS} activeIdx={activeIdx} section={DESTINATIONS[activeIdx]?.section} onJump={handleJump} />
      {/* Focused-planet FUI reticle — tracks the active body via camera projection. */}
      <V3Reticle cameraRef={cameraRef} clock={sceneClockRef.current} activeIdx={activeIdx} />
      {/* Per-body editorial card — historical quote + rotating etymology / fact.
          Bottom-right; hidden on hero stop, mobile, or bodies without data. */}
      <V3Editorial destinationId={DESTINATIONS[activeIdx]?.id} activeIdx={activeIdx} hidden={panelHidden || SPREAD_SECTIONS.has(DESTINATIONS[activeIdx]?.section)} />
      {/* §12.4 — "You are here / Orion Spur" callout that fades in during the
          pull-back finale, pinned to the Sun (viewport centre — that's where
          the finale camera aims). */}
      <V3FinaleOverlay finaleT={finaleTRef} />
      {/* Hero-only ambient scale annotations — hairline text top-right telling
          the viewer where they are in the physical hierarchy. Fades out on
          every planet stop. */}
      <V3ScaleAnnotations activeIdx={activeIdx} hidden={panelHidden} />
      {/* Live "powers of ten" distance-from-Sun readout — climbs through the
          regimes (M km → AU + light-min → light-hours → light-days) as the tour
          scrolls outward. Bottom-left; solar-system stops only. */}
      <V3ScaleReadout cameraRef={cameraRef} activeIdx={activeIdx} finale={showFinaleContent} flying={panelHidden} />
      {/* Closing quote overlay on The Edge stop (activeIdx === 13). Not the
          V3Panel section content — the black hole finale has none. Just an
          elegant floating line + attribution to close the tour. */}
      <V3TheEdgeQuote activeIdx={activeIdx} />
      {/* Boot calibration screen — covers the first load until textures + GPU
          warm-up + the intro have settled, then fades to the ready homepage. */}
      {booting && (
        <BootLoader
          warmed={extrasPhase >= 4}
          reducedMotion={reducedMotion}
          onDone={() => setBooting(false)}
        />
      )}
    </MotionConfig>
    </ViewportProvider>
  );
};

export default StellarApp;
