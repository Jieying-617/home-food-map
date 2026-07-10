"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { RotateCcw } from "lucide-react";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { ForestDioramaScene } from "@/components/location/ForestDioramaScene";

function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (!window.matchMedia) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(media.matches);
    updatePreference();
    media.addEventListener("change", updatePreference);
    return () => media.removeEventListener("change", updatePreference);
  }, []);

  return reducedMotion;
}

export function ForestDiorama() {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const reducedMotion = useReducedMotion();

  return (
    <section className="forest-diorama-shell" role="region" aria-label="可旋转的3D森林储物模型">
      <Canvas
        data-testid="forest-webgl-canvas"
        camera={{ position: [8.6, 6.8, 10.4], fov: 32, near: 0.1, far: 100 }}
        dpr={[1, 1.75]}
        frameloop="demand"
        gl={{ alpha: true, antialias: true }}
        shadows
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
          gl.toneMappingExposure = 1.12;
        }}
        fallback={<p className="forest-diorama-fallback">当前浏览器暂不支持 3D 预览。</p>}
      >
        <Suspense fallback={null}>
          <ForestDioramaScene />
          <OrbitControls
            ref={controlsRef}
            makeDefault
            enablePan={false}
            enableDamping={!reducedMotion}
            dampingFactor={0.075}
            minDistance={6}
            maxDistance={16}
            minPolarAngle={Math.PI * 0.2}
            maxPolarAngle={Math.PI * 0.48}
            target={[0, 0.65, 0]}
          />
        </Suspense>
      </Canvas>

      <button
        type="button"
        className="forest-diorama-reset"
        aria-label="重置3D视角"
        title="重置3D视角"
        onClick={() => controlsRef.current?.reset()}
      >
        <RotateCcw aria-hidden />
      </button>
    </section>
  );
}
