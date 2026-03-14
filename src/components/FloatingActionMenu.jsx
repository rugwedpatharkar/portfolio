import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { personalInfo } from "../constants";
import { AiOutlineGithub, AiOutlineMail } from "react-icons/ai";
import { ImLinkedin } from "react-icons/im";

const actions = [
  {
    label: "Email",
    href: `mailto:${personalInfo.email}`,
    icon: <AiOutlineMail />,
    color: "bg-red-600",
  },
  {
    label: "LinkedIn",
    href: personalInfo.linkedin,
    icon: <ImLinkedin />,
    color: "bg-blue-600",
  },
  {
    label: "GitHub",
    href: personalInfo.github,
    icon: <AiOutlineGithub />,
    color: "bg-gray-700",
  },
];

const FloatingActionMenu = () => {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 1 }}
      className="fixed bottom-3 left-3 sm:bottom-4 sm:left-4 z-50 flex flex-col-reverse items-center gap-2"
    >
      <AnimatePresence>
        {open &&
          actions.map((action, i) => (
            <motion.a
              key={action.label}
              href={action.href}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 10, scale: 0 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`${action.color} w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-white text-body-lg shadow-lg hover:shadow-xl transition-shadow group relative`}
              aria-label={action.label}
            >
              {action.icon}
              <span className="absolute left-full ml-2 px-2 py-1 bg-black/80 text-white text-caption font-mono rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {action.label}
              </span>
            </motion.a>
          ))}
      </AnimatePresence>
      <button
        onClick={() => setOpen(!open)}
        className={`green-pink-gradient w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center ${
          open ? "rotate-45" : ""
        }`}
        style={{ transition: "transform 0.3s" }}
        aria-label={open ? "Close contact menu" : "Open contact menu"}
      >
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </motion.div>
  );
};

export default FloatingActionMenu;
