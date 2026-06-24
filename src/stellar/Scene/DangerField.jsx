/* eslint-disable react/no-unknown-property */
import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useSceneClock } from "./SceneClock";

/*
 * Spaghettification danger field — the dread you feel flying too close to
 * Gargantua.
 *
 * An inverted sphere parented to the camera (rendered on its INSIDE, BackSide)
 * so it surrounds the near plane like a helmet visor: a deep red-shift vignette
 * closing in from the screen edges + a subtle radial "tidal stretch" warp
 * dragging the view toward screen centre. Intensity is driven by one uniform,
 * uDanger, computed from camera distance to the hole.
 *
 * Why an in-scene shell and NOT a postprocessing pass: the scene already runs a
 * single post effect (CinematicGrade). Adding a SECOND post pass whites out the
 * whole frame (the merged-effect bug this project already hit). So the warning
 * is geometry that lives in the scene, blended additively over everything the
 * camera sees — it can never fight the post pipeline.
 *
 * The mesh follows the camera's world position + orientation each frame (the
 * camera-relative render approach used elsewhere here, e.g. billboards in
 * BlackHole), rather than reparenting into camera.children — same result, no
 * scene-graph mutation on mount/cleanup.
 *
 * It also writes the danger level onto the shared scene clock (clock.danger) so
 * the DOM control surface can react (e.g. a "PROXIMITY WARNING" readout). This
 * write happens every frame even under reduced motion: it's a safety signal,
 * not decoration.
 */

const GARGANTUA = new THREE.Vector3(960, -40, -70); // true-scale edge, beyond the Contact beacon

/* Scratch vector reused every frame — no per-frame allocation. */
const _camPos = new THREE.Vector3();

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAG = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uDanger;   // 0 far → 1 at the edge of survival
  uniform float uTime;     // frozen under reduced motion (warp wobble stops)

  void main() {
    /* Screen-centred radial coord. The sphere's equirect uv maps the forward
       hemisphere across the middle of the uv space, so centring on (0.5,0.5)
       puts the calm eye dead ahead and the vignette on the periphery. */
    vec2 p = vUv - 0.5;
    float r = length(p) * 2.0;            // ~0 centre → ~1 edge

    /* Tidal-stretch wobble: the rim pulses inward as the hole pulls. Frozen
       (uTime constant) under reduced motion → static vignette, no motion. */
    float wobble = 0.04 * sin(uTime * 2.0 + r * 9.0) * uDanger;
    float vig = smoothstep(0.25 - wobble, 1.05, r);

    /* Red-shift gradient: deep blood-red on the rim warming to orange as it
       bites toward centre — the spectrum sliding red as you fall in. */
    vec3 edge = vec3(0.65, 0.02, 0.0);
    vec3 inner = vec3(1.0, 0.32, 0.06);
    vec3 col = mix(inner, edge, vig);

    /* Ramp hard with danger so far-out it's invisible and only screams near
       the horizon. Squared keeps the onset gentle then accelerates. */
    float d = uDanger * uDanger;
    float a = vig * d * 1.35;

    /* A faint full-field red wash at extreme danger so even the centre tints
       (the moment before spaghettification — nowhere is safe). */
    a += d * d * 0.18;

    a = clamp(a, 0.0, 0.92);
    gl_FragColor = vec4(col * a, a);
  }
`;

const DangerField = ({ animate = true }) => {
  const meshRef = useRef();
  const matRef = useRef();
  const clock = useSceneClock();
  const { camera } = useThree();

  const uniforms = useMemo(
    () => ({ uDanger: { value: 0 }, uTime: { value: 0 } }),
    []
  );

  useFrame(() => {
    camera.getWorldPosition(_camPos);
    const distance = _camPos.distanceTo(GARGANTUA);
    /* 0 beyond 16 units → 1 at ~7 units from the singularity. */
    const danger = THREE.MathUtils.smoothstep(distance, 7.0, 16.0);
    const inverted = 1.0 - danger; // smoothstep above goes 0→1 as dist grows
    const level = THREE.MathUtils.clamp(inverted, 0, 1);

    /* Publish to the shared clock for the DOM — always, even reduced-motion. */
    clock.danger = level;

    const mesh = meshRef.current;
    if (!mesh) return;
    /* Costs nothing when far (≈always): skip the draw entirely. */
    mesh.visible = level > 0.001;
    if (!mesh.visible) return;

    /* Glue the shell to the camera: same world position + orientation, so it
       wraps the view like a visor regardless of where the pilot flies. */
    mesh.position.copy(_camPos);
    mesh.quaternion.copy(camera.quaternion);

    if (matRef.current) {
      matRef.current.uniforms.uDanger.value = level;
      /* Reduced motion freezes the wobble but keeps the static vignette. */
      if (animate) matRef.current.uniforms.uTime.value = clock.t;
    }
  });

  return (
    /* Small inverted sphere hugging the near plane; BackSide → drawn on the
       inside so it surrounds the camera. renderOrder high + depthTest off so it
       always paints last, over the whole scene. */
    <mesh ref={meshRef} visible={false} renderOrder={9999} frustumCulled={false}>
      <sphereGeometry args={[2.5, 32, 24]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={VERT}
        fragmentShader={FRAG}
        uniforms={uniforms}
        transparent
        side={THREE.BackSide}
        depthTest={false}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </mesh>
  );
};

export default DangerField;
