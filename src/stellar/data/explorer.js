/*
 * Explorer progress — ONE consolidated, versioned localStorage object for all
 * gamification/persistence state, replacing the scattered legacy keys.
 *
 * Why consolidate: badges, the discovery hunt, the breadcrumb trail, speed-run
 * PBs, and visitor stats were each their own key with their own ad-hoc shape.
 * A single object is migrated once, read/written through one tiny API, and is
 * trivial to extend (the rank + discovery + hunt model layers on top in
 * Phase 1).
 *
 * Reads are cached (module singleton). Writes shallow-merge a patch and persist.
 * Every storage access is try/catch-wrapped — a blocked/again-full localStorage
 * must never break the experience (matches the existing codebase convention).
 */

const KEY = "stellar:progress";
const VERSION = 1;

const blank = () => ({
  v: VERSION,
  achievements: [], // unlocked badge ids
  charted: [], // discovered object ids (the rank denominator, Phase 1)
  visited: {}, // { [destinationId]: true } — breadcrumb trail
  speedrunBest: null, // ms
  firstSeen: null, // epoch ms
  lastSeen: null, // epoch ms
  visits: 0, // session count (greeting copy)
  transmissionSent: false, // E2 — don't re-prompt
});

let _cache = null;

const readRaw = () => {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem(KEY) || "null");
  } catch {
    return null;
  }
};

const write = (p) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* storage full / blocked — best-effort only */
  }
};

/* Fold the pre-consolidation keys into the new object, once. Legacy keys are
   left in place for one release in case of rollback. Idempotent: a second run
   just re-reads the same legacy values into an already-populated object. */
const migrateLegacy = (p) => {
  try {
    const a = JSON.parse(localStorage.getItem("stellar:achievements") || "[]");
    if (Array.isArray(a) && a.length) {
      p.achievements = Array.from(new Set([...p.achievements, ...a]));
    }
  } catch {
    /* ignore malformed legacy data */
  }
  try {
    const best = Number(localStorage.getItem("stellar:speedrun:best"));
    if (Number.isFinite(best) && best > 0) p.speedrunBest = p.speedrunBest ?? best;
  } catch {
    /* ignore */
  }
  return p;
};

export const loadProgress = () => {
  if (_cache) return _cache;
  const raw = readRaw();
  if (!raw || raw.v !== VERSION) {
    const p = migrateLegacy({ ...blank(), ...(raw || {}) });
    p.v = VERSION;
    write(p);
    _cache = p;
  } else {
    _cache = raw;
  }
  return _cache;
};

/* Shallow-merge a patch into the live progress object and persist. Returns the
   (mutated) singleton so callers can read back immediately. */
export const saveProgress = (patch) => {
  const p = loadProgress();
  Object.assign(p, patch);
  write(p);
  return p;
};
