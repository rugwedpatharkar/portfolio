import { useEffect } from "react";
import { cssVars, accentFor } from "./tokens";

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

  /* Live accent update — cheap, no re-render of the tree. */
  useEffect(() => {
    document.documentElement.style.setProperty("--v3-accent", accentFor(accentKey));
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
      .stellar-v3 ::selection{background:color-mix(in oklab,var(--v3-accent) 40%,transparent);color:var(--v3-fg);}
      /* Chromeless reading column — kill the (global purple) scrollbar entirely;
         the edge fade + single-open accordion carry the "there's more" signal. */
      .stellar-v3 .stellar-content-left{scrollbar-width:none;-ms-overflow-style:none;}
      .stellar-v3 .stellar-content-left::-webkit-scrollbar{width:0;height:0;display:none;}
      @media (prefers-reduced-motion: reduce){
        .stellar-v3 *{animation-duration:.001ms !important;animation-iteration-count:1 !important;}
      }
    `}</style>
  );
};

export default V3Style;
