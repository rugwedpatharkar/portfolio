import { Suspense, lazy, useEffect, useRef, useState } from "react";
import useVisitorAchievements from "./hooks/useVisitorAchievements";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { easterEggs } from "./content";
import ErrorBoundary from "./components/ErrorBoundary";
import ScrollProgressBar from "./components/ScrollProgressBar";
import Preloader from "./components/Preloader";

import SectionDivider from "./components/SectionDivider";
import { ToastProvider, useToast } from "./components/Toast";
import GradientMesh from "./components/GradientMesh";
import ScrollDepthBlur from "./components/ScrollDepthBlur";
import CodeRain from "./components/CodeRain";
import DynamicTitle from "./components/DynamicTitle";
import AnimatedFavicon from "./components/AnimatedFavicon";
import ThemeSwitcher from "./components/ThemeSwitcher";
import Hero from "./sections/Hero";

// StarsCanvas is purely decorative + pulls in the 945 KB three.js chunk.
// Lazy-load it so three.js stays out of the critical-path bundle and only
// downloads after the page is interactive.
const StarsCanvas = lazy(() => import("./components/canvas/Stars"));

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

// Lazy-loaded interactive overlays (not needed at first paint)
const ContextualCursor = lazy(() => import("./components/ContextualCursor"));
const CursorTrail = lazy(() => import("./components/CursorTrail"));
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

  // Add custom-cursor class to body for hiding default cursor on devices with a precise pointer.
  // matchMedia('(hover: hover) and (pointer: fine)') is the correct semantic check — it asks
  // "does the user have a real mouse" — and fires once on change rather than on every resize.
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const apply = (matches) => {
      document.body.classList.toggle("custom-cursor", matches);
    };
    apply(mq.matches);
    const handleChange = (e) => apply(e.matches);
    mq.addEventListener("change", handleChange);
    return () => {
      document.body.classList.remove("custom-cursor");
      mq.removeEventListener("change", handleChange);
    };
  }, []);

  // Theme-aware ambient background: GradientMesh for the default "space" theme,
  // CodeRain for "cyber" / "matrix". Only one runs at a time — they paint the
  // same surface and shouldn't compete for the frame budget.
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "space";
    return localStorage.getItem("portfolio_theme") || "space";
  });
  useEffect(() => {
    const handler = (e) => setTheme(e.detail || "space");
    window.addEventListener("portfolio-theme-change", handler);
    return () => window.removeEventListener("portfolio-theme-change", handler);
  }, []);
  const useCodeRain = theme === "cyber" || theme === "matrix";

  // Defer StarsCanvas (945 KB three.js chunk) until after first paint.
  // Without this, even though it's a lazy import, the Suspense renders
  // immediately on mount and Vite preloads the chunk during initial load.
  // Waiting for requestIdleCallback ensures three.js downloads after
  // the page is interactive, not during LCP.
  const [showStars, setShowStars] = useState(false);
  useEffect(() => {
    const ric = window.requestIdleCallback || ((cb) => setTimeout(cb, 1500));
    const id = ric(() => setShowStars(true));
    return () => {
      if (window.cancelIdleCallback) window.cancelIdleCallback(id);
      else clearTimeout(id);
    };
  }, []);

  // Hash-route: '#design' opens the internal design-system page in place of the
  // portfolio. Keeps everything in one bundle, no router dependency. Lazy-loaded
  // so the design module is zero cost for normal visitors.
  const [route, setRoute] = useState(() =>
    typeof window !== "undefined" && window.location.hash === "#design" ? "design" : "home"
  );
  useEffect(() => {
    const onHash = () => setRoute(window.location.hash === "#design" ? "design" : "home");
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

  return (
    <ToastProvider>
      <AchievementTracker />
      <ReferrerGreeting />
      <main id="main-content" className="relative z-0">
        <div className="noise-overlay" aria-hidden="true" />
        <Preloader />
        <DynamicTitle />
        <AnimatedFavicon />
        {showStars && (
          <Suspense fallback={null}>
            <StarsCanvas fixed />
          </Suspense>
        )}
        {useCodeRain ? <CodeRain /> : <GradientMesh />}
        <ScrollDepthBlur />
        <Suspense fallback={null}>
          <ContextualCursor />
          <CursorTrail />
          <EasterEgg />
        </Suspense>
        <ScrollProgressBar />
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
