import {
  backend,
  frontend,
  fullstack,
  javascript,
  html,
  css,
  reactjs,
  redux,
  tailwind,
  mongodb,
  docker,
  java,
  kubernetes,
  linux,
  mysql,
  python,
  springboot,
  techentrepreneurs,
  upswing,
  web,
  django,
  github,
  hsc,
  bachelor,
  ssc,
  bigquery,
  fastapi,
  firebase,
  gcp,
  grpc,
  helm,
  langchain,
  nextjs,
  nodejs,
  openai,
  postgresql,
  prometheus,
  rabbitmq,
  redis,
  restapi,
  soapapi,
  terraform,
  typescript,
  celery,
  gadgetgalaxy,
  blogbuddy,
  careerforall,
} from "../assets";

export const navLinks = [
  { id: "about", title: "About" },
  { id: "experience", title: "Experience" },
  { id: "skills", title: "Skills" },
  { id: "projects", title: "Projects" },
  { id: "notes", title: "Notes" },
  { id: "education", title: "Education" },
  { id: "hobbies", title: "Hobbies" },
  { id: "contact", title: "Contact" },
];

export const services = [
  { title: "Backend & Distributed Systems", icon: backend },
  { title: "Agentic AI (LangGraph · MCP)", icon: fullstack },
  { title: "Hybrid RAG · Vector Search", icon: web },
  { title: "Cloud-native on GKE", icon: frontend },
];

export const skills = {
  "Languages": [
    { name: "Python", icon: python, level: 92 },
    { name: "JavaScript", icon: javascript, level: 82 },
    { name: "TypeScript", icon: typescript, level: 75 },
    { name: "Java", icon: java, level: 80 },
    { name: "Protocol Buffers", icon: grpc, level: 85 },
    { name: "SQL", icon: mysql, level: 85 },
    { name: "Shell", icon: linux, level: 80 },
  ],
  "AI & Agentic AI": [
    { name: "LangChain", icon: langchain, level: 88 },
    { name: "LangGraph", icon: langchain, level: 88 },
    { name: "Model Context Protocol (MCP)", icon: openai, level: 88 },
    { name: "FastMCP", icon: fastapi, level: 85 },
    { name: "OpenAI", icon: openai, level: 85 },
    { name: "Gemini · Vertex AI", icon: gcp, level: 82 },
    { name: "Anthropic Claude", icon: openai, level: 82 },
    { name: "Groq", icon: openai, level: 78 },
    { name: "Google ADK", icon: gcp, level: 78 },
    { name: "Hybrid RAG (Dense + BM25)", icon: langchain, level: 85 },
    { name: "Embeddings · FastEmbed", icon: langchain, level: 82 },
    { name: "Prompt Engineering", icon: langchain, level: 85 },
    { name: "LangSmith", icon: langchain, level: 70 },
    { name: "Vapi (Voice AI)", icon: openai, level: 65 },
    { name: "Prophet (forecasting)", icon: python, level: 68 },
  ],
  "Backend": [
    { name: "FastAPI", icon: fastapi, level: 92 },
    { name: "gRPC", icon: grpc, level: 88 },
    { name: "Pydantic", icon: fastapi, level: 90 },
    { name: "asyncio", icon: python, level: 88 },
    { name: "WebSockets · Socket.IO", icon: nodejs, level: 80 },
    { name: "Celery", icon: celery, level: 80 },
    { name: "Django", icon: django, level: 78 },
    { name: "Spring Boot", icon: springboot, level: 72 },
    { name: "Node.js", icon: nodejs, level: 75 },
  ],
  "Frontend": [
    { name: "React JS", icon: reactjs, level: 82 },
    { name: "Next JS", icon: nextjs, level: 70 },
    { name: "Vite", icon: reactjs, level: 80 },
    { name: "Tailwind CSS", icon: tailwind, level: 82 },
    { name: "Redux", icon: redux, level: 70 },
    { name: "Three.js", icon: reactjs, level: 65 },
    { name: "HTML", icon: html, level: 90 },
    { name: "CSS", icon: css, level: 85 },
  ],
  "Databases & Search": [
    { name: "MongoDB", icon: mongodb, level: 88 },
    { name: "Redis (Cloud · multi-shard)", icon: redis, level: 88 },
    { name: "Qdrant (Vector DB)", icon: mongodb, level: 82 },
    { name: "ChromaDB", icon: mongodb, level: 82 },
    { name: "Firebase Firestore", icon: firebase, level: 82 },
    { name: "Google BigQuery", icon: bigquery, level: 80 },
    { name: "PostgreSQL", icon: postgresql, level: 78 },
    { name: "MySQL", icon: mysql, level: 80 },
    { name: "FastEmbed", icon: openai, level: 78 },
  ],
  "Distributed Systems": [
    { name: "Event-driven architecture", icon: rabbitmq, level: 88 },
    { name: "Idempotency", icon: grpc, level: 88 },
    { name: "Eventual consistency", icon: mongodb, level: 82 },
    { name: "Multi-tenancy isolation", icon: gcp, level: 88 },
    { name: "Caching & connection pooling", icon: redis, level: 90 },
    { name: "Multi-region deployments", icon: gcp, level: 80 },
    { name: "Observability (Prometheus / Grafana)", icon: prometheus, level: 80 },
    { name: "On-call · incident response", icon: prometheus, level: 80 },
  ],
  "Cloud & DevOps": [
    { name: "GCP (GKE, Pub/Sub, Cloud Storage, Vertex AI)", icon: gcp, level: 88 },
    { name: "Docker", icon: docker, level: 90 },
    { name: "Kubernetes", icon: kubernetes, level: 85 },
    { name: "Helm · Helmfile", icon: helm, level: 80 },
    { name: "Terraform", icon: terraform, level: 78 },
    { name: "Pants (build system)", icon: python, level: 75 },
    { name: "Apache Airflow", icon: python, level: 75 },
    { name: "GitHub Actions (self-hosted)", icon: github, level: 88 },
    { name: "GitLab CI/CD", icon: github, level: 78 },
    { name: "Prometheus · Grafana", icon: prometheus, level: 78 },
    { name: "Trivy (container scanning)", icon: docker, level: 78 },
  ],
  "Messaging & Integration": [
    { name: "RabbitMQ", icon: rabbitmq, level: 85 },
    { name: "Google Pub/Sub", icon: gcp, level: 82 },
    { name: "MQTT", icon: rabbitmq, level: 72 },
    { name: "Stripe", icon: nodejs, level: 75 },
    { name: "SMTP · Resend", icon: nodejs, level: 80 },
    { name: "Zoho CRM SDK", icon: nodejs, level: 70 },
    { name: "Webhooks (idempotent)", icon: grpc, level: 88 },
    { name: "REST API", icon: restapi, level: 92 },
    { name: "SOAP API · XML", icon: soapapi, level: 75 },
  ],
  "Testing · Security · Practices": [
    { name: "pytest", icon: python, level: 88 },
    { name: "Integration & smoke testing", icon: python, level: 85 },
    { name: "CI quality gates", icon: github, level: 85 },
    { name: "TDD", icon: python, level: 78 },
    { name: "Code review", icon: github, level: 90 },
    { name: "Agile", icon: github, level: 85 },
    { name: "JWT", icon: nodejs, level: 88 },
    { name: "OAuth 2.1", icon: nodejs, level: 80 },
    { name: "RBAC", icon: nodejs, level: 85 },
    { name: "Firebase Authentication", icon: firebase, level: 82 },
    { name: "AES Encryption", icon: nodejs, level: 80 },
  ],
};

