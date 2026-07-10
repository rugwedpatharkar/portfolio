/*
 * V3Panel — dispatcher for the per-stop résumé section. Each section (About →
 * Contact) is a self-contained component that reads from src/content; this picks
 * the one for the active body's section and mounts it in the fixed dossier frame.
 * The frame is pointer-transparent so the 3D body behind stays interactive;
 * sections opt back in on their own columns. (The legacy inline-accordion
 * fallback was removed — every stop has a section component.)
 */
import AboutSection from "./sections/About";
import FunFactsSection from "./sections/FunFacts";
import ExperienceSection from "./sections/Experience";
import SkillsSection from "./sections/Skills";
import ProjectsSection from "./sections/Projects";
import NotesSection from "./sections/Notes";
import AchievementsSection from "./sections/Achievements";
import EducationSection from "./sections/Education";
import HobbiesSection from "./sections/Hobbies";
import TestimonialsSection from "./sections/Testimonials";
import ContactSection from "./sections/Contact";
import WhatSetsMeApartSection from "./sections/WhatSetsMeApart";

const SECTION_COMPONENT = {
  about: AboutSection,
  funfacts: FunFactsSection,
  experience: ExperienceSection,
  skills: SkillsSection,
  projects: ProjectsSection,
  notes: NotesSection,
  achievements: AchievementsSection,
  education: EducationSection,
  hobbies: HobbiesSection,
  testimonials: TestimonialsSection,
  whatsetsmeapart: WhatSetsMeApartSection,
  contact: ContactSection,
};

export default function V3Panel({ section, bootNonce }) {
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
      <Section bootNonce={bootNonce} />
    </div>
  );
}
