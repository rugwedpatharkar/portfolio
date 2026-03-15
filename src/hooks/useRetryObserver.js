import { useEffect, useRef } from "react";

const MAX_RETRIES = 20;

/**
 * Sets up an IntersectionObserver that retries until all target IDs are in the DOM.
 * @param {string[]} ids - Element IDs to observe
 * @param {Function} callback - IntersectionObserver callback
 * @param {Object} options - IntersectionObserver options
 * @param {Function} [onReady] - Called with observed elements once all found
 */
const useRetryObserver = (ids, callback, options, onReady) => {
  const observerRef = useRef(null);
  const retryTimerRef = useRef(null);

  useEffect(() => {
    let retryCount = 0;

    const setup = () => {
      const elements = ids
        .map((id) => document.getElementById(id))
        .filter(Boolean);

      if (elements.length < ids.length && retryCount < MAX_RETRIES) {
        retryCount++;
        retryTimerRef.current = setTimeout(setup, 500);
        return;
      }

      if (elements.length === 0) return;

      observerRef.current = new IntersectionObserver(callback, options);
      elements.forEach((el) => observerRef.current.observe(el));

      if (onReady) onReady(elements);
    };

    retryTimerRef.current = setTimeout(setup, 300);

    return () => {
      clearTimeout(retryTimerRef.current);
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [ids, callback, options, onReady]);
};

export default useRetryObserver;
