/* eslint-disable react/prop-types */
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { resume } from "../assets";

const ResumeModal = ({ isOpen, onClose }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    const mainContent = document.getElementById("main-content");
    if (!mainContent) return;

    if (isOpen) {
      mainContent.style.filter = "blur(12px)";
      mainContent.style.transition = "filter 0.3s ease";
      document.body.style.overflow = "hidden";
    } else {
      mainContent.style.filter = "";
      document.body.style.overflow = "";
    }

    return () => {
      mainContent.style.filter = "";
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  /* Focus trap + Escape to close */
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key !== "Tab") return;

      const modal = modalRef.current;
      if (!modal) return;
      const focusable = modal.querySelectorAll('a, button, input, [tabindex]:not([tabindex="-1"])');
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    // Focus first focusable element
    requestAnimationFrame(() => {
      const modal = modalRef.current;
      if (modal) {
        const first = modal.querySelector('a, button');
        if (first) first.focus();
      }
    });

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 30 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            ref={modalRef}
            className="relative w-full max-w-4xl h-[80vh] sm:h-[85vh] mx-2 sm:mx-4 glass-card rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Resume viewer"
          >
            <div className="flex items-center justify-between p-4 border-b border-secondary/20">
              <h3 className="text-white font-heading font-bold text-body sm:text-body-lg">Resume</h3>
              <div className="flex items-center gap-3">
                <a
                  href={resume}
                  download
                  className="text-[#915eff] hover:text-white text-body-sm font-medium transition-colors"
                >
                  Download
                </a>
                <button
                  onClick={onClose}
                  className="w-10 h-10 sm:w-8 sm:h-8 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition-colors"
                  aria-label="Close resume viewer"
                >
                  ✕
                </button>
              </div>
            </div>
            <iframe
              src={`${resume}#toolbar=0`}
              title="Resume"
              className="w-full h-[calc(80vh-60px)] sm:h-[calc(85vh-60px)]"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default ResumeModal;
