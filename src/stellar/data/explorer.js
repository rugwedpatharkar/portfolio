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

/* ── Discovery / Explorer Rank model ──────────────────────────────────────
 *
 * The off-rail objects that count toward Explorer Rank. The 12 résumé planets
 * are the mandatory scroll tour, so they DON'T count — rank rewards leaving the
 * rail and exploring. `hunt: true` marks the 9 homage ships that form the
 * "anomalies X / 9" scavenger hunt (masked + cryptic-hinted until found); the 4
 * plain anomalies are self-evident on the map so they count but aren't hunted.
 */
export const DISCOVERABLE = [
  { id: "blackhole", label: "Gargantua", color: "#ffb066", hunt: false },
  { id: "wormhole", label: "Wormhole", color: "#9a7dff", hunt: false },
  { id: "pulsar", label: "Pulsar", color: "#9fd0ff", hunt: false },
  { id: "voyager", label: "Voyager Probes", color: "#ffd9a0", hunt: false },
  { id: "kilonova", label: "Kilonova", color: "#ffd9a0", hunt: false },
  { id: "betelgeuse", label: "Betelgeuse", color: "#ff6a48", hunt: false },
  { id: "etacarinae", label: "Eta Carinae", color: "#ff9a5a", hunt: false },
  { id: "einsteinring", label: "Einstein Ring", color: "#cfe2ff", hunt: false },
  { id: "omegacen", label: "Omega Centauri", color: "#ffe9c2", hunt: false },
  { id: "ligo-gw", label: "Gravitational Wave", color: "#9fd0ff", hunt: false },
  { id: "reddots", label: "Little Red Dots", color: "#e0563f", hunt: false },
  { id: "bootes-void", label: "Boötes Void", color: "#8aa0d8", hunt: false },
  { id: "great-attractor", label: "Great Attractor", color: "#ffd0a0", hunt: false },
  { id: "hcb-wall", label: "Hercules–Corona Wall", color: "#a0b6ff", hunt: false },
  { id: "monolith", label: "The Monolith", color: "#3a4a6a", hunt: true, hint: "A perfect black slab — 1 : 4 : 9 — turning in the dark." },
  { id: "haloring", label: "Halo Installation", color: "#7fb0a0", hunt: true, hint: "A ring you'd live on the inside of." },
  { id: "dyson", label: "Dyson Swarm", color: "#ffd070", hunt: true, hint: "A star being boxed in by its own builders — one arc still open." },
  { id: "solgate", label: "The Ring", color: "#3a6a8a", hunt: true, hint: "A gate to a thousand gates; mind the slow zone." },
  { id: "citadel", label: "The Citadel", color: "#9ab0c4", hunt: true, hint: "Five arms that close like a flower." },
  { id: "deathstar", label: "Death Star", color: "#c9ccd6", hunt: true, hint: "That's no moon — it shadows the asteroid belt." },
  { id: "enterprise", label: "USS Enterprise", color: "#9fc8ff", hunt: true, hint: "Boldly going, high over the inner planets." },
  { id: "endurance", label: "Endurance", color: "#cfd6e0", hunt: true, hint: "A slowly spinning ring on the long voyage out." },
  { id: "stardestroyer", label: "Star Destroyer", color: "#aeb6c4", hunt: true, hint: "An Imperial wedge looms in the deep field." },
  { id: "cooperstation", label: "Cooper Station", color: "#d0d6dd", hunt: true, hint: "Humanity's cylinder, turning near the rings." },
  { id: "tardis", label: "TARDIS", color: "#5b8dff", hunt: true, hint: "A blue box by Saturn. Blink and it's gone." },
  { id: "hal", label: "HAL 9000", color: "#ff5a4d", hunt: true, hint: "An unblinking red eye near the giant." },
  { id: "walle", label: "WALL·E", color: "#e2a85a", hunt: true, hint: "A lonely worker, far past the blue giant." },
  { id: "watney", label: "Watney's Potato", color: "#c1632e", hunt: true, hint: "Someone grew dinner on the red planet." },
  { id: "chandrayaan", label: "Chandrayaan", color: "#ffcf6b", hunt: true, hint: "ISRO's orbiter, circling the Moon by Earth." },
  { id: "mangalyaan", label: "Mangalyaan (MOM)", color: "#ff9d5c", hunt: true, hint: "India's Mars Orbiter — success on the first try." },
  { id: "sandworm", label: "Shai-Hulud", color: "#d8a35a", hunt: true, hint: "Something vast moves under the red planet's sands." },
  { id: "rocinante", label: "Rocinante", color: "#9fb4c8", hunt: true, hint: "A borrowed Martian frigate runs the belt." },
  { id: "normandy", label: "SSV Normandy", color: "#bcd0ff", hunt: true, hint: "A stealth frigate with swept wings, over Earth." },
  { id: "discovery", label: "Discovery One", color: "#dfe4ea", hunt: true, hint: "A command sphere on a long spine, near the giant." },
  { id: "nostromo", label: "USCSS Nostromo", color: "#b7b1a4", hunt: true, hint: "An industrial tug hauls its refinery through the dark." },
  { id: "perseverance", label: "Perseverance & Ingenuity", color: "#d98a5a", hunt: false, hint: "A rover and the first helicopter to fly on Mars." },
  { id: "goldenrecord", label: "Golden Record", color: "#ffd56a", hunt: true, hint: "A gold disc carrying the sounds of Earth — play it." },
  { id: "genship", label: "Generation Ship", color: "#5a6070", hunt: true, hint: "A dead ark tumbling in the deep, one light still on." },
  { id: "heighliner", label: "Guild Heighliner", color: "#c79a4a", hunt: true, hint: "A mountain that folds space to travel without moving." },
];

