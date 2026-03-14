import { AiOutlineGithub } from "react-icons/ai";
import { ImLinkedin } from "react-icons/im";
import { navLinks, personalInfo } from "../constants";
import VisitorCounter from "./VisitorCounter";

const BUILT_WITH = [
  { name: "React", color: "#61dafb" },
  { name: "Tailwind CSS", color: "#38bdf8" },
  { name: "Framer Motion", color: "#bf61ff" },
  { name: "Three.js", color: "#00cea8" },
  { name: "Vite", color: "#f8c555" },
];

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-white/[0.06] pb-20 sm:pb-24">
      {/* Subtle gradient glow at top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-px bg-gradient-to-r from-transparent via-[#915eff]/40 to-transparent" />

      <div className="max-w-7xl 3xl:max-w-[2000px] mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-6 sm:pb-8">
        {/* Top section: 3 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
          {/* Column 1: Brand */}
          <div>
            <p className="text-white font-heading font-bold text-body-lg sm:text-subheading">
              {personalInfo.fullName}
            </p>
            <p className="text-secondary text-body-sm mt-1.5 max-w-xs leading-relaxed">
              {personalInfo.role}. Building scalable microservices & AI-powered systems.
            </p>
            {/* Social icons */}
            <div className="flex gap-3 mt-4">
              <a
                href={personalInfo.github}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg glass-card border border-white/[0.08] hover:border-[#915eff]/40 flex items-center justify-center text-white/50 hover:text-white transition-all duration-300 group"
                aria-label="GitHub"
              >
                <AiOutlineGithub className="text-lg group-hover:scale-110 transition-transform" />
              </a>
              <a
                href={personalInfo.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg glass-card border border-white/[0.08] hover:border-[#0077b5]/40 flex items-center justify-center text-white/50 hover:text-[#0077b5] transition-all duration-300 group"
                aria-label="LinkedIn"
              >
                <ImLinkedin className="text-sm group-hover:scale-110 transition-transform" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-white/30 text-caption font-mono uppercase tracking-wider mb-3">
              Navigate
            </h4>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5">
              {navLinks.map((link) => (
                <li key={link.id}>
                  <a
                    href={`#${link.id}`}
                    className="text-secondary hover:text-white text-body-sm transition-colors duration-200 inline-flex items-center gap-1.5 group"
                  >
                    <span
                      className="w-1 h-1 rounded-full bg-[#915eff]/40 group-hover:bg-[#915eff] transition-colors"
                    />
                    {link.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Built With */}
          <div>
            <h4 className="text-white/30 text-caption font-mono uppercase tracking-wider mb-3">
              Built With
            </h4>
            <div className="flex flex-wrap gap-2">
              {BUILT_WITH.map((tech) => (
                <span
                  key={tech.name}
                  className="font-mono text-micro sm:text-caption px-2.5 py-1 rounded-full border transition-colors duration-300"
                  style={{
                    color: `${tech.color}cc`,
                    borderColor: `${tech.color}20`,
                    background: `${tech.color}08`,
                  }}
                >
                  {tech.name}
                </span>
              ))}
            </div>
            <div className="mt-4">
              <VisitorCounter />
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/[0.06] mt-8 sm:mt-10 pt-4 sm:pt-5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-white/25 text-caption sm:text-body-sm font-mono">
            &copy; {currentYear} {personalInfo.fullName}
          </p>
          <p className="text-white/15 text-micro sm:text-caption font-mono">
            Designed & Developed with{" "}
            <span className="text-[#915eff]">&lt;/&gt;</span> &amp;{" "}
            <span className="text-red-400">&#9829;</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
