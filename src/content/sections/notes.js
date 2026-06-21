/*
 * Notes content — split out of the monolithic content/index.js so the Notes
 * section's chunk only loads its own data.
 *
 * Vite/Rollup chunking: because this module is imported by the lazy Notes
 * section AND barrel-re-exported by content/index.js, Rollup keeps it as
 * a shared chunk; non-Notes pages never download it.
 */

export const notes = [
  {
    id: "schema-first-pipelines",
    title: "Designing schema-first ingestion pipelines",
    blurb:
      "Why I default to typed schemas at every ingestion boundary, even for one-off scripts — the half hour you spend declaring shape pays back the first time something downstream silently changes.",
    tags: ["FastAPI", "pydantic", "data engineering"],
    readingTime: 4,
    date: "2026-05-18",
    href: "#notes",
  },
  {
    id: "grpc-vs-rest",
    title: "When gRPC actually earns its keep over REST",
    blurb:
      "After two years of shipping both, my honest test for picking gRPC: it's about contract sharing across teams, not perf — and the moment you need browser clients, the calculus flips.",
    tags: ["gRPC", "API design", "architecture"],
    readingTime: 6,
    date: "2026-03-02",
    href: "#notes",
  },
  {
    id: "lessons-from-production-llms",
    title: "Three lessons from shipping LLM agents to production",
    blurb:
      "Latency budget, deterministic fallbacks, and the unglamorous prompt-evaluation harness — the parts that aren't on the demo reel but are why agents stop being toys.",
    tags: ["LangChain", "LLM ops", "evals"],
    readingTime: 7,
    date: "2026-01-15",
    href: "#notes",
  },
];

export default notes;
