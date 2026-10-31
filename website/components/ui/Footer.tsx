'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/lib/animations/useReducedMotion';
import { fadeIn, slideUp } from '@/lib/animations/variants';
import { getTransition, transitions } from '@/lib/animations/transitions';
import { ScrollReveal } from '@/lib/animations/ScrollReveal';
import Link from 'next/link';
import clsx from 'clsx';

interface FooterProps {
  className?: string;
}

interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

export function Footer({ className = '' }: FooterProps) {
  const reducedMotion = useReducedMotion();

  const footerLinks: Record<string, FooterLink[]> = {
    product: [
      { label: 'Dashboard', href: '/' },
      { label: 'Live Monitoring', href: '/monitor' },
      { label: 'Alert History', href: '/history' },
      { label: 'Device Settings', href: '/settings' },
      { label: 'API Reference', href: '/docs/api' },
    ],
    resources: [
      { label: 'Documentation', href: '/docs' },
      { label: 'Getting Started', href: '/docs/getting-started' },
      { label: 'Hardware Guide', href: '/docs/hardware' },
      { label: 'Troubleshooting', href: '/docs/troubleshooting' },
      { label: 'FAQ', href: '/faq' },
    ],
    company: [
      { label: 'About GASTECT', href: '/about' },
      { label: 'Bizz Tycoons 2026', href: '/competition' },
      { label: 'Team', href: '/team' },
      { label: 'Contact', href: '/contact' },
      { label: 'Privacy Policy', href: '/privacy' },
    ],
    community: [
      { label: 'GitHub', href: 'https://github.com/gastect', external: true },
      { label: 'Discord', href: 'https://discord.gg/gastect', external: true },
      { label: 'Twitter', href: 'https://twitter.com/gastect', external: true },
      { label: 'Blog', href: '/blog' },
      { label: 'Contribute', href: '/contribute' },
    ],
  };

  const socialLinks = [
    { label: 'GitHub', icon: 'github', href: 'https://github.com/gastect' },
    { label: 'Discord', icon: 'discord', href: 'https://discord.gg/gastect' },
    { label: 'Twitter', icon: 'twitter', href: 'https://twitter.com/gastect' },
    { label: 'LinkedIn', icon: 'linkedin', href: 'https://linkedin.com/company/gastect' },
    { label: 'YouTube', icon: 'youtube', href: 'https://youtube.com/@gastect' },
  ];

  const techStack = [
    { name: 'Next.js 14', color: '#000000' },
    { name: 'React 18', color: '#61DAFB' },
    { name: 'TypeScript', color: '#3178C6' },
    { name: 'Three.js', color: '#000000' },
    { name: 'Framer Motion', color: '#0055FF' },
    { name: 'SQLite', color: '#003B57' },
    { name: 'Python 3.11', color: '#3776AB' },
    { name: 'Arduino C++', color: '#00979D' },
  ];

  return (
    <ScrollReveal variant="slideUp" className={clsx('footer', className)}>
      <footer
        style={{
          position: 'relative',
          background: 'var(--surface)',
          borderTop: '1px solid var(--border-subtle)',
          padding: 'var(--space-3xl) var(--space-xl) var(--space-xl)',
          marginTop: 'var(--space-3xl)',
        }}
      >
        {/* Animated background pattern */}
        {!reducedMotion && (
          <motion.div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `
                radial-gradient(circle at 20% 20%, var(--brand-primary)05 0%, transparent 50%),
                radial-gradient(circle at 80% 80%, var(--brand-secondary)05 0%, transparent 50%),
                radial-gradient(circle at 50% 50%, var(--safe)03 0%, transparent 60%)
              `,
              pointerEvents: 'none',
            }}
            animate={{
              backgroundPosition: [
                '20% 20%, 80% 80%, 50% 50%',
                '25% 25%, 75% 75%, 55% 55%',
                '20% 20%, 80% 80%, 50% 50%',
              ],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            aria-hidden="true"
          />
        )}

        <div
          style={{
            position: 'relative',
            zIndex: 1,
            maxWidth: '1400px',
            margin: '0 auto',
          }}
        >
          {/* Main grid */}
          <motion.div
            initial={reducedMotion ? undefined : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={getTransition({ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }, reducedMotion)}
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr repeat(4, 1fr)',
              gap: 'var(--space-2xl)',
              marginBottom: 'var(--space-2xl)',
            }}
          >
            {/* Brand column */}
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
                  marginBottom: 'var(--space-md)',
                }}
                aria-label="GASTECT Home"
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 48,
                    height: 48,
                    borderRadius: 'var(--radius-xl)',
                    background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))',
                    boxShadow: '0 0 30px var(--brand-glow)',
                  }}
                  aria-hidden="true"
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0A0F1A" strokeWidth="2.5">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </div>
                <span style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, letterSpacing: '-0.02em', fontFamily: 'var(--font-mono)' }}>
                  GASTECT
                </span>
              </Link>

              <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 'var(--space-lg)', maxWidth: 300 }}>
                Industrial-grade IoT gas leak detection system built for the Bizz Tycoons 2026 competition.
                Local-first architecture with real-time 3D visualization.
              </p>

              {/* Tech stack badges */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-xs)' }}>
                {techStack.map((tech, index) => (
                  <motion.span
                    key={tech.name}
                    initial={reducedMotion ? undefined : { opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={getTransition({ delay: 0.2 + index * 0.03, ...transitions.bouncy }, reducedMotion)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: 'var(--space-xs) var(--space-sm)',
                      fontSize: 'var(--text-xs)',
                      fontWeight: 500,
                      color: tech.color === '#000000' ? 'var(--surface)' : 'var(--text-primary)',
                      background: tech.color,
                      borderRadius: 'var(--radius-sm)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {tech.name}
                  </motion.span>
                ))}
              </div>
            </motion.div>

            {/* Link columns */}
            {Object.entries(footerLinks).map(([category, links], categoryIndex) => (
              <motion.div
                key={category}
                initial={reducedMotion ? undefined : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={getTransition({ delay: 0.15 + categoryIndex * 0.05, ...transitions.smooth }, reducedMotion)}
              >
                <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-primary)', marginBottom: 'var(--space-lg)' }}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                  {links.map((link, linkIndex) => (
                    <motion.li
                      key={link.href}
                      initial={reducedMotion ? undefined : { opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={getTransition({ delay: 0.2 + categoryIndex * 0.05 + linkIndex * 0.03, ...transitions.fast }, reducedMotion)}
                    >
                      <Link
                        href={link.href}
                        target={link.external ? '_blank' : undefined}
                        rel={link.external ? 'noopener noreferrer' : undefined}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 'var(--space-xs)',
                          fontSize: 'var(--text-sm)',
                          color: 'var(--text-secondary)',
                          textDecoration: 'none',
                          transition: 'color var(--duration-fast) ease, transform var(--duration-fast) ease',
                          padding: 'var(--space-xs) 0',
                        }}
                        onMouseEnter={(e) => { if (!reducedMotion) e.currentTarget.style.transform = 'translateX(4px)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateX(0)'; }}
                      >
                        {link.label}
                        {link.external && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                            <polyline points="15 3 21 3 21 9" />
                            <line x1="10" y1="14" x2="21" y2="3" />
                          </svg>
                        )}
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>

          {/* Social & Stats row */}
          <motion.div
            initial={reducedMotion ? undefined : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={getTransition({ delay: 0.3, ...transitions.smooth }, reducedMotion)}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 2fr 1fr',
              gap: 'var(--space-2xl)',
              paddingTop: 'var(--space-2xl)',
              borderTop: '1px solid var(--border-subtle)',
              marginBottom: 'var(--space-2xl)',
            }}
          >
            {/* Social links */}
            <div>
              <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-primary)', marginBottom: 'var(--space-md)' }}>
                Connect
              </h4>
              <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={reducedMotion ? undefined : { opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={getTransition({ delay: 0.35 + index * 0.05, ...transitions.bouncy }, reducedMotion)}
                    whileHover={!reducedMotion ? { scale: 1.15, y: -2 } : undefined}
                    whileTap={!reducedMotion ? { scale: 0.9 } : undefined}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 44,
                      height: 44,
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--surface-elevated)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-secondary)',
                      transition: 'all var(--duration-fast) ease',
                    }}
                    aria-label={social.label}
                  >
                    {getSocialIcon(social.icon)}
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Key stats */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-2xl)', flexWrap: 'wrap' }}>
              <StatItem label="Languages" value="15" icon="💻" reducedMotion={reducedMotion} delay={0.35} />
              <StatItem label="Sensors" value="17" icon="📡" reducedMotion={reducedMotion} delay={0.4} />
              <StatItem label="Uptime" value="99.9%" icon="⏱️" reducedMotion={reducedMotion} delay={0.45} />
              <StatItem label="Response" value="<100ms" icon="⚡" reducedMotion={reducedMotion} delay={0.5} />
            </div>

            {/* Status badge */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-md)',
                  padding: 'var(--space-md) var(--space-lg)',
                  background: 'rgba(0, 212, 200, 0.1)',
                  border: '1px solid var(--brand-primary)40',
                  borderRadius: 'var(--radius-xl)',
                }}
              >
                <div
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    background: 'var(--brand-primary)',
                    boxShadow: '0 0 12px var(--brand-glow)',
                    animation: reducedMotion ? 'none' : 'pulse 2s ease-in-out infinite',
                  }}
                  aria-hidden="true"
                />
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    System Status
                  </div>
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--brand-primary)', fontFamily: 'var(--font-mono)' }}>
                    OPERATIONAL
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Bottom bar */}
          <motion.div
            initial={reducedMotion ? undefined : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={getTransition({ delay: 0.4, ...transitions.smooth }, reducedMotion)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 'var(--space-md)',
              paddingTop: 'var(--space-lg)',
              borderTop: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
                © 2026 GASTECT. Built for Bizz Tycoons Competition.
              </p>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                v1.0.0
              </span>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>|</span>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                Local-First Architecture
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-lg)', flexWrap: 'wrap' }}>
              <Link
                href="/privacy"
                style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', textDecoration: 'none', transition: 'color var(--duration-fast) ease' }}
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', textDecoration: 'none', transition: 'color var(--duration-fast) ease' }}
              >
                Terms
              </Link>
              <Link
                href="/license"
                style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', textDecoration: 'none', transition: 'color var(--duration-fast) ease' }}
              >
                MIT License
              </Link>
              <a
                href="https://github.com/gastect"
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', textDecoration: 'none', transition: 'color var(--duration-fast) ease' }}
              >
                Open Source
              </a>
            </div>
          </motion.div>
        </div>
      </footer>
    </ScrollReveal>
  );
}

