/* eslint-disable react/prop-types */
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { resume } from "../assets";

const ResumeModal = ({ isOpen, onClose }) => {
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

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 30 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-4xl h-[85vh] glass-card rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
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
                  className="w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition-colors"
                  aria-label="Close resume viewer"
                >
                  ✕
                </button>
              </div>
            </div>
            <iframe
              src={`${resume}#toolbar=0`}
              title="Resume"
              className="w-full h-[calc(85vh-60px)]"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default ResumeModal;
