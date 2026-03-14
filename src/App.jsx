import { Suspense, useEffect } from "react";
import {
  About,
  Contact,
  Experience,
  Hero,
  Navbar,
  Skills,
  Projects,
  StarsCanvas,
  Education,
  Footer,
} from "./components";
import ErrorBoundary from "./components/ErrorBoundary";
import ScrollProgressBar from "./components/ScrollProgressBar";
import BackToTop from "./components/BackToTop";
import ContextualCursor from "./components/ContextualCursor";
import Preloader from "./components/Preloader";
import FunFacts from "./components/FunFacts";
import Achievements from "./components/Achievements";
import Testimonials from "./components/Testimonials";
import Blog from "./components/Blog";
import GitHubActivity from "./components/GitHubActivity";
import EasterEgg from "./components/EasterEgg";
import FloatingActionMenu from "./components/FloatingActionMenu";
import WaveDivider from "./components/WaveDivider";
import SvgLineDraw from "./components/SvgLineDraw";
import { ToastProvider } from "./components/Toast";
import GradientMesh from "./components/GradientMesh";
import CommandTerminal from "./components/CommandTerminal";
import MusicToggle from "./components/MusicToggle";
import KeyboardHints from "./components/KeyboardHints";

const App = () => {
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
      <div className="relative z-0">
        <Preloader />
        <Suspense fallback={null}>
          <StarsCanvas fixed />
        </Suspense>
        <GradientMesh />
        <ContextualCursor />
        <ScrollProgressBar />
        <EasterEgg />
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

        <WaveDivider color="rgba(5, 8, 22, 0.4)" />

        <ErrorBoundary>
          <About />
        </ErrorBoundary>
        <ErrorBoundary>
          <FunFacts />
        </ErrorBoundary>

        <SvgLineDraw variant="circuit" />

        <WaveDivider color="rgba(29, 24, 54, 0.5)" />
        <div className="bg-[#1d1836]/50 backdrop-blur-sm">
          <ErrorBoundary>
            <Experience />
          </ErrorBoundary>
        </div>
        <WaveDivider color="rgba(29, 24, 54, 0.5)" flip />

        <SvgLineDraw variant="nodes" />

        <ErrorBoundary>
          <Skills />
        </ErrorBoundary>

        <SvgLineDraw variant="wave" />

        <ErrorBoundary>
          <Projects />
        </ErrorBoundary>
        <ErrorBoundary>
          <Education />
        </ErrorBoundary>

        <SvgLineDraw variant="circuit" />

        <ErrorBoundary>
          <Achievements />
        </ErrorBoundary>
        <ErrorBoundary>
          <Testimonials />
        </ErrorBoundary>
        <ErrorBoundary>
          <GitHubActivity />
        </ErrorBoundary>

        <SvgLineDraw variant="nodes" />

        <ErrorBoundary>
          <Blog />
        </ErrorBoundary>
        <div className="relative z-0">
          <ErrorBoundary>
            <Contact />
          </ErrorBoundary>
        </div>
        <Footer />
        <FloatingActionMenu />
        <CommandTerminal />
        <MusicToggle />
        <KeyboardHints />
        <BackToTop />
      </div>
    </ToastProvider>
  );
};

export default App;
