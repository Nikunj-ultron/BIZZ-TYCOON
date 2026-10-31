'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, MotionProps } from 'framer-motion';
import { useReducedMotion } from './useReducedMotion';
import { getTransition, transitions } from './transitions';

interface ScrollRevealProps extends Omit<MotionProps, 'initial' | 'whileInView' | 'viewport' | 'children'> {
  children: React.ReactNode;
  variant?: 'fade' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'scale';
  delay?: number;
  duration?: number;
  once?: boolean;
  threshold?: number;
  rootMargin?: string;
  className?: string;
}

const variantMap = {
  fade: { hidden: { opacity: 0 }, visible: { opacity: 1 } },
  slideUp: { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } },
  slideDown: { hidden: { opacity: 0, y: -30 }, visible: { opacity: 1, y: 0 } },
  slideLeft: { hidden: { opacity: 0, x: -30 }, visible: { opacity: 1, x: 0 } },
  slideRight: { hidden: { opacity: 0, x: 30 }, visible: { opacity: 1, x: 0 } },
  scale: { hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } },
};

export function ScrollReveal({
  children,
  variant = 'slideUp',
  delay = 0,
  duration = 0.6,
  once = true,
  threshold = 0.1,
  rootMargin = '0px 0px -50px 0px',
  className = '',
  style,
  ...props
}: ScrollRevealProps) {
  const reducedMotion = useReducedMotion();
  const [isInView, setIsInView] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reducedMotion) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          if (once) {
            observer.unobserve(entry.target);
          }
        } else if (!once) {
          setIsInView(false);
        }
      },
      { threshold, rootMargin }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin, once, reducedMotion]);

  const transition = getTransition(
    { duration, delay, ease: [0.25, 0.46, 0.45, 0.94] },
    reducedMotion
  );

  const variants = variantMap[variant];

  return (
    <motion.div
      ref={elementRef}
      initial={reducedMotion ? undefined : variants.hidden}
      animate={isInView ? variants.visible : variants.hidden}
      transition={transition}
      className={className}
      style={style}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// StaggerContainer for staggered children animations
interface StaggerContainerProps extends Omit<MotionProps, 'initial' | 'animate' | 'variants'> {
  children: React.ReactNode;
  staggerDelay?: number;
  delayChildren?: number;
  className?: string;
  variant?: keyof typeof variantMap;
  direction?: 'up' | 'down' | 'left' | 'right';
}

export function StaggerContainer({
  children,
  staggerDelay = 0.1,
  delayChildren = 0.1,
  className = '',
  variant = 'slideUp',
  ...props
}: StaggerContainerProps) {
  const reducedMotion = useReducedMotion();
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reducedMotion) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [reducedMotion]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren,
      },
    },
  };

  const childVariants = variantMap[variant];

  return (
    <motion.div
      ref={containerRef}
      initial={reducedMotion ? undefined : containerVariants.hidden}
      animate={isInView ? containerVariants.visible : containerVariants.hidden}
      className={className}
      {...props}
    >
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child;
        return React.cloneElement(child as React.ReactElement, {
          variants: childVariants,
          transition: getTransition(
            { duration: 0.5, delay: index * staggerDelay, ease: [0.25, 0.46, 0.45, 0.94] },
            reducedMotion
          ),
        });
      })}
    </motion.div>
  );
}

// Parallax component
interface ParallaxProps {
  children: React.ReactNode;
  speed?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function Parallax({ children, speed = 0.5, className = '', style }: ParallaxProps) {
  const reducedMotion = useReducedMotion();
  const [offset, setOffset] = useState(0);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reducedMotion) return;

    const handleScroll = () => {
      if (!elementRef.current) return;
      const rect = elementRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const scrollProgress = (viewportHeight - rect.top) / (viewportHeight + rect.height);
      const clampedProgress = Math.max(0, Math.min(1, scrollProgress));
      setOffset((clampedProgress - 0.5) * 100 * speed);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed, reducedMotion]);

  return (
    <div
      ref={elementRef}
      className={className}
      style={{
        ...style,
        transform: `translateY(${offset}px)`,
        willChange: 'transform',
      }}
    >
      {children}
    </div>
  );
}

