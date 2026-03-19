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


// Particle dot configuration — small floating circles for depth
const PARTICLES = [
  { cx: 200, cy: 40, r: 2,   color: "#915eff", opacity: 0.3, freqX: 0.4, freqY: 0.7, ampX: 30, ampY: 8,  phaseX: 0,    phaseY: 0.5 },
  { cx: 500, cy: 55, r: 1.5, color: "#00cea8", opacity: 0.25, freqX: 0.3, freqY: 0.5, ampX: 25, ampY: 10, phaseX: 1.2,  phaseY: 0   },
  { cx: 800, cy: 35, r: 2.5, color: "#915eff", opacity: 0.35, freqX: 0.5, freqY: 0.6, ampX: 35, ampY: 7,  phaseX: 2.5,  phaseY: 1.8 },
  { cx: 1050, cy: 60, r: 1.8, color: "#00cea8", opacity: 0.2, freqX: 0.35, freqY: 0.8, ampX: 20, ampY: 12, phaseX: 3.8, phaseY: 2.2 },
];

const SectionDivider = () => {
  const ref = useRef(null);
  const rafRef = useRef(0);
  const startRef = useRef(null);
  const visibleRef = useRef(false);
  const glowPosRef = useRef(50); // 0-100, starts center
  const wavesRef = useRef(null);
  const glowRef = useRef(null);
  const glowBrightRef = useRef(null);
  const dotsRef = useRef(null);
  // Per-instance scroll state (not shared globals)
  const scrollPosRef = useRef(0);
  const scrollVelocityRef = useRef(0);
  const lastScrollRef = useRef(0);

  const tick = useCallback((timestamp) => {
    const el = ref.current;
    if (!el || !visibleRef.current) {
      rafRef.current = 0;
      return;
    }

    if (!startRef.current) startRef.current = timestamp;
    const t = (timestamp - startRef.current) / 1000;

    // Cache DOM queries on first frame
    if (!wavesRef.current) wavesRef.current = el.querySelectorAll("[data-wave]");
    if (!glowRef.current) glowRef.current = el.querySelector("[data-glow]");
    if (!glowBrightRef.current) glowBrightRef.current = el.querySelector("[data-glow-bright]");
    if (!dotsRef.current) dotsRef.current = el.querySelectorAll("[data-dot]");

    // Update wave shapes
    const paths = wavesRef.current;
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
    const target = 50 + Math.max(-45, Math.min(45, scrollVelocityRef.current * 1.5));
    // Ease toward target for smooth motion, slowly drift back to center when idle
    glowPosRef.current += (target - glowPosRef.current) * 0.08;

    const glow = glowRef.current;
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
    const glowBright = glowBrightRef.current;
    if (glowBright) {
      const speed = Math.abs(glowPosRef.current - 50) / 45;
      glowBright.setAttribute("cx", `${glowPosRef.current}%`);
      glowBright.setAttribute("opacity", `${0.1 + speed * 0.3}`);
    }

    // Parallax depth — shift wave layers horizontally based on scroll position
    // Wave 2 (mid, index 1 in wavesRef which is ordered bg→mid→glow→primary)
    // wavesRef order: wave3(bg), wave2(mid), wave1-glow, wave1-primary
    const parallaxScroll = scrollPosRef.current * 0.05; // scale factor for subtle shift
    const paths2 = wavesRef.current;
    if (paths2.length >= 4) {
      // Wave 2 (mid) — slight left shift
      paths2[1].setAttribute("transform", `translate(${-parallaxScroll * 0.3}, 0)`);
      // Wave 3 (background) — more pronounced shift
      paths2[0].setAttribute("transform", `translate(${-parallaxScroll * 0.6}, 0)`);
    }

    // Animate particle dots — simple sin/cos drift
    const dots = dotsRef.current;
    if (dots) {
      for (let i = 0; i < dots.length; i++) {
        const p = PARTICLES[i];
        if (!p) break;
        const dx = Math.sin(t * p.freqX + p.phaseX) * p.ampX;
        const dy = Math.cos(t * p.freqY + p.phaseY) * p.ampY;
        dots[i].setAttribute("cx", p.cx + dx);
        dots[i].setAttribute("cy", p.cy + dy);
      }
    }

    // Decay velocity when not scrolling
    scrollVelocityRef.current *= 0.95;

    rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    lastScrollRef.current = window.scrollY;
    scrollPosRef.current = window.scrollY;

    const onScroll = () => {
      const now = window.scrollY;
      scrollVelocityRef.current = now - lastScrollRef.current;
      scrollPosRef.current = now;
      lastScrollRef.current = now;
    };
    window.addEventListener("scroll", onScroll, { passive: true });

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
      window.removeEventListener("scroll", onScroll);
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

        {/* Particle dots — floating ambient circles */}
        {PARTICLES.map((p, i) => (
          <circle
            key={i}
            data-dot
            cx={p.cx}
            cy={p.cy}
            r={p.r}
            fill={p.color}
            opacity={p.opacity}
          />
        ))}

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
