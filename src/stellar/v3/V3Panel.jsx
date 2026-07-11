/*
 * V3Panel — dispatcher for the per-stop résumé section. Each section (About →
 * Contact) is a self-contained component that reads from src/content; this picks
 * the one for the active body's section and mounts it in the fixed dossier frame.
 * The frame is pointer-transparent so the 3D body behind stays interactive;
 * sections opt back in on their own columns.
 *
 * Sections are React.lazy so the ~12 section chunks (and their content) are
 * deferred off the hero's first paint — only the active body's section loads.
 */
import { lazy, memo, Suspense } from "react";

const SECTION_COMPONENT = {
  about: lazy(() => import("./sections/About")),
  funfacts: lazy(() => import("./sections/FunFacts")),
  experience: lazy(() => import("./sections/Experience")),
  skills: lazy(() => import("./sections/Skills")),
  projects: lazy(() => import("./sections/Projects")),
  notes: lazy(() => import("./sections/Notes")),
  achievements: lazy(() => import("./sections/Achievements")),
  education: lazy(() => import("./sections/Education")),
  hobbies: lazy(() => import("./sections/Hobbies")),
  testimonials: lazy(() => import("./sections/Testimonials")),
  whatsetsmeapart: lazy(() => import("./sections/WhatSetsMeApart")),
  contact: lazy(() => import("./sections/Contact")),
};

/* memo: HoloBridge re-renders on every panelHidden toggle (twice per planet
   hop: hide-on-depart + reveal-on-arrival). Without memo the 150-400 line
   section tree reconciles each time even though only the wrapper's opacity
   changed. Props are just (section, bootNonce) — both primitives, so shallow
   compare skips reconcile on every non-section change. */
function V3Panel({ section, bootNonce }) {
  const Section = SECTION_COMPONENT[section];
  if (!Section) return null;
  return (
    <div
      className="stellar-dossier-frame"
      style={{
        pointerEvents: "none",
        position: "fixed",
        inset: 0,
        padding: "clamp(42px, 5vh, 66px) clamp(24px, 4vw, 60px) clamp(48px, 6vh, 74px)",
        zIndex: 40,
        display: "flex",
        overflow: "hidden",
      }}
    >
      <Suspense fallback={null}>
        <Section bootNonce={bootNonce} />
      </Suspense>
    </div>
  );
}

export default memo(V3Panel);
