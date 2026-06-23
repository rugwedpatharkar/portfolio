# Portfolio Content — Master Document

> Source of truth for what each stop in the solar-system tour shows. Drafted from
> your **resume (v3)** + the existing portfolio content, made **max-informative**.
> Review / edit this first; then I implement it into `content/index.js` + the
> panels. **Nothing is implemented yet.**

---

## Analysis: resume vs. current portfolio

| Area | Resume v3 | Current portfolio | Action |
|---|---|---|---|
| **Experience** | 2 jobs (Upswing — 12 bullets; Tech Entrepreneurs intern — 1 bullet) | Data has **both**, but the panel shows only Upswing + a 1-line footnote | **Show both jobs fully** ← your callout |
| Skills | 9 categories | 9 categories (matches) | Show all (panel currently caps at 9 → fine) |
| Projects | 6 professional + Portfolio Website | 6 professional + 3 academic (Blog, E-com, CareerForAll) | **Decide** (see Q1) |
| Education | MSc, BSc | MSc, BSc, **HSC, SSC** | Keep all 4 (portfolio richer) |
| Achievements | 1 (Star Performer) | 8 | Keep 8 (portfolio richer) |
| Summary / About | Concise | Richer | Keep rich + add **languages + location** |
| Spoken languages | English, Hindi, Marathi | ❌ not shown | **Add** |
| Phone | +91-8237565579 | ❌ not shown | **Decide** (see Q3) |
| Notes / Blog | ❌ | 3 posts, "Coming soon" links | **Decide** (see Q2) |

**Also "max-informative" = un-slice the panels:** today the panels truncate
(`projects.slice(0,6)`, `hobbies.slice(0,6)`, `testimonials.slice(0,2)`,
`blogPosts.slice(0,4)`, skills top-4-per-category). I'll show everything, with
graceful scroll in the left column.

---

## SOL · Hero
- **Name:** Rugwed Patharkar
- **Role:** Backend & Agentic AI Engineer
- **Tagline:** 31-service Python/FastAPI/gRPC platform on GKE · multi-agent LLM systems with MCP & hybrid RAG, in production.
- **Location:** Pune, India · open to opportunities
- **Stats:** `31` Services Architected · `7+` PMS / Hardware Vendors · `96%` p95 Latency Cut
- Photo: ✅

## MERCURY · About
> One tightened paragraph + a short "stack at a glance" + languages.

I build the backend infrastructure that hospitality SaaS runs on. At **Upswing** I
architected and own a **31-service** Python/FastAPI/gRPC platform on **GKE** —
multi-tenant, multi-region, integrated with **7+** PMS, door-lock and GRMS vendors
(Apaleo, Opera/OHIP, Cloudbeds, RMS, Clock, Maxxton, ASSA ABLOY, Messerschmitt).
p95 API latency went **5s → 200ms (96%)**; compute spend dropped **~25%**. I also
ship production **agentic AI** — a multi-agent **LangGraph** supervisor with **MCP**
tool-calling across 4 LLM providers (OpenAI, Gemini, Claude, Groq), grounded by
**Qdrant** hybrid (dense + BM25) RAG. I lead a **3-engineer** integration team and
was named **Star Performer of the Quarter**. I care about systems that recover
gracefully, observability that earns its keep, and APIs that don't surprise their
consumers.

- **Languages:** English · Hindi · Marathi  *(new)*
- **Experience:** 2+ years building production systems

## VENUS · Numbers I've Moved (impact)
8 receipts, each tied to a real initiative (keep all):
`31` services · `96%` p95 latency cut · `~25%` compute saved · `7+` vendors ·
`99.9%` availability · `50%` faster vendor onboarding · `60%` code redundancy cut ·
`65%` test coverage on core.

## EARTH · Experience  ← **the fix: show BOTH jobs**

