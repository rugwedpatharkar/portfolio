import { useEffect } from "react";
import { cssVars, COLOR } from "./tokens";
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
     §6.3: each destination row carries its own accent — `accent` for the Sun
     and non-planet stops (curated warm gold, etc.), `color` for planets (the
     body's real color). No-dest / no-color paths fall to Sol gold. */
  useEffect(() => {
    const dest = DESTINATION_BY_ID[accentKey];
    const accent = dest?.accent || dest?.color || COLOR.accent;
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

      /* GLASSMORPHIC section cards — every dossier card is inline-styled with
         \`border: 1px solid var(--v3-line)\` (the SUBTLE line; chips/pills use
         \`--v3-line-strong\` + a round radius). Two selection paths, applied
         additively:

           1. **Class-based, resilient path (preferred for new code):**
              \`.v3-glass\`  → neutral card glass
              \`.v3-glass-accent\` → accent-bordered emphasis glass
              Formatter-safe: no reliance on inline-style string shape.

           2. **Inline-style attribute path (legacy, catches everything already
              shipped):** matches the exact substring \`border: … var(--v3-line…\`
              in the element's inline \`style\`. Both \`border: 1px …\` and
              \`border:1px …\` (Prettier-compressed) are covered so a future
              format pass on the JSX style objects can't silently un-glass any
              card. Excludes photo tiles via :not([style*="background-image"]).

         IMPORTANT — the background is a SOLID gradient, not a translucent tint
         relying on backdrop-filter: Cards sit inside <V3Scan>, whose entry
         animation sets \`filter: blur()\` and \`transform\` (and leaves
         \`filter: blur(0px)\` behind). Per CSS, any ancestor with a non-none
         filter/transform becomes the backdrop root for a descendant's
         \`backdrop-filter\`, so the blur samples an EMPTY buffer and the card
         looks un-frosted. The gradient reads as frosted glass WITHOUT needing
         backdrop-filter; the real blur is a progressive enhancement.

         NOTE on the border-token substring: match STOPS at \`var(--v3-line\`
         with NO closing paren so we catch BOTH \`var(--v3-line)\` (cards) and
         \`var(--v3-line-strong)\` (chips / pills / tabs / round buttons) in
         one selector. Including the \`)\` would exclude every line-strong
         chip. */

      /* Neutral boxes — cool dark glass. */
      .v3-glass,
      .stellar-dossier-frame [style*="border: 1px solid var(--v3-line"]:not([style*="background-image"]),
      .stellar-dossier-frame [style*="border:1px solid var(--v3-line"]:not([style*="background-image"]){
        background: linear-gradient(157deg, rgba(30, 34, 46, 0.72), rgba(15, 18, 27, 0.82)) !important;
        border-color: color-mix(in oklab, var(--v3-fg) 17%, transparent) !important;
        box-shadow: 0 8px 26px rgba(0, 0, 0, 0.40), inset 0 1px 0 rgba(255, 255, 255, 0.08) !important;
        backdrop-filter: blur(11px) saturate(135%);
        -webkit-backdrop-filter: blur(11px) saturate(135%);
      }
      /* Emphasis boxes (accent border) — warm-tinted glass with soft accent glow. */
      .v3-glass-accent,
      .stellar-dossier-frame [style*="border: 1px solid var(--v3-accent"]:not([style*="background-image"]),
      .stellar-dossier-frame [style*="border:1px solid var(--v3-accent"]:not([style*="background-image"]){
        background: linear-gradient(157deg, color-mix(in oklab, var(--v3-accent) 13%, rgba(34, 27, 17, 0.76)), rgba(18, 14, 9, 0.85)) !important;
        box-shadow: 0 8px 26px rgba(0, 0, 0, 0.40), 0 0 20px color-mix(in oklab, var(--v3-accent) 16%, transparent), inset 0 1px 0 rgba(255, 255, 255, 0.08) !important;
        backdrop-filter: blur(11px) saturate(135%);
        -webkit-backdrop-filter: blur(11px) saturate(135%);
      }
      /* Touch devices: gradient carries it; drop the blur (cheaper). */
      @media (hover: none) and (pointer: coarse){
        .v3-glass,
        .v3-glass-accent,
        .stellar-dossier-frame [style*="border: 1px solid var(--v3-line"]:not([style*="background-image"]),
        .stellar-dossier-frame [style*="border:1px solid var(--v3-line"]:not([style*="background-image"]),
        .stellar-dossier-frame [style*="border: 1px solid var(--v3-accent"]:not([style*="background-image"]),
        .stellar-dossier-frame [style*="border:1px solid var(--v3-accent"]:not([style*="background-image"]){
          backdrop-filter: none;
          -webkit-backdrop-filter: none;
        }
      }
      @media (prefers-reduced-motion: reduce){
        .stellar-v3 *{animation-duration:.001ms !important;animation-iteration-count:1 !important;}
      }
    `}</style>
  );
};

export default V3Style;
