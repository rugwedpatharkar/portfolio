/*
 * Thin wrapper over the window `stellar:*` CustomEvent bus that the dormant
 * gamification components already listen to, so the command palette + dock can
 * drive them without prop-drilling. Centralizes the event names so there is one
 * authoritative list (typos become impossible).
 */

export const CMD = {
  /* Navigation / camera cues */
  DESTINATION: "stellar:destination",
  WHOOSH: "stellar:whoosh",
  SHAKE: "stellar:shake",
  /* Achievements + challenges (already wired listeners) */
  SALUTE: "stellar:salute",
  KONAMI: "stellar:konami",
  ANSWER42: "stellar:answer42",
  SPEEDRUN: "stellar:speedrun",
  FREEROAM: "stellar:freeroam",
  /* Discovery — the homage ships. The first four already fire from the scene;
     the rest are added when their eggs become clickable (Phase 1). */
  DEATHSTAR: "stellar:deathstar",
  ENTERPRISE: "stellar:enterprise",
  STARDESTROYER: "stellar:stardestroyer",
  ENDURANCE: "stellar:endurance",
  HAL: "stellar:hal",
  COOPERSTATION: "stellar:cooperstation",
  WALLE: "stellar:walle",
  TARDIS: "stellar:tardis",
  WATNEY: "stellar:watney",
};

export const emit = (name, detail) =>
  window.dispatchEvent(
    new CustomEvent(name, detail !== undefined ? { detail } : undefined)
  );

/* Subscribe; returns an unsubscribe fn for useEffect cleanup. */
export const onEvent = (name, handler) => {
  window.addEventListener(name, handler);
  return () => window.removeEventListener(name, handler);
};
