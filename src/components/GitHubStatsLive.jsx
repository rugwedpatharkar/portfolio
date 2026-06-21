import { personalInfo } from "../content";
import { useGitHubStats } from "../hooks/useGitHubStats";

/*
 * Compact live GitHub stats strip — repos · stars · followers · top language.
 * Renders skeleton on first load, hides itself entirely on API failure so a
 * rate-limit doesn't break the footer.
 */

const Stat = ({ label, value }) => (
  <div className="flex flex-col items-center sm:items-start gap-0.5">
    <span className="font-mono font-bold text-white text-body-sm sm:text-body tabular-nums">
      {value}
    </span>
    <span className="font-mono text-micro text-white/40 uppercase tracking-wide">
      {label}
    </span>
  </div>
);

const Skeleton = () => (
  <div className="flex gap-4 sm:gap-6">
    {[0, 1, 2].map((i) => (
      <div key={i} className="flex flex-col items-center sm:items-start gap-1">
        <span className="block h-3 w-8 rounded bg-white/[0.06] animate-pulse" />
        <span className="block h-2 w-12 rounded bg-white/[0.04] animate-pulse" />
      </div>
    ))}
  </div>
);

const GitHubStatsLive = () => {
  const { data, loading, error } = useGitHubStats(personalInfo.githubUsername);
  if (error) return null;
  if (loading || !data) return <Skeleton />;

  return (
    <div
      className="flex flex-wrap items-center gap-x-5 gap-y-2 sm:gap-x-6"
      aria-label="Live GitHub statistics"
    >
      <Stat label="Repos" value={data.publicRepos} />
      <Stat label="Stars" value={data.stars} />
      <Stat label="Followers" value={data.followers} />
      {data.topLanguage && <Stat label="Top lang" value={data.topLanguage} />}
    </div>
  );
};

export default GitHubStatsLive;
