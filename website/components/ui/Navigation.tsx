'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '@/lib/animations/useReducedMotion';
import { slideDown, fadeIn, scaleUp } from '@/lib/animations/variants';
import { getTransition, transitions } from '@/lib/animations/transitions';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import Link from 'next/link';

interface NavigationProps {
  connected: boolean;
  status: 'SAFE' | 'WARNING' | 'DANGER' | 'UNKNOWN';
  ppm: number;
  className?: string;
}

const navItems = [
  { href: '/', label: 'Dashboard', icon: '🏠' },
  { href: '/about', label: 'About', icon: 'ℹ️' },
  { href: '/docs', label: 'Documentation', icon: '📚' },
  { href: '/settings', label: 'Settings', icon: '⚙️' },
];

export function Navigation({ connected, status, ppm, className = '' }: NavigationProps) {
  const reducedMotion = useReducedMotion();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const statusConfig = {
    SAFE: { color: 'var(--safe)', label: 'SAFE', pulse: true, border: 'var(--safe)' },
    WARNING: { color: 'var(--warning)', label: 'WARN', pulse: true, border: 'var(--warning)' },
    DANGER: { color: 'var(--danger)', label: 'DANGER', pulse: true, border: 'var(--danger)' },
    UNKNOWN: { color: 'var(--text-muted)', label: 'OFFLINE', pulse: false, border: 'var(--text-muted)' },
  };

  const config = statusConfig[status];

  return (
    <>
      {/* Progress bar at top */}
      <motion.div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(90deg, ${config.color}, ${config.color}80, ${config.color})`,
          backgroundSize: '200% 100%',
          zIndex: 1000,
          transformOrigin: 'left center',
        }}
        initial={reducedMotion ? undefined : { scaleX: 0 }}
        animate={{
          scaleX: 1,
          ...(!reducedMotion ? { backgroundPosition: ['0%', '100%', '0%'] } : {}),
        }}
        transition={[
          getTransition({ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }, reducedMotion),
          { duration: 4, repeat: Infinity, ease: 'linear' },
        ]}
        aria-hidden="true"
      />

      <motion.header
        className={clsx('navigation', className)}
        initial={reducedMotion ? undefined : { y: -100 }}
        animate={{ y: 0 }}
        transition={getTransition({ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }, reducedMotion)}
        style={{
          position: 'fixed',
          top: 3,
          left: 0,
          right: 0,
          zIndex: 999,
          background: scrolled ? 'rgba(10, 15, 26, 0.95)' : 'rgba(10, 15, 26, 0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${scrolled ? 'var(--border-subtle)' : 'transparent'}`,
          transition: 'background var(--duration-normal) ease, border-color var(--duration-normal) ease',
        }}
      >
        <nav
          style={{
            maxWidth: '1400px',
            margin: '0 auto',
            padding: 'var(--space-md) var(--space-xl)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--space-lg)',
          }}
          aria-label="Main navigation"
        >
          {/* Logo */}
          <motion.div
            initial={reducedMotion ? undefined : { opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={getTransition({ delay: 0.1, ...transitions.smooth }, reducedMotion)}
          >
            <Link
              href="/"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-sm)',
                textDecoration: 'none',
                color: 'var(--text-primary)',
              }}
              aria-label="GASTECT Home"
            >
              <motion.span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 40,
                  height: 40,
                  borderRadius: 'var(--radius-lg)',
                  background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))',
                  boxShadow: '0 0 20px var(--brand-glow)',
                }}
                animate={!reducedMotion ? { rotateZ: [0, 2, -2, 0] } : {}}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                aria-hidden="true"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0A0F1A" strokeWidth="2.5">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </motion.span>
              <span style={{ fontSize: 'var(--text-xl)', fontWeight: 700, letterSpacing: '-0.02em', fontFamily: 'var(--font-mono)' }}>
                GASTECT
              </span>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <motion.div
            className="nav-desktop"
            initial={reducedMotion ? undefined : { opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={getTransition({ delay: 0.15, ...transitions.smooth }, reducedMotion)}
            style={{
              display: 'none',
              alignItems: 'center',
              gap: 'var(--space-xs)',
            }}
          >
            {navItems.map((item, index) => (
              <motion.div
                key={item.href}
                initial={reducedMotion ? undefined : { opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={getTransition({ delay: 0.2 + index * 0.05, ...transitions.smooth }, reducedMotion)}
              >
                <Link
                  href={item.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-xs)',
                    padding: 'var(--space-sm) var(--space-md)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 500,
                    color: pathname === item.href ? 'var(--brand-primary)' : 'var(--text-secondary)',
                    textDecoration: 'none',
                    borderRadius: 'var(--radius-md)',
                    transition: 'all var(--duration-fast) ease',
                    position: 'relative',
                  }}
                  aria-current={pathname === item.href ? 'page' : undefined}
                >
                  <span style={{ fontSize: 'var(--text-base)' }}>{item.icon}</span>
                  <span>{item.label}</span>
                  {pathname === item.href && (
                    <motion.span
                      style={{
                        position: 'absolute',
                        bottom: -2,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 20,
                        height: 3,
                        borderRadius: 'var(--radius-full)',
                        background: 'var(--brand-primary)',
                      }}
                      initial={reducedMotion ? undefined : { scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={getTransition(transitions.bouncy, reducedMotion)}
                    />
                  )}
                </Link>
              </motion.div>
            ))}
          </motion.div>

          {/* Right side - Status & Actions */}
          <motion.div
            initial={reducedMotion ? undefined : { opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={getTransition({ delay: 0.2, ...transitions.smooth }, reducedMotion)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-md)',
            }}
          >
            {/* Live Status Badge */}
            <motion.div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-sm)',
                padding: 'var(--space-xs) var(--space-md)',
                borderRadius: 'var(--radius-full)',
                background: `rgba(${config.color.replace('var(--', '').replace(')', '')}, 0.12)`,
                border: `1px solid ${config.border}40`,
              }}
              animate={config.pulse && !reducedMotion ? { boxShadow: ['0 0 0 0 var(--safe-glow)', '0 0 16px 4px var(--safe-glow)', '0 0 0 0 var(--safe-glow)'] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <motion.span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: config.color,
                  boxShadow: `0 0 8px ${config.color}`,
                }}
                animate={config.pulse && !reducedMotion ? { scale: [1, 1.4, 1] } : {}}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                aria-hidden="true"
              />
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: config.color, fontFamily: 'var(--font-mono)' }}>
                {config.label}
              </span>
            </motion.div>

            {/* PPM Display */}
            <motion.div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-xs)',
                padding: 'var(--space-xs) var(--space-md)',
                background: 'var(--surface-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                minWidth: 100,
              }}
            >
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>PPM</span>
              <span style={{ fontSize: 'var(--text-base)', fontWeight: 700, fontFamily: 'var(--font-mono)', color: config.color }}>
                {ppm.toLocaleString()}
              </span>
            </motion.div>

            {/* Connection Status */}
            <ConnectionDot connected={connected} reducedMotion={reducedMotion} />

            {/* Mobile Menu Button */}
            <motion.button
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 44,
                height: 44,
                borderRadius: 'var(--radius-md)',
                background: 'var(--surface-elevated)',
                border: '1px solid var(--border-subtle)',
                cursor: 'pointer',
              }}
              whileHover={!reducedMotion ? { background: 'var(--surface)', scale: 1.05 } : undefined}
              whileTap={!reducedMotion ? { scale: 0.95 } : undefined}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {mobileMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <>
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </>
                )}
              </svg>
            </motion.button>
          </motion.div>
        </nav>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              id="mobile-menu"
              initial={reducedMotion ? undefined : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={reducedMotion ? undefined : { opacity: 0, height: 0 }}
              transition={getTransition({ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }, reducedMotion)}
              style={{
                overflow: 'hidden',
                background: 'rgba(10, 15, 26, 0.98)',
                backdropFilter: 'blur(20px)',
                borderBottom: '1px solid var(--border-subtle)',
                padding: 'var(--space-md) var(--space-xl)',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                {navItems.map((item, index) => (
                  <motion.button
                    key={item.href}
                    onClick={() => { setMobileMenuOpen(false); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-md)',
                      padding: 'var(--space-md)',
                      fontSize: 'var(--text-base)',
                      fontWeight: 500,
                      color: pathname === item.href ? 'var(--brand-primary)' : 'var(--text-primary)',
                      background: pathname === item.href ? 'rgba(0, 212, 200, 0.1)' : 'transparent',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all var(--duration-fast) ease',
                    }}
                    whileHover={!reducedMotion ? { background: pathname === item.href ? 'rgba(0, 212, 200, 0.2)' : 'var(--surface-elevated)', x: 4 } : undefined}
                    initial={reducedMotion ? undefined : { opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={getTransition({ delay: index * 0.05, ...transitions.smooth }, reducedMotion)}
                  >
                    <span style={{ fontSize: 'var(--text-xl)' }}>{item.icon}</span>
                    <span>{item.label}</span>
                  </motion.button>
                ))}

                {/* Mobile Status Card */}
                <motion.div
                  initial={reducedMotion ? undefined : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={getTransition({ delay: 0.3, ...transitions.smooth }, reducedMotion)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 'var(--space-md)',
                    background: 'var(--surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-lg)',
                    marginTop: 'var(--space-sm)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                    <div
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        background: config.color,
                        boxShadow: `0 0 12px ${config.color}`,
                      }}
                    />
                    <div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</div>
                      <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: config.color, textTransform: 'uppercase' }}>{config.label}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Gas Level</div>
                    <div style={{ fontSize: 'var(--text-lg)', fontWeight: 700, fontFamily: 'var(--font-mono)', color: config.color }}>{ppm.toLocaleString()} PPM</div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Spacer for fixed header */}
      <div style={{ height: 'var(--nav-height, 72px)' }} aria-hidden="true" />
    </>
  );
}

