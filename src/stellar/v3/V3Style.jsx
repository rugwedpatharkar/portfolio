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
        /* Base rem — every rem-based clamp() min/max in every section scales
           proportionally with viewport bracket, so we don't have to touch
           7 section files to make type breathe on bigger monitors. */
        font-size: 16px;
      }
      /* 1920+ (Full HD) → +12.5% rem-scale so 1rem=18px, 2.6rem=46.8px, etc. */
      @media (min-width: 1920px){ .stellar-v3{ font-size: 18px; } }
      /* 2400+ (27" QHD) → +25% rem-scale. clamp maxes lift into headline range. */
      @media (min-width: 2400px){ .stellar-v3{ font-size: 20px; } }
      /* Small laptop guard — never smaller than default. */
      @media (max-width: 1279px){ .stellar-v3{ font-size: 15px; } }
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
      /* Override the global purple #915eff scrollbar for anything inside .stellar-v3.
         Elegant version: hairline track, low-opacity accent thumb, tighter width.
         Firefox uses scrollbar-width/color; WebKit gets a full ::-webkit-scrollbar
         override at higher specificity than the global rule. */
      .stellar-v3, .stellar-v3 *{
        scrollbar-width:thin;
        scrollbar-color: color-mix(in oklab, var(--v3-fg) 22%, transparent) transparent;
      }
      .stellar-v3 ::-webkit-scrollbar{width:6px;height:6px;}
      /* Rail is faintly visible even at rest — a subtle 'you can scroll here' hint. */
      .stellar-v3 ::-webkit-scrollbar-track{
        background: color-mix(in oklab, var(--v3-fg) 6%, transparent);
        border-radius: 999px;
      }
      .stellar-v3 ::-webkit-scrollbar-thumb{
        background: color-mix(in oklab, var(--v3-fg) 30%, transparent);
        border-radius: 999px;
        border: 1px solid transparent;
        background-clip: padding-box;
      }
      .stellar-v3 ::-webkit-scrollbar-thumb:hover{
        background: color-mix(in oklab, var(--v3-accent) 65%, transparent);
        background-clip: padding-box;
      }
      .stellar-v3 ::-webkit-scrollbar-corner{background:transparent;}
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
