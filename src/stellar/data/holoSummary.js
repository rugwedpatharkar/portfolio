/*
 * Holo-Bridge — bespoke one-line summaries per section (the glance-able line the
 * RIGHT dossier hologram shows BEFORE "open full dossier"). Keyed by destination
 * `section`. Draft copy — tune the voice later; this is the default reveal.
 */
export const HOLO_SUMMARY = {
  hero: "Backend & Agentic-AI engineer — systems that scale, agents that think.",
  about: "Pune-based engineer; Python, distributed systems, and LLM agents are home turf.",
  funfacts: "A few signals about how I work, beyond the résumé bullets.",
  experience: "Architected a 31-service Python/gRPC platform on GKE — p95 latency down 96%.",
  projects: "Agentic AI, hybrid RAG, and multi-tenant platforms — shipped, not slideware.",
  achievements: "Milestones worth charting — launches, awards, and hard problems solved.",
  skills: "9 domains, 80+ technologies — FastAPI & gRPC to LangGraph, MCP & Qdrant.",
  notes: "Field notes and writing on backend, agents, and distributed systems.",
  education: "The academic record behind the engineering.",
  hobbies: "What I build and chase when the terminal's closed.",
  testimonials: "What people who've actually shipped with me say.",
  contact: "Open a channel — let's build something.",
};

/* Fallback used if a section ever lacks a bespoke line. */
export const summaryFor = (section) => HOLO_SUMMARY[section] || "Scan to open the full dossier.";
