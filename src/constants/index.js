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
  eclipse,
  java,
  jquery,
  kubernetes,
  linux,
  mysql,
  netbeans,
  postman,
  pycharm,
  python,
  springboot,
  threejs,
  vscode,
  techentrepreneurs,
  gadgetgalaxy,
  blogbuddy,
  web,
  django,
  bootstrap,
  github,
  hsc,
  bachelor,
  ssc,
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
  { title: "Full Stack Developer", icon: fullstack },
  { title: "ReactJS Developer", icon: frontend },
  { title: "Backend Developer", icon: backend },
  { title: "Web Developer", icon: web },
];

const skills = {
  "Programming Languages": [
    { name: "Java", icon: java, level: 85 },
    { name: "JavaScript", icon: javascript, level: 80 },
    { name: "Python", icon: python, level: 75 },
  ],
  "Database Management": [
    { name: "MongoDB", icon: mongodb, level: 70 },
    { name: "MySQL", icon: mysql, level: 75 },
  ],
  "Web Development": [
    { name: "HTML", icon: html, level: 90 },
    { name: "CSS", icon: css, level: 85 },
    { name: "ReactJS", icon: reactjs, level: 80 },
    { name: "Redux", icon: redux, level: 70 },
    { name: "Tailwind CSS", icon: tailwind, level: 80 },
    { name: "Bootstrap CSS", icon: bootstrap, level: 80 },
  ],
  "Version Control": [
    { name: "Git", icon: git, level: 85 },
    { name: "GitHub", icon: github, level: 85 },
  ],
  "Web Frameworks": [
    { name: "Spring Boot", icon: springboot, level: 75 },
    { name: "Django", icon: django, level: 70 },
  ],
  Containerization: [
    { name: "Docker", icon: docker, level: 65 },
    { name: "Kubernetes", icon: kubernetes, level: 55 },
  ],
  "Development Tools": [
    { name: "Eclipse", icon: eclipse, level: 70 },
    { name: "NetBeans", icon: netbeans, level: 65 },
    { name: "Postman", icon: postman, level: 80 },
    { name: "PyCharm", icon: pycharm, level: 75 },
    { name: "VS Code", icon: vscode, level: 90 },
  ],
  "Other Technologies": [
    { name: "jQuery", icon: jquery, level: 65 },
    { name: "Linux", icon: linux, level: 70 },
    { name: "Three.js", icon: threejs, level: 55 },
  ],
};

const experiences = [
  {
    title: "IT Trainee Intern",
    company_name: "Tech Entrepreneurs",
    icon: techentrepreneurs,
    iconBg: "#383E56",
    date: "March 2023 - September 2023",
    points: [
      "Collaborated with a cross-functional team to develop the Placement Portal application, optimizing candidate and job matching processes and enhancing overall efficiency.",
      "Translated project requirements into actionable tasks, defining scope and milestones with a user-centric approach.",
      "Demonstrated exceptional multitasking skills, ensuring on-time project delivery and contributing positively to team goals.",
      "Designed and implemented an advanced sorting system for filtering candidates and job openings based on descriptions, showcasing expertise in software designing.",
      "Conducted regular code reviews, ensuring code quality and adherence to best practices, providing constructive feedback for continuous improvement.",
      "Effectively managed project timelines, coordinated team efforts, and ensured successful project completion.",
    ],
  },
];

const projects = [
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
      "The CareerforAll initiative aims to revolutionize the recruitment process by connecting startup companies, institutes, and job seekers on a comprehensive platform. By streamlining the matching process, it facilitates efficient job placements, addressing challenges faced by both companies and candidates in the current competitive job market. This user-friendly solution contributes to the growth of the startup ecosystem, fostering improved career opportunities and talent acquisition within the industry.",
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
  role: "Full Stack Developer",
  availability: "Open to Work",
  github: "https://github.com/rugwedpatharkar",
  githubUsername: "rugwedpatharkar",
  linkedin: "https://www.linkedin.com/in/rugwed-patharkar/",
  about: "Hello, I'm Rugwed Patharkar, a dedicated Full Stack Developer hailing from Pune, India. With a blend of creativity and technical prowess, I specialize in crafting seamless web solutions using a variety of technologies such as Java, Python, HTML, CSS, and JavaScript. My journey in software development began with a passion for problem solving and a commitment to delivering high quality, user centric applications. From backend database management to frontend design, I thrive in bringing ideas to life through code. With a keen eye for detail and a collaborative spirit, I am driven to create impactful digital experiences that drive innovation and exceed expectations.",
};

const educations = [
  {
    degree: "MSc Computer Application",
    marks: "Percentage : 81.95%",
    name: "PVG's College of Science, Pune",
    image: hsc,
  },
  {
    degree: "BSc Computer Science",
    marks: "Percentage : 72.57%",
    name: "Modern College of Arts, Science and Commerce, Pune",
    image: bachelor,
  },
  {
    degree: "12th Standard HSC Board",
    marks: "Percentage : 62.31 %",
    name: "PVG College, Pune",
    image: hsc,
  },
  {
    degree: "10th Standard SSC Board",
    marks: "Percentage : 79.40 %",
    name: "M.S.G.G.V., Pune",
    image: ssc,
  },
];

const achievements = [
  {
    title: "MSc Computer Application",
    description: "Completed MSc with 81.95% from PVG's College of Science, Pune",
    icon: "🎓",
    year: "2024",
  },
  {
    title: "Placement Portal Development",
    description: "Led the development of a full-featured Placement Portal during internship at Tech Entrepreneurs",
    icon: "💼",
    year: "2023",
  },
  {
    title: "3+ Full Stack Projects",
    description: "Built and deployed production-ready applications using Java, Python, and modern web technologies",
    icon: "🚀",
    year: "2023",
  },
  {
    title: "BSc Computer Science",
    description: "Graduated from Modern College of Arts, Science and Commerce, Pune",
    icon: "📚",
    year: "2022",
  },
];

const testimonials = [
  {
    name: "Tech Entrepreneurs Team",
    role: "Internship Supervisor",
    quote: "Rugwed demonstrated exceptional problem-solving skills and consistently delivered high-quality code. His ability to collaborate effectively and manage project timelines was truly outstanding.",
  },
  {
    name: "Academic Mentor",
    role: "PVG's College of Science",
    quote: "A dedicated student with a strong aptitude for software development. Rugwed's projects consistently demonstrated innovation and attention to detail.",
  },
];

const funFacts = [
  { label: "Projects Completed", value: 10, suffix: "+", icon: "🚀" },
  { label: "Technologies Learned", value: 25, suffix: "+", icon: "💻" },
  { label: "Lines of Code", value: 50000, suffix: "+", icon: "📝" },
  { label: "Cups of Coffee", value: 1000, suffix: "+", icon: "☕" },
];

const blogPosts = [
  {
    title: "Getting Started with Spring Boot",
    description: "A comprehensive guide to building RESTful APIs with Spring Boot and Java for modern web applications.",
    link: "#",
    date: "2024",
    tags: ["Java", "Spring Boot", "REST API"],
  },
  {
    title: "Docker for Beginners",
    description: "Learn how to containerize your applications with Docker for consistent and reliable deployments.",
    link: "#",
    date: "2024",
    tags: ["Docker", "DevOps", "Deployment"],
  },
  {
    title: "Building Responsive UIs with React",
    description: "Master modern React patterns and create stunning responsive interfaces with Tailwind CSS.",
    link: "#",
    date: "2024",
    tags: ["React", "JavaScript", "Tailwind"],
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