interface StatItemProps {
  label: string;
  value: string;
  icon: string;
  reducedMotion: boolean;
  delay: number;
}

function StatItem({ label, value, icon, reducedMotion, delay }: StatItemProps) {
  return (
    <motion.div
      initial={reducedMotion ? undefined : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={getTransition({ delay, ...transitions.smooth }, reducedMotion)}
      style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', textAlign: 'center' }}
    >
      <span style={{ fontSize: 'var(--text-xl)' }}>{icon}</span>
      <div>
        <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--brand-primary)', lineHeight: 1 }}>
          {value}
        </div>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}
        </div>
      </div>
    </motion.div>
  );
}

function getSocialIcon(name: string) {
  const icons: Record<string, React.ReactNode> = {
    github: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
      </svg>
    ),
    discord: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.675 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58 0 18.187a.083.083 0 0 0 .027.057.631.631 0 0 0 .079.043c.736.736 1.972 1.483 3.236 1.531a.42.42 0 0 0 .297-.065.42.42 0 0 0 .124-.227c.074-.634.267-2.133.38-2.54.279-1.295.923-2.469 1.768-3.205.77-.67 1.647-1.18 2.613-1.466.588-.175 1.136-.306 1.703-.306.574 0 1.115.137 1.697.312.978.286 1.84.796 2.626 1.466.845.736 1.489 1.91 1.768 3.205.108.417.313 1.916.376 2.55a.42.42 0 0 0 .421.27.42.42 0 0 0 .296-.065c1.248-.047 2.499-.794 3.206-1.53a.63.63 0 0 0 .079-.043c.294-5.237-.428-10.11-1.741-13.79a.061.061 0 0 0-.032-.027zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333 1.006-2.418 2.203-2.418 1.141 0 2.077.943 2.116 2.154h1.043c-.05-1.179-.998-2.16-2.148-2.16-1.597 0-2.868 1.505-2.868 3.21 0 1.852 1.398 3.173 2.913 3.173 1.179 0 2.28-.793 2.316-1.879H8.02zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.974-2.418 2.171-2.418 1.14 0 2.077.943 2.116 2.154h1.043c-.049-1.179-.997-2.16-2.147-2.16-1.598 0-2.868 1.505-2.868 3.21 0 1.852 1.398 3.173 2.913 3.173 1.178 0 2.28-.793 2.316-1.879h-1.064c-.037.973-.975 1.842-2.29 1.842-1.438 0-2.515-1.228-2.515-2.739zm-.432-3.323c0 .826-.759 1.344-1.364 1.344-.735 0-1.284-.642-1.284-1.393 0-.735.564-1.309 1.272-1.309.683 0 1.24.549 1.26 1.22h.116zm3.98 3.323c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.974-2.418 2.172-2.418 1.14 0 2.077.943 2.116 2.154h1.043c-.05-1.179-.998-2.16-2.147-2.16-1.598 0-2.868 1.505-2.868 3.21 0 1.852 1.398 3.173 2.912 3.173 1.179 0 2.28-.793 2.316-1.879h-1.064c-.037.973-.975 1.842-2.29 1.842-1.438 0-2.515-1.228-2.515-2.739zm-.432-3.323c0 .826-.759 1.344-1.364 1.344-.736 0-1.284-.642-1.284-1.393 0-.735.564-1.309 1.272-1.309.683 0 1.24.549 1.26 1.22h.116z" />
      </svg>
    ),
    twitter: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 9.24-3.303.955-7.227-8.26L3.309 24H0l7.816-8.83-8.056-8.75h3.308L11.46 12.59 3.023 3.36h3.649l6.794 7.75L23.976 2.25h-3.43l-7.327 8.29L12.487 2.25h-3.49l-6.615 7.52 7.41 8.21z" />
      </svg>
    ),
    linkedin: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
    youtube: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  };
  return icons[name] || icons.github;
}