interface ConnectionDotProps {
  connected: boolean;
  reducedMotion: boolean;
}

function ConnectionDot({ connected, reducedMotion }: ConnectionDotProps) {
  return (
    <motion.button
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 44,
        height: 44,
        borderRadius: 'var(--radius-md)',
        background: connected ? 'rgba(0, 230, 118, 0.1)' : 'rgba(255, 61, 0, 0.1)',
        border: `1px solid ${connected ? 'var(--safe)' : 'var(--danger)'}40`,
        cursor: 'default',
      }}
      animate={
        connected && !reducedMotion
          ? { boxShadow: ['0 0 0 0 var(--safe-glow)', '0 0 12px 4px var(--safe-glow)', '0 0 0 0 var(--safe-glow)'] }
          : undefined
      }
      transition={{ duration: 2, repeat: Infinity }}
    >
      <motion.span
        style={{
          width: 10,
          height: 10,
          borderRadius: '50%',
          background: connected ? 'var(--safe)' : 'var(--danger)',
          boxShadow: `0 0 10px ${connected ? 'var(--safe)' : 'var(--danger)'}`,
        }}
        animate={connected && !reducedMotion ? { scale: [1, 1.3, 1] } : {}}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        aria-hidden="true"
      />
    </motion.button>
  );
}

