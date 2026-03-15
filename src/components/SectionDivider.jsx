import { useEffect, useRef, useCallback } from "react";

const W = 1200;

const buildWave = (t, amp, phase, speed) => {
  const s = t * speed + phase;
  const pts = [];
  for (let x = 0; x <= W; x += 3) {
    const nx = x / W;
    const y =
      50 +
      Math.sin(nx * Math.PI * 2 + s) * amp * 0.5 +
      Math.sin(nx * Math.PI * 4 + s * 1.3) * amp * 0.3 +
      Math.sin(nx * Math.PI * 6 + s * 0.7) * amp * 0.2;
    pts.push(`${x},${y.toFixed(1)}`);
  }
  return pts.join(" ");
};

// Shared scroll state across all divider instances
let scrollPos = 0;
let scrollVelocity = 0;
let lastScroll = 0;
let scrollListenerAttached = false;

const attachScrollListener = () => {
  if (scrollListenerAttached) return;
  scrollListenerAttached = true;
  lastScroll = window.scrollY;

  window.addEventListener(
    "scroll",
    () => {
      const now = window.scrollY;
      scrollVelocity = now - lastScroll;
      lastScroll = now;
    },
    { passive: true }
  );
};

const SectionDivider = () => {
  const ref = useRef(null);
  const rafRef = useRef(0);
  const startRef = useRef(null);
  const visibleRef = useRef(false);
  const glowPosRef = useRef(50); // 0-100, starts center

  const tick = useCallback((timestamp) => {
    const el = ref.current;
    if (!el || !visibleRef.current) {
      rafRef.current = 0;
      return;
    }

    if (!startRef.current) startRef.current = timestamp;
    const t = (timestamp - startRef.current) / 1000;

    // Update wave shapes
    const paths = el.querySelectorAll("[data-wave]");
    for (let i = 0; i < paths.length; i++) {
      const p = paths[i];
      p.setAttribute(
        "points",
        buildWave(
          t,
          parseFloat(p.dataset.amp),
          parseFloat(p.dataset.phase),
          parseFloat(p.dataset.speed)
        )
      );
    }

    // Glow follows scroll direction with momentum
    // scrollVelocity is positive (scrolling down) or negative (scrolling up)
    const target = 50 + Math.max(-45, Math.min(45, scrollVelocity * 1.5));
    // Ease toward target for smooth motion, slowly drift back to center when idle
    glowPosRef.current += (target - glowPosRef.current) * 0.08;

    const glow = el.querySelector("[data-glow]");
    if (glow) {
      glow.setAttribute("cx", `${glowPosRef.current}%`);
      // Glow intensity increases with movement speed
      const speed = Math.abs(glowPosRef.current - 50) / 45;
      const ry = 40 + speed * 15;
      const rx = 200 + speed * 100;
      glow.setAttribute("rx", `${rx}`);
      glow.setAttribute("ry", `${ry}`);
    }

    // Glow brightness element
    const glowBright = el.querySelector("[data-glow-bright]");
    if (glowBright) {
      const speed = Math.abs(glowPosRef.current - 50) / 45;
      glowBright.setAttribute("cx", `${glowPosRef.current}%`);
      glowBright.setAttribute("opacity", `${0.1 + speed * 0.3}`);
    }

    // Decay velocity when not scrolling
    scrollVelocity *= 0.95;

    rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    attachScrollListener();

    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry.isIntersecting;
        if (entry.isIntersecting && !rafRef.current) {
          rafRef.current = requestAnimationFrame(tick);
        }
      },
      { threshold: 0, rootMargin: "100px" }
    );
    obs.observe(el);

    return () => {
      obs.disconnect();
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    };
  }, [tick]);

  return (
    <div
      ref={ref}
      className="relative w-full py-0 sm:py-1 overflow-hidden"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1200 100"
        className="w-full h-14 sm:h-20 md:h-24"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="wv1" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#915eff" stopOpacity="0" />
            <stop offset="15%" stopColor="#915eff" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#00cea8" stopOpacity="0.5" />
            <stop offset="85%" stopColor="#915eff" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#915eff" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="wv2" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#00cea8" stopOpacity="0" />
            <stop offset="25%" stopColor="#00cea8" stopOpacity="0.35" />
            <stop offset="75%" stopColor="#f8c555" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#f8c555" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="wv3" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#bf61ff" stopOpacity="0" />
            <stop offset="30%" stopColor="#bf61ff" stopOpacity="0.2" />
            <stop offset="70%" stopColor="#915eff" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#915eff" stopOpacity="0" />
          </linearGradient>

          <radialGradient id="wvGlow" cx="50%" cy="50%" r="30%">
            <stop offset="0%" stopColor="#915eff" stopOpacity="0.4" />
            <stop offset="60%" stopColor="#00cea8" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#915eff" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="wvGlowBright" cx="50%" cy="50%" r="15%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#915eff" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#915eff" stopOpacity="0" />
          </radialGradient>

          <filter id="wvBlur">
            <feGaussianBlur stdDeviation="2" />
          </filter>
        </defs>

        {/* Main glow — drifts with scroll */}
        <ellipse data-glow cx="50%" cy="50" rx="200" ry="40" fill="url(#wvGlow)" />

        {/* Bright core — intensifies on fast scroll */}
        <ellipse data-glow-bright cx="50%" cy="50" rx="80" ry="25" fill="url(#wvGlowBright)" opacity="0.1" />

        {/* Wave 3 — background */}
        <polyline
          data-wave data-amp="22" data-phase="2" data-speed="0.6"
          fill="none" stroke="url(#wv3)" strokeWidth="1.5" strokeLinecap="round"
        />

        {/* Wave 2 — mid */}
        <polyline
          data-wave data-amp="16" data-phase="0.8" data-speed="0.8"
          fill="none" stroke="url(#wv2)" strokeWidth="2" strokeLinecap="round"
        />

        {/* Wave 1 glow — bloom */}
        <polyline
          data-wave data-amp="12" data-phase="0" data-speed="1"
          fill="none" stroke="url(#wv1)" strokeWidth="6" strokeLinecap="round"
          filter="url(#wvBlur)" opacity="0.4"
        />

        {/* Wave 1 — primary */}
        <polyline
          data-wave data-amp="12" data-phase="0" data-speed="1"
          fill="none" stroke="url(#wv1)" strokeWidth="2.5" strokeLinecap="round"
        />
      </svg>
    </div>
  );
};

export default SectionDivider;
