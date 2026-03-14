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
  jquery,
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
    points: [
      "Architected and developed scalable backend microservices using Python, FastAPI, and gRPC deployed on Google Kubernetes Engine (GKE), supporting multi-tenant hospitality operations across multiple production environments.",
      "Developed API Gateway service translating external REST requests to internal gRPC backend calls, providing a unified API surface for client applications via Protocol Buffers.",
      "Engineered a unified abstraction layer integrating 6+ third-party Property Management Systems using base class inheritance and polymorphic design, reducing code redundancy by 60% and enabling zero-downtime provider switching.",
      "Optimized API response latency by 96% (from 5s to 200ms) through Redis caching, connection pooling, query optimization, and efficient data serialization.",
      "Developed 5 iterations of an enterprise conversational AI agent using LangChain, LangGraph, and Agentic AI patterns, integrating 4 LLM providers (OpenAI, Gemini, Claude, Groq) with tool-calling via Model Context Protocol (MCP).",
      "Built a RAG pipeline using ChromaDB vector database and sentence-transformer embeddings, enabling AI-driven knowledge retrieval and context-aware guest interactions.",
      "Led a team of 2+ developers on integration workstreams, establishing reusable code architecture patterns and coordinating parallel development across multiple codebases.",
      "Deployed self-hosted GitHub Actions runner infrastructure, automating CI/CD pipelines for Docker image builds, semantic versioning, and Kubernetes deployments to GCP.",
      "Engineered event-driven architecture using RabbitMQ and Google Cloud Pub/Sub for asynchronous inter-service communication and real-time notifications via Firebase Cloud Messaging.",
      "Managed infrastructure provisioning using Terraform and Helm/Helmfile across GKE clusters with Prometheus/Grafana monitoring.",
      "Awarded Star Performer of the Quarter for delivering across multiple concurrent production projects.",
    ],
  },
  {
    title: "IT Trainee Intern",
    company_name: "Tech Entrepreneurs",
    icon: techentrepreneurs,
    iconBg: "#383E56",
    date: "March 2023 – September 2023",
    points: [
      "Engineered 10+ filtering categories for a job matching portal, achieving 95% filter accuracy and optimizing candidate-to-job matching workflows.",
      "Designed an advanced sorting system resulting in 30% reduction in processing time for filtering candidates and job openings.",
      "Conducted regular code reviews across the team, enforcing best practices and contributing to 20% improvement in overall code quality.",
      "Translated business requirements into actionable development tasks, ensuring alignment with project timelines and stakeholder objectives.",
    ],
  },
];

