/*
 * Achievement registry. Each achievement has:
 *   - id        unique stable key for localStorage
 *   - label     short user-facing title
 *   - icon      single character / glyph
 *   - color     mission-patch tint
 *   - hint      one-line how-to (shown when locked + hovered)
 */

import { loadProgress, saveProgress } from "./explorer";

export const ACHIEVEMENTS = [
  { id: "first_light", label: "First Light", icon: "☀", color: "#ffb86b",
    hint: "Reach the sun." },
  { id: "inner_tour", label: "Inner System", icon: "◐", color: "#7faaff",
    hint: "Visit Mercury, Venus, Earth, and Mars." },
  { id: "belt_crossed", label: "Belt Crossed", icon: "⬡", color: "#f8c555",
    hint: "Pass through the asteroid belt." },
  { id: "gas_giants", label: "Gas Giant Tour", icon: "◯", color: "#915eff",
    hint: "See Jupiter, Saturn, Uranus, and Neptune." },
  { id: "edge_beacon", label: "Edge Beacon", icon: "▲", color: "#ff6b6b",
    hint: "Reach the heliopause." },
  { id: "all_destinations", label: "Solar Tourist", icon: "✦", color: "#00cea8",
    hint: "Visit all 12 destinations." },
  { id: "konami", label: "Konami Decoded", icon: "🛸", color: "#bf61ff",
    hint: "↑↑↓↓←→←→ba" },
  { id: "salute", label: "Sun Salute", icon: "★", color: "#ffd47a",
    hint: "Click the sun directly." },
  { id: "death_star", label: "That's No Moon", icon: "☠", color: "#cccccc",
    hint: "Find the Death Star." },
  { id: "the_answer", label: "42", icon: "42", color: "#7df2c0",
    hint: "Type the answer." },
  { id: "speed_runner", label: "Hyperjump", icon: "⚡", color: "#ffe066",
    hint: "Visit all 12 destinations in under 60 seconds." },
  { id: "explorer", label: "Free Roamer", icon: "⌖", color: "#ffb86b",
    hint: "Enable free roam and fly the system." },
  { id: "enterprise", label: "Boldly Gone", icon: "🖖", color: "#9fc8ff",
    hint: "Find the USS Enterprise." },
  { id: "endurance", label: "Docking Sequence", icon: "◍", color: "#cfd6e0",
    hint: "Find the Endurance." },
  { id: "stardestroyer", label: "Imperial Sighting", icon: "◤", color: "#aeb6c4",
    hint: "Spot the Star Destroyer in the deep field." },
  { id: "hal", label: "Open the Pod Bay", icon: "⊙", color: "#ff5a4d",
    hint: "Find HAL 9000." },
  { id: "anomaly_hunter", label: "Anomaly Hunter", icon: "✦", color: "#7df2c0",
    hint: "Chart every hidden anomaly." },
  { id: "isro", label: "Jai Vigyan", icon: "🛰", color: "#ff9933",
    hint: "Find both ISRO missions — Chandrayaan + Mangalyaan." },
];

export const ACHIEVEMENTS_BY_ID = Object.fromEntries(ACHIEVEMENTS.map((a) => [a.id, a]));

/* Persistence is delegated to the consolidated progress store (explorer.js) so
   all gamification state lives under one localStorage key. */
export const unlockedSet = () => new Set(loadProgress().achievements);

export const persistUnlocked = (set) => {
  saveProgress({ achievements: Array.from(set) });
};
