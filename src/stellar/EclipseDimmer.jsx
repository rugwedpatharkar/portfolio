 
import { useEffect, useRef } from "react";

/*
 * Sky-darkening at totality. Reads the live eclipse totality (written by
 * SolarEclipse) each frame and ramps a twilight overlay over the 3-D scene —
 * real eclipses only darken near totality, so it stays at zero until coverage
 * passes ~half, then deepens to dusk. Sits above the canvas but below the HUD
 * (z 33) so the scene dims while the readouts stay legible.
 */

const MAX_DIM = 0.62;

const EclipseDimmer = ({ eclipseRef }) => {
  const ref = useRef(null);
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const el = ref.current;
      if (!el) return;
      const t = eclipseRef?.current || 0;
      el.style.opacity = (Math.max(0, (t - 0.5) / 0.5) * MAX_DIM).toFixed(3);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [eclipseRef]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 33,
        pointerEvents: "none",
        opacity: 0,
        background: "radial-gradient(circle at 50% 46%, rgba(10,12,30,0.45), rgba(2,3,10,0.96))",
      }}
    />
  );
};

export default EclipseDimmer;