const projects = [
  // --- Professional projects ---
  {
    name: "Multi-Agent Conversational AI",
    description:
      "Enterprise AI assistant built through 5 iterative versions using LangChain, LangGraph, and Google ADK. Implemented Agentic AI patterns with MCP-based tool calling for autonomous task execution. Features versioned prompt engineering, context-aware prompt chaining, RAG pipeline with ChromaDB, and dynamic routing across 4 LLM providers.",
    tags: [
      { name: "langchain", color: "green-text-gradient" },
      { name: "python", color: "blue-text-gradient" },
      { name: "openai", color: "pink-text-gradient" },
      { name: "rag", color: "orange-text-gradient" },
      { name: "mcp", color: "purple-text-gradient" },
    ],
    image: blogbuddy,
    stats: [
      { label: "LLM Providers", value: "4" },
      { label: "Iterations", value: "5" },
    ],
    source_code_link: "https://github.com/rugwedpatharkar",
  },
  {
    name: "Enterprise Integration Platform",
    description:
      "Unified backend integration layer connecting 6+ Property Management Systems, door lock platforms, and room management systems. Designed abstraction interfaces enabling provider-agnostic operations with Redis caching. Reduced code redundancy by 60%, cut new vendor integration time by 50%, and optimized API latency by 96%.",
    tags: [
      { name: "fastapi", color: "green-text-gradient" },
      { name: "grpc", color: "blue-text-gradient" },
      { name: "redis", color: "red-text-gradient" },
      { name: "gcp", color: "yellow-text-gradient" },
      { name: "python", color: "purple-text-gradient" },
    ],
    image: gadgetgalaxy,
    stats: [
      { label: "Integrations", value: "6+" },
      { label: "Latency Reduction", value: "96%" },
    ],
    source_code_link: "https://github.com/rugwedpatharkar",
  },
  {
    name: "Self-Hosted CI/CD Infrastructure",
    description:
      "Deployed and configured local GitHub Actions runner servers to execute CI/CD pipelines internally. Automated Docker image builds, semantic versioning, container registry pushes, and Kubernetes rollout deployments to GCP. Integrated Trivy vulnerability scanning for container security.",
    tags: [
      { name: "github-actions", color: "blue-text-gradient" },
      { name: "docker", color: "green-text-gradient" },
      { name: "kubernetes", color: "pink-text-gradient" },
      { name: "terraform", color: "purple-text-gradient" },
    ],
    image: careerforall,
    stats: [
      { label: "Pipelines", value: "10+" },
      { label: "Environments", value: "3" },
    ],
    source_code_link: "https://github.com/rugwedpatharkar",
  },
  {
    name: "RAG Knowledge Retrieval Pipeline",
    description:
      "End-to-end Retrieval-Augmented Generation system using Playwright for web scraping, BeautifulSoup for parsing, OpenAI for embeddings, and ChromaDB as the vector store. Implemented chunking, indexing, and semantic search for context-aware AI responses.",
    tags: [
      { name: "python", color: "blue-text-gradient" },
      { name: "chromadb", color: "green-text-gradient" },
      { name: "openai", color: "pink-text-gradient" },
      { name: "rag", color: "orange-text-gradient" },
    ],
    image: blogbuddy,
    stats: [
      { label: "Data Sources", value: "5+" },
      { label: "Accuracy", value: "High" },
    ],
    source_code_link: "https://github.com/rugwedpatharkar",
  },
  // --- Personal / Academic projects ---
  {
    name: "Blog Application",
    description:
      "BlogBuddy is a robust blogging platform developed with Java and Spring Boot, featuring secure user registration, login/logout, and password recovery with email OTP verification. Its visually appealing frontend, crafted with HTML, CSS, and Bootstrap, offers a responsive user experience. Leveraging MongoDB Atlas for data storage and Docker containers for deployment on Render, it ensures scalability and efficient management.",
    tags: [
      { name: "java", color: "blue-text-gradient" },
      { name: "spring-boot", color: "green-text-gradient" },
      { name: "mongodb", color: "pink-text-gradient" },
      { name: "html5", color: "yellow-text-gradient" },
      { name: "css3", color: "red-text-gradient" },
      { name: "bootstrap", color: "purple-text-gradient" },
      { name: "docker", color: "orange-text-gradient" },
      { name: "render", color: "yellow-text-gradient" },
    ],
    image: blogbuddy,
    stats: [
      { label: "Features", value: "10+" },
      { label: "API Endpoints", value: "15+" },
    ],
    live_demo_link: "https://blog-application-01rp.onrender.com/",
    source_code_link: "https://github.com/rugwedpatharkar/blog_application.git",
  },
  {
    name: "E-commerce Project",
    description:
      "GadgetGalaxy, an e-commerce platform built with Python and Django, offers secure user authentication, registration, and password reset with OTP. Its intuitive design facilitates seamless shopping experiences, while email notifications enhance user communication. Deployed on PythonAnywhere, it ensures continuous availability and scalability for uninterrupted service.",
    tags: [
      { name: "python", color: "blue-text-gradient" },
      { name: "django", color: "green-text-gradient" },
      { name: "html5", color: "pink-text-gradient" },
      { name: "css3", color: "yellow-text-gradient" },
      { name: "bootstrap", color: "red-text-gradient" },
    ],
    image: gadgetgalaxy,
    stats: [
      { label: "Products", value: "50+" },
      { label: "Pages", value: "8" },
    ],
    live_demo_link: "https://rugwedpatharkar.pythonanywhere.com/",
    source_code_link:
      "https://github.com/rugwedpatharkar/ecommerce_project.git",
  },
  {
    name: "CareerForAll Application",
    description:
      "The CareerforAll initiative aims to revolutionize the recruitment process by connecting startup companies, institutes, and job seekers on a comprehensive platform. By streamlining the matching process, it facilitates efficient job placements, addressing challenges faced by both companies and candidates in the current competitive job market.",
    tags: [
      { name: "java", color: "blue-text-gradient" },
      { name: "spring-boot", color: "green-text-gradient" },
      { name: "mysql", color: "pink-text-gradient" },
      { name: "html5", color: "yellow-text-gradient" },
      { name: "css3", color: "red-text-gradient" },
      { name: "bootstrap", color: "purple-text-gradient" },
      { name: "javascript", color: "orange-text-gradient" },
      { name: "api", color: "yellow-text-gradient" },
    ],
    image: careerforall,
    stats: [
      { label: "Modules", value: "12+" },
      { label: "User Roles", value: "3" },
    ],
    source_code_link: "https://github.com/rugwedpatharkar/CareerForAll2.git",
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
    marks: "Percentage: 81.95%",
    name: "Savitribai Phule Pune University",
    image: bachelor,
    year: "2021 – 2023",
  },
  {
    degree: "BSc (Computer Science)",
    marks: "Percentage: 72.57%",
    name: "Savitribai Phule Pune University",
    image: bachelor,
    year: "2017 – 2021",
  },
  {
    degree: "12th Standard HSC Board",
    marks: "Percentage: 62.31%",
    name: "PVG College, Pune",
    image: hsc,
  },
  {
    degree: "10th Standard SSC Board",
    marks: "Percentage: 79.40%",
    name: "M.S.G.G.V., Pune",
    image: ssc,
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
    quote:
      "Rugwed consistently delivers high-impact work across backend microservices, AI systems, and infrastructure. His ability to architect scalable integrations and lead workstreams has been instrumental to our platform's growth.",
  },
  {
    name: "Tech Entrepreneurs Team",
    role: "Internship Supervisor",
    quote:
      "Rugwed demonstrated exceptional problem-solving skills and consistently delivered high-quality code. His ability to collaborate effectively and manage project timelines was truly outstanding.",
  },
  {
    name: "Academic Mentor",
    role: "Savitribai Phule Pune University",
    quote:
      "A dedicated student with a strong aptitude for software development. Rugwed's projects consistently demonstrated innovation and attention to detail.",
  },
];

const funFacts = [
  { label: "Years Experience", value: 2, suffix: "+", icon: "💼" },
  { label: "Enterprise Integrations", value: 6, suffix: "+", icon: "🔗" },
  { label: "API Latency Reduced", value: 96, suffix: "%", icon: "⚡" },
  { label: "LLM Providers Integrated", value: 4, suffix: "", icon: "🤖" },
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