export const experiences = [
  {
    title: "Software Engineer",
    companyName: "Upswing Cognitive Hospitality Solutions",
    icon: upswing,
    iconBg: "#ffffff",
    date: "May 2024 – Present",
    tech: [
      "Python", "FastAPI", "gRPC", "Protocol Buffers", "GKE", "Multi-region",
      "LangGraph", "MCP", "Qdrant (Hybrid RAG)", "MongoDB", "Redis Cloud",
      "RabbitMQ", "Pub/Sub", "BigQuery", "Airflow", "Terraform", "Helm", "Pants",
    ],
    metrics: [
      { value: "31", label: "Services Owned" },
      { value: "96%", label: "p95 Latency Cut" },
      { value: "~25%", label: "Compute Cost Saved" },
      { value: "99.9%", label: "Availability" },
    ],
    achievement: "Awarded Star Performer of the Quarter",
    categories: [
      {
        name: "Platform & Architecture",
        points: [
          "Architected and own end-to-end a 31-service, multi-tenant Python/FastAPI/gRPC backend on GKE with multi-region production deployments, including an API Gateway translating external REST to internal gRPC over Protocol Buffers.",
          "Designed a multi-protocol communication layer (REST, gRPC, WebSockets, Server-Sent Events, Socket.IO) selected per latency and streaming requirement, with idempotent contracts at every external boundary.",
        ],
      },
      {
        name: "Distributed Systems & Reliability",
        points: [
          "Cut p95 API latency 96% (5s → 200ms) on availability and pricing endpoints via Redis caching, connection pooling, query optimization, and efficient serialization — reducing compute cost ~25%.",
          "Migrated production Redis from self-hosted to a multi-shard Redis Cloud cluster and made the shared client cluster-safe (cross-slot handling); diagnosed and fixed distributed race conditions in inventory-hold and pricing consistency under concurrent booking flows.",
          "Engineered event-driven architecture (RabbitMQ, Google Cloud Pub/Sub) with at-least-once delivery and idempotency; real-time Firebase Cloud Messaging and WebSocket updates with ~99.9% production availability.",
          "Designed a dual-write strategy (MongoDB operational, BigQuery analytics) powering automated Excel/PDF reports and an Apache Airflow ETL ingesting documents/media into the vector store.",
        ],
      },
      {
        name: "Integrations (PMS · Door-lock · GRMS)",
        points: [
          "Engineered a unified abstraction integrating 7+ Property Management Systems (Apaleo, Opera/OHIP, Cloudbeds, RMS, Clock, Maxxton) via polymorphic base-class design with idempotent webhook processing and zero-downtime provider switching, cutting code redundancy 60%.",
          "Spearheaded enterprise door-lock (ASSA ABLOY, Messerschmitt) and Guest Room Management System integrations with a template-driven architecture of abstract base classes and provider-specific implementations, reducing new-vendor onboarding time 50%.",
        ],
      },
      {
        name: "Agentic AI & Retrieval",
        points: [
          "Built a production LangGraph multi-agent supervisor (staff, media, and booking agents) with MongoDB-checkpointed conversational state and MCP tool-calling across 4 LLM providers (OpenAI, Gemini, Claude, Groq); shipped 5 agent iterations and a versioned prompt-management system with context-aware chaining and dynamic composition.",
          "Evolved the RAG stack from ChromaDB to Qdrant hybrid dense+sparse (BM25/FastEmbed) vector search with multi-tenant isolation, grounding context-aware guest interactions.",
        ],
      },
      {
        name: "DevOps · Quality · Leadership",
        points: [
          "Deployed self-hosted GitHub Actions runners automating Docker builds, semantic versioning, and Kubernetes rollouts to GCP; provisioned infrastructure with Terraform, Helm/Helmfile, and Pants under Prometheus/Grafana with production on-call and incident response; authored 500+ line Makefiles for deploy/log/pod operations.",
          "Drove engineering rigor with pytest integration and smoke suites behind CI quality gates (~65% coverage on core services), Trivy container scanning, non-root containers, and AES-128 encryption at rest.",
          "Led and mentored the 3-engineer integration team, establishing reusable architecture patterns and code-review standards and coordinating parallel development across multiple codebases.",
        ],
      },
    ],
  },
  {
    title: "IT Trainee Intern",
    companyName: "Tech Entrepreneurs",
    icon: techentrepreneurs,
    iconBg: "#383E56",
    date: "March 2023 – September 2023",
    tech: ["Python", "Django", "JavaScript", "PostgreSQL"],
    metrics: [
      { value: "10+", label: "Filter Categories" },
      { value: "95%", label: "Filter Accuracy" },
      { value: "30%", label: "Faster Processing" },
      { value: "20%", label: "Code Quality Up" },
    ],
    categories: [
      {
        name: "Development",
        points: [
          "Engineered 10+ filtering categories for a job matching portal, achieving 95% filter accuracy and optimizing candidate-to-job matching workflows.",
          "Designed an advanced sorting system resulting in 30% reduction in processing time for filtering candidates and job openings.",
        ],
      },
      {
        name: "Process & Leadership",
        points: [
          "Conducted regular code reviews across the team, enforcing best practices and contributing to 20% improvement in overall code quality.",
          "Translated business requirements into actionable development tasks, ensuring alignment with project timelines and stakeholder objectives.",
        ],
      },
    ],
  },
];

