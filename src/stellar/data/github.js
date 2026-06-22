/*
 * Minimal GitHub events fetcher. Public endpoint, no auth, cached to
 * localStorage with a 6-hour TTL so we never hammer the API.
 */

const USERNAME = "rugwedpatharkar";
const TTL_MS = 6 * 60 * 60 * 1000;
const KEY = `stellar:gh:${USERNAME}`;

export const fetchGithubEvents = async () => {
  if (typeof window === "undefined") return [];

  /* Cache check */
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const { at, events } = JSON.parse(raw);
      if (Date.now() - at < TTL_MS && Array.isArray(events)) return events;
    }
  } catch { /* ignore */ }

  try {
    const res = await fetch(`https://api.github.com/users/${USERNAME}/events/public?per_page=30`, {
      headers: { Accept: "application/vnd.github+json" },
    });
    if (!res.ok) throw new Error("gh fetch failed");
    const data = await res.json();

    const commits = [];
    data.forEach((e) => {
      if (e.type === "PushEvent" && e.payload?.commits) {
        e.payload.commits.slice(0, 3).forEach((c) => {
          commits.push({
            sha: c.sha?.slice(0, 7),
            message: c.message?.split("\n")[0]?.slice(0, 80),
            repo: e.repo?.name?.split("/")[1] || "unknown",
            time: e.created_at,
          });
        });
      } else if (e.type === "CreateEvent" || e.type === "PullRequestEvent") {
        commits.push({
          sha: e.id?.slice(0, 7),
          message: `${e.type.replace("Event", "")} · ${e.repo?.name?.split("/")[1] || "?"}`,
          repo: e.repo?.name?.split("/")[1] || "unknown",
          time: e.created_at,
        });
      }
    });

    localStorage.setItem(KEY, JSON.stringify({ at: Date.now(), events: commits }));
    return commits;
  } catch {
    /* Network failed — return any stale cache, or seed with synthetic */
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const { events } = JSON.parse(raw);
        if (Array.isArray(events)) return events;
      }
    } catch { /* ignore */ }
    return SYNTHETIC_FALLBACK;
  }
};

/* Used only if GitHub is unreachable AND no cache exists. Keeps the
   feature working at first paint even on flaky connections. */
const SYNTHETIC_FALLBACK = [
  { sha: "a1b2c3d", message: "feat: add hybrid RAG retriever", repo: "andromeda", time: new Date().toISOString() },
  { sha: "e4f5g6h", message: "perf: cut p95 latency 96% on availability", repo: "platform", time: new Date().toISOString() },
  { sha: "i7j8k9l", message: "fix: idempotency key on PMS sync", repo: "integrations", time: new Date().toISOString() },
  { sha: "m1n2o3p", message: "refactor: collapse multi-tenant resolver", repo: "platform", time: new Date().toISOString() },
  { sha: "q4r5s6t", message: "feat: MCP tool-calling supervisor", repo: "agentic", time: new Date().toISOString() },
];

/* Deterministic colour per repo so each repo's comets read consistently */
export const repoColor = (repo) => {
  const palette = ["#ff9a3c", "#00cea8", "#915eff", "#61dafb", "#bf61ff", "#ff6b6b", "#f8c555"];
  let h = 0;
  for (let i = 0; i < repo.length; i++) h = (h * 31 + repo.charCodeAt(i)) >>> 0;
  return palette[h % palette.length];
};
