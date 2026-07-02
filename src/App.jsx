import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import AppErrorBoundary from "./AppErrorBoundary";
import { easterEggs } from "./content";

/* One-shot WebGL feature check — recruiters with WebGL disabled, ancient browsers,
   or a broken graphics driver should NOT see the 3D tour crash. We probe once at
   module load; a WebGL2 OR WebGL1 context both satisfy Three.js's requirements. */
const hasWebGL = (() => {
  if (typeof window === "undefined") return true; // don't force fallback in SSR
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
  } catch (_) { return false; }
})();

/*
 * Stellar 3D solar-system portfolio is now the default surface.
 *
 * Optional alternate routes:
 *   #design  — design-system page (kept for token reference)
 *   #legacy  — old scroll site (kept as fallback while Stellar settles in)
 *
 * Default (and #stellar) renders the 3D portfolio.
 */

const StellarApp = lazy(() => import("./stellar/StellarApp"));
const Design = lazy(() => import("./sections/Design"));
const LegacyApp = lazy(() => import("./LegacyApp"));

/* v3 is the DEFAULT landing experience. #stellar → the v2 cockpit, #legacy →
   the old scroll site, #design → the token page; anything else (incl. bare "/") → v3.
   If the browser can't do WebGL, force EVERYTHING (default, #v3, #stellar) to the
   #legacy scroll site — the 3D tour would only crash otherwise. */
const routeForHash = (h = "") => {
  if (h === "#design") return "design";
  if (h === "#legacy") return "legacy";
  if (!hasWebGL) return "legacy";
  if (h === "#stellar" || h.startsWith("#stellar/") || h.startsWith("#/stellar")) return "stellar";
  return "v3";
};

/* Branded first-load curtain — shown while the app chunk streams, so the first
   paint is an elegant fade-in of the name (on the v3 void) instead of a black
   flash. Uses hardcoded v3 colors since the token skin mounts after this. */
const BootReveal = () => (
  <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "#050609", display: "flex", alignItems: "center", justifyContent: "center" }}>
    <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 340, fontSize: "clamp(1.5rem, 5vw, 2.4rem)", letterSpacing: "-.01em", color: "#f5f7fc", opacity: 0, animation: "stellarBoot 700ms cubic-bezier(.22,1,.36,1) forwards" }}>
      Rugwed <em style={{ fontStyle: "italic", color: "#e9c675" }}>Patharkar</em>
    </div>
    <style>{`@keyframes stellarBoot{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
      @media (prefers-reduced-motion: reduce){[style*="stellarBoot"]{animation:none!important;opacity:1!important}}`}</style>
  </div>
);

const App = () => {
  const consoleLoggedRef = useRef(false);
  useEffect(() => {
    if (consoleLoggedRef.current) return;
    consoleLoggedRef.current = true;
    console.log(
      "%c\n" + easterEggs.ascii + " \n",
      "color: #915eff; font-size: 10px; font-family: monospace;"
    );
    console.log(
      `%c${easterEggs.greeting}`,
      "color: #00cea8; font-size: 16px; font-weight: bold;"
    );
    console.log(
      `%c${easterEggs.repoLink}`,
      "color: #aaa6c3; font-size: 12px;"
    );
    console.log(
      `%c${easterEggs.hint}`,
      "color: #bf61ff; font-size: 12px;"
    );
  }, []);

  const [route, setRoute] = useState(() =>
    typeof window === "undefined" ? "v3" : routeForHash(window.location.hash)
  );

  useEffect(() => {
    const onHash = () => setRoute(routeForHash(window.location.hash));
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const routed = (() => {
    if (route === "design") return (
      <main id="main-content" className="relative z-0">
        <Suspense fallback={null}><Design /></Suspense>
      </main>
    );
    if (route === "legacy") return (
      <Suspense fallback={null}><LegacyApp /></Suspense>
    );
    return (
      <Suspense fallback={<BootReveal />}>
        <StellarApp v3={route === "v3"} />
      </Suspense>
    );
  })();

  return (
    <AppErrorBoundary>
      {routed}
      {/* Vercel Analytics + Speed Insights — mount at the app root so ALL routes
          are covered. Auto-tracks page views; no-op locally (dev mode has no
          network call by default). */}
      <Analytics />
      <SpeedInsights />
    </AppErrorBoundary>
  );
};

export default App;