export const projects = [
  // --- Professional projects ---
  {
    name: "Multi-Agent Conversational AI",
    type: "professional",
    status: "production",
    year: "2024",
    team: "Team of 4",
    description:
      "Enterprise AI assistant built through 5 iterative versions using LangChain, LangGraph, and Google ADK. Implemented Agentic AI patterns with MCP-based tool calling for autonomous task execution.",
    features: [
      "Agentic AI with MCP-based tool calling",
      "RAG pipeline with ChromaDB vector store",
      "Dynamic routing across 4 LLM providers",
      "Versioned prompt engineering & context-aware chaining",
    ],
    tags: [
      { name: "langchain" },
      { name: "python" },
      { name: "openai" },
      { name: "rag" },
      { name: "mcp" },
    ],
    stats: [
      { label: "LLM Providers", value: "4" },
      { label: "Iterations", value: "5" },
    ],
    highlight: { value: "4", label: "LLM Providers" },
  },
  {
    name: "Enterprise Integration Platform",
    type: "professional",
    status: "production",
    year: "2024",
    team: "Solo",
    description:
      "Unified backend integration layer connecting 6+ Property Management Systems, door lock platforms, and room management systems. Designed abstraction interfaces enabling provider-agnostic operations.",
    features: [
      "6+ PMS & lock system integrations",
      "Provider-agnostic abstraction layer",
      "Redis caching for performance optimization",
      "96% reduction in API response latency",
    ],
    tags: [
      { name: "fastapi" },
      { name: "grpc" },
      { name: "redis" },
      { name: "gcp" },
      { name: "python" },
    ],
    stats: [
      { label: "Integrations", value: "6+" },
      { label: "Latency Cut", value: "96%" },
    ],
    highlight: { value: "96%", label: "Faster" },
  },
  {
    name: "Self-Hosted CI/CD Infrastructure",
    type: "professional",
    status: "production",
    year: "2024",
    team: "Solo",
    description:
      "Deployed and configured local GitHub Actions runner servers to execute CI/CD pipelines internally. Automated Docker builds, semantic versioning, and Kubernetes rollout deployments to GCP.",
    features: [
      "Self-hosted GitHub Actions runners",
      "Automated Docker builds & semantic versioning",
      "Kubernetes rollout deployments on GCP",
      "Trivy container vulnerability scanning",
    ],
    tags: [
      { name: "github-actions" },
      { name: "docker" },
      { name: "kubernetes" },
      { name: "terraform" },
    ],
    stats: [
      { label: "Pipelines", value: "10+" },
      { label: "Environments", value: "3" },
    ],
    highlight: { value: "10+", label: "Pipelines" },
  },
  {
    name: "RAG Knowledge Pipeline (ChromaDB → Qdrant Hybrid)",
    type: "professional",
    status: "production",
    year: "2024",
    team: "Team of 2",
    description:
      "End-to-end Retrieval-Augmented Generation system: Playwright/BeautifulSoup scrapers feed embeddings into a vector store, chunked and indexed for semantic search. Evolved the stack from ChromaDB to Qdrant hybrid (dense + BM25/FastEmbed) to fix recall on short queries, with multi-tenant isolation.",
    features: [
      "Playwright + BeautifulSoup scraping into Airflow ETL",
      "Dense embeddings + BM25/FastEmbed sparse (hybrid retrieval)",
      "Qdrant vector store with multi-tenant isolation",
      "Migration story: why ChromaDB stopped scaling for us",
    ],
    tags: [
      { name: "python" },
      { name: "qdrant" },
      { name: "chromadb" },
      { name: "openai" },
      { name: "rag" },
      { name: "airflow" },
    ],
    stats: [
      { label: "Retrieval", value: "Hybrid" },
      { label: "Tenant Isolation", value: "Yes" },
    ],
    highlight: { value: "Hybrid", label: "Dense + Sparse" },
  },
  {
    name: "Custom MCP Server Suite",
    type: "professional",
    status: "production",
    year: "2024",
    team: "Solo",
    description:
      "Three standalone Model Context Protocol servers I built to make Kubernetes-native local dev workflows feel native to LLM agents: a Redis Sentinel inspector, a multi-target RabbitMQ controller, and a Pants service-runner. Each exposes async tool registries with kubectl port-forwarding automation so an agent can interact with cluster services as if they were local.",
    features: [
      "3 standalone MCP servers (Redis Sentinel, RabbitMQ, Pants runner)",
      "kubectl port-forwarding automation built into each tool",
      "Async tool registries with typed Pydantic schemas",
      "Kubernetes-native local dev workflow for LLM agents",
    ],
    tags: [
      { name: "python" },
      { name: "mcp" },
      { name: "fastmcp" },
      { name: "kubernetes" },
      { name: "redis" },
      { name: "rabbitmq" },
    ],
    stats: [
      { label: "MCP Servers", value: "3" },
      { label: "Pattern", value: "Async tools" },
    ],
    highlight: { value: "3", label: "MCP Servers" },
  },
  {
    name: "Accommodation Management Platform",
    type: "professional",
    status: "production",
    year: "2024",
    team: "Team of 4",
    description:
      "RBAC-driven backend with a shared-library architecture across 5+ FastAPI microservices: JWT auth, role-based permissions, multi-channel notifications (Firebase FCM, SMTP), and APScheduler-driven background jobs over MongoDB. The shared library is the load-bearing piece — keeps cross-service contracts honest without coupling deployments.",
    features: [
      "5+ FastAPI microservices on a shared internal library",
      "JWT auth with multi-tenant RBAC permissions",
      "Multi-channel notifications: Firebase FCM + SMTP",
      "APScheduler background jobs over MongoDB",
    ],
    tags: [
      { name: "python" },
      { name: "fastapi" },
      { name: "mongodb" },
      { name: "firebase" },
      { name: "jwt" },
      { name: "rbac" },
    ],
    stats: [
      { label: "Microservices", value: "5+" },
      { label: "Auth", value: "JWT · RBAC" },
    ],
    highlight: { value: "5+", label: "Services" },
  },
  // --- Personal / Academic projects ---
  {
    name: "Blog Application",
    type: "personal",
    status: "completed",
    year: "2023",
    team: "Solo",
    image: blogbuddy,
    github: "https://github.com/rugwedpatharkar/BlogBuddy",
    description:
      "BlogBuddy — a full-stack blogging platform with secure authentication, email OTP verification, and responsive UI. Deployed with Docker on Render.",
    features: [
      "User auth with email OTP verification",
      "Full CRUD blogging with rich text",
      "MongoDB Atlas cloud storage",
      "Dockerized deployment on Render",
    ],
    tags: [
      { name: "java" },
      { name: "spring-boot" },
      { name: "mongodb" },
      { name: "docker" },
      { name: "bootstrap" },
    ],
    stats: [
      { label: "Features", value: "10+" },
      { label: "Endpoints", value: "15+" },
    ],
    highlight: { value: "15+", label: "APIs" },
  },
  {
    name: "E-commerce Platform",
    type: "personal",
    status: "completed",
    year: "2023",
    team: "Solo",
    image: gadgetgalaxy,
    github: "https://github.com/rugwedpatharkar/GadgetGalaxy",
    description:
      "GadgetGalaxy — an e-commerce platform with secure user authentication, product catalog, cart system, and email notifications. Deployed on PythonAnywhere.",
    features: [
      "Product catalog & shopping cart",
      "Secure auth with OTP password reset",
      "Email notification system",
      "Deployed on PythonAnywhere",
    ],
    tags: [
      { name: "python" },
      { name: "django" },
      { name: "html5" },
      { name: "css3" },
      { name: "bootstrap" },
    ],
    stats: [
      { label: "Products", value: "50+" },
      { label: "Pages", value: "8" },
    ],
    highlight: { value: "50+", label: "Products" },
  },
  {
    name: "CareerForAll Application",
    type: "personal",
    status: "completed",
    year: "2023",
    team: "Solo",
    image: careerforall,
    github: "https://github.com/rugwedpatharkar/CareerForAll",
    description:
      "Recruitment platform connecting startups, institutes, and job seekers. Streamlines the matching process with multi-role access and modular architecture.",
    features: [
      "Multi-role platform (3 user types)",
      "Startup-institute-candidate matching",
      "12+ functional modules",
      "RESTful API integration",
    ],
    tags: [
      { name: "java" },
      { name: "spring-boot" },
      { name: "mysql" },
      { name: "javascript" },
      { name: "bootstrap" },
    ],
    stats: [
      { label: "Modules", value: "12+" },
      { label: "User Roles", value: "3" },
    ],
    highlight: { value: "12+", label: "Modules" },
  },
];

