import React, { useEffect, useState } from "react";
import { styles } from "../styles";
import { navLinks } from "../constants";
import { logo, menu, close } from "../assets";


const Navbar = () => {
  const [active, setActive] = useState("");
  const [toggle, setToggle] = useState(false);
  const [scrolling, setScrolling] = useState(false);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrolling(window.scrollY > 0);

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
        ticking = false;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (!toggle) return;

    const handleClickOutside = (e) => {
      if (!e.target.closest(".mobile-menu") && !e.target.closest(".menu-toggle")) {
        setToggle(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [toggle]);

  const handleItemClick = (link) => {
    setActive(link.title);
    setToggle(false);
  };

  return (
    <nav
      className={`${styles.paddingX} w-full flex items-center py-3 sm:py-5 fixed top-0 z-40 transition-colors duration-300 ${
        scrolling
          ? "bg-primary/50 backdrop-blur-md"
          : "bg-transparent"
      }`}
      style={{
        WebkitBackdropFilter: scrolling ? "blur(5px)" : "none",
      }}
    >
      <div className="flex items-center justify-between w-full mx-auto max-w-7xl 3xl:max-w-[2000px]">
        <a
          href="#"
          className="flex items-center gap-2"
          onClick={() => {
            setActive("");
            window.scrollTo(0, 0);
          }}
        >
          <img src={logo} alt="logo" className="object-contain w-8 h-8 sm:w-9 sm:h-9" />
          <p className="text-white text-[15px] sm:text-[18px] font-bold cursor-pointer flex">
            Rugwed Patharkar&nbsp;
            <span className="md:block hidden">| Portfolio</span>
          </p>
        </a>

        <ul className="list-none hidden md:flex flex-row gap-6 lg:gap-10">
          {navLinks.map((link) => (
            <li
              key={link.id}
              className={`${
                active === link.title ? "text-white nav-link-active" : "text-secondary"
              } hover:text-white text-[15px] lg:text-[18px] font-medium cursor-pointer transition-colors relative link-hover-underline`}
              onClick={() => handleItemClick(link)}
            >
              <a href={"#" + link.id}>{link.title}</a>
            </li>
          ))}
        </ul>

        <div className="md:hidden flex flex-1 justify-end items-center">
          <button
            className="menu-toggle w-[28px] h-[28px] cursor-pointer bg-transparent border-none p-0"
            onClick={() => setToggle(!toggle)}
            aria-label="Toggle menu"
            aria-expanded={toggle}
          >
            <img
              src={toggle ? close : menu}
              alt=""
              className="w-full h-full object-contain"
            />
          </button>

          <div
            className={`mobile-menu ${
              toggle ? "flex" : "hidden"
            } p-6 absolute top-16 sm:top-20 right-0 mx-4 my-2 min-w-[180px] z-50 rounded-xl glass-card shadow-xl`}
          >
            <ul className="list-none flex justify-end items-start flex-col gap-4 w-full">
              {navLinks.map((link) => (
                <li
                  key={link.id}
                  className={`${
                    active === link.title ? "text-white" : "text-secondary"
                  } font-sans font-medium cursor-pointer text-[16px] w-full`}
                  onClick={() => handleItemClick(link)}
                >
                  <a href={"#" + link.id} className="block w-full py-1">
                    {link.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
