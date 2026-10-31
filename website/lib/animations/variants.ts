'use client';

import { Variants } from 'framer-motion';

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

export const slideUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

export const slideDown: Variants = {
  hidden: { opacity: 0, y: -30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

export const slideLeft: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

export const slideRight: Variants = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

export const scaleOut: Variants = {
  hidden: { opacity: 0, scale: 1.1 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};

export const scaleUp: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

export const rotateIn: Variants = {
  hidden: { opacity: 0, rotate: -180, scale: 0.5 },
  visible: {
    opacity: 1,
    rotate: 0,
    scale: 1,
    transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

export const stagger: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

export const staggerFast: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
};

export const staggerSlow: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: 'easeIn' } },
};

export const cardHover: Variants = {
  rest: { scale: 1, y: 0, boxShadow: 'var(--shadow-lg)' },
  hover: {
    scale: 1.02,
    y: -4,
    boxShadow: 'var(--shadow-xl)',
    transition: { duration: 0.2, ease: 'easeOut' },
  },
  tap: { scale: 0.98 },
};

export const buttonPress: Variants = {
  rest: { scale: 1 },
  hover: { scale: 1.02, transition: { duration: 0.15 } },
  tap: { scale: 0.97, transition: { duration: 0.1 } },
};

export const pulse: Variants = {
  rest: { scale: 1 },
  animate: {
    scale: [1, 1.05, 1],
    transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
  },
};

export const pulseGlow: Variants = {
  rest: { opacity: 0.5 },
  animate: {
    opacity: [0.5, 1, 0.5],
    transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
  },
};

export const shimmer: Variants = {
  hidden: { backgroundPosition: '-200% 0' },
  visible: {
    backgroundPosition: '200% 0',
    transition: { duration: 1.5, repeat: Infinity, ease: 'linear' },
  },
};

export const float: Variants = {
  animate: {
    y: [0, -10, 0],
    transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
  },
};

export const spin: Variants = {
  animate: {
    rotate: 360,
    transition: { duration: 10, repeat: Infinity, ease: 'linear' },
  },
};

export const accordion: Variants = {
  closed: { height: 0, opacity: 0 },
  open: { height: 'auto', opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } },
};

export const modalBackdrop: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

export const modalContent: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.2, ease: 'easeIn' } },
};

export const toastEnter: Variants = {
  hidden: { opacity: 0, x: 100, scale: 0.9 },
  visible: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit: { opacity: 0, x: 100, scale: 0.9, transition: { duration: 0.3, ease: 'easeIn' } },
};

export const listItem: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { opacity: 0, x: 20, transition: { duration: 0.2, ease: 'easeIn' } },
};

export const navLink: Variants = {
  rest: { color: 'var(--text-secondary)' },
  hover: { color: 'var(--brand-primary)', transition: { duration: 0.2 } },
  active: { color: 'var(--brand-primary)' },
};

export const statusPulse: Record<string, Variants> = {
  SAFE: {
    animate: {
      boxShadow: ['0 0 0 0 rgba(0, 230, 118, 0.4)', '0 0 0 12px rgba(0, 230, 118, 0)', '0 0 0 0 rgba(0, 230, 118, 0.4)'],
      transition: { duration: 2, repeat: Infinity },
    },
  },
  WARNING: {
    animate: {
      boxShadow: ['0 0 0 0 rgba(255, 214, 0, 0.4)', '0 0 0 12px rgba(255, 214, 0, 0)', '0 0 0 0 rgba(255, 214, 0, 0.4)'],
      transition: { duration: 1.5, repeat: Infinity },
    },
  },
  DANGER: {
    animate: {
      boxShadow: ['0 0 0 0 rgba(255, 61, 0, 0.5)', '0 0 0 12px rgba(255, 61, 0, 0)', '0 0 0 0 rgba(255, 61, 0, 0.5)'],
      transition: { duration: 1, repeat: Infinity },
    },
  },
};