export const personalInfo = {
  name: "Rugwed",
  fullName: "Rugwed Patharkar",
  email: "rugwedspatharkar@gmail.com",
  role: "Software Engineer",
  availability: "Software Engineer @ Upswing · Backend & Agentic AI",
  // "available" → green, "busy" → yellow, "unavailable" → red
  availabilityStatus: "available",
  github: "https://github.com/rugwedpatharkar",
  githubUsername: "rugwedpatharkar",
  linkedin: "https://www.linkedin.com/in/rugwed-patharkar/",
  location: "Pune, India",
  languages: "English · Hindi · Marathi",
  yearsExperience: "2+",
  about:
    "I build the backend infrastructure that hospitality SaaS runs on. At Upswing I architected and own a 31-service Python/FastAPI/gRPC platform on GKE — multi-tenant, multi-region, integrated with 7+ PMS, door-lock, and GRMS vendors (Apaleo, Opera/OHIP, Cloudbeds, RMS, Clock, Maxxton, ASSA ABLOY, Messerschmitt). p95 API latency went from 5s to 200ms (96% cut); compute spend dropped ~25%. I also ship production agentic AI — multi-agent LangGraph supervisor with MCP tool-calling across 4 LLM providers (OpenAI, Gemini, Claude, Groq), grounded by Qdrant hybrid (dense + BM25/sparse) RAG. I lead a 3-engineer integration team and was named Star Performer of the Quarter. I care most about systems that recover gracefully, observability that earns its keep, and APIs that don't surprise the people who consume them.",
};