// Cookie consent banner
interface CookieConsentProps {
  onAccept: () => void;
  onDecline: () => void;
}

export function CookieConsent({ onAccept, onDecline }: CookieConsentProps) {
  const reducedMotion = useReducedMotion();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (consent) setVisible(false);
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setVisible(false);
    onAccept();
  };

  const handleDecline = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setVisible(false);
    onDecline();
  };

  if (!visible) return null;

  return (
    <motion.div
      initial={reducedMotion ? undefined : { opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reducedMotion ? undefined : { opacity: 0, y: 100 }}
      transition={getTransition(transitions.smooth, reducedMotion)}
      style={{
        position: 'fixed',
        bottom: 'var(--space-xl)',
        left: 'var(--space-xl)',
        right: 'var(--space-xl)',
        maxWidth: 600,
        margin: '0 auto',
        zIndex: 9999,
        padding: 'var(--space-lg)',
        background: 'var(--surface-elevated)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-xl)',
        backdropFilter: 'blur(20px)',
      }}
      role="dialog"
      aria-label="Cookie consent"
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-md)' }}>
        <div style={{ flexShrink: 0, fontSize: 'var(--text-2xl)' }}>🍪</div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 'var(--space-md)' }}>
            We use cookies to enhance your experience and analyze traffic. By clicking "Accept", you consent to our use of cookies.
            <a href="/privacy" style={{ color: 'var(--brand-primary)', textDecoration: 'underline' }}>Learn more</a>
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
            <motion.button
              onClick={handleAccept}
              className="btn btn-primary"
              style={{ fontSize: 'var(--text-sm)' }}
              whileHover={!reducedMotion ? { scale: 1.02 } : undefined}
              whileTap={!reducedMotion ? { scale: 0.98 } : undefined}
            >
              Accept
            </motion.button>
            <motion.button
              onClick={handleDecline}
              className="btn btn-secondary"
              style={{ fontSize: 'var(--text-sm)' }}
              whileHover={!reducedMotion ? { scale: 1.02 } : undefined}
              whileTap={!reducedMotion ? { scale: 0.98 } : undefined}
            >
              Decline
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}