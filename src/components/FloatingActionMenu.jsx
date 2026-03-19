import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { personalInfo } from "../content";
import { AiOutlineGithub, AiOutlineMail } from "react-icons/ai";
import { ImLinkedin } from "react-icons/im";
import useSoundEffects from "../hooks/useSoundEffects";

const FloatingActionMenu = () => {
  const [open, setOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [soundsMuted, setSoundsMuted] = useState(
    () => localStorage.getItem("portfolio-sounds-muted") === "true"
  );
  const audioRef = useRef(null);
  const { playClick, playHover, playToggle } = useSoundEffects();

  /* Audio setup */
  useEffect(() => {
    audioRef.current = new Audio("/ambient.mp3");
    audioRef.current.loop = true;
    audioRef.current.volume = 0.3;
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      }
    };
  }, []);

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
    setIsPlaying(!isPlaying);
    window.dispatchEvent(new CustomEvent("achievement", { detail: "musician" }));
  };

  const openTerminal = () => {
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "`", ctrlKey: true }));
    setOpen(false);
  };

  const showShortcuts = () => {
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "?" }));
    setOpen(false);
  };

  const toggleSoundsMuted = () => {
    const next = !soundsMuted;
    setSoundsMuted(next);
    localStorage.setItem("portfolio-sounds-muted", String(next));
    if (!next) playToggle();
  };

  const actions = [
    {
      label: "Email",
      href: `mailto:${personalInfo.email}`,
      icon: <AiOutlineMail className="text-body-lg" />,
      color: "#ff6b6b",
    },
    {
      label: "LinkedIn",
      href: personalInfo.linkedin,
      icon: <ImLinkedin className="text-body-sm" />,
      color: "#0077b5",
    },
    {
      label: "GitHub",
      href: personalInfo.github,
      icon: <AiOutlineGithub className="text-body-lg" />,
      color: "#6e7681",
    },
    {
      label: "Terminal",
      onClick: openTerminal,
      icon: (
        <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: "#915eff",
    },
    {
      label: isPlaying ? "Pause Music" : "Play Music",
      onClick: toggleMusic,
      icon: isPlaying ? (
        <div className="flex items-center gap-[2px]">
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="w-[2.5px] bg-white rounded-full"
              animate={{ height: [6, 14, 6, 10, 6] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
            />
          ))}
        </div>
      ) : (
        <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
      ),
      color: "#00cea8",
    },
    {
      label: "Shortcuts (?)",
      onClick: showShortcuts,
      icon: (
        <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      color: "#f8c555",
    },
    {
      label: soundsMuted ? "Unmute Sounds" : "Mute Sounds",
      onClick: toggleSoundsMuted,
      icon: soundsMuted ? (
        <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
        </svg>
      ) : (
        <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
        </svg>
      ),
      color: "#7c6daf",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 1 }}
      className="fixed bottom-3 left-3 sm:bottom-4 sm:left-4 z-50 flex flex-col-reverse items-center gap-3"
    >
      <AnimatePresence>
        {open &&
          actions.map((action, i) => {
            const shared = {
              key: action.label,
              initial: { opacity: 0, y: 10, scale: 0 },
              animate: { opacity: 1, y: 0, scale: 1 },
              exit: { opacity: 0, y: 10, scale: 0 },
              transition: { delay: i * 0.04 },
              className:
                "w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-shadow group relative",
              style: { background: action.color },
              onMouseEnter: playHover,
            };

            return action.href ? (
              <motion.a
                {...shared}
                href={action.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={action.label}
              >
                {action.icon}
                <span className="absolute left-full ml-2 px-2 py-1 bg-black/80 text-white text-caption font-mono rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  {action.label}
                </span>
              </motion.a>
            ) : (
              <motion.button
                {...shared}
                onClick={action.onClick}
                aria-label={action.label}
              >
                {action.icon}
                <span className="absolute left-full ml-2 px-2 py-1 bg-black/80 text-white text-caption font-mono rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  {action.label}
                </span>
              </motion.button>
            );
          })}
      </AnimatePresence>

      {/* Main FAB button */}
      <button
        onClick={() => { playClick(); setOpen(!open); }}
        className={`green-pink-gradient w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center`}
        style={{ transition: "transform 0.3s" }}
        aria-label={open ? "Close menu" : "Open menu"}
      >
        <svg
          className={`w-6 h-6 text-white transition-transform duration-300 ${open ? "rotate-45" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </motion.div>
  );
};

export default FloatingActionMenu;
