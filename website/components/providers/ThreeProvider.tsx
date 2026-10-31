'use client';

import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { Canvas, extend, useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

// Extend Three.js classes for R3F
extend({
  EffectComposer,
  RenderPass,
  UnrealBloomPass,
});

interface ThreeContextValue {
  scene: THREE.Scene | null;
  camera: THREE.Camera | null;
  renderer: THREE.WebGLRenderer | null;
  size: { width: number; height: number };
  registerObject: (name: string, object: THREE.Object3D) => void;
  unregisterObject: (name: string) => void;
  getObject: (name: string) => THREE.Object3D | undefined;
}

const ThreeContext = createContext<ThreeContextValue | null>(null);

export function useThreeContext() {
  const context = useContext(ThreeContext);
  if (!context) {
    throw new Error('useThreeContext must be used within a ThreeProvider');
  }
  return context;
}

interface ThreeProviderProps {
  children: ReactNode;
  enableBloom?: boolean;
  bloomConfig?: {
    strength: number;
    radius: number;
    threshold: number;
  };
}

export function ThreeProvider({
  children,
  enableBloom = true,
  bloomConfig = { strength: 0.8, radius: 0.4, threshold: 0.1 }
}: ThreeProviderProps) {
  const [mounted, setMounted] = useState(false);
  const objectsRef = useRef<Map<string, THREE.Object3D>>(new Map());

  const registerObject = (name: string, object: THREE.Object3D) => {
    objectsRef.current.set(name, object);
  };

  const unregisterObject = (name: string) => {
    objectsRef.current.delete(name);
  };

  const getObject = (name: string) => {
    return objectsRef.current.get(name);
  };

  // Custom canvas with post-processing
  const CustomCanvas = ({ children: canvasChildren }: { children: ReactNode }) => {
    const { gl, scene, camera, size, viewport } = useThree();
    const composerRef = useRef<EffectComposer | null>(null);
    const bloomPassRef = useRef<UnrealBloomPass | null>(null);

    useEffect(() => {
      if (!enableBloom) return;

      const composer = new EffectComposer(gl);
      const renderPass = new RenderPass(scene, camera);
      composer.addPass(renderPass);

      const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        bloomConfig.strength,
        bloomConfig.radius,
        bloomConfig.threshold
      );
      composer.addPass(bloomPass);
      composerRef.current = composer;
      bloomPassRef.current = bloomPass;

      return () => {
        composer.dispose();
      };
    }, [gl, scene, camera, enableBloom, bloomConfig.strength, bloomConfig.radius, bloomConfig.threshold]);

    useFrame((_, delta) => {
      if (composerRef.current && enableBloom) {
        composerRef.current.render(delta);
      }
    }, 1);

    // Render nothing here - we're handling render in useFrame
    return null;
  };

  const CanvasWrapper = ({ children: canvasChildren }: { children: ReactNode }) => {
    const { size } = useThree();

    useEffect(() => {
      setMounted(true);
    }, []);

    return (
      <>
        <Canvas
          camera={{ position: [0, 0, 5], fov: 50 }}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance', preserveDrawingBuffer: false }}
          onCreated={({ gl }) => {
            gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
          }}
        >
          <color attach="background" args={['#0A0F1A']} />
          <fog attach="fog" args={['#0A0F1A', 5, 50]} />
          {canvasChildren}
          <CustomCanvas>{canvasChildren}</CustomCanvas>
        </Canvas>
      </>
    );
  };

  const contextValue: ThreeContextValue = {
    scene: null, // Will be populated by useThree in children
    camera: null,
    renderer: null,
    size: { width: 0, height: 0 },
    registerObject,
    unregisterObject,
    getObject,
  };

  return (
    <ThreeContext.Provider value={contextValue}>
      <div style={{ width: '100%', height: '100%', minHeight: '100vh' }}>
        {mounted && <CanvasWrapper>{children}</CanvasWrapper>}
        {!mounted && <div style={{ width: '100%', height: '100%' }} aria-hidden="true" />}
      </div>
    </ThreeContext.Provider>
  );
}

// Hook for components that need to share the same canvas
export function useSharedCanvas() {
  const { scene, camera, gl, size, viewport } = useThree();

  return { scene, camera, renderer: gl, size, viewport };
}

// Performance monitor component
export function PerformanceMonitor() {
  const { gl } = useThree();
  const [fps, setFps] = useState(0);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());

  useFrame(() => {
    frameCountRef.current++;
    const now = performance.now();
    if (now - lastTimeRef.current >= 1000) {
      setFps(frameCountRef.current);
      frameCountRef.current = 0;
      lastTimeRef.current = now;
    }
  });

  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        background: 'rgba(10, 15, 26, 0.9)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-sm) var(--space-md)',
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--text-xs)',
        color: 'var(--text-muted)',
        zIndex: 9999,
        backdropFilter: 'blur(8px)',
      }}
    >
      FPS: {fps}
    </div>
  );
}