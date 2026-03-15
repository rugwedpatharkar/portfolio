import { Suspense, lazy, useEffect } from "react";
import {
  Hero,
  Navbar,
  StarsCanvas,
  Footer,
} from "./components";
import ErrorBoundary from "./components/ErrorBoundary";
import ScrollProgressBar from "./components/ScrollProgressBar";
import Preloader from "./components/Preloader";

import SectionDivider from "./components/SectionDivider";
import { ToastProvider } from "./components/Toast";
import GradientMesh from "./components/GradientMesh";
import ScrollDepthBlur from "./components/ScrollDepthBlur";
import CodeRain from "./components/CodeRain";
import DynamicTitle from "./components/DynamicTitle";
import AnimatedFavicon from "./components/AnimatedFavicon";
import ThemeSwitcher from "./components/ThemeSwitcher";

// Lazy-loaded below-fold sections
const About = lazy(() => import("./components/About"));
const FunFacts = lazy(() => import("./components/FunFacts"));
const Experience = lazy(() => import("./components/Experience"));
const Skills = lazy(() => import("./components/Skills"));
const Projects = lazy(() => import("./components/Projects"));
const Education = lazy(() => import("./components/Education"));
const Achievements = lazy(() => import("./components/Achievements"));
const Testimonials = lazy(() => import("./components/Testimonials"));
const Contact = lazy(() => import("./components/Contact"));
// const Blog = lazy(() => import("./components/Blog")); // Hidden until real blog posts are published

// Lazy-loaded interactive overlays (not needed at first paint)
const ContextualCursor = lazy(() => import("./components/ContextualCursor"));
const CursorTrail = lazy(() => import("./components/CursorTrail"));
const BackToTop = lazy(() => import("./components/BackToTop"));
const EasterEgg = lazy(() => import("./components/EasterEgg"));
const FloatingActionMenu = lazy(() => import("./components/FloatingActionMenu"));
const CommandTerminal = lazy(() => import("./components/CommandTerminal"));
const KeyboardHints = lazy(() => import("./components/KeyboardHints"));

const App = () => {
  // Console easter eggs for devs who inspect
  useEffect(() => {
    console.log(
      "%c\n" +
      "  ██████╗ ██╗   ██╗ ██████╗ ██╗    ██╗███████╗██████╗ \n" +
      "  ██╔══██╗██║   ██║██╔════╝ ██║    ██║██╔════╝██╔══██╗\n" +
      "  ██████╔╝██║   ██║██║  ███╗██║ █╗ ██║█████╗  ██║  ██║\n" +
      "  ██╔══██╗██║   ██║██║   ██║██║███╗██║██╔══╝  ██║  ██║\n" +
      "  ██║  ██║╚██████╔╝╚██████╔╝╚███╔███╔╝███████╗██████╔╝\n" +
      "  ╚═╝  ╚═╝ ╚═════╝  ╚═════╝  ╚══╝╚══╝ ╚══════╝╚═════╝ \n",
      "color: #915eff; font-size: 10px; font-family: monospace;"
    );
    console.log(
      "%cHey there, fellow developer! 👋",
      "color: #00cea8; font-size: 16px; font-weight: bold;"
    );
    console.log(
      "%cCurious about the code? Check it out: https://github.com/rugwedpatharkar/portfolio",
      "color: #aaa6c3; font-size: 12px;"
    );
    console.log(
      "%cHint: Try pressing Ctrl+` for a surprise 🎮",
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
      <main id="main-content" className="relative z-0">
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
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[70] focus:bg-tertiary focus:text-white focus:px-4 focus:py-2 focus:rounded-lg"
        >
          Skip to main content
        </a>
        <div className="bg-hero-pattern bg-cover bg-no-repeat bg-center relative">
          <Navbar />
          <Hero />
        </div>
        {/* Gradient fade to smooth the 3D model's hard bottom edge into the background */}
        <div className="relative -mt-48 sm:-mt-64 h-48 sm:h-64 bg-gradient-to-b from-transparent to-[#050816] pointer-events-none z-[3]" />

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
          <BackToTop />
        </Suspense>
      </main>
    </ToastProvider>
  );
};

export default App;