export const educations = [
  {
    degree: "MSc (Computer Applications)",
    shortName: "MSc",
    level: "Postgraduate",
    percentage: 81.95,
    name: "Savitribai Phule Pune University",
    image: bachelor,
    year: "2021 – 2023",
    duration: "2 years",
    highlights: ["Cloud Computing & DevOps", "AI / Machine Learning", "Advanced DBMS", "Software Architecture"],
  },
  {
    degree: "BSc (Computer Science)",
    shortName: "BSc",
    level: "Undergraduate",
    percentage: 72.57,
    name: "Savitribai Phule Pune University",
    image: bachelor,
    year: "2017 – 2021",
    duration: "4 years",
    highlights: ["Data Structures & Algorithms", "Operating Systems", "Computer Networks", "Web Development"],
  },
  {
    degree: "12th Standard HSC Board",
    shortName: "HSC",
    level: "Higher Secondary",
    percentage: 62.31,
    name: "PVG College, Pune",
    image: hsc,
    year: "2017",
    duration: "2 years",
    highlights: ["Physics", "Mathematics", "Computer Science"],
  },
  {
    degree: "10th Standard SSC Board",
    shortName: "SSC",
    level: "Secondary",
    percentage: 79.40,
    name: "M.S.G.G.V., Pune",
    image: ssc,
    year: "2015",
    duration: null,
    highlights: ["Mathematics", "Science", "English"],
  },
];

export const achievements = [
  {
    title: "Star Performer of the Quarter",
    description:
      "Awarded at Upswing Cognitive Hospitality Solutions for outstanding delivery across multiple concurrent production projects",
    icon: "⭐",
    year: "2024",
  },
  {
    title: "96% API Latency Reduction",
    description:
      "Optimized integration services from 5s to 200ms response time through Redis caching, connection pooling, and query optimization",
    icon: "⚡",
    year: "2024",
  },
  {
    title: "5-Iteration AI Agent",
    description:
      "Built enterprise conversational AI through 5 iterative versions integrating 4 LLM providers with Agentic AI and MCP patterns",
    icon: "🤖",
    year: "2024",
  },
  {
    title: "Team Leadership",
    description:
      "Led a team of 2+ developers on integration workstreams, establishing reusable architecture patterns across multiple codebases",
    icon: "👥",
    year: "2024",
  },
  {
    title: "6+ Enterprise Integrations",
    description:
      "Architected unified abstraction layer for Property Management Systems, door locks, and room management — reducing code redundancy by 60%",
    icon: "🔗",
    year: "2024",
  },
  {
    title: "MSc Computer Applications",
    description:
      "Completed MSc with 81.95% from Savitribai Phule Pune University",
    icon: "🎓",
    year: "2023",
  },
  {
    title: "Placement Portal Development",
    description:
      "Led the development of a full-featured Placement Portal during internship at Tech Entrepreneurs",
    icon: "💼",
    year: "2023",
  },
  {
    title: "3+ Full Stack Projects",
    description:
      "Built and deployed production-ready applications using Java, Python, and modern web technologies",
    icon: "🚀",
    year: "2023",
  },
];

export const testimonials = [
  {
    name: "Upswing Engineering Team",
    role: "Engineering Manager",
    company: "Upswing Cognitive Hospitality Solutions",
    quote:
      "Rugwed consistently delivers high-impact work across backend microservices, AI systems, and infrastructure. His ability to architect scalable integrations and lead workstreams has been instrumental to our platform's growth.",
    rating: 5,
    endorsements: ["Backend", "System Design", "AI/ML", "DevOps"],
    context: {
      projects: ["Enterprise Integration Platform", "Multi-Agent AI", "CI/CD Infrastructure"],
      period: "May 2024 – Present",
    },
  },
  {
    name: "Tech Entrepreneurs Team",
    role: "Internship Supervisor",
    company: "Tech Entrepreneurs",
    quote:
      "Rugwed demonstrated exceptional problem-solving skills and consistently delivered high-quality code. His ability to collaborate effectively and manage project timelines was truly outstanding.",
    rating: 5,
    endorsements: ["Java", "Teamwork", "Problem-Solving", "Project Management"],
    context: {
      projects: ["Placement Portal"],
      period: "Mar 2023 – Sep 2023",
    },
  },
  {
    name: "Academic Mentor",
    role: "Savitribai Phule Pune University",
    company: "SPPU",
    quote:
      "A dedicated student with a strong aptitude for software development. Rugwed's projects consistently demonstrated innovation and attention to detail.",
    rating: 5,
    endorsements: ["Innovation", "Software Development", "Research"],
    context: {
      projects: ["MSc Projects", "Academic Research"],
      period: "2021 – 2023",
    },
  },
];

// "Numbers I've moved" — every value below is grounded in a specific Upswing
// initiative documented in the experience entry above. Recruiter-scannable.
export const funFacts = [
  { label: "Services Architected", value: 31, suffix: "", icon: "🛰️", detail: "Multi-tenant Python/FastAPI/gRPC platform on GKE with multi-region production deployments and an API Gateway translating REST to internal gRPC." },
  { label: "p95 Latency Cut", value: 96, suffix: "%", icon: "⚡", detail: "From 5s to 200ms on availability and pricing endpoints via Redis caching, connection pooling, query optimization, and efficient serialization." },
  { label: "Compute Cost Saved", value: 25, suffix: "%", icon: "💰", detail: "Direct outcome of the latency work — fewer wasted cycles per request, paid back in cloud bill." },
  { label: "PMS / Hardware Vendors", value: 7, suffix: "+", icon: "🔌", detail: "Apaleo, Opera/OHIP, Cloudbeds, RMS, Clock, Maxxton — plus ASSA ABLOY and Messerschmitt for door-locks and GRMS." },
  { label: "Production Availability", value: 99.9, suffix: "%", icon: "🟢", detail: "Backed by Prometheus/Grafana observability, on-call rotation, and incident response on the platform I own." },
  { label: "Vendor Onboarding Speed", value: 50, suffix: "%", icon: "🚀", detail: "Faster, via a template-driven architecture of abstract base classes and provider-specific implementations." },
  { label: "Code Redundancy Cut", value: 60, suffix: "%", icon: "🧹", detail: "Polymorphic base-class design across the PMS integration layer — one contract, many providers." },
  { label: "Test Coverage on Core", value: 65, suffix: "%", icon: "🧪", detail: "pytest integration & smoke suites behind CI quality gates on the services that matter most." },
];

