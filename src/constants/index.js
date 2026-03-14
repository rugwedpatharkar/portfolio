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
  git,
  docker,
  careerforall,
  java,
  kubernetes,
  linux,
  mysql,
  postman,
  python,
  springboot,
  vscode,
  techentrepreneurs,
  upswing,
  gadgetgalaxy,
  blogbuddy,
  web,
  django,
  bootstrap,
  github,
  hsc,
  bachelor,
  ssc,
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
  terraform,
  typescript,
  celery,
  eclipse,
  netbeans,
  pycharm,
  threejs,
} from "../assets";

export const navLinks = [
  { id: "about", title: "About" },
  { id: "experience", title: "Experience" },
  { id: "skills", title: "Skills" },
  { id: "projects", title: "Projects" },
  { id: "educations", title: "Education" },
  { id: "contact", title: "Contact" },
];

const services = [
  { title: "Software Engineer", icon: backend },
  { title: "AI / ML Engineer", icon: fullstack },
  { title: "Cloud & DevOps", icon: web },
  { title: "Full Stack Developer", icon: frontend },
];

const skills = {
  "Languages": [
    { name: "Python", icon: python, level: 92 },
    { name: "JavaScript", icon: javascript, level: 82 },
    { name: "TypeScript", icon: typescript, level: 75 },
    { name: "Java", icon: java, level: 80 },
    { name: "SQL", icon: mysql, level: 85 },
  ],
  "Backend Frameworks": [
    { name: "FastAPI", icon: fastapi, level: 92 },
    { name: "gRPC", icon: grpc, level: 88 },
    { name: "Django", icon: django, level: 78 },
    { name: "Spring Boot", icon: springboot, level: 72 },
    { name: "Node.js", icon: nodejs, level: 75 },
    { name: "Celery", icon: celery, level: 80 },
  ],
  "Frontend": [
    { name: "React JS", icon: reactjs, level: 82 },
    { name: "Next JS", icon: nextjs, level: 70 },
    { name: "HTML", icon: html, level: 90 },
    { name: "CSS", icon: css, level: 85 },
    { name: "Tailwind CSS", icon: tailwind, level: 80 },
    { name: "Bootstrap", icon: bootstrap, level: 78 },
    { name: "Redux", icon: redux, level: 70 },
  ],
  "AI & Emerging Tech": [
    { name: "LangChain", icon: langchain, level: 88 },
    { name: "OpenAI / LLMs", icon: openai, level: 85 },
    { name: "RAG / Embeddings", icon: langchain, level: 82 },
  ],
  "Databases": [
    { name: "MongoDB", icon: mongodb, level: 85 },
    { name: "Redis", icon: redis, level: 85 },
    { name: "PostgreSQL", icon: postgresql, level: 78 },
    { name: "Firebase Firestore", icon: firebase, level: 80 },
    { name: "MySQL", icon: mysql, level: 80 },
  ],
  "Cloud & DevOps": [
    { name: "GCP", icon: gcp, level: 88 },
    { name: "Docker", icon: docker, level: 88 },
    { name: "Kubernetes", icon: kubernetes, level: 82 },
    { name: "Terraform", icon: terraform, level: 75 },
    { name: "Helm", icon: helm, level: 78 },
    { name: "GitHub Actions", icon: github, level: 85 },
    { name: "Prometheus/Grafana", icon: prometheus, level: 72 },
  ],
  "Tools & Platforms": [
    { name: "Git", icon: git, level: 90 },
    { name: "RabbitMQ", icon: rabbitmq, level: 82 },
    { name: "Postman", icon: postman, level: 85 },
    { name: "Linux", icon: linux, level: 80 },
    { name: "VS Code", icon: vscode, level: 92 },
    { name: "PyCharm", icon: pycharm, level: 75 },
    { name: "Eclipse", icon: eclipse, level: 70 },
  ],
};

