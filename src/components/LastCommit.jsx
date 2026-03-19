import { useState, useEffect } from "react";
import { personalInfo } from "../content";

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (mins > 0) return `${mins}m ago`;
  return "just now";
}

const LastCommit = () => {
  const [commit, setCommit] = useState(null);

  useEffect(() => {
    fetch(
      `https://api.github.com/users/${personalInfo.githubUsername}/events?per_page=20`,
      { headers: { Accept: "application/vnd.github+json" } }
    )
      .then((r) => r.json())
      .then((events) => {
        if (!Array.isArray(events)) return;
        const push = events.find((e) => e.type === "PushEvent");
        if (push) {
          setCommit({
            ago: timeAgo(push.created_at),
            repo: push.repo.name,
            url: `https://github.com/${push.repo.name}`,
          });
        }
      })
      .catch(() => {});
  }, []);

  if (!commit) return null;

  return (
    <a
      href={commit.url}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-mono text-white/30 hover:text-[#00cea8] transition-colors duration-200 group"
      title={`Last push to ${commit.repo}`}
    >
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full rounded-full bg-[#00cea8] opacity-75 group-hover:animate-ping" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#00cea8]/60" />
      </span>
      Last commit: {commit.ago}
    </a>
  );
};

export default LastCommit;