// Breadcrumb component
interface BreadcrumbProps {
  items: Array<{ label: string; href?: string }>;
  className?: string;
}

export function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.nav
      className={clsx('breadcrumb', className)}
      initial={reducedMotion ? undefined : { opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={getTransition(transitions.smooth, reducedMotion)}
      style={{
        padding: 'var(--space-sm) 0',
      }}
      aria-label="Breadcrumb"
    >
      <ol style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', flexWrap: 'wrap', listStyle: 'none', margin: 0, padding: 0 }}>
        {items.map((item, index) => (
          <motion.li
            key={item.href || item.label}
            initial={reducedMotion ? undefined : { opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={getTransition({ delay: index * 0.05, ...transitions.smooth }, reducedMotion)}
            style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}
          >
            {index > 0 && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            )}
            {item.href ? (
              <Link
                href={item.href}
                style={{
                  fontSize: 'var(--text-sm)',
                  color: index === items.length - 1 ? 'var(--text-primary)' : 'var(--text-muted)',
                  fontWeight: index === items.length - 1 ? 600 : 400,
                  textDecoration: 'none',
                  transition: 'color var(--duration-fast) ease',
                }}
                aria-current={index === items.length - 1 ? 'page' : undefined}
              >
                {item.label}
              </Link>
            ) : (
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', fontWeight: 600 }}>{item.label}</span>
            )}
          </motion.li>
        ))}
      </ol>
    </motion.nav>
  );
}