/* eslint-disable react/no-unknown-property */
import { useState, useRef, useMemo, useEffect, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial, Preload } from "@react-three/drei";
import * as random from "maath/random/dist/maath-random.esm";

const Stars = ({ paused = false, ...props }) => {
  const ref = useRef();

  const sphere = useMemo(
    () => random.inSphere(new Float32Array(5000), { radius: 1.2 }),
    []
  );
  useFrame((state, delta) => {
    if (paused) return;
    ref.current.rotation.x -= delta / 10;
    ref.current.rotation.y -= delta / 15;
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled {...props}>
        <PointMaterial
          transparent
          color="#f272c8"
          size={0.002}
          sizeAttenuation={true}
          depthWrite={false}
        />
      </Points>
    </group>
  );
};

const StarsCanvas = ({ fixed = false }) => {
  const [isVisible, setIsVisible] = useState(fixed ? true : false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (fixed) {
      setIsVisible(true);
      return;
    }
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [fixed]);

  return (
    <div
      ref={containerRef}
      className={fixed ? "fixed inset-0 w-full h-full z-[-1]" : "w-full h-auto absolute inset-0 z-[-1]"}
      aria-hidden="true"
    >
      <Canvas camera={{ position: [0, 0, 1] }}>
        <Suspense fallback={null}>
          <Stars paused={!isVisible} />
        </Suspense>
      </Canvas>
    </div>
  );
};
export default StarsCanvas;
