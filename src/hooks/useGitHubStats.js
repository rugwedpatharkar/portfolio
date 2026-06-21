import { useEffect, useState } from "react";

/*
 * Live GitHub stats from the public REST API.
 *
 * - 60 unauthenticated requests/hour per IP (more than enough for a portfolio).
 * - Cached in sessionStorage with a 30-minute TTL to avoid burning rate limit
 *   on every page load — repeat visits hit the cache, not the network.
 * - Aggregates owned repo stars in a single follow-up request capped to the
 *   first page (most users). Returns null fields when offline / rate-limited;
 *   the consumer renders a skeleton rather than throwing.
 */

const CACHE_KEY = (username) => `github-stats:${username}`;
const TTL_MS = 30 * 60 * 1000;

const readCache = (username) => {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY(username));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.fetchedAt > TTL_MS) return null;
    return parsed.data;
  } catch {
    return null;
  }
};

const writeCache = (username, data) => {
  try {
    sessionStorage.setItem(
      CACHE_KEY(username),
      JSON.stringify({ fetchedAt: Date.now(), data })
    );
  } catch {
    /* storage full or denied — ignore */
  }
};

const fetchStats = async (username, signal) => {
  const userRes = await fetch(`https://api.github.com/users/${username}`, { signal });
  if (!userRes.ok) throw new Error(`user ${userRes.status}`);
  const user = await userRes.json();

  const reposRes = await fetch(
    `https://api.github.com/users/${username}/repos?per_page=100&sort=updated&type=owner`,
    { signal }
  );
  const repos = reposRes.ok ? await reposRes.json() : [];

  const stars = Array.isArray(repos)
    ? repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0)
    : 0;

  const langCounts = {};
  if (Array.isArray(repos)) {
    for (const r of repos) {
      if (!r.language) continue;
      langCounts[r.language] = (langCounts[r.language] || 0) + 1;
    }
  }
  const topLanguage = Object.entries(langCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || null;

  return {
    publicRepos: user.public_repos,
    followers: user.followers,
    following: user.following,
    stars,
    topLanguage,
    profileUrl: user.html_url,
  };
};

export const useGitHubStats = (username) => {
  const [data, setData] = useState(() => (username ? readCache(username) : null));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!username || data) return;
    const controller = new AbortController();
    fetchStats(username, controller.signal)
      .then((fresh) => {
        if (controller.signal.aborted) return;
        writeCache(username, fresh);
        setData(fresh);
      })
      .catch((e) => {
        if (e.name !== "AbortError") setError(e);
      });
    return () => controller.abort();
  }, [username, data]);

  return { data, error, loading: !data && !error };
};

export default useGitHubStats;