export const hobbies = [
  {
    name: "Gaming",
    icon: "🎮",
    tagline: "Strategy, FPS & open-world adventures",
    detail: "Whether it's a clutch round in an FPS or losing hours in a massive open-world RPG — gaming sharpens lateral thinking and decision-making under pressure.",
    stat: { value: "500+", label: "Hours Played" },
    tags: ["Strategy", "FPS", "RPG"],
  },
  {
    name: "Music",
    icon: "🎵",
    tagline: "The ultimate debugging companion",
    detail: "Lo-fi beats for deep focus, classic rock when energy spikes. There's a playlist for every kind of sprint — music makes the hours invisible.",
    stat: { value: "8h", label: "Daily Listening" },
    tags: ["Lo-fi", "Rock", "Electronic"],
  },
  {
    name: "Gym",
    icon: "💪",
    tagline: "Discipline built outside the IDE",
    detail: "Consistent strength training keeps the mind as sharp as the body. Fitness taught me that showing up every day beats one-time intensity — same rule applies to engineering.",
    stat: { value: "3+", label: "Years Consistent" },
    tags: ["Strength", "Cardio", "Discipline"],
  },
  {
    name: "Cricket",
    icon: "🏏",
    tagline: "Weekend warrior & IPL season fanatic",
    detail: "Weekend matches with the crew, IPL season tracking, match analysis — cricket is all about reading pressure, adapting strategy, and executing under the clock. Sound familiar?",
    stat: { value: "IPL", label: "Season Tracker" },
    tags: ["Batting", "Strategy", "IPL"],
  },
  {
    name: "Travelling",
    icon: "✈️",
    tagline: "Every city is a new system to explore",
    detail: "New cultures, unfamiliar streets, and local food reset the mind completely. Some of my best architectural ideas sparked mid-trip, wandering somewhere entirely unexpected.",
    stat: { value: "5+", label: "Cities Explored" },
    tags: ["Culture", "Adventure", "Food"],
  },
  {
    name: "Reading",
    icon: "📚",
    tagline: "Tech books, sci-fi & self-growth",
    detail: "From Clean Code to science fiction — reading feeds curiosity at both ends. Technical depth from one shelf, perspective and creativity from the other.",
    stat: { value: "20+", label: "Books Devoured" },
    tags: ["Tech", "Sci-Fi", "Self-Dev"],
  },
  {
    name: "Photography",
    icon: "📷",
    tagline: "Framing stories one shot at a time",
    detail: "Photography trained a different kind of vision — composition, light, and timing. Engineering and photography both reward patience and a relentless eye for detail.",
    stat: { value: "500+", label: "Shots Captured" },
    tags: ["Composition", "Street", "Nature"],
  },
  {
    name: "Cooking",
    icon: "🍳",
    tagline: "Late-night kitchen experiments",
    detail: "Cooking is just shipping in a different medium: gather ingredients (dependencies), execute the recipe (logic), improvise when needed, and deliver something delicious.",
    stat: { value: "30+", label: "Recipes Tried" },
    tags: ["Indian", "Fusion", "Experiment"],
  },
];

// Blog tags use plain strings (e.g. "FastAPI") unlike project tags which use
// objects (e.g. { name: "React" }). The Blog component renders them directly.
// Working notes — short, specific lessons pulled straight from production work.
// Not blog placeholders: each one is a real insight from a system I shipped.
export const blogPosts = [
  {
    title: "Idempotency is the only thing that lets you sleep",
    description:
      "Every external boundary in the PMS layer — 7+ webhooks, door-lock callbacks — processes at-least-once. The polymorphic base class gives one idempotent contract for N providers; designing the dedup key before the happy path is what made zero-downtime provider switching and safe replay-after-incident possible.",
    link: "#",
    date: "2024",
    tags: ["Idempotency", "Webhooks", "Integration"],
  },
  {
    title: "Where the 5 seconds went",
    description:
      "Cutting p95 from 5s to 200ms was three things stacked: N+1 queries hidden behind an ORM, missing Redis caching on hot read paths, and connection-pool starvation under concurrent bookings. The same concurrency surfaced inventory-hold race conditions that only appeared under real load — latency and correctness bugs hide in the same place.",
    link: "#",
    date: "2024",
    tags: ["Performance", "Redis", "Concurrency"],
  },
  {
    title: "Why we migrated off ChromaDB",
    description:
      "ChromaDB shipped the prototype, then stalled: dense-only embeddings dropped recall on short, keyword-heavy guest queries, and we needed hard multi-tenant isolation. Qdrant hybrid (dense + BM25/FastEmbed sparse) restored recall; named collections + payload filters gave per-tenant isolation. Hybrid retrieval isn't a luxury when queries are short.",
    link: "#",
    date: "2024",
    tags: ["RAG", "Qdrant", "Vector Search"],
  },
];