const experiences = [
  {
    title: "Software Engineer",
    company_name: "Upswing Cognitive Hospitality Solutions",
    icon: upswing,
    iconBg: "#ffffff",
    date: "May 2024 – Present",
    tech: ["Python", "FastAPI", "gRPC", "GKE", "LangChain", "Redis", "RabbitMQ", "Terraform", "Docker", "Helm"],
    metrics: [
      { value: "96%", label: "Latency Reduced" },
      { value: "60%", label: "Code Reduced" },
      { value: "6+", label: "Integrations" },
      { value: "5", label: "AI Iterations" },
    ],
    achievement: "Awarded Star Performer of the Quarter",
    categories: [
      {
        name: "Backend & Architecture",
        points: [
          "Architected and developed scalable backend microservices using Python, FastAPI, and gRPC deployed on Google Kubernetes Engine (GKE), supporting multi-tenant hospitality operations across multiple production environments.",
          "Developed API Gateway service translating external REST requests to internal gRPC backend calls, providing a unified API surface for client applications via Protocol Buffers.",
          "Engineered a unified abstraction layer integrating 6+ third-party Property Management Systems using base class inheritance and polymorphic design, reducing code redundancy by 60% and enabling zero-downtime provider switching.",
          "Optimized API response latency by 96% (from 5s to 200ms) through Redis caching, connection pooling, query optimization, and efficient data serialization.",
        ],
      },
      {
        name: "AI & Machine Learning",
        points: [
          "Developed 5 iterations of an enterprise conversational AI agent using LangChain, LangGraph, and Agentic AI patterns, integrating 4 LLM providers (OpenAI, Gemini, Claude, Groq) with tool-calling via Model Context Protocol (MCP).",
          "Built a RAG pipeline using ChromaDB vector database and sentence-transformer embeddings, enabling AI-driven knowledge retrieval and context-aware guest interactions.",
        ],
      },
      {
        name: "DevOps & Infrastructure",
        points: [
          "Deployed self-hosted GitHub Actions runner infrastructure, automating CI/CD pipelines for Docker image builds, semantic versioning, and Kubernetes deployments to GCP.",
          "Engineered event-driven architecture using RabbitMQ and Google Cloud Pub/Sub for asynchronous inter-service communication and real-time notifications via Firebase Cloud Messaging.",
          "Managed infrastructure provisioning using Terraform and Helm/Helmfile across GKE clusters with Prometheus/Grafana monitoring.",
        ],
      },
      {
        name: "Leadership & Impact",
        points: [
          "Led a team of 2+ developers on integration workstreams, establishing reusable code architecture patterns and coordinating parallel development across multiple codebases.",
        ],
      },
    ],
  },
  {
    title: "IT Trainee Intern",
    company_name: "Tech Entrepreneurs",
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

const projects = [
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
    name: "RAG Knowledge Retrieval Pipeline",
    type: "professional",
    status: "completed",
    year: "2024",
    team: "Team of 2",
    description:
      "End-to-end Retrieval-Augmented Generation system using Playwright for web scraping, OpenAI for embeddings, and ChromaDB as the vector store.",
    features: [
      "Web scraping with Playwright & BeautifulSoup",
      "OpenAI embeddings & semantic search",
      "ChromaDB vector store with chunking & indexing",
      "Context-aware AI response generation",
    ],
    tags: [
      { name: "python" },
      { name: "chromadb" },
      { name: "openai" },
      { name: "rag" },
    ],
    stats: [
      { label: "Data Sources", value: "5+" },
      { label: "Accuracy", value: "High" },
    ],
    highlight: { value: "5+", label: "Sources" },
  },
  // --- Personal / Academic projects ---
  {
    name: "Blog Application",
    type: "personal",
    status: "completed",
    year: "2023",
    team: "Solo",
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

const personalInfo = {
  name: "Rugwed",
  fullName: "Rugwed Patharkar",
  email: "rugwedspatharkar@gmail.com",
  role: "Software Engineer",
  availability: "Software Engineer @ Upswing",
  github: "https://github.com/rugwedpatharkar",
  githubUsername: "rugwedpatharkar",
  linkedin: "https://www.linkedin.com/in/rugwed-patharkar/",
  location: "Pune, India",
  about:
    "Backend Software Engineer with 2+ years of experience building scalable microservices and AI-powered systems for the hospitality SaaS industry. Expert in Python, FastAPI, gRPC, and Google Cloud Platform. Architected enterprise-grade integrations with 6+ third-party systems, achieving 96% reduction in API response latency. Developed multi-agent conversational AI using LangChain, LangGraph, and Model Context Protocol (MCP). Passionate about building full stack applications with Java, Python, React, and modern web technologies. Awarded Star Performer of the Quarter for delivering across multiple concurrent production projects.",
};

const educations = [
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
    duration: "",
    highlights: ["Mathematics", "Science", "English"],
  },
];

const achievements = [
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

const testimonials = [
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
      period: "2023 – Present",
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

const funFacts = [
  { label: "Cups of Coffee", value: 1200, suffix: "+", icon: "☕", detail: "Fueled by filter coffee & chai — mostly during late-night debugging sessions." },
  { label: "Git Commits", value: 3000, suffix: "+", icon: "📝", detail: "Across 30+ repos spanning Django, FastAPI, React, and infrastructure projects." },
  { label: "APIs Deployed", value: 15, suffix: "+", icon: "🚀", detail: "REST & gRPC services running on GKE, serving millions of requests per day." },
  { label: "Bugs Squashed", value: 500, suffix: "+", icon: "🐛", detail: "From race conditions to timezone bugs — every squash is a war story." },
];

const blogPosts = [
  {
    title: "Building Scalable Microservices with FastAPI & gRPC",
    description:
      "A deep dive into architecting high-performance backend services using FastAPI for REST and gRPC for inter-service communication on GKE.",
    link: "#",
    date: "2024",
    tags: ["FastAPI", "gRPC", "GCP"],
  },
  {
    title: "Multi-Agent AI with LangChain & MCP",
    description:
      "How I built an enterprise conversational AI through 5 iterations using LangChain, LangGraph, and Model Context Protocol for tool calling.",
    link: "#",
    date: "2024",
    tags: ["LangChain", "AI", "MCP"],
  },
  {
    title: "RAG Pipeline: From Scraping to Semantic Search",
    description:
      "End-to-end guide on building a Retrieval-Augmented Generation system with ChromaDB, OpenAI embeddings, and context-aware responses.",
    link: "#",
    date: "2024",
    tags: ["RAG", "ChromaDB", "OpenAI"],
  },
];

export {
  services,
  skills,
  experiences,
  projects,
  personalInfo,
  educations,
  achievements,
  testimonials,
  funFacts,
  blogPosts,
};
