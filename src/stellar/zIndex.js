/*
 * Single source of truth for z-index layering. Keeps the stacking
 * order legible across many fixed-position components.
 *
 * Scale:
 *   1xxx — background overlays (stardust, mouse trail)
 *    1xx — HUD primary surface (panels, hints)
 *     5x — interactive toggles + minor HUD strips
 *     3x — informational HUD (breadcrumb, live stats, time scrubber)
 *     2x — bottom-of-screen passive (quote feed)
 *    9xx — modals + screen-wide alerts (achievements, answer-42 flash)
 *  10xxx — system-level (cursor, boot, countdown)
 */

export const Z = {
  /* Background overlays — never block interaction */
  quoteFeed: 28,

  /* Information HUDs — passive readouts */
  breadcrumb: 30,
  liveStats: 32,
  timeScrubber: 32,
  fpsMonitor: 32,

  /* Decorative frames */
  cockpitFrame: 35,
  achievementPatches: 36,
  speedRun: 36,

  /* Persistent content + sidebar */
  sideRail: 38,
  contentPanel: 40,
  planetHud: 45,

  /* Interactive toggles + minor controls */
  toggles: 50,

  /* Modals + announcements */
  visitorReport: 80,
  achievementToast: 90,
  answer42: 95,
  easterEggCard: 100,

  /* Pre-app screens */
  warpOpening: 240,
  missionCountdown: 250,
  bootSequence: 300,

  /* System-level — always on top */
  stardustTrail: 9997,
  cursorRing: 9998,
  cursorDot: 9999,
};