const DISCOVERABLE_IDS = new Set(DISCOVERABLE.map((d) => d.id));
export const HUNT_IDS = DISCOVERABLE.filter((d) => d.hunt).map((d) => d.id);
const N_DISCOVERABLE = DISCOVERABLE.length; // 13

/* Rank tiers keyed off how many objects you've charted. */
export const RANK_TIERS = [
  { tier: 0, label: "Cadet", min: 0 },
  { tier: 1, label: "Ensign", min: 2 },
  { tier: 2, label: "Pilot", min: 5 },
  { tier: 3, label: "Navigator", min: 8 },
  { tier: 4, label: "Commander", min: 11 },
  { tier: 5, label: "Captain", min: 14 },
  { tier: 6, label: "Fleet Admiral", min: 17 },
];

/* Fired whenever progress changes (a new chart, visit, or badge) so the rank
   meter + discoveries view refresh without prop-drilling. */
const announce = () => {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("stellar:progress"));
};

export const chartedSet = () =>
  new Set(loadProgress().charted.filter((id) => DISCOVERABLE_IDS.has(id)));
export const chartedCount = () => chartedSet().size;

/* Record a newly-discovered object. Idempotent; returns true only on a NEW
   discovery (so callers can fire a one-shot cue). Announces progress. */
export const markCharted = (id) => {
  if (!DISCOVERABLE_IDS.has(id)) return false;
  const p = loadProgress();
  if (p.charted.includes(id)) return false;
  saveProgress({ charted: [...p.charted, id] });
  announce();
  return true;
};

/* Record a visited résumé stop (powers the greeting + "stops X / 12"). */
export const markVisited = (id) => {
  const p = loadProgress();
  if (p.visited[id]) return false;
  saveProgress({ visited: { ...p.visited, [id]: true } });
  announce();
  return true;
};
export const visitedCount = () => Object.keys(loadProgress().visited).length;

export const rankFor = (count = chartedCount()) => {
  let cur = RANK_TIERS[0];
  for (const t of RANK_TIERS) if (count >= t.min) cur = t;
  const next = RANK_TIERS.find((t) => t.min > count) || null;
  return {
    tier: cur.tier,
    label: cur.label,
    count,
    total: N_DISCOVERABLE,
    next: next ? next.label : null,
    remaining: next ? next.min - count : 0,
  };
};

/* Everything the Discoveries view renders. Badges are composed separately by
   the UI (from the achievements registry) to avoid a circular import. */
export const getDiscoveriesModel = () => {
  const charted = chartedSet();
  const hunt = DISCOVERABLE.filter((d) => d.hunt).map((d) => {
    const found = charted.has(d.id);
    return { id: d.id, color: d.color, found, hint: d.hint, label: found ? d.label : "???" };
  });
  return {
    rank: rankFor(charted.size),
    hunt: { found: hunt.filter((h) => h.found).length, total: HUNT_IDS.length, items: hunt },
    anomalies: DISCOVERABLE.map((d) => ({
      id: d.id, label: d.label, color: d.color, found: charted.has(d.id), hunt: d.hunt,
    })),
  };
};
