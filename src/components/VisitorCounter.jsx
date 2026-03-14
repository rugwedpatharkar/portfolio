import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const VisitorCounter = () => {
  const [count, setCount] = useState(null);

  useEffect(() => {
    // Use localStorage to simulate unique visitors
    // For a real counter, replace with Firebase/Supabase
    const KEY = "portfolio_visitor_count";
    const VISITED_KEY = "portfolio_has_visited";

    let storedCount = parseInt(localStorage.getItem(KEY) || "4832", 10);
    const hasVisited = sessionStorage.getItem(VISITED_KEY);

    if (!hasVisited) {
      storedCount += 1;
      localStorage.setItem(KEY, storedCount.toString());
      sessionStorage.setItem(VISITED_KEY, "true");
    }

    setCount(storedCount);
  }, []);

  if (count === null) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 2, duration: 1 }}
      className="font-mono text-[10px] sm:text-xs text-white/30 flex items-center gap-1.5"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-[#00cea8] animate-pulse" />
      visitor #{count.toLocaleString()}
    </motion.div>
  );
};

export default VisitorCounter;
