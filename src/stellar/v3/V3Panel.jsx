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

/* Import thunks kept separate from the lazy() wrappers so they can be PRELOADED
   (warmed into the module cache) during the intro — otherwise the first display
   of a section at a scroll boundary pays the dynamic-import + glass-paint cost
   as a frame dip. `preloadSection` and `lazy()` share these, so specifiers never
   desync. */
const SECTION_LOADERS = {
  about: () => import("./sections/About"),
  funfacts: () => import("./sections/FunFacts"),
  experience: () => import("./sections/Experience"),
  skills: () => import("./sections/Skills"),
  projects: () => import("./sections/Projects"),
  notes: () => import("./sections/Notes"),
  achievements: () => import("./sections/Achievements"),
  education: () => import("./sections/Education"),
  hobbies: () => import("./sections/Hobbies"),
  testimonials: () => import("./sections/Testimonials"),
  whatsetsmeapart: () => import("./sections/WhatSetsMeApart"),
  contact: () => import("./sections/Contact"),
};

/* Fire-and-forget preload — the module cache dedupes with the matching lazy(). */
export const preloadSection = (name) => { SECTION_LOADERS[name]?.(); };

const SECTION_COMPONENT = Object.fromEntries(
  Object.entries(SECTION_LOADERS).map(([k, load]) => [k, lazy(load)]),
);

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
