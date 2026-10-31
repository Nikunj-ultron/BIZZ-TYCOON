'use client';

import { createContext, useContext, ReactNode } from 'react';
import { CanvasProps } from '@react-three/fiber';

interface ThreeContextType {
  canvasProps: Partial<CanvasProps>;
  backgroundColor?: string;
}

const ThreeContext = createContext<ThreeContextType | undefined>(undefined);

interface ThreeProviderProps {
  children: ReactNode;
  camera?: CanvasProps['camera'];
  dpr?: CanvasProps['dpr'];
  gl?: CanvasProps['gl'];
  backgroundColor?: string;
}

export function ThreeProvider({
  children,
  camera = { position: [0, 0, 5], fov: 50 },
  dpr = [1, 2],
  gl = { antialias: true, alpha: true, powerPreference: 'high-performance' },
  backgroundColor = '#0A0F1A',
}: ThreeProviderProps) {
  return (
    <ThreeContext.Provider value={{ canvasProps: { camera, dpr, gl }, backgroundColor }}>
      {children}
    </ThreeContext.Provider>
  );
}

export function useThreeContext(): ThreeContextType {
  const context = useContext(ThreeContext);
  if (!context) {
    throw new Error('useThreeContext must be used within a ThreeProvider');
  }
  return context;
}