import { Suspense } from "react";
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
import CursorSpotlight from "./components/CursorSpotlight";
import Preloader from "./components/Preloader";
import FunFacts from "./components/FunFacts";
import Achievements from "./components/Achievements";
import Testimonials from "./components/Testimonials";
import Blog from "./components/Blog";
import GitHubActivity from "./components/GitHubActivity";
import EasterEgg from "./components/EasterEgg";
import FloatingActionMenu from "./components/FloatingActionMenu";
import WaveDivider from "./components/WaveDivider";
import { ToastProvider } from "./components/Toast";

const App = () => {
  return (
    <ToastProvider>
      <div className="relative z-0 bg-primary">
        <Preloader />
        <CursorSpotlight />
        <ScrollProgressBar />
        <EasterEgg />
        <a
          href="#about"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[70] focus:bg-tertiary focus:text-white focus:px-4 focus:py-2 focus:rounded-lg"
        >
          Skip to main content
        </a>
        <div className="bg-hero-pattern bg-cover bg-no-repeat bg-center">
          <Navbar />
          <Hero />
        </div>

        <WaveDivider color="#050816" />

        <ErrorBoundary>
          <About />
        </ErrorBoundary>
        <ErrorBoundary>
          <FunFacts />
        </ErrorBoundary>

        <WaveDivider color="#1d1836" />
        <div className="bg-[#1d1836]">
          <ErrorBoundary>
            <Experience />
          </ErrorBoundary>
        </div>
        <WaveDivider color="#1d1836" flip />

        <ErrorBoundary>
          <Skills />
        </ErrorBoundary>
        <ErrorBoundary>
          <Projects />
        </ErrorBoundary>
        <ErrorBoundary>
          <Education />
        </ErrorBoundary>

        <ErrorBoundary>
          <Achievements />
        </ErrorBoundary>
        <ErrorBoundary>
          <Testimonials />
        </ErrorBoundary>
        <ErrorBoundary>
          <GitHubActivity />
        </ErrorBoundary>
        <ErrorBoundary>
          <Blog />
        </ErrorBoundary>
        <div className="relative z-0">
          <ErrorBoundary>
            <Contact />
          </ErrorBoundary>
          <Suspense fallback={null}>
            <StarsCanvas />
          </Suspense>
        </div>
        <Footer />
        <FloatingActionMenu />
        <BackToTop />
      </div>
    </ToastProvider>
  );
};

export default App;
