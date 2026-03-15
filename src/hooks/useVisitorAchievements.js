import { useEffect, useRef, useCallback } from "react";

const ACHIEVEMENTS = {
  explorer: { title: "Explorer", desc: "Visited all sections", icon: "\u{1F9ED}" },
  nightOwl: { title: "Night Owl", desc: "Browsing past midnight", icon: "\u{1F989}" },
  speedReader: { title: "Speed Reader", desc: "Scrolled to bottom in under 60s", icon: "\u26A1" },
  curious: { title: "Curious Mind", desc: "Expanded a project card", icon: "\u{1F50D}" },
  musician: { title: "Audiophile", desc: "Toggled ambient music", icon: "\u{1F3B5}" },
  hacker: { title: "Terminal Hacker", desc: "Used the command terminal", icon: "\u{1F4BB}" },
  konami: { title: "Retro Gamer", desc: "Found the Konami code", icon: "\u{1F3AE}" },
  timeTravel: { title: "Time Traveler", desc: "Switched themes", icon: "\u{1F3A8}" },
};

const getUnlocked = () => {
  try {
    return JSON.parse(localStorage.getItem("achievements") || "[]");
  } catch {
    return [];
  }
};

const saveUnlocked = (list) => {
  try {
    localStorage.setItem("achievements", JSON.stringify(list));
  } catch { /* ignore */ }
};

const useVisitorAchievements = (toast) => {
  const startTime = useRef(Date.now());
  const sectionsVisited = useRef(new Set());

  const unlock = useCallback(
    (key) => {
      const unlocked = getUnlocked();
      if (unlocked.includes(key)) return;
      unlocked.push(key);
      saveUnlocked(unlocked);
      const a = ACHIEVEMENTS[key];
      if (a && toast) {
        toast(`${a.icon} Achievement: ${a.title} \u2014 ${a.desc}`, "success");
      }
    },
    [toast]
  );

  // Night owl check
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 0 && hour < 5) unlock("nightOwl");
  }, [unlock]);

  // Speed reader — reached bottom within 60s
  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollTop / docHeight > 0.95) {
        if (Date.now() - startTime.current < 60000) {
          unlock("speedReader");
        }
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [unlock]);

  // Explorer — visited all main sections
  useEffect(() => {
    const SECTIONS = ["about", "experience", "skills", "projects", "education", "contact"];
    const observers = [];
    SECTIONS.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            sectionsVisited.current.add(id);
            if (sectionsVisited.current.size >= SECTIONS.length) {
              unlock("explorer");
            }
          }
        },
        { threshold: 0.3 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, [unlock]);

  return unlock;
};

export default useVisitorAchievements;
