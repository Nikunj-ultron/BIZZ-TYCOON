'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useReducedMotion as useReducedMotionHook } from './useReducedMotion';

interface ReducedMotionContextType {
  reducedMotion: boolean;
}

const ReducedMotionContext = createContext<ReducedMotionContextType | undefined>(undefined);

export function ReducedMotionProvider({ children }: { children: ReactNode }) {
  const reducedMotion = useReducedMotionHook();

  return (
    <ReducedMotionContext.Provider value={{ reducedMotion }}>
      {children}
    </ReducedMotionContext.Provider>
  );
}

export function useReducedMotion(): boolean {
  const context = useContext(ReducedMotionContext);
  if (context === undefined) {
    // Fallback to hook if provider not used
    return useReducedMotionHook();
  }
  return context.reducedMotion;
}