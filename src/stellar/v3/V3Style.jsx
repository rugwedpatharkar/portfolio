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
         \`--v3-line-strong\` + a round radius). This attribute selector catches
         them all and applies frosted glass. Excludes pills (border-radius 999)
         and the round nav buttons (border-radius 50%).

         IMPORTANT — why the background is a SOLID gradient, not a bare
         translucent tint relying on backdrop-filter:
         Cards sit inside <V3Scan>, whose entry animation sets \`filter: blur()\`
         and \`transform\` (and leaves \`filter: blur(0px)\` behind). Per CSS, any
         ancestor with a non-none filter/transform becomes the backdrop root for
         a descendant's \`backdrop-filter\`, so the blur samples an EMPTY buffer
         and the card looks un-frosted — which is exactly the "transparent for a
         few seconds then glass" + "not on all cards" behaviour. So we make the
         glass a layered dark gradient + top highlight that reads as frosted
         glass WITHOUT needing backdrop-filter to render, and keep the real blur
         as a progressive enhancement (no !important → where an ancestor filter
         suppresses it, the gradient still carries the look). Result: consistent
         glass on every card, instantly, no flash. */
      /* Selector notes (verified card-by-card against the live DOM across all
         12 stops):
           - Require the \`border: \` PREFIX (colon-space, no dash) so we match
             full-border BOXES and NOT \`border-top: …\` hairline dividers.
           - Two families of box border exist: the neutral \`var(--v3-line)\`
             (also matches \`--v3-line-strong\`, since "line" is a substring, so
             chips/pills/tabs are covered too) and the emphasis \`var(--v3-accent)\`
             (featured milestones + active/selected states). We handle both.
           - Scope is EVERY boxed element (per user: "everything boxed") — cards,
             stat tiles, chips, filter pills, tabs, and round nav buttons all get
             glass. So we DO NOT exclude by radius and we DO NOT force a radius:
             each element keeps its own (pills stay round, cards stay 6px).
           - Exclude ONLY photo tiles via :not([style*="background-image"]) — the
             About portrait is an accent-bordered role="img" whose photo the glass
             \`background\` would otherwise overwrite.
         Gradients are intentionally OPAQUE (~0.66–0.84): backdrop-filter is
         suppressed while an ancestor <V3Scan> holds a filter/transform during the
         arrival scan, so a translucent box would read as a bare tint (the
         "transparent then glass" flash). At this opacity the box is frosted glass
         from the first frame; real backdrop blur layers on as enhancement.
         Shadow kept modest (8/26 vs 14/44) so it reads right on small chips too. */

      /* Neutral boxes — cool dark glass. NOTE the border token match STOPS at
         \`var(--v3-line\` with NO closing paren: that prefix catches BOTH
         \`var(--v3-line)\` (cards) and \`var(--v3-line-strong)\` (chips / pills /
         tabs / round buttons) in one selector. Including the \`)\` would exclude
         every line-strong chip (\`…line)\` ≠ \`…line-strong)\`). */
      .stellar-dossier-frame [style*="border: 1px solid var(--v3-line"]:not([style*="background-image"]){
        /* Base lightened from ~#0e1018 to ~#1e222e so the card reads as a
           distinct frosted-glass PANEL even over dark space (where there's no
           bright planet behind it to frost — the previous near-black gradient
           vanished into the backdrop, e.g. the Projects card). Still opaque. */
        background: linear-gradient(157deg, rgba(30, 34, 46, 0.72), rgba(15, 18, 27, 0.82)) !important;
        border-color: color-mix(in oklab, var(--v3-fg) 17%, transparent) !important;
        box-shadow: 0 8px 26px rgba(0, 0, 0, 0.40), inset 0 1px 0 rgba(255, 255, 255, 0.08) !important;
        backdrop-filter: blur(11px) saturate(135%);
        -webkit-backdrop-filter: blur(11px) saturate(135%);
      }
      /* Emphasis boxes (accent border) — warm-tinted glass that KEEPS the accent
         border + a soft accent glow, so "featured / active" still reads as
         special while matching the frosted-glass system. (\`--v3-accent\` has no
         \`-strong\` variant, so the open-prefix match is equivalent here.) */
      .stellar-dossier-frame [style*="border: 1px solid var(--v3-accent"]:not([style*="background-image"]){
        /* Warm glass, base lightened to match the neutral panel so accent cards
           also read as glass over dark backdrops. */
        background: linear-gradient(157deg, color-mix(in oklab, var(--v3-accent) 13%, rgba(34, 27, 17, 0.76)), rgba(18, 14, 9, 0.85)) !important;
        box-shadow: 0 8px 26px rgba(0, 0, 0, 0.40), 0 0 20px color-mix(in oklab, var(--v3-accent) 16%, transparent), inset 0 1px 0 rgba(255, 255, 255, 0.08) !important;
        backdrop-filter: blur(11px) saturate(135%);
        -webkit-backdrop-filter: blur(11px) saturate(135%);
      }
      /* Touch devices: gradient carries it; drop the blur (cheaper — matters more
         now that "everything boxed" means many small blurred elements). */
      @media (hover: none) and (pointer: coarse){
        .stellar-dossier-frame [style*="border: 1px solid var(--v3-line"]:not([style*="background-image"]),
        .stellar-dossier-frame [style*="border: 1px solid var(--v3-accent"]:not([style*="background-image"]){
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
