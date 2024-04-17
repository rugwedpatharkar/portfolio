import {
  backend,
  frontend,
  fullstack,
  bootstrap,
  css,
  django,
  docker,
  eclipse,
  git,
  html,
  java,
  javascript,
  jquery,
  kubernetes,
  linux,
  mongodb,
  mysql,
  netbeans,
  nodejs,
  postman,
  pycharm,
  python,
  reactjs,
  redux,
  replit,
  springboot,
  sublimetext,
  tailwind,
  typescript,
  threejs,
  ubuntu,
  vim,
  vscode,
  techentrepreneurs,
  gadgetgalaxy,
  blogbuddy,
} from "../assets";

export const navLinks = [
  {
    id: "about",
    title: "About",
  },
  {
    id: "projects",
    title: "projects",
  },
  {
    id: "skills",
    title: "skills",
  },
  {
    id: "experience",
    title: "experience",
  },
  {
    id: "education",
    title: "education",
  },
  {
    id: "contact",
    title: "Contact",
  },
];

const services = [
  {
    title: "Full Stack Developer",
    icon: fullstack,
  },
  {
    title: "Frontend Developer",
    icon: frontend,
  },
  {
    title: "Backend Developer",
    icon: backend,
  },
];

const technologies = [
  {
    name: "Java",
    icon: java,
  },
  {
    name: "JavaScript",
    icon: javascript,
  },
  {
    name: "Python",
    icon: python,
  },
  {
    name: "MongoDB",
    icon: mongodb,
  },
  {
    name: "MySQL",
    icon: mysql,
  },
  {
    name: "HTML",
    icon: html,
  },
  {
    name: "CSS",
    icon: css,
  },
  {
    name: "ReactJS",
    icon: reactjs,
  },
  {
    name: "Redux",
    icon: redux,
  },
  {
    name: "Tailwind CSS",
    icon: tailwind,
  },
  {
    name: "Node.js",
    icon: nodejs,
  },
  {
    name: "Django",
    icon: django,
  },
  {
    name: "Bootstrap",
    icon: bootstrap,
  },
  {
    name: "Git",
    icon: git,
  },
  {
    name: "Spring Boot",
    icon: springboot,
  },
  {
    name: "Docker",
    icon: docker,
  },
  {
    name: "Eclipse",
    icon: eclipse,
  },
  {
    name: "NetBeans",
    icon: netbeans,
  },
  {
    name: "Postman",
    icon: postman,
  },
  {
    name: "PyCharm",
    icon: pycharm,
  },
  {
    name: "Replit",
    icon: replit,
  },
  {
    name: "Sublime Text",
    icon: sublimetext,
  },
  {
    name: "VS Code",
    icon: vscode,
  },
  {
    name: "Vim",
    icon: vim,
  },
  {
    name: "jQuery",
    icon: jquery,
  },
  {
    name: "Kubernetes",
    icon: kubernetes,
  },
  {
    name: "Linux",
    icon: linux,
  },
  {
    name: "TypeScript",
    icon: typescript,
  },
  {
    name: "Three.js",
    icon: threejs,
  },
  {
    name: "Ubuntu",
    icon: ubuntu,
  },
];

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
      "Developed BlogBuddy, a blogging platform showcasing proficiency in backend technologies and efficient database management.",
    tags: [
      {
        name: "java",
        color: "blue-text-gradient",
      },
      {
        name: "spring-boot",
        color: "green-text-gradient",
      },
      {
        name: "mongodb",
        color: "pink-text-gradient",
      },
      {
        name: "html5",
        color: "yellow-text-gradient",
      },
      {
        name: "css3",
        color: "red-text-gradient",
      },
      {
        name: "bootstrap",
        color: "white-text-gradient",
      },
      {
        name: "docker",
        color: "orange-text-gradient",
      },
      {
        name: "render",
        color: "violet-text-gradient",
      },
    ],
    image: blogbuddy,
    live_demo_link: "https://blog-application-01rp.onrender.com/",
    source_code_link: "https://github.com/rugwedpatharkar/blog_application.git",
  },
  {
    name: "E-commerce Project",
    description:
      "Developed GadgetGalaxy, an e-commerce platform showcasing expertise in project setup, database management, and secure user authentication.",
    tags: [
      {
        name: "python",
        color: "blue-text-gradient",
      },
      {
        name: "django",
        color: "green-text-gradient",
      },
      {
        name: "html5",
        color: "pink-text-gradient",
      },
      {
        name: "css3",
        color: "yellow-text-gradient",
      },
      {
        name: "bootstrap",
        color: "red-text-gradient",
      },
    ],
    image: gadgetgalaxy,
    live_demo_link: "https://rugwedpatharkar.pythonanywhere.com/",
    source_code_link:
      "https://github.com/rugwedpatharkar/ecommerce_project.git",
  },
];

export { services, technologies, experiences, projects };
