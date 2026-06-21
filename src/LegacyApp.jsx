import { Suspense, lazy, useEffect, useState } from "react";
import useVisitorAchievements from "./hooks/useVisitorAchievements";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ErrorBoundary from "./components/ErrorBoundary";
import Preloader from "./components/Preloader";
import SectionDivider from "./components/SectionDivider";
import { ToastProvider, useToast } from "./components/Toast";
import DynamicTitle from "./components/DynamicTitle";
import AnimatedFavicon from "./components/AnimatedFavicon";
import ThemeSwitcher from "./components/ThemeSwitcher";
import Hero from "./sections/Hero";
import StarsBackground from "./components/StarsBackground";

/*
 * Legacy scroll-based portfolio, kept as a fallback under /#legacy. The
 * Stellar 3D portfolio is the default surface at /#stellar (and root).
 *
 * This file is verbatim from the pre-Stellar App.jsx, minus the routing
 * shell which lives in App.jsx now.
 */

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

const BackToTop = lazy(() => import("./components/BackToTop"));
const FloatingActionMenu = lazy(() => import("./components/FloatingActionMenu"));
const KeyboardHints = lazy(() => import("./components/KeyboardHints"));
const SpotlightSearch = lazy(() => import("./components/SpotlightSearch"));
const CinemaMode = lazy(() => import("./components/CinemaMode"));

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
    if (ref.includes("linkedin")) toast("Welcome from LinkedIn! Thanks for visiting.", "success");
    else if (ref.includes("github")) toast("Hey fellow developer! Welcome from GitHub.", "success");
  }, [toast]);
  return null;
};

const LegacyApp = () => {
  const [, setTheme] = useState(() => {
    if (typeof window === "undefined") return "space";
    return localStorage.getItem("portfolio_theme") || "space";
  });
  useEffect(() => {
    const handler = (e) => setTheme(e.detail || "space");
    window.addEventListener("portfolio-theme-change", handler);
    return () => window.removeEventListener("portfolio-theme-change", handler);
  }, []);

  return (
    <ToastProvider>
      <AchievementTracker />
      <ReferrerGreeting />
      <main id="main-content" className="relative z-0">
        <div className="noise-overlay" aria-hidden="true" />
        <Preloader />
        <DynamicTitle />
        <AnimatedFavicon />
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
          <ErrorBoundary><About /></ErrorBoundary>
          <SectionDivider />
          <ErrorBoundary><FunFacts /></ErrorBoundary>
          <SectionDivider />
          <ErrorBoundary><Experience /></ErrorBoundary>
          <SectionDivider />
          <ErrorBoundary><Skills /></ErrorBoundary>
          <SectionDivider />
          <ErrorBoundary><Projects /></ErrorBoundary>
          <SectionDivider />
          <ErrorBoundary><Notes /></ErrorBoundary>
          <SectionDivider />
          <ErrorBoundary><Education /></ErrorBoundary>
          <SectionDivider />
          <ErrorBoundary><Achievements /></ErrorBoundary>
          <SectionDivider />
          <ErrorBoundary><Hobbies /></ErrorBoundary>
          <SectionDivider />
          <ErrorBoundary><Testimonials /></ErrorBoundary>
          <SectionDivider />
          <ErrorBoundary><Contact /></ErrorBoundary>
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

export default LegacyApp;
