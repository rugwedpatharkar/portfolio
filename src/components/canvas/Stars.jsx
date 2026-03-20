/* eslint-disable react/no-unknown-property */
import { useState, useRef, useMemo, useEffect, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { PointMaterial } from "@react-three/drei";
import * as THREE from "three";
import * as random from "maath/random/dist/maath-random.esm";

const Stars = ({ paused = false }) => {
  const groupRef = useRef();
  const pointsRef = useRef();

  // Build geometry once with a pre-set valid bounding sphere.
  // Using THREE.BufferGeometry directly lets us set boundingSphere BEFORE
  // Three.js ever tries to compute it, eliminating the NaN warning entirely.
  const geometry = useMemo(() => {
    // 4998 = 1666 × 3 — always divisible by stride so no partial points
    const positions = random.inSphere(new Float32Array(4998), { radius: 1.2 });
    for (let i = 0; i < positions.length; i++) {
      if (!isFinite(positions[i])) positions[i] = 0;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    // Pre-set a valid bounding sphere — prevents Three.js from computing NaN
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 1.5);
    return geo;
  }, []);

  // Cleanup geometry on unmount
  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((_state, delta) => {
    if (paused || !groupRef.current) return;
    groupRef.current.rotation.x -= delta / 10;
    groupRef.current.rotation.y -= delta / 15;
  });

  return (
    <group ref={groupRef} rotation={[0, 0, Math.PI / 4]}>
      <points ref={pointsRef} geometry={geometry} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#f272c8"
          size={0.002}
          sizeAttenuation={true}
          depthWrite={false}
        />
      </points>
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
      {/* events={false} — purely decorative canvas needs no pointer event handling,
          which also eliminates the "non-static position" scroll-offset warning */}
      <Canvas camera={{ position: [0, 0, 1] }} events={false}>
        <Suspense fallback={null}>
          <Stars paused={!isVisible} />
        </Suspense>
      </Canvas>
    </div>
  );
};
export default StarsCanvas;
