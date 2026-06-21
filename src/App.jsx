import { Suspense, lazy, useEffect, useRef, useState } from "react";
import useVisitorAchievements from "./hooks/useVisitorAchievements";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { easterEggs } from "./content";
import ErrorBoundary from "./components/ErrorBoundary";
import Preloader from "./components/Preloader";

import SectionDivider from "./components/SectionDivider";
import { ToastProvider, useToast } from "./components/Toast";
import DynamicTitle from "./components/DynamicTitle";
import AnimatedFavicon from "./components/AnimatedFavicon";
import ThemeSwitcher from "./components/ThemeSwitcher";
import Hero from "./sections/Hero";

// Pure-CSS background effects — replaced canvas/three.js implementations
// for buttery scroll. All animation runs on the compositor thread.
import StarsBackground from "./components/StarsBackground";

// Lazy-loaded below-fold sections
const About = lazy(() => import("./sections/About"));
const FunFacts = lazy(() => import("./sections/FunFacts"));
const Experience = lazy(() => import("./sections/Experience"));
const Skills = lazy(() => import("./sections/Skills"));
const Projects = lazy(() => import("./sections/Projects"));
const Notes = lazy(() => import("./sections/Notes"));
const Education = lazy(() => import("./sections/Education"));
const Achievements = lazy(() => import("./sections/Achievements"));
const Hobbies = lazy(() => import("./sections/Hobbies"));
const Testimonials = lazy(() => import("./sections/Testimonials"));
const Contact = lazy(() => import("./sections/Contact"));
const Design = lazy(() => import("./sections/Design"));

// Stellar 3D portfolio — preview at /#stellar during build. Phase 1+ replaces App entirely once approved.
const StellarApp = lazy(() => import("./stellar/StellarApp"));

// Lazy-loaded interactive overlays (not needed at first paint)
const BackToTop = lazy(() => import("./components/BackToTop"));
const EasterEgg = lazy(() => import("./components/EasterEgg"));
const FloatingActionMenu = lazy(() => import("./components/FloatingActionMenu"));
const KeyboardHints = lazy(() => import("./components/KeyboardHints"));
const SpotlightSearch = lazy(() => import("./components/SpotlightSearch"));
const CinemaMode = lazy(() => import("./components/CinemaMode"));

/* ── Inner components defined at module level to prevent remount on App re-render ── */
const AchievementTracker = () => {
  const toast = useToast();
  const unlock = useVisitorAchievements(toast);

  useEffect(() => {
    const handler = (e) => unlock(e.detail);
    window.addEventListener("achievement", handler);
    return () => window.removeEventListener("achievement", handler);
  }, [unlock]);

  return null;
};

const ReferrerGreeting = () => {
  const toast = useToast();
  useEffect(() => {
    if (sessionStorage.getItem("referrer-greeted")) return;
    sessionStorage.setItem("referrer-greeted", "1");
    const ref = document.referrer.toLowerCase();
    if (ref.includes("linkedin")) {
      toast("Welcome from LinkedIn! Thanks for visiting.", "success");
    } else if (ref.includes("github")) {
      toast("Hey fellow developer! Welcome from GitHub.", "success");
    }
  }, [toast]);
  return null;
};

const App = () => {
  // Console easter eggs for devs who inspect — ref guard prevents StrictMode double-fire
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

  // Theme state — still synced with localStorage so the theme switcher works.
  // The ambient background no longer changes (the CSS gradient mesh is themeable
  // via the existing data-theme color overrides).
  const [, setTheme] = useState(() => {
    if (typeof window === "undefined") return "space";
    return localStorage.getItem("portfolio_theme") || "space";
  });
  useEffect(() => {
    const handler = (e) => setTheme(e.detail || "space");
    window.addEventListener("portfolio-theme-change", handler);
    return () => window.removeEventListener("portfolio-theme-change", handler);
  }, []);

  // Hash-route: '#design' opens the design-system page, '#stellar' opens the
  // new 3D solar system portfolio (in active development). Default = current site.
  const [route, setRoute] = useState(() => {
    if (typeof window === "undefined") return "home";
    if (window.location.hash === "#design") return "design";
    if (window.location.hash === "#stellar") return "stellar";
    return "home";
  });
  useEffect(() => {
    const onHash = () => {
      if (window.location.hash === "#design") setRoute("design");
      else if (window.location.hash === "#stellar") setRoute("stellar");
      else setRoute("home");
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  if (route === "design") {
    return (
      <ToastProvider>
        <main id="main-content" className="relative z-0">
          <Suspense fallback={null}>
            <Design />
          </Suspense>
        </main>
      </ToastProvider>
    );
  }
  if (route === "stellar") {
    return (
      <Suspense fallback={null}>
        <StellarApp />
      </Suspense>
    );
  }

  return (
    <ToastProvider>
      <AchievementTracker />
      <ReferrerGreeting />
      <main id="main-content" className="relative z-0">
        <div className="noise-overlay" aria-hidden="true" />
        <Preloader />
        <DynamicTitle />
        <AnimatedFavicon />
        {/* Pure-CSS ambient background — no canvas, no RAF, no main-thread cost */}
        <StarsBackground />
        <div className="ambient-mesh" aria-hidden="true" />
        <ThemeSwitcher />
        <a
          href="#about"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[50] focus:bg-tertiary focus:text-white focus:px-4 focus:py-2 focus:rounded-lg"
        >
          Skip to main content
        </a>
        <div className="relative">
          {/* Hero background — fades out at bottom */}
          <div
            className="absolute inset-0 bg-hero-pattern bg-cover bg-no-repeat bg-center"
            style={{
              maskImage: "linear-gradient(to bottom, #000 60%, transparent 100%)",
              WebkitMaskImage: "linear-gradient(to bottom, #000 60%, transparent 100%)",
            }}
          />
          <Navbar />
          <Hero />
        </div>

        <div className="mt-[clamp(4rem,8vw,6rem)]" />
        <Suspense fallback={null}>
          <ErrorBoundary>
            <About />
          </ErrorBoundary>
          <SectionDivider />
          <ErrorBoundary>
            <FunFacts />
          </ErrorBoundary>
          <SectionDivider />
          <ErrorBoundary>
            <Experience />
          </ErrorBoundary>
          <SectionDivider />
          <ErrorBoundary>
            <Skills />
          </ErrorBoundary>
          <SectionDivider />
          <ErrorBoundary>
            <Projects />
          </ErrorBoundary>
          <SectionDivider />
          <ErrorBoundary>
            <Notes />
          </ErrorBoundary>
          <SectionDivider />
          <ErrorBoundary>
            <Education />
          </ErrorBoundary>
          <SectionDivider />
          <ErrorBoundary>
            <Achievements />
          </ErrorBoundary>
          <SectionDivider />
          <ErrorBoundary>
            <Hobbies />
          </ErrorBoundary>
          <SectionDivider />
          <ErrorBoundary>
            <Testimonials />
          </ErrorBoundary>
          <SectionDivider />
          <ErrorBoundary>
            <Contact />
          </ErrorBoundary>
        </Suspense>
        <Footer />
        <Suspense fallback={null}>
          <FloatingActionMenu />
          <KeyboardHints />
          <SpotlightSearch />
          <BackToTop />
          <CinemaMode />
        </Suspense>
      </main>
    </ToastProvider>
  );
};

export default App;