### 1. Software Engineer — Upswing Cognitive Hospitality Solutions · May 2024 – Present
🏆 Star Performer of the Quarter
**Metrics:** 31 Services Owned · 96% p95 Latency Cut · ~25% Compute Saved · 99.9% Availability
- **Platform & Architecture** — 31-service multi-tenant FastAPI/gRPC backend on GKE, multi-region, API Gateway (REST→gRPC over Protocol Buffers); multi-protocol layer (REST, gRPC, WebSockets, SSE, Socket.IO) with idempotent boundaries.
- **Distributed Systems & Reliability** — 96% p95 latency cut (5s→200ms); Redis Cloud multi-shard migration + cluster-safe client; fixed inventory-hold/pricing race conditions; event-driven (RabbitMQ, Pub/Sub) at-least-once + idempotency; dual-write MongoDB↔BigQuery feeding Airflow ETL + automated reports.
- **Integrations (PMS · Door-lock · GRMS)** — unified abstraction for 7+ PMS (zero-downtime provider switching, −60% redundancy); door-lock + GRMS template architecture (−50% onboarding time).
- **Agentic AI & Retrieval** — production LangGraph multi-agent supervisor (staff/media/booking), MongoDB-checkpointed state, MCP across 4 LLMs, 5 iterations + versioned prompts; RAG ChromaDB→Qdrant hybrid with multi-tenant isolation.
- **DevOps · Quality · Leadership** — self-hosted GH Actions runners, Terraform/Helm/Pants, Prometheus/Grafana + on-call; pytest CI gates (~65%), Trivy, AES-128 at rest; led + mentored the 3-engineer team.

### 2. IT Trainee Intern — Tech Entrepreneurs · Mar 2023 – Sep 2023  *(currently hidden)*
**Metrics:** 10+ Filter Categories · 95% Filter Accuracy · 30% Faster Processing · 20% Code Quality ↑
- **Development** — 10+ filtering categories for a job-matching portal (95% accuracy); advanced sorting system (−30% filtering time).
- **Process & Leadership** — regular code reviews enforcing best practices (+20% code quality); translated business requirements into actionable tasks.

## MARS · Projects  *(show all)*
**Professional (6):**
1. Multi-Agent Conversational AI — LangGraph/ADK, MCP tool-calling, hybrid RAG, 4 LLMs, 5 iterations.
2. Enterprise Integration Platform — provider-agnostic 7+ PMS/lock/GRMS, Redis caching, −60% redundancy, 96% faster.
3. Custom MCP Server Suite — 3 MCP servers (Redis Sentinel, RabbitMQ, Pants runner), kubectl port-forward automation.
4. RAG Knowledge Pipeline — Playwright/BS4 → Airflow → Qdrant hybrid (dense + BM25), multi-tenant.
5. Accommodation Management Platform — 5+ FastAPI services on a shared lib, JWT + RBAC, FCM/SMTP, APScheduler.
6. Self-Hosted CI/CD Infrastructure — GH Actions runners, semantic versioning, GKE rollouts, Trivy scans.

**Academic / Personal (3)** — Blog (BlogBuddy · Spring Boot), E-commerce (GadgetGalaxy · Django), CareerForAll (recruitment · Spring Boot). *(see Q1)*

## ASTEROID BELT · Achievements  *(keep 8)*
Star Performer · 96% latency cut · 5-iteration AI agent · team leadership · 6+ integrations · MSc 81.95% · placement-portal build · 3+ full-stack projects.

## JUPITER · Skills  *(9 categories, all shown)*
Languages · AI & Agentic AI · Backend · Frontend · Databases & Search · Distributed Systems · Cloud & DevOps · Messaging & Integration · Testing · Security · Practices. *(matches resume exactly.)*

## SATURN · Notes / Writing  *(see Q2)*
3 technical writeups (FastAPI+gRPC microservices, Multi-Agent AI with MCP, RAG pipeline) — currently "Coming soon."

## URANUS · Education  *(all 4)*
MSc Computer Applications 81.95% (SPPU, 2021–23) · BSc Computer Science 72.57% (SPPU, 2017–21) · HSC 62.31% (2017) · SSC 79.40% (2015).

## NEPTUNE · Hobbies  *(all 8)*
Gaming · Music · Gym · Cricket · Travelling · Reading · Photography · Cooking.

## KUIPER · Testimonials  *(keep 3)*
Upswing Engineering · Tech Entrepreneurs supervisor · SPPU academic mentor.

## BEACON · Contact
Email · Book a Call (calendar) · GitHub · LinkedIn · Resume PDF. *(add phone? — Q3)*

---

## Decisions for you (Q1–Q3)
- **Q1 — Projects:** keep the 3 academic projects (Blog/E-com/CareerForAll), drop them for just the 6 professional, or add the resume's "Portfolio Website" too?
- **Q2 — Notes/Writing:** keep the 3 posts as "Coming soon" teasers, write real short notes, or drop the Saturn/Notes stop entirely?
- **Q3 — Contact:** add your phone number (+91-8237565579) to the contact stop, or keep it email/calendar/social only?
