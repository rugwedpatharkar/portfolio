import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { styles } from "../styles";
import { navLinks } from "../constants";
import { logo } from "../assets";

const Navbar = () => {
  const [active, setActive] = useState("");
  const [toggle, setToggle] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const tickingRef = useRef(false);
  const indicatorRef = useRef(null);

  /* Scroll detection + active section tracking */
  useEffect(() => {
    const handleScroll = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 50);

        const visibleSection = navLinks.find((link) => {
          const section = document.getElementById(link.id);
          if (section) {
            const rect = section.getBoundingClientRect();
            return (
              rect.top <= window.innerHeight / 2 &&
              rect.bottom >= window.innerHeight / 2
            );
          }
          return false;
        });

        if (visibleSection) {
          setActive(visibleSection.title);
        }
        tickingRef.current = false;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* Mobile menu: body lock + outside click + escape */
  useEffect(() => {
    if (!toggle) return;
    document.body.style.overflow = "hidden";

    const handleClickOutside = (e) => {
      if (!e.target.closest(".mobile-menu") && !e.target.closest(".menu-toggle")) {
        setToggle(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setToggle(false);
    };

    document.addEventListener("click", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [toggle]);

  const handleItemClick = (link) => {
    setActive(link.title);
    setToggle(false);
  };

  return (
    <nav
      className={`${styles.paddingX} w-full flex items-center fixed top-0 z-40 transition-all duration-500 ${
        scrolled
          ? "py-2 sm:py-3 navbar-scrolled"
          : "py-3 sm:py-5 bg-transparent"
      }`}
    >
      <div className="flex items-center justify-between w-full mx-auto max-w-7xl 3xl:max-w-[2000px]">
        {/* Logo */}
        <a
          href="#"
          className="flex items-center gap-2 group"
          onClick={() => {
            setActive("");
            window.scrollTo(0, 0);
          }}
        >
          <div className="relative">
            <img src={logo} alt="logo" className="object-contain w-8 h-8 sm:w-9 sm:h-9 relative z-[1]" />
            <div className="absolute inset-0 rounded-full bg-[#915eff]/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <p className="text-white text-body-sm sm:text-body font-heading font-bold cursor-pointer flex">
            Rugwed Patharkar&nbsp;
            <span className="md:block hidden text-white/50 font-normal">| Portfolio</span>
          </p>
        </a>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center">
          <ul ref={indicatorRef} className="list-none flex flex-row gap-1 p-1 rounded-full bg-white/[0.03] border border-white/[0.06]">
            {navLinks.map((link) => (
              <li key={link.id}>
                <a
                  href={`#${link.id}`}
                  onClick={() => handleItemClick(link)}
                  className={`relative px-3 lg:px-4 py-1.5 rounded-full text-body-sm lg:text-body font-medium cursor-pointer transition-all duration-300 block ${
                    active === link.title
                      ? "text-white"
                      : "text-secondary hover:text-white/80"
                  }`}
                >
                  {active === link.title && (
                    <motion.span
                      layoutId="navIndicator"
                      className="absolute inset-0 rounded-full bg-[#915eff]/15 border border-[#915eff]/25"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                    />
                  )}
                  <span className="relative z-[1]">{link.title}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Mobile menu toggle */}
        <div className="md:hidden flex flex-1 justify-end items-center">
          <button
            className="menu-toggle w-11 h-11 cursor-pointer rounded-xl border border-white/10 hover:border-[#915eff]/30 bg-white/5 flex items-center justify-center transition-colors duration-300"
            onClick={() => setToggle(!toggle)}
            aria-label="Toggle menu"
            aria-expanded={toggle}
          >
            <div className="flex flex-col gap-1.5 w-5">
              <span className={`h-[2px] bg-white rounded-full transition-all duration-300 ${toggle ? "rotate-45 translate-y-[4px]" : ""}`} />
              <span className={`h-[2px] bg-white rounded-full transition-all duration-300 ${toggle ? "opacity-0 scale-0" : ""}`} />
              <span className={`h-[2px] bg-white rounded-full transition-all duration-300 ${toggle ? "-rotate-45 -translate-y-[4px]" : ""}`} />
            </div>
          </button>

          {/* Mobile dropdown */}
          <AnimatePresence>
            {toggle && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="mobile-menu absolute top-16 sm:top-20 right-0 mx-3 sm:mx-4 my-2 w-[calc(100vw-24px)] sm:w-auto sm:min-w-[200px] max-w-[280px] z-50 rounded-2xl overflow-hidden border border-white/[0.08]"
                style={{ background: "rgba(5, 8, 22, 0.9)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
                role="menu"
              >
                <ul className="list-none flex flex-col p-2">
                  {navLinks.map((link, i) => (
                    <li key={link.id}>
                      <a
                        href={`#${link.id}`}
                        onClick={() => handleItemClick(link)}
                        className={`block px-4 py-2.5 rounded-xl text-body font-medium transition-all duration-200 ${
                          active === link.title
                            ? "text-white bg-[#915eff]/15"
                            : "text-secondary hover:text-white hover:bg-white/[0.04]"
                        }`}
                      >
                        {link.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
