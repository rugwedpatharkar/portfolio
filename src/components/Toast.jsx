/* eslint-disable react/prop-types */
import { useState, useEffect, useCallback, createContext, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ToastContext = createContext(null);

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success", duration = 4000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div className="fixed top-4 right-4 z-[90] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              className={`pointer-events-auto flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl backdrop-blur-sm border min-w-[280px] max-w-[400px] ${
                toast.type === "success"
                  ? "bg-green-900/80 border-green-500/30 text-green-100"
                  : toast.type === "error"
                  ? "bg-red-900/80 border-red-500/30 text-red-100"
                  : "bg-yellow-900/80 border-yellow-500/30 text-yellow-100"
              }`}
            >
              <span className="text-body-lg flex-shrink-0">
                {toast.type === "success" ? "✓" : toast.type === "error" ? "✕" : "⚠"}
              </span>
              <p className="text-body-sm font-medium">{toast.message}</p>
              <button
                onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                className="ml-auto text-white/60 hover:text-white text-body-lg flex-shrink-0"
              >
                ×
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
