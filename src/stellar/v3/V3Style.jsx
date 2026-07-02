import { useEffect } from "react";
import { cssVars, accentFor } from "./tokens";
import { DESTINATION_BY_ID } from "../config/destinations";

/*
 * Injects the v3 design-token CSS variables onto :root while the v3 surface is
 * mounted, and keeps --v3-accent synced to the active body so every hairline /
 * label / active-state tint tracks the per-body accent. Also loads the base
 * dark canvas + font smoothing. Removed cleanly on unmount so #stellar (v2) and
 * #legacy are unaffected.
 */
const V3Style = ({ accentKey }) => {
  /* Tag <html> so the v3 skin scopes cleanly and unmounts without residue. */
  useEffect(() => {
    document.documentElement.classList.add("stellar-v3");
    return () => document.documentElement.classList.remove("stellar-v3");
  }, []);

  /* Live accent update — cheap, no re-render of the tree.
     Per-body accent: PLANETS tint the UI their REAL color (single source of
     truth = the destination's own `color`), while the Sun / overview / cosmic
     stops keep the curated ACCENT (warm-gold hero, etc.). Fixes the prior bug
     where accentFor was keyed by the planet's section-id (about/experience…),
     which never matched the body-name ACCENT keys → every planet fell back to
     gold. */
  useEffect(() => {
    const dest = DESTINATION_BY_ID[accentKey];
    const accent = dest?.kind === "planet" ? dest.color : accentFor(accentKey);
    document.documentElement.style.setProperty("--v3-accent", accent);
  }, [accentKey]);

  return (
    <style>{`
      :root{${cssVars()}}
      html,body{background:var(--v3-bg-void);}
      .stellar-v3{
        color:var(--v3-fg);
        font-family:var(--v3-font-ui);
        -webkit-font-smoothing:antialiased;
        text-rendering:optimizeLegibility;
      }
      /* Cancel the legacy \`* { font-family: Saira }\` reset inside v3 so children
         inherit their parent's typography instead of falling back to Saira.
         Without this, any span/div that doesn't inline its own font-family (e.g.
         V3Ticker's inner span nested inside a DM Serif Display parent) gets Saira. */
      .stellar-v3 *{font-family:inherit;}
      .stellar-v3 ::selection{background:color-mix(in oklab,var(--v3-accent) 40%,transparent);color:var(--v3-fg);}
      /* Chromeless reading column — kill the (global purple) scrollbar entirely;
         the edge fade + single-open accordion carry the "there's more" signal. */
      .stellar-v3 .stellar-content-left{scrollbar-width:none;-ms-overflow-style:none;}
      .stellar-v3 .stellar-content-left::-webkit-scrollbar{width:0;height:0;display:none;}
      /* Dossier pointer routing: dossier wrapper + V3Frame are pointer-events:none
         so pointer-move passes through to the 3D canvas (needed for MouseParallax
         → sun sways with cursor). Section content columns opt back in via the
         inline grid-area attribute so text/buttons stay interactive. */
      .stellar-dossier-frame [style*="grid-area:"],
      .stellar-dossier-frame [style*="gridArea:"]{pointer-events:auto;}
      @media (prefers-reduced-motion: reduce){
        .stellar-v3 *{animation-duration:.001ms !important;animation-iteration-count:1 !important;}
      }
    `}</style>
  );
};

export default V3Style;
