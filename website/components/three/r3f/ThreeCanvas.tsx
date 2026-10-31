'use client';

import React, { ReactNode, Suspense, useEffect, useState } from 'react';
import { Canvas, CanvasProps } from '@react-three/fiber';

export interface ThreeCanvasProps extends Omit<CanvasProps, 'children'> {
  children: ReactNode;
  fallback?: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  backgroundColor?: string;
}

export function ThreeCanvas({
  children,
  fallback = null,
  className = '',
  style,
  backgroundColor = '#0A0F1A',
  camera = { position: [0, 0, 5], fov: 50 },
  dpr = [1, 2],
  gl = { antialias: true, alpha: true, powerPreference: 'high-performance' },
  ...props
}: ThreeCanvasProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={`three-canvas-container ${className}`}
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          background: backgroundColor,
          overflow: 'hidden',
          ...style,
        }}
        aria-hidden="true"
      >
        {fallback}
      </div>
    );
  }

  return (
    <div
      className={`three-canvas-container ${className}`}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        background: backgroundColor,
        overflow: 'hidden',
        ...style,
      }}
    >
      <Suspense fallback={fallback}>
        <Canvas
          camera={camera}
          dpr={dpr}
          gl={gl}
          {...props}
        >
          <color attach="background" args={[backgroundColor]} />
          {children}
        </Canvas>
      </Suspense>
    </div>
  );
}

export default ThreeCanvas;