export const sectionMeta = {
  about: { sub: "Introduction", heading: "Overview", description: "What I work on, what I lead, and the technical stance I bring to every system I touch." },
  funFacts: { sub: "Numbers I've Moved", heading: "Impact in Production", description: "Every number below is grounded in a specific platform initiative — latency cuts, vendor onboarding speedups, code reductions. Receipts, not vibes." },
  experience: { sub: "Where I've worked", heading: "Work Experience", description: "Backend systems, agentic AI, and platform ownership — organized by the discipline each bullet draws on." },
  skills: { sub: "What I Bring to the Table", heading: "Technical Skills", description: "9 categories — from languages and backend frameworks to distributed-systems primitives, security, and the messaging fabric that holds it all together." },
  projects: { sub: "Explore My Work", heading: "Projects", description: "Each project represents a distinct challenge — from building AI-powered systems to deploying cloud infrastructure. Tap any card to explore." },
  notes: { sub: "Working Notes", heading: "Notes & Writing", description: "Short technical notes, lessons from production, and ideas I'm wrestling with — published as I learn, not when they're polished." },
  education: { sub: "Academic Journey", heading: "Education", description: "From foundational studies to advanced computer science — each milestone shaped my engineering journey." },
  achievements: { sub: "Milestones", heading: "Achievements", description: "Key milestones and recognitions from my academic and professional journey that keep me motivated to push further." },
  hobbies: { sub: "Beyond the Code", heading: "Hobbies & Interests", description: "When I'm not building systems or pushing code, here's what keeps me curious, creative, and energized." },
  testimonials: { sub: "What Others Say", heading: "Testimonials", description: "Feedback from colleagues, mentors, and collaborators I've had the privilege of working with." },
  contact: { sub: "Get in Touch", heading: "Contact", description: "Have a project idea, collaboration opportunity, or just want to say hi? I'd love to hear from you." },
};

export const heroContent = {
  stats: [
    { value: 31, suffix: "", label: "Services Architected" },
    { value: 7, suffix: "+", label: "PMS / Hardware Vendors" },
    { value: 96, suffix: "%", label: "p95 Latency Cut" },
  ],
  typewriterRoles: [
    "Backend & Agentic AI Engineer",
    "Distributed Systems @ GKE",
    "LangGraph · MCP · Hybrid RAG",
  ],
  tagline: "31-service Python/FastAPI/gRPC platform on GKE · multi-agent LLM systems with MCP & hybrid RAG, in production.",
  codeSnippet: [
    { text: "const ", color: "#bf61ff" },
    { text: "rugwed", color: "#79c0ff" },
    { text: " = {", color: "#e6e6e6" },
    { text: "\n  role: ", color: "#e6e6e6" },
    { text: '"SWE"', color: "#00cea8" },
    { text: ",", color: "#e6e6e6" },
    { text: "\n  stack: ", color: "#e6e6e6" },
    { text: "[", color: "#e6e6e6" },
    { text: '"Python"', color: "#00cea8" },
    { text: ", ", color: "#e6e6e6" },
    { text: '"React"', color: "#00cea8" },
    { text: "]", color: "#e6e6e6" },
    { text: ",", color: "#e6e6e6" },
    { text: "\n  passion: ", color: "#e6e6e6" },
    { text: '"building"', color: "#00cea8" },
    { text: "\n};", color: "#e6e6e6" },
  ],
  orbitTags: [
    { name: "Python", color: "#915eff", r: 0.58, dur: 22, delay: 0 },
    { name: "Django", color: "#00cea8", r: 0.58, dur: 22, delay: -7.33 },
    { name: "FastAPI", color: "#bf61ff", r: 0.58, dur: 22, delay: -14.67 },
    { name: "React", color: "#61dafb", r: 0.75, dur: 32, delay: 0 },
    { name: "Docker", color: "#2496ed", r: 0.75, dur: 32, delay: -10.67 },
    { name: "Redis", color: "#ff4438", r: 0.75, dur: 32, delay: -21.33 },
    { name: "K8s", color: "#326ce5", r: 0.92, dur: 45, delay: 0 },
    { name: "GCP", color: "#f8c555", r: 0.92, dur: 45, delay: -11.25 },
    { name: "PostgreSQL", color: "#336791", r: 0.92, dur: 45, delay: -22.5 },
    { name: "AI/ML", color: "#00cea8", r: 0.92, dur: 45, delay: -33.75 },
  ],
  orbitDots: [
    { r: 0.58, dur: 22, delay: -4, size: 3, color: "#915eff" },
    { r: 0.58, dur: 22, delay: -15, size: 2, color: "#00cea8" },
    { r: 0.75, dur: 32, delay: -5, size: 3, color: "#61dafb" },
    { r: 0.75, dur: 32, delay: -18, size: 2, color: "#915eff" },
    { r: 0.75, dur: 32, delay: -28, size: 2.5, color: "#bf61ff" },
    { r: 0.92, dur: 45, delay: -7, size: 2.5, color: "#f8c555" },
    { r: 0.92, dur: 45, delay: -22, size: 2, color: "#00cea8" },
    { r: 0.92, dur: 45, delay: -38, size: 3, color: "#915eff" },
    { r: 1.08, dur: 60, delay: -10, size: 2, color: "#915eff" },
    { r: 1.08, dur: 60, delay: -30, size: 1.5, color: "#00cea8" },
    { r: 1.08, dur: 60, delay: -50, size: 2.5, color: "#bf61ff" },
  ],
  comets: [
    { name: "TypeScript", color: "#3178c6", dur: 30, delay: 0, x1: -1.3, y1: -0.5, x2: 1.3, y2: 0.5, tail: "left" },
    { name: "Node.js", color: "#68a063", dur: 38, delay: -10, x1: 1.3, y1: -0.3, x2: -1.3, y2: 0.4, tail: "right" },
    { name: "MongoDB", color: "#4db33d", dur: 34, delay: -20, x1: -1.1, y1: 0.6, x2: 1.2, y2: -0.4, tail: "left" },
    { name: "GraphQL", color: "#e535ab", dur: 42, delay: -30, x1: 0.8, y1: -1.2, x2: -0.5, y2: 1.3, tail: "right" },
    { name: "Terraform", color: "#7b42bc", dur: 36, delay: -8, x1: -0.6, y1: -1.3, x2: 0.7, y2: 1.2, tail: "left" },
  ],
};

export const aboutStats = [
  { value: 2, suffix: "+", label: "Years Building Production" },
  { value: 31, suffix: "", label: "Services in One Platform" },
  { value: 99.9, suffix: "%", label: "Production Availability" },
];

