import { useEffect, useRef, useState } from "react";
import { AiOutlineGithub } from "react-icons/ai";
import { ImLinkedin } from "react-icons/im";
import { navLinks, personalInfo, builtWith, footerContent } from "../content";
import VisitorCounter from "./VisitorCounter";
import LastCommit from "./LastCommit";


const Footer = () => {
  const currentYear = new Date().getFullYear();
  const pillsRef = useRef(null);
  const [pillsVisible, setPillsVisible] = useState(false);

  useEffect(() => {
    const el = pillsRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPillsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <footer className="footer-glow-border relative overflow-hidden border-t border-white/[0.06] pb-20 sm:pb-24">
      {/* Ambient glow blobs */}
      <div className="absolute -top-20 -left-20 w-60 h-60 bg-[#915eff]/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-[#00cea8]/5 rounded-full blur-[80px] pointer-events-none" />
      {/* Subtle gradient glow at top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-px bg-gradient-to-r from-transparent via-[#915eff]/40 to-transparent" />
      {/* Scroll-to-top glowing line animation */}
      <div className="footer-glow-line absolute top-0 left-0 w-full h-px pointer-events-none" />

      <div className="max-w-7xl 3xl:max-w-[2000px] mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-6 sm:pb-8">
        {/* Top section: 3 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
          {/* Column 1: Brand */}
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
            <p className="text-white font-heading font-bold text-body-lg sm:text-subheading">
              {personalInfo.fullName}
            </p>
            <p className="text-secondary text-body-sm mt-1.5 max-w-xs leading-relaxed">
              {footerContent.tagline}
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
                <AiOutlineGithub className="text-body-lg group-hover:scale-110 transition-transform" />
              </a>
              <a
                href={personalInfo.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg glass-card border border-white/[0.08] hover:border-[#0077b5]/40 flex items-center justify-center text-white/50 hover:text-[#0077b5] transition-all duration-300 group"
                aria-label="LinkedIn"
              >
                <ImLinkedin className="text-body-sm group-hover:scale-110 transition-transform" />
              </a>
            </div>
            {/* Last commit */}
            <LastCommit />
          </div>

          {/* Column 2: Quick Links */}
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
            <h4 className="text-white/45 text-caption font-mono uppercase tracking-wider mb-3">
              {footerContent.navigateHeader}
            </h4>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5 w-full">
              {navLinks.map((link) => (
                <li key={link.id} className="flex justify-center sm:justify-start">
                  <a
                    href={`#${link.id}`}
                    className="text-secondary hover:text-[#915eff] text-body-sm transition-colors duration-200 inline-flex items-center gap-1.5 group"
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
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
            <h4 className="text-white/45 text-caption font-mono uppercase tracking-wider mb-3">
              {footerContent.builtWithHeader}
            </h4>
            <div className="flex flex-wrap gap-2 justify-center sm:justify-start" ref={pillsRef}>
              {builtWith.map((tech, index) => (
                <span
                  key={tech.name}
                  className="font-mono text-micro sm:text-caption px-2.5 py-1 rounded-full border transition-all duration-300 cursor-default"
                  style={{
                    color: `${tech.color}cc`,
                    borderColor: `${tech.color}20`,
                    background: `${tech.color}08`,
                    opacity: pillsVisible ? 1 : 0,
                    transform: pillsVisible ? "translateY(0)" : "translateY(12px)",
                    transitionDelay: `${index * 100}ms`,
                    transitionProperty: "opacity, transform, box-shadow, border-color",
                    "--pill-color": tech.color,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = `0 0 12px ${tech.color}40`;
                    e.currentTarget.style.borderColor = `${tech.color}60`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.borderColor = `${tech.color}20`;
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
          <div className="flex items-center gap-3">
            <p className="text-white/55 text-caption sm:text-body-sm font-mono">
              &copy; {currentYear} {personalInfo.fullName}
            </p>
            <span className="inline-flex items-center gap-1.5 font-mono text-micro px-2 py-0.5 rounded-full border border-[#915eff]/20 bg-[#915eff]/5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#915eff] animate-pulse" />
              <span className="text-[#915eff]">{footerContent.version}</span>
            </span>
          </div>
          <p className="text-white/55 text-micro sm:text-caption font-mono">
            {footerContent.madeWith}{" "}
            <span className="text-[#915eff]">&lt;/&gt;</span> &amp;{" "}
            <span className="footer-heart text-red-400 inline-block align-middle">&#9829;</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
