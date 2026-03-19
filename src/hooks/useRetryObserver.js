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
  // Stable refs so changing these never triggers a re-run of the effect
  const callbackRef = useRef(callback);
  const optionsRef = useRef(options);
  const onReadyRef = useRef(onReady);
  callbackRef.current = callback;
  optionsRef.current = options;
  onReadyRef.current = onReady;

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

      observerRef.current = new IntersectionObserver(
        (...args) => callbackRef.current(...args),
        optionsRef.current
      );
      elements.forEach((el) => observerRef.current.observe(el));

      if (onReadyRef.current) onReadyRef.current(elements);
    };

    retryTimerRef.current = setTimeout(setup, 300);

    return () => {
      clearTimeout(retryTimerRef.current);
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [ids]);
};

export default useRetryObserver;
