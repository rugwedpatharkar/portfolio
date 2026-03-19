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
  web,
  django,
  bootstrap,
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
  eclipse,
  pycharm,
  gadgetgalaxy,
  blogbuddy,
  careerforall,
} from "../assets";

export const navLinks = [
  { id: "about", title: "About" },
  { id: "experience", title: "Experience" },
  { id: "skills", title: "Skills" },
  { id: "projects", title: "Projects" },
  { id: "education", title: "Education" },
  { id: "hobbies", title: "Hobbies" },
  { id: "contact", title: "Contact" },
];

export const services = [
  { title: "Software Engineer", icon: backend },
  { title: "AI / ML Engineer", icon: fullstack },
  { title: "Cloud & DevOps", icon: web },
  { title: "Full Stack Developer", icon: frontend },
];

export const skills = {
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
    { name: "REST API", icon: restapi, level: 92 },
    { name: "SOAP API", icon: soapapi, level: 75 },
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
    { name: "BigQuery", icon: bigquery, level: 78 },
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

export const experiences = [
  {
    title: "Software Engineer",
    companyName: "Upswing Cognitive Hospitality Solutions",
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
  availability: "Software Engineer @ Upswing",
  github: "https://github.com/rugwedpatharkar",
  githubUsername: "rugwedpatharkar",
  linkedin: "https://www.linkedin.com/in/rugwed-patharkar/",
  location: "Pune, India",
  about:
    "Backend Software Engineer with 2+ years of experience building scalable microservices and AI-powered systems for the hospitality SaaS industry. Expert in Python, FastAPI, gRPC, and Google Cloud Platform. Architected enterprise-grade integrations with 6+ third-party systems, achieving 96% reduction in API response latency. Developed multi-agent conversational AI using LangChain, LangGraph, and Model Context Protocol (MCP). Passionate about building full stack applications with Java, Python, React, and modern web technologies. Awarded Star Performer of the Quarter for delivering across multiple concurrent production projects.",
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

export const funFacts = [
  { label: "Cups of Coffee", value: 1200, suffix: "+", icon: "☕", detail: "Fueled by filter coffee & chai — mostly during late-night debugging sessions." },
  { label: "Git Commits", value: 3000, suffix: "+", icon: "📝", detail: "Across 30+ repos spanning Django, FastAPI, React, and infrastructure projects." },
  { label: "APIs Deployed", value: 15, suffix: "+", icon: "🚀", detail: "REST & gRPC services running on GKE, serving millions of requests per day." },
  { label: "Bugs Squashed", value: 500, suffix: "+", icon: "🐛", detail: "From race conditions to timezone bugs — every squash is a war story." },
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
export const blogPosts = [
  {
    title: "Building Scalable Microservices with FastAPI & gRPC",
    description:
      "A deep dive into architecting high-performance backend services using FastAPI for REST and gRPC for inter-service communication on GKE.",
    link: "#", // placeholder — Blog component renders "Coming soon" for "#" links
    date: "2024",
    tags: ["FastAPI", "gRPC", "GCP"],
  },
  {
    title: "Multi-Agent AI with LangChain & MCP",
    description:
      "How I built an enterprise conversational AI through 5 iterations using LangChain, LangGraph, and Model Context Protocol for tool calling.",
    link: "#", // placeholder — Blog component renders "Coming soon" for "#" links
    date: "2024",
    tags: ["LangChain", "AI", "MCP"],
  },
  {
    title: "RAG Pipeline: From Scraping to Semantic Search",
    description:
      "End-to-end guide on building a Retrieval-Augmented Generation system with ChromaDB, OpenAI embeddings, and context-aware responses.",
    link: "#", // placeholder — Blog component renders "Coming soon" for "#" links
    date: "2024",
    tags: ["RAG", "ChromaDB", "OpenAI"],
  },
];

export const sectionMeta = {
  about: { sub: "Introduction", heading: "Overview", description: "A snapshot of who I am, what drives me, and the disciplines I bring to every project." },
  funFacts: { sub: "Numbers That Define Me", heading: "Fun Facts", description: "A few numbers and fun stats from my journey so far — because every line of code tells a story." },
  experience: { sub: "Where I've worked", heading: "Work Experience", description: "Building scalable microservices, AI-powered systems, and cloud-native solutions — here's where I've put my engineering skills to work." },
  skills: { sub: "What I Bring to the Table", heading: "Technical Skills", description: "From Python and FastAPI to cloud infrastructure and AI — the tools and technologies I use to build production-grade software." },
  projects: { sub: "Explore My Work", heading: "Projects", description: "Each project represents a distinct challenge — from building AI-powered systems to deploying cloud infrastructure. Tap any card to explore." },
  education: { sub: "Academic Journey", heading: "Education", description: "From foundational studies to advanced computer science — each milestone shaped my engineering journey." },
  achievements: { sub: "Milestones", heading: "Achievements", description: "Key milestones and recognitions from my academic and professional journey that keep me motivated to push further." },
  hobbies: { sub: "Beyond the Code", heading: "Hobbies & Interests", description: "When I'm not building systems or pushing code, here's what keeps me curious, creative, and energized." },
  testimonials: { sub: "What Others Say", heading: "Testimonials", description: "Feedback from colleagues, mentors, and collaborators I've had the privilege of working with." },
  contact: { sub: "Get in Touch", heading: "Contact", description: "Have a project idea, collaboration opportunity, or just want to say hi? I'd love to hear from you." },
};

export const heroContent = {
  stats: [
    { value: 3, suffix: "+", label: "Years Exp." },
    { value: 10, suffix: "+", label: "Projects" },
    { value: 6, suffix: "+", label: "Integrations" },
  ],
  typewriterRoles: [
    "Software Engineer",
    "Backend \u0026 AI Engineer",
    "Cloud \u0026 DevOps",
  ],
  tagline: "Building scalable microservices & AI-powered systems on the cloud.",
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
  { value: 3, suffix: "+", label: "Years Experience" },
  { value: 10, suffix: "+", label: "Projects Built" },
  { value: 50, suffix: "+", label: "Technologies" },
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
  hint: "Hint: Try pressing Ctrl+` for a surprise 🎮",
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

export const sectionOrder = [
  "about",
  "funFacts",
  "experience",
  "skills",
  "projects",
  "education",
  "achievements",
  "hobbies",
  "testimonials",
  "contact",
];
