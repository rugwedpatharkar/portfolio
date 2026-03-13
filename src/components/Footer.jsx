import { AiOutlineGithub } from "react-icons/ai";
import { ImLinkedin } from "react-icons/im";
import { navLinks, personalInfo } from "../constants";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-tertiary py-6 sm:py-8 px-4 sm:px-6">
      <div className="max-w-7xl 3xl:max-w-[2000px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6">
        <div className="text-center md:text-left">
          <p className="text-white font-bold text-base sm:text-lg">{personalInfo.fullName}</p>
          <p className="text-secondary text-xs sm:text-sm mt-1">{personalInfo.role}</p>
        </div>

        <ul className="flex flex-wrap justify-center gap-3 sm:gap-6">
          {navLinks.map((link) => (
            <li key={link.id}>
              <a
                href={`#${link.id}`}
                className="text-secondary hover:text-white text-xs sm:text-sm transition-colors link-hover-underline"
              >
                {link.title}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex gap-4">
          <a
            href={personalInfo.github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-secondary hover:text-white text-lg sm:text-xl transition-colors icon-bounce"
            aria-label="GitHub"
          >
            <AiOutlineGithub />
          </a>
          <a
            href={personalInfo.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="text-secondary hover:text-white text-lg sm:text-xl transition-colors icon-bounce"
            aria-label="LinkedIn"
          >
            <ImLinkedin />
          </a>
        </div>
      </div>

      <div className="border-t border-gray-700 mt-4 sm:mt-6 pt-3 sm:pt-4 text-center">
        <p className="text-secondary text-xs sm:text-sm">
          &copy; {currentYear} {personalInfo.fullName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
