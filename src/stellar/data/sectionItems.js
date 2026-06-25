/*
 * Per-section item lists for the 2-axis nav: ↑↓ moves between planets/sections,
 * ←→ moves between THESE items (each rendered as an object on the planet's
 * orbital lane). One source of truth, read from the Content layer so adding a
 * job / project / skill is a data edit, not a code change.
 */
import {
  experiences,
  projects,
  skills,
  educations,
  achievements,
  testimonials,
  funFacts,
  hobbies,
  blogPosts,
  contactLinks,
} from "../../content";

const label = (v, fallback) => v || fallback;

/* section id → ordered items { id, label, kind } strung along that planet's lane. */
export const SECTION_ITEMS = {
  about: [{ id: "about-0", label: "Profile", kind: "dossier" }],
  funfacts: funFacts.map((f, i) => ({ id: `funfact-${i}`, label: label(f.label, `Fact ${i + 1}`), kind: "fact" })),
  experience: experiences.map((e, i) => ({ id: `exp-${i}`, label: label(e.companyName, e.title || `Role ${i + 1}`), kind: "station" })),
  projects: projects.map((p, i) => ({ id: `proj-${i}`, label: label(p.name, `Project ${i + 1}`), kind: "probe" })),
  achievements: achievements.map((a, i) => ({ id: `ach-${i}`, label: label(a.title, `Milestone ${i + 1}`), kind: "beacon" })),
  skills: Object.keys(skills).map((k, i) => ({ id: `skill-${i}`, label: k, kind: "moon" })),
  notes: blogPosts.map((b, i) => ({ id: `note-${i}`, label: label(b.title, `Note ${i + 1}`), kind: "log" })),
  education: educations.map((e, i) => ({ id: `edu-${i}`, label: label(e.shortName, e.degree || `Degree ${i + 1}`), kind: "moon" })),
  hobbies: hobbies.map((h, i) => ({ id: `hobby-${i}`, label: label(h.name, `Pursuit ${i + 1}`), kind: "drone" })),
  testimonials: testimonials.map((t, i) => ({ id: `test-${i}`, label: label(t.name, `Voice ${i + 1}`), kind: "relay" })),
  contact: contactLinks.map((c, i) => ({ id: `contact-${i}`, label: label(c.label, `Channel ${i + 1}`), kind: "beacon" })),
};

export const itemsForSection = (section) => SECTION_ITEMS[section] || [];
export const itemCount = (section) => itemsForSection(section).length;
