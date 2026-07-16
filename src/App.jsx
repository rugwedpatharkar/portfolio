import { Suspense, lazy, useEffect, useRef } from "react";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import AppErrorBoundary from "./AppErrorBoundary";
import { easterEggs } from "./content";

/* One-shot WebGL feature check — recruiters with WebGL disabled, ancient browsers,
   or a broken graphics driver get a lightweight static résumé instead of a crashed
   3D canvas. We probe once at module load; a WebGL2 OR WebGL1 context both satisfy
   Three.js's requirements. */
const hasWebGL = (() => {
  if (typeof window === "undefined") return true; // don't force fallback in SSR
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
  } catch (_) { return false; }
})();

/* The Stellar 3D solar-system portfolio is the one and only surface. */
const StellarApp = lazy(() => import("./stellar/StellarApp"));

/* Branded first-load curtain — shown while the app chunk streams, so the first
   paint is an elegant fade-in of the name (on the v3 void) instead of a black
   flash. Hardcoded v3 colours since the token skin mounts after this. */
const BootReveal = () => (
  <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "#050609", display: "flex", alignItems: "center", justifyContent: "center" }}>
    <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 340, fontSize: "clamp(1.5rem, 5vw, 2.4rem)", letterSpacing: "-.01em", color: "#f5f7fc", opacity: 0, animation: "stellarBoot 700ms cubic-bezier(.22,1,.36,1) forwards" }}>
      Rugwed <em style={{ fontStyle: "italic", color: "#e9c675" }}>Patharkar</em>
    </div>
    <style>{`@keyframes stellarBoot{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
      @media (prefers-reduced-motion: reduce){[style*="stellarBoot"]{animation:none!important;opacity:1!important}}`}</style>
  </div>
);

/* No-WebGL fallback — a lightweight static résumé so visitors without a working
   3D context still get the essentials (no lazy chunk, no Three.js). Uses only the
   fonts index.html already loads for the boot / error UIs. */
const StaticResume = () => {
  const link = { color: "#e9c675", textDecoration: "none", borderBottom: "1px solid rgba(233,198,117,.4)", paddingBottom: 1 };
  return (
    <main id="main-content" style={{ position: "fixed", inset: 0, overflow: "auto", background: "#050609", color: "#f5f7fc", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center" }}>
      <div style={{ maxWidth: 560 }}>
        <div style={{ font: "400 .72rem 'Space Mono', monospace", letterSpacing: ".28em", textTransform: "uppercase", color: "#8a8fa3", marginBottom: 18 }}>Rugwed Patharkar</div>
        <h1 style={{ font: "400 clamp(2.2rem, 6vw, 3.4rem) 'Fraunces', Georgia, serif", lineHeight: 1.05, letterSpacing: "-.02em", margin: "0 0 .4em" }}>
          Backend &amp; <em style={{ fontStyle: "italic", color: "#e9c675" }}>Agentic AI</em> Engineer
        </h1>
        <p style={{ font: "300 1.05rem 'Space Grotesk', system-ui, sans-serif", color: "#c4c8d6", lineHeight: 1.6, margin: "0 0 28px" }}>
          I build distributed Python/FastAPI/gRPC backends and agentic-AI systems at Upswing
          (Pune, India). Your browser can’t run the interactive 3D tour — here are the essentials.
        </p>
        <div style={{ font: "400 1rem 'Space Grotesk', system-ui, sans-serif", display: "flex", gap: 22, justifyContent: "center", flexWrap: "wrap" }}>
          <a style={link} href="/Rugwed-Patharkar-Resume.pdf">Résumé (PDF)</a>
          <a style={link} href="mailto:rugwed@upswing.global">Email</a>
          <a style={link} href="https://www.linkedin.com/in/rugwed-patharkar" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <a style={link} href="https://github.com/rugwedpatharkar" target="_blank" rel="noopener noreferrer">GitHub</a>
        </div>
      </div>
    </main>
  );
};

const App = () => {
  const consoleLoggedRef = useRef(false);
  useEffect(() => {
    if (consoleLoggedRef.current) return;
    consoleLoggedRef.current = true;
    console.log(
      "%c\n" + easterEggs.ascii + " \n",
      "color: #915eff; font-size: 10px; font-family: monospace;"
    );
    console.log(`%c${easterEggs.greeting}`, "color: #00cea8; font-size: 16px; font-weight: bold;");
    console.log(`%c${easterEggs.repoLink}`, "color: #aaa6c3; font-size: 12px;");
    console.log(`%c${easterEggs.hint}`, "color: #bf61ff; font-size: 12px;");
  }, []);

  return (
    <AppErrorBoundary>
      {hasWebGL ? (
        <Suspense fallback={<BootReveal />}>
          <StellarApp />
        </Suspense>
      ) : (
        <StaticResume />
      )}
      {/* Vercel Analytics + Speed Insights — auto-tracks page views; no-op locally. */}
      <Analytics />
      <SpeedInsights />
    </AppErrorBoundary>
  );
};

export default App;
