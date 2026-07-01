/*
 * Per-section item lists for the 2-axis nav: ↑↓ moves between planets/sections,
 * ←→ moves between THESE items (each rendered as an object on the planet's
 * orbital lane). One source of truth, read from the Content layer so adding a
 * job / project / skill is a data edit, not a code change.
 *
 * Each item also carries a NORMALISED `dossier` (Phase 2B) — the holographic
 * per-item readout ItemDossier renders when ←→ focuses it. Shape:
 *   { eyebrow, title, subtitle, meta:[{value,label}], body:[str | {head,points[]}],
 *     tags:[str], accent?, icon?, href? }
 * Mapping the heterogeneous source shapes into this one shape lives HERE (data
 * layer), keeping the dossier view generic.
 */
import {
  personalInfo,
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
const clean = (arr) => (arr || []).filter(Boolean);

/* section id → ordered items { id, label, kind, dossier } strung along the lane. */
export const SECTION_ITEMS = {
  about: [
    {
      id: "about-0",
      label: "Profile",
      kind: "dossier",
      dossier: {
        eyebrow: "CREW DOSSIER",
        title: personalInfo.fullName,
        subtitle: personalInfo.availability,
        meta: [
          { value: personalInfo.yearsExperience, label: "Years" },
          { value: "31", label: "Services" },
          { value: personalInfo.location, label: "Based" },
        ],
        body: [personalInfo.about],
        tags: clean((personalInfo.languages || "").split(" · ")),
      },
    },
  ],

  funfacts: funFacts.map((f, i) => ({
    id: `funfact-${i}`,
    label: label(f.label, `Fact ${i + 1}`),
    kind: "fact",
    dossier: {
      eyebrow: "TELEMETRY SIGNAL",
      title: label(f.label, `Fact ${i + 1}`),
      subtitle: `${f.value}${f.suffix || ""}`,
      icon: f.icon,
      meta: [],
      body: [f.detail],
      tags: [],
    },
  })),

  experience: experiences.map((e, i) => ({
    id: `exp-${i}`,
    label: label(e.companyName, e.title || `Role ${i + 1}`),
    kind: "station",
    dossier: {
      eyebrow: "SERVICE RECORD",
      title: label(e.companyName, `Role ${i + 1}`),
      subtitle: clean([e.title, e.date]).join(" · "),
      accent: e.achievement,
      meta: e.metrics || [],
      body: (e.categories || []).map((c) => ({ head: c.name, points: c.points })),
      tags: e.tech || [],
    },
  })),

  projects: projects.map((p, i) => ({
    id: `proj-${i}`,
    label: label(p.name, `Project ${i + 1}`),
    kind: "probe",
    dossier: {
      eyebrow: "MISSION FILE",
      title: label(p.name, `Project ${i + 1}`),
      subtitle: clean([p.status, p.year, p.team]).join(" · "),
      meta: (p.stats || []).map((s) => ({ value: s.value, label: s.label })),
      body: clean([p.description, p.features && p.features.length ? { head: "Capabilities", points: p.features } : null]),
      tags: (p.tags || []).map((t) => t.name || t),
    },
  })),

  achievements: achievements.map((a, i) => ({
    id: `ach-${i}`,
    label: label(a.title, `Milestone ${i + 1}`),
    kind: "beacon",
    dossier: {
      eyebrow: "COMMENDATION",
      title: label(a.title, `Milestone ${i + 1}`),
      subtitle: a.year ? `Logged ${a.year}` : "",
      icon: a.icon,
      meta: [],
      body: [a.description],
      tags: [],
    },
  })),

  skills: Object.entries(skills).map(([cat, arr], i) => {
    const list = arr || [];
    const avg = list.length ? Math.round(list.reduce((s, x) => s + (x.level || 0), 0) / list.length) : 0;
    return {
      id: `skill-${i}`,
      label: cat,
      kind: "moon",
      dossier: {
        eyebrow: "SKILL CLUSTER",
        title: cat,
        subtitle: `${list.length} technolog${list.length === 1 ? "y" : "ies"}`,
        meta: [
          { value: `${avg}%`, label: "Avg level" },
          { value: String(list.length), label: "Count" },
        ],
        body: [{ head: "Proficiency", points: list.map((s) => `${s.name} · ${s.level}%`) }],
        tags: list.slice(0, 8).map((s) => s.name),
      },
    };
  }),

  notes: blogPosts.map((b, i) => ({
    id: `note-${i}`,
    label: label(b.title, `Note ${i + 1}`),
    kind: "log",
    dossier: {
      eyebrow: "FLIGHT LOG",
      title: label(b.title, `Note ${i + 1}`),
      subtitle: b.date || "",
      meta: [],
      body: [b.description],
      tags: b.tags || [],
    },
  })),

  education: educations.map((e, i) => ({
    id: `edu-${i}`,
    label: label(e.shortName, e.degree || `Degree ${i + 1}`),
    kind: "moon",
    dossier: {
      eyebrow: "ACADEMY RECORD",
      title: label(e.degree, `Degree ${i + 1}`),
      subtitle: clean([e.name, e.year]).join(" · "),
      meta: clean([
        e.percentage != null ? { value: `${e.percentage}%`, label: "Score" } : null,
        e.duration ? { value: e.duration, label: "Duration" } : null,
        e.level ? { value: e.level, label: "Level" } : null,
      ]),
      body: e.highlights && e.highlights.length ? [{ head: "Focus areas", points: e.highlights }] : [],
      tags: [],
    },
  })),

  hobbies: hobbies.map((h, i) => ({
    id: `hobby-${i}`,
    label: label(h.name, `Pursuit ${i + 1}`),
    kind: "drone",
    dossier: {
      eyebrow: "OFF-DUTY",
      title: label(h.name, `Pursuit ${i + 1}`),
      subtitle: h.tagline || "",
      icon: h.icon,
      meta: h.stat ? [{ value: h.stat.value, label: h.stat.label }] : [],
      body: [h.detail],
      tags: h.tags || [],
    },
  })),

  testimonials: testimonials.map((t, i) => ({
    id: `test-${i}`,
    label: label(t.name, `Voice ${i + 1}`),
    kind: "relay",
    dossier: {
      eyebrow: "INCOMING TRANSMISSION",
      title: label(t.name, `Voice ${i + 1}`),
      subtitle: clean([t.role, t.company]).join(" · "),
      meta: t.rating ? [{ value: `${t.rating}/5`, label: "Rating" }] : [],
      body: [t.quote ? `“${t.quote}”` : ""],
      tags: t.endorsements || [],
    },
  })),

  contact: contactLinks.map((c, i) => ({
    id: `contact-${i}`,
    label: label(c.label, `Channel ${i + 1}`),
    kind: "beacon",
    dossier: {
      eyebrow: "COMMS CHANNEL",
      title: label(c.label, `Channel ${i + 1}`),
      subtitle: c.value || "",
      href: c.href,
      meta: [],
      body: [],
      tags: [],
    },
  })),
};

export const itemsForSection = (section) => SECTION_ITEMS[section] || [];
export const itemCount = (section) => itemsForSection(section).length;
export const itemDossier = (section, idx) => itemsForSection(section)[idx]?.dossier || null;
