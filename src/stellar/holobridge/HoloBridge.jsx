/*
 * HoloBridge — the dual-hologram info surface. The CENTERED planet shows through
 * the canvas behind; its facts project LEFT (cyan) and the résumé section RIGHT
 * (amber). Replaces the old ContentPanel / forced-←→ ItemDossier mount.
 *
 * Container is pointer-transparent so the planet stays interactive; only the two
 * panels capture pointer events. Mouse-parallax tilts the panels (desktop). On
 * compact/mobile the panels stack at the bottom, static. Fades during flight via
 * panelHidden (reuses the stellar:flight reveal-on-arrival machinery).
 */
import useViewport from "../useViewport";
import useHoloParallax from "./useHoloParallax";
import useBootReveal from "./useBootReveal";
import FactsHologram from "./FactsHologram";
import DossierHologram from "./DossierHologram";
import HeroHologram from "./HeroHologram";

export default function HoloBridge({ destination, section, items, bootNonce, panelHidden }) {
  const { isCompact, isMobile } = useViewport();
  const ref = useHoloParallax();
  const { booting } = useBootReveal(bootNonce);
  const stack = isCompact || isMobile;
  const isHero = section === "hero" || destination?.id === "sol";

  return (
    <div
      ref={ref}
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
        justifyContent: stack ? "flex-end" : isHero ? "flex-start" : "space-between",
        gap: stack ? 10 : 16,
        padding: stack ? "0 12px 92px" : "0 clamp(18px, 3vw, 46px)",
      }}
    >
      {isHero ? (
        /* Sol — the recruiter landing: one prominent hero card, Sun visible beside it. */
        <div style={{ pointerEvents: "auto", width: stack ? "100%" : "clamp(320px, 38vw, 500px)", maxHeight: "88vh", overflowY: "auto" }}>
          <HeroHologram booting={booting} />
        </div>
      ) : (
        <>
          <div style={{ pointerEvents: "auto", width: stack ? "100%" : "clamp(220px, 22vw, 300px)", maxHeight: "82vh", overflowY: "auto" }}>
            <FactsHologram destination={destination} booting={booting} />
          </div>
          <div style={{ pointerEvents: "auto", width: stack ? "100%" : "clamp(240px, 24vw, 340px)", maxHeight: "82vh", overflowY: "auto" }}>
            <DossierHologram destination={destination} section={section} items={items} booting={booting} sectionLabel={destination?.label} />
          </div>
        </>
      )}
    </div>
  );
}
