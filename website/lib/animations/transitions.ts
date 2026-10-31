'use client';

import { Transition } from 'framer-motion';

export const transitions = {
  // Smooth and natural
  smooth: {
    duration: 0.5,
    ease: [0.25, 0.46, 0.45, 0.94] as const,
  } satisfies Transition,

  // Quick and responsive
  snappy: {
    duration: 0.25,
    ease: [0.4, 0, 0.2, 1] as const,
  } satisfies Transition,

  // Bouncy and playful
  bouncy: {
    duration: 0.5,
    ease: [0.34, 1.56, 0.64, 1] as const,
  } satisfies Transition,

  // Slow and deliberate
  slow: {
    duration: 0.8,
    ease: [0.25, 0.46, 0.45, 0.94] as const,
  } satisfies Transition,

  // Very fast for micro-interactions
  fast: {
    duration: 0.15,
    ease: 'easeOut' as const,
  } satisfies Transition,

  // Spring configurations
  spring: {
    type: 'spring' as const,
    stiffness: 300,
    damping: 30,
  } satisfies Transition,

  springSoft: {
    type: 'spring' as const,
    stiffness: 200,
    damping: 25,
  } satisfies Transition,

  springStiff: {
    type: 'spring' as const,
    stiffness: 500,
    damping: 40,
  } satisfies Transition,

  // Page transitions
  pageEnter: {
    duration: 0.5,
    ease: [0.25, 0.46, 0.45, 0.94] as const,
  } satisfies Transition,

  pageExit: {
    duration: 0.3,
    ease: 'easeIn' as const,
  } satisfies Transition,

  // Modal/overlay
  modalOverlay: {
    duration: 0.2,
    ease: 'easeOut' as const,
  } satisfies Transition,

  modalContent: {
    duration: 0.3,
    ease: [0.25, 0.46, 0.45, 0.94] as const,
  } satisfies Transition,

  // Stagger delays
  staggerDelay: (index: number, baseDelay = 0.1) => ({
    delay: baseDelay * index,
  }),

  // Reduced motion - minimal animation
  reduced: {
    duration: 0.01,
    ease: 'linear' as const,
  } satisfies Transition,
};

// Helper to get transition based on reduced motion preference
export function getTransition(
  normal: Transition,
  reducedMotion: boolean
): Transition {
  return reducedMotion ? transitions.reduced : normal;
}

// Pre-computed common transition objects
export const commonTransitions = {
  fade: { opacity: transitions.smooth },
  slide: { y: transitions.smooth, opacity: transitions.smooth },
  scale: { scale: transitions.snappy, opacity: transitions.fast },
  rotate: { rotate: transitions.slow },
  all: {
    opacity: transitions.smooth,
    y: transitions.smooth,
    scale: transitions.snappy
  },
};