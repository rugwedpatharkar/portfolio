import { DESTINATIONS } from "./destinations";
import { OBJECTS } from "./objects";

/*
 * Command registry for the ⌘K Mission-Control palette. `buildCommands(ctx)`
 * binds each command's `run` to the app's handlers (ctx), so the palette stays
 * a dumb renderer. Navigation commands are generated from the destination +
 * object registries; action commands are static.
 */

const SECTION_LABEL = {
  hero: "Hero", about: "About", funfacts: "Impact", experience: "Experience",
  projects: "Projects", achievements: "Achievements", skills: "Skills",
  notes: "Notes", education: "Education", hobbies: "Hobbies",
  testimonials: "Testimonials", contact: "Contact",
};

const lower = (arr) => arr.filter(Boolean).map((s) => String(s).toLowerCase());

export const buildCommands = (ctx) => {
  const warp = DESTINATIONS.map((d, i) => ({
    id: `warp:${d.id}`,
    group: "Navigate",
    icon: "➜",
    title: `Warp to ${d.label}`,
    subtitle: SECTION_LABEL[d.section] || "",
    accent: d.color,
    keywords: lower([d.label, d.id, d.section, SECTION_LABEL[d.section]]),
    run: () => ctx.warpTo(i),
  }));

  const scan = OBJECTS.filter((o) => o.visit.kind === "focus").map((o) => ({
    id: `scan:${o.id}`,
    group: "Scan",
    icon: "◎",
    title: `Scan ${o.label}`,
    subtitle: o.category,
    accent: o.color,
    keywords: lower([o.label, o.id, o.category]),
    run: () => ctx.pick(o),
  }));

  const actions = [
    { id: "act:log", group: "Explorer", icon: "✦", title: "Open discoveries log", subtitle: "Rank · badges · hunt", keywords: ["log", "discoveries", "rank", "badges", "hunt", "explorer"], run: ctx.toggleLog },
    { id: "act:map", group: "Navigate", icon: "⊕", title: "System map", subtitle: "Pull back to the whole system", shortcut: "Z", keywords: ["map", "overview", "system", "zoom out"], run: ctx.toggleMap },
    { id: "act:speedrun", group: "Challenge", icon: "⚡", title: "Start speed run", subtitle: "All 12 stops, against the clock", keywords: ["speed", "run", "timer", "race", "challenge"], run: ctx.startSpeedRun },
    { id: "act:pilot", group: "Modes", icon: "✈", title: "Take the controls (pilot)", subtitle: "Free-flight — fly the system", keywords: ["pilot", "fly", "free", "roam", "controls", "flight"], shortcut: "P", run: ctx.enterPilot },
    { id: "act:voice", group: "Modes", icon: "🎙", title: "Voice navigation", subtitle: "\"Take me to Earth\"", keywords: ["voice", "speech", "mic", "talk"], run: ctx.startVoice },
    { id: "time:pause", group: "Playback", icon: "⏸", title: "Pause orbits", keywords: ["pause", "stop", "freeze", "time", "orbit"], run: () => ctx.setTimeScale(0) },
    { id: "time:half", group: "Playback", icon: "◑", title: "Orbit speed ×0.5", keywords: ["slow", "half", "time", "orbit"], run: () => ctx.setTimeScale(0.5) },
    { id: "time:one", group: "Playback", icon: "▶", title: "Orbit speed ×1", subtitle: "Normal", keywords: ["normal", "play", "resume", "time", "orbit"], run: () => ctx.setTimeScale(1) },
    { id: "time:two", group: "Playback", icon: "»", title: "Orbit speed ×2", keywords: ["fast", "double", "time", "orbit", "speed"], run: () => ctx.setTimeScale(2) },
  ];

  return [...actions, ...warp, ...scan];
};
