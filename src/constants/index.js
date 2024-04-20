import {
  backend,
  frontend,
  fullstack,
  bootstrap,
  css,
  django,
  docker,
  git,
  html,
  java,
  javascript,
  kubernetes,
  mongodb,
  mysql,
  python,
  reactjs,
  springboot,
  tailwind,
  techentrepreneurs,
  gadgetgalaxy,
  blogbuddy,
  web,
} from "../assets";

export const navLinks = [
  {
    id: "about",
    title: "About",
  },
  {
    id: "experience",
    title: "Experience",
  },
  {
    id: "skills",
    title: "Skills",
  },
  {
    id: "projects",
    title: "Projects",
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
    title: "ReactJS Developer",
    icon: frontend,
  },
  {
    title: "Backend Developer",
    icon: backend,
  },
  {
    title: "Web Developer",
    icon: web,
  },
];

const skills = [
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
    name: "Tailwind CSS",
    icon: tailwind,
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
    name: "Kubernetes",
    icon: kubernetes,
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
      "BlogBuddy is a robust blogging platform developed with Java and Spring Boot, featuring secure user registration, login/logout, and password recovery with email OTP verification. Its visually appealing frontend, crafted with HTML, CSS, and Bootstrap, offers a responsive user experience. Leveraging MongoDB Atlas for data storage and Docker containers for deployment on Render, it ensures scalability and efficient management.",
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
      "GadgetGalaxy, an e-commerce platform built with Python and Django, offers secure user authentication, registration, and password reset with OTP. Its intuitive design facilitates seamless shopping experiences, while email notifications enhance user communication. Deployed on PythonAnywhere, it ensures continuous availability and scalability for uninterrupted service.",
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

export { services, skills, experiences, projects };
