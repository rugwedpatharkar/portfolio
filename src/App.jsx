import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { easterEggs } from "./content";

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

  const [route, setRoute] = useState(() => {
    if (typeof window === "undefined") return "stellar";
    const h = window.location.hash;
    if (h === "#design") return "design";
    if (h === "#legacy") return "legacy";
    return "stellar";
  });

  useEffect(() => {
    const onHash = () => {
      const h = window.location.hash;
      if (h === "#design") setRoute("design");
      else if (h === "#legacy") setRoute("legacy");
      else setRoute("stellar");
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  if (route === "design") {
    return (
      <main id="main-content" className="relative z-0">
        <Suspense fallback={null}>
          <Design />
        </Suspense>
      </main>
    );
  }
  if (route === "legacy") {
    return (
      <Suspense fallback={null}>
        <LegacyApp />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={null}>
      <StellarApp />
    </Suspense>
  );
};

export default App;
