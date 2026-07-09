/*
 * HoloBridge — the v3 info surface overlaid on the live 3D scene. On the hero
 * stop it renders the V3Hero landing column; on every other stop the V3Panel
 * (résumé + body telemetry). Container is pointer-transparent so the planet
 * behind stays interactive; the panel captures pointer events. Mouse-parallax
 * tilts it (desktop); on compact/mobile it stacks at the bottom. Fades during
 * flight via panelHidden (the stellar:flight reveal-on-arrival machinery).
 */
import useViewport from "../useViewport";
import useHoloParallax from "./useHoloParallax";
import useBootReveal from "./useBootReveal";
import V3Hero from "../v3/V3Hero";
import V3Panel from "../v3/V3Panel";

export default function HoloBridge({ destination, section, items, bootNonce, panelHidden }) {
  const { isCompact, isMobile } = useViewport();
  const ref = useHoloParallax();
  useBootReveal(bootNonce);
  const stack = isCompact || isMobile;
  /* Hero = the system-overview stop only (keyed on the section, since v3 moved
     the Sun to the "about" stop so id==="sol" is no longer the hero). */
  const isHero = section === "hero";

  return (
    <div
      ref={ref}
      id="main-content"
      role="main"
      tabIndex={-1}
      aria-label="Portfolio content"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 40,
        pointerEvents: "none",
        opacity: panelHidden ? 0 : 1,
        transition: "opacity 360ms ease",
        display: "flex",
        flexDirection: stack ? "column" : "row",
        alignItems: stack ? "stretch" : "center",
        justifyContent: stack ? "flex-end" : "flex-start",
        gap: stack ? 10 : 16,
        padding: stack
          ? "0 12px calc(92px + env(safe-area-inset-bottom, 0px))"
          : "0 clamp(28px, 6vw, 120px)",
      }}
    >
      {isHero ? (
        /* Far-left info column over the real 3D system (Sun framed upper-right,
           orbits + belts sweeping in). */
        <V3Hero />
      ) : (
        /* Premium single content column on the LEFT (résumé + body telemetry). */
        <V3Panel destination={destination} section={section} items={items} bootNonce={bootNonce} />
      )}
    </div>
  );
}
