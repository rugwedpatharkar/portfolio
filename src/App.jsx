import { Suspense, lazy, useEffect, useRef } from "react";
import useVisitorAchievements from "./hooks/useVisitorAchievements";
import {
  Navbar,
  StarsCanvas,
  Footer,
} from "./components";
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

// Lazy-loaded below-fold sections
const About = lazy(() => import("./sections/About"));
const FunFacts = lazy(() => import("./sections/FunFacts"));
const Experience = lazy(() => import("./sections/Experience"));
const Skills = lazy(() => import("./sections/Skills"));
const Projects = lazy(() => import("./sections/Projects"));
const Education = lazy(() => import("./sections/Education"));
const Achievements = lazy(() => import("./sections/Achievements"));
const Hobbies = lazy(() => import("./sections/Hobbies"));
const Testimonials = lazy(() => import("./sections/Testimonials"));
const Contact = lazy(() => import("./sections/Contact"));

// Lazy-loaded interactive overlays (not needed at first paint)
const ContextualCursor = lazy(() => import("./components/ContextualCursor"));
const CursorTrail = lazy(() => import("./components/CursorTrail"));
const BackToTop = lazy(() => import("./components/BackToTop"));
const EasterEgg = lazy(() => import("./components/EasterEgg"));
const FloatingActionMenu = lazy(() => import("./components/FloatingActionMenu"));
const CommandTerminal = lazy(() => import("./components/CommandTerminal"));
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

const CopyBlocker = () => {
  const toast = useToast();
  useEffect(() => {
    const isFormElement = (el) =>
      el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable;

    const blockCopy = (e) => {
      if (!isFormElement(e.target)) {
        e.preventDefault();
        toast("Content copying is disabled on this site.", "warning", 2500);
      }
    };
    const blockContext = (e) => {
      if (!isFormElement(e.target)) {
        e.preventDefault();
        toast("Right-click is disabled on this site.", "warning", 2500);
      }
    };
    const blockKeys = (e) => {
      if (isFormElement(e.target)) return;
      if ((e.ctrlKey || e.metaKey) && ["c", "a", "u", "s"].includes(e.key.toLowerCase())) {
        e.preventDefault();
        toast("This keyboard shortcut is disabled.", "warning", 2500);
      }
    };

    document.addEventListener("copy", blockCopy);
    document.addEventListener("cut", blockCopy);
    document.addEventListener("contextmenu", blockContext);
    document.addEventListener("keydown", blockKeys);
    return () => {
      document.removeEventListener("copy", blockCopy);
      document.removeEventListener("cut", blockCopy);
      document.removeEventListener("contextmenu", blockContext);
      document.removeEventListener("keydown", blockKeys);
    };
  }, [toast]);
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

  // Add custom-cursor class to body for hiding default cursor on desktop
  useEffect(() => {
    const isDesktop = window.innerWidth >= 768;
    if (isDesktop) document.body.classList.add("custom-cursor");
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        document.body.classList.add("custom-cursor");
      } else {
        document.body.classList.remove("custom-cursor");
      }
    };
    window.addEventListener("resize", handleResize);
    return () => {
      document.body.classList.remove("custom-cursor");
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <ToastProvider>
      <CopyBlocker />
      <AchievementTracker />
      <ReferrerGreeting />
      <main id="main-content" className="relative z-0">
        <div className="noise-overlay" aria-hidden="true" />
        <Preloader />
        <DynamicTitle />
        <AnimatedFavicon />
        <Suspense fallback={null}>
          <StarsCanvas fixed />
        </Suspense>
        <CodeRain />
        <GradientMesh />
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

        <div className="mt-16 sm:mt-24" />
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
          <CommandTerminal />
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