export const contactLinks = [
  {
    label: "Email",
    value: personalInfo.email,
    href: `mailto:${personalInfo.email}`,
    iconType: "email",
    copyable: true,
  },
  {
    label: "Book a Call",
    value: "Schedule a Meeting",
    href: "https://calendar.app.google/NBvECL2cKbdgVVwG7",
    iconType: "calendar",
  },
  {
    label: "GitHub",
    value: personalInfo.githubUsername,
    href: personalInfo.github,
    iconType: "github",
  },
  {
    label: "LinkedIn",
    value: "rugwed-patharkar",
    href: personalInfo.linkedin,
    iconType: "linkedin",
  },
  {
    label: "Resume",
    value: "Download PDF",
    href: "/Rugwed-Patharkar-Resume.pdf",
    iconType: "resume",
    download: true,
  },
];

export const contactContent = {
  topics: [
    { label: "Hiring", icon: "💼" },
    { label: "Freelance", icon: "🤝" },
    { label: "Collaboration", icon: "🚀" },
    { label: "Just saying hi", icon: "👋" },
  ],
  msgTemplates: {
    Hiring: "Hi Rugwed, I came across your portfolio and I'm impressed by your work. We have an exciting opportunity that I think would be a great fit for your skills. Would you be open to discussing it?",
    Freelance: "Hi Rugwed, I have a project that could use your expertise in backend/AI development. I'd love to discuss the scope, timeline, and how we could work together.",
    Collaboration: "Hi Rugwed, I'm working on something interesting and your experience with microservices and AI systems would be a great complement. Would you be interested in collaborating?",
    "Just saying hi": "Hey Rugwed! Just wanted to say your portfolio is really impressive. Keep up the great work!",
  },
  msgLimit: 500,
  availabilityMessage: "Currently accepting new opportunities",
  responseTime: "Responds within 24h",
  terminalTitle: `${personalInfo.name.toLowerCase()}@portfolio — compose`,
  terminalCommand: { prompt: "compose", flag: "--new-message" },
  formLabels: {
    topicQuestion: "What's this about?",
    name: "Your Name",
    email: "Your Email",
    message: "Your Message",
  },
  placeholders: {
    name: "John Doe",
    email: "john@example.com",
    message: "Tell me about your project or just say hi...",
    previewEmpty: "Start typing to see preview...",
    previewFrom: "your@email.com",
    previewSubject: "Select a topic...",
  },
  successMessage: "Message sent! I'll get back to you soon.",
  previewSuccessMessage: "Message sent!",
  previewSuccessSubtext: "I'll get back to you soon.",
  sendButton: "Send Message",
  sendingText: "Sending",
  sentText: "Delivered!",
  keyboardHint: "Cmd+Enter",
};

export const easterEggs = {
  ascii: "  ██████╗ ██╗   ██╗ ██████╗ ██╗    ██╗███████╗██████╗ \n  ██╔══██╗██║   ██║██╔════╝ ██║    ██║██╔════╝██╔══██╗\n  ██████╔╝██║   ██║██║  ███╗██║ █╗ ██║█████╗  ██║  ██║\n  ██╔══██╗██║   ██║██║   ██║██║███╗██║██╔══╝  ██║  ██║\n  ██║  ██║╚██████╔╝╚██████╔╝╚███╔███╔╝███████╗██████╔╝\n  ╚═╝  ╚═╝ ╚═════╝  ╚═════╝  ╚══╝╚══╝ ╚══════╝╚═════╝ ",
  greeting: "Hey there, fellow developer! 👋",
  repoLink: "Curious about the code? Check it out: https://github.com/rugwedpatharkar/portfolio",
  hint: "🛸  Try the Konami code. Click the sun. Drag to explore.",
};

export const builtWith = [
  { name: "React", color: "#61dafb" },
  { name: "Tailwind CSS", color: "#61dafb" },
  { name: "Framer Motion", color: "#bf61ff" },
  { name: "Three.js", color: "#00cea8" },
  { name: "Vite", color: "#f8c555" },
];

export const footerContent = {
  tagline: `${personalInfo.role}. Building scalable microservices & AI-powered systems.`,
  navigateHeader: "Navigate",
  builtWithHeader: "Built With",
  version: "v3.0",
  madeWith: "Designed & Developed with",
  portfolioDownload: "Download Portfolio",
  portfolioFile: "/Rugwed-Patharkar-Resume.pdf",
};

export const navbarContent = {
  name: personalInfo.fullName,
  suffix: "| Portfolio",
};

export const heroButtons = {
  primary: "Explore My Work",
  secondary: "Get in Touch",
  resume: "Resume",
  resumeFilename: "Rugwed-Patharkar-Resume.pdf",
};

export const uiLabels = {
  projects: {
    professional: "// professional",
    personal: "// personal",
    source: "Source",
    liveDemo: "Live Demo",
    noResults: "No projects found for this filter.",
    showAll: "Show all projects",
    collapseAll: "↑ Collapse all",
    expandAll: "↓ Expand all",
  },
  education: {
    score: "Score",
    completed: "Completed",
    prev: "Prev",
    next: "Next",
  },
  funFacts: {
    flipHint: "click to reveal",
    flipBack: "tap to flip back",
  },
  testimonials: {
    endorses: "Endorses",
    projects: "Projects:",
  },
  about: {
    viewResume: "View Resume",
    downloadCv: "Download CV",
  },
};

// Notes data lives in its own module so the Notes section chunk owns it.
// The barrel-re-export keeps the public API stable for SpotlightSearch.
export { notes } from "./sections/notes";

export const sectionOrder = [
  "about",
  "funFacts",
  "experience",
  "skills",
  "projects",
  "notes",
  "education",
  "achievements",
  "hobbies",
  "testimonials",
  "contact",
];
