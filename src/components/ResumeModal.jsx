/* eslint-disable react/prop-types */
import { motion, AnimatePresence } from "framer-motion";
import { resume } from "../assets";

const ResumeModal = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-4xl h-[85vh] glass-card rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-secondary/20">
              <h3 className="text-white font-bold text-base sm:text-lg">Resume</h3>
              <div className="flex items-center gap-3">
                <a
                  href={resume}
                  download
                  className="text-[#915eff] hover:text-white text-sm font-medium transition-colors"
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
    </AnimatePresence>
  );
};

export default ResumeModal;
