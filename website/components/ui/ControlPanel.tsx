'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '@/lib/animations/useReducedMotion';
import { slideUp, fadeIn } from '@/lib/animations/variants';
import { getTransition, transitions } from '@/lib/animations/transitions';
import { ScrollReveal } from '@/lib/animations/ScrollReveal';
import clsx from 'clsx';

interface ControlPanelProps {
  connected: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onSendCommand: (command: string, params?: Record<string, any>) => void;
  thresholds: { warn: number; danger: number };
  onThresholdChange: (warn: number, danger: number) => void;
  className?: string;
}

export function ControlPanel({
  connected,
  onConnect,
  onDisconnect,
  onSendCommand,
  thresholds,
  onThresholdChange,
  className = '',
}: ControlPanelProps) {
  const reducedMotion = useReducedMotion();
  const [warnThreshold, setWarnThreshold] = useState(thresholds.warn);
  const [dangerThreshold, setDangerThreshold] = useState(thresholds.danger);
  const [expanded, setExpanded] = useState(true);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'controls' | 'thresholds' | 'logs'>('controls');

  const addToHistory = (command: string) => {
    setCommandHistory(prev => [`[${new Date().toLocaleTimeString()}] ${command}`, ...prev.slice(0, 9)]);
  };

  const handleSendCommand = (command: string, params?: Record<string, any>) => {
    onSendCommand(command, params);
    addToHistory(`${command}${params ? ` ${JSON.stringify(params)}` : ''}`);
  };

  const handleThresholdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (warnThreshold >= dangerThreshold) return;
    onThresholdChange(warnThreshold, dangerThreshold);
    addToHistory(`THRESHOLD_UPDATE warn=${warnThreshold} danger=${dangerThreshold}`);
  };

  return (
    <ScrollReveal variant="slideUp" className={clsx('control-panel', className)}>
      <aside
        style={{
          position: 'sticky',
          top: 'var(--space-xl)',
          height: 'fit-content',
          maxHeight: 'calc(100vh - var(--space-xl))',
          overflowY: 'auto',
        }}
      >
        {/* Connection Card */}
        <motion.section
          className={clsx('control-card', 'connection-card')}
          initial={reducedMotion ? undefined : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={getTransition({ delay: 0.05, ...transitions.smooth }, reducedMotion)}
          style={{
            background: 'var(--surface-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-lg)',
            marginBottom: 'var(--space-md)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-md)' }}>
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
              <span style={{ fontSize: 'var(--text-lg)' }}>📡</span>
              Connection
            </h3>
            <ConnectionIndicator connected={connected} reducedMotion={reducedMotion} />
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
            <motion.button
              onClick={onConnect}
              disabled={connected}
              className={clsx('btn', connected ? 'btn-secondary' : 'btn-primary')}
              style={{
                flex: 1,
                padding: 'var(--space-sm) var(--space-md)',
                fontSize: 'var(--text-sm)',
              }}
              whileHover={!reducedMotion && !connected ? { scale: 1.02 } : undefined}
              whileTap={!reducedMotion ? { scale: 0.98 } : undefined}
            >
              {connected ? 'Connected' : 'Connect'}
            </motion.button>
            <motion.button
              onClick={onDisconnect}
              disabled={!connected}
              className={clsx('btn btn-danger')}
              style={{
                flex: 1,
                padding: 'var(--space-sm) var(--space-md)',
                fontSize: 'var(--text-sm)',
              }}
              whileHover={!reducedMotion && connected ? { scale: 1.02 } : undefined}
              whileTap={!reducedMotion ? { scale: 0.98 } : undefined}
            >
              Disconnect
            </motion.button>
          </div>

          <div style={{ marginTop: 'var(--space-md)', paddingTop: 'var(--space-md)', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 'var(--text-xs)' }}>
              <span style={{ color: 'var(--text-muted)' }}>WebSocket</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>ws://localhost:8765</span>
            </div>
          </div>
        </motion.section>

        {/* Tab Navigation */}
        <motion.div
          initial={reducedMotion ? undefined : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={getTransition({ delay: 0.1, ...transitions.smooth }, reducedMotion)}
          style={{ marginBottom: 'var(--space-md)' }}
          role="tablist"
          aria-label="Control panel tabs"
        >
          {['controls', 'thresholds', 'logs'].map((tab) => (
            <motion.button
              key={tab}
              role="tab"
              aria-selected={activeTab === tab}
              aria-controls={`${tab}-panel`}
              id={`${tab}-tab`}
              onClick={() => setActiveTab(tab as 'controls' | 'thresholds' | 'logs')}
              className={clsx('control-tab', activeTab === tab && 'active')}
              style={{
                flex: 1,
                padding: 'var(--space-sm) var(--space-md)',
                fontSize: 'var(--text-xs)',
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: activeTab === tab ? 'var(--brand-primary)' : 'var(--text-muted)',
                background: activeTab === tab ? 'rgba(0, 212, 200, 0.1)' : 'transparent',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                borderBottom: activeTab === tab ? '2px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
                marginRight: 'var(--space-xs)',
                cursor: 'pointer',
                transition: 'all var(--duration-fast) ease',
              }}
              whileHover={!reducedMotion ? { background: activeTab === tab ? 'rgba(0, 212, 200, 0.2)' : 'var(--surface-elevated)' } : undefined}
              whileTap={!reducedMotion ? { scale: 0.98 } : undefined}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </motion.button>
          ))}
        </motion.div>

        {/* Tab Panels */}
        <AnimatePresence mode="wait">
          {/* Controls Tab */}
          <motion.div
            key={activeTab === 'controls' ? 'controls' : null}
            initial={reducedMotion ? undefined : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? undefined : { opacity: 0, y: -10 }}
            transition={getTransition(transitions.smooth, reducedMotion)}
            id="controls-panel"
            role="tabpanel"
            aria-labelledby="controls-tab"
          >
            <motion.section
              className={clsx('control-card')}
              initial={reducedMotion ? undefined : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={getTransition({ delay: 0.15, ...transitions.smooth }, reducedMotion)}
              style={{
                background: 'var(--surface-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-xl)',
                padding: 'var(--space-lg)',
                marginBottom: 'var(--space-md)',
              }}
            >
              <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                <span style={{ fontSize: 'var(--text-lg)' }}>🎛️</span>
                Device Controls
              </h3>

              <div style={{ display: 'grid', gap: 'var(--space-sm)' }}>
                <ControlButton
                  label="Test Alarm"
                  icon="🔔"
                  onClick={() => handleSendCommand('test_alarm')}
                  variant="warning"
                  reducedMotion={reducedMotion}
                />
                <ControlButton
                  label="Silence Buzzer"
                  icon="🔕"
                  onClick={() => handleSendCommand('silence')}
                  variant="primary"
                  reducedMotion={reducedMotion}
                />
                <ControlButton
                  label="Calibrate Sensors"
                  icon="🔧"
                  onClick={() => handleSendCommand('calibrate')}
                  variant="secondary"
                  reducedMotion={reducedMotion}
                />
                <ControlButton
                  label="Reset System"
                  icon="🔄"
                  onClick={() => handleSendCommand('reset')}
                  variant="danger"
                  reducedMotion={reducedMotion}
                />
                <ControlButton
                  label="Open Valve (Servo 0°)"
                  icon="⚙️"
                  onClick={() => handleSendCommand('servo', { angle: 0 })}
                  variant="secondary"
                  reducedMotion={reducedMotion}
                />
                <ControlButton
                  label="Close Valve (Servo 180°)"
                  icon="🔒"
                  onClick={() => handleSendCommand('servo', { angle: 180 })}
                  variant="secondary"
                  reducedMotion={reducedMotion}
                />
              </div>
            </motion.section>
          </motion.div>

          {/* Thresholds Tab */}
          <motion.div
            key={activeTab === 'thresholds' ? 'thresholds' : null}
            initial={reducedMotion ? undefined : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? undefined : { opacity: 0, y: -10 }}
            transition={getTransition(transitions.smooth, reducedMotion)}
            id="thresholds-panel"
            role="tabpanel"
            aria-labelledby="thresholds-tab"
          >
            <motion.section
              className={clsx('control-card')}
              initial={reducedMotion ? undefined : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={getTransition({ delay: 0.15, ...transitions.smooth }, reducedMotion)}
              style={{
                background: 'var(--surface-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-xl)',
                padding: 'var(--space-lg)',
              }}
            >
              <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                <span style={{ fontSize: 'var(--text-lg)' }}>⚠️</span>
                Alert Thresholds
              </h3>

              <form onSubmit={handleThresholdSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                <ThresholdSlider
                  label="Warning Threshold"
                  unit="PPM"
                  value={warnThreshold}
                  onChange={setWarnThreshold}
                  min={50}
                  max={450}
                  step={10}
                  color="var(--warning)"
                  reducedMotion={reducedMotion}
                />

                <ThresholdSlider
                  label="Danger Threshold"
                  unit="PPM"
                  value={dangerThreshold}
                  onChange={setDangerThreshold}
                  min={250}
                  max={1000}
                  step={10}
                  color="var(--danger)"
                  reducedMotion={reducedMotion}
                />

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-sm)', background: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Gap</span>
                  <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, fontFamily: 'var(--font-mono)', color: dangerThreshold - warnThreshold < 100 ? 'var(--warning)' : 'var(--safe)' }}>
                    {dangerThreshold - warnThreshold} PPM
                  </span>
                </div>

                <motion.button
                  type="submit"
                  disabled={warnThreshold >= dangerThreshold}
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: 'var(--space-sm)' }}
                  whileHover={!reducedMotion && warnThreshold < dangerThreshold ? { scale: 1.01 } : undefined}
                  whileTap={!reducedMotion ? { scale: 0.98 } : undefined}
                >
                  Apply Thresholds
                </motion.button>
              </form>
            </motion.section>
          </motion.div>

          {/* Logs Tab */}
          <motion.div
            key={activeTab === 'logs' ? 'logs' : null}
            initial={reducedMotion ? undefined : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? undefined : { opacity: 0, y: -10 }}
            transition={getTransition(transitions.smooth, reducedMotion)}
            id="logs-panel"
            role="tabpanel"
            aria-labelledby="logs-tab"
          >
            <motion.section
              className={clsx('control-card')}
              initial={reducedMotion ? undefined : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={getTransition({ delay: 0.15, ...transitions.smooth }, reducedMotion)}
              style={{
                background: 'var(--surface-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-xl)',
                padding: 'var(--space-lg)',
                maxHeight: 300,
                overflow: 'hidden',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-md)' }}>
                <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                  <span style={{ fontSize: 'var(--text-lg)' }}>📋</span>
                  Command Log
                </h3>
                <motion.button
                  onClick={() => setCommandHistory([])}
                  className="btn btn-ghost"
                  style={{ padding: 'var(--space-xs) var(--space-sm)', fontSize: 'var(--text-xs)' }}
                  whileHover={!reducedMotion ? { scale: 1.05 } : undefined}
                  whileTap={!reducedMotion ? { scale: 0.95 } : undefined}
                >
                  Clear
                </motion.button>
              </div>

              <div
                style={{
                  maxHeight: 200,
                  overflowY: 'auto',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-xs)',
                  lineHeight: 1.6,
                  color: 'var(--text-secondary)',
                }}
              >
                {commandHistory.length === 0 ? (
                  <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 'var(--space-lg)' }}>No commands sent yet</div>
                ) : (
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {commandHistory.map((entry, index) => (
                      <motion.li
                        key={index}
                        initial={reducedMotion ? undefined : { opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={getTransition({ delay: index * 0.02, ...transitions.fast }, reducedMotion)}
                        style={{ padding: 'var(--space-xs) 0', borderBottom: '1px solid var(--border-subtle)', opacity: index > 5 ? 0.7 - index * 0.05 : 1 }}
                      >
                        {entry}
                      </motion.li>
                    ))}
                  </ul>
                )}
              </div>
            </motion.section>
          </motion.div>
        </AnimatePresence>
      </aside>
    </ScrollReveal>
  );
}

interface ConnectionIndicatorProps {
  connected: boolean;
  reducedMotion: boolean;
}

function ConnectionIndicator({ connected, reducedMotion }: ConnectionIndicatorProps) {
  return (
    <motion.div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-xs)',
        padding: 'var(--space-xs) var(--space-sm)',
        borderRadius: 'var(--radius-full)',
        background: connected ? 'rgba(0, 230, 118, 0.15)' : 'rgba(255, 61, 0, 0.15)',
        border: `1px solid ${connected ? 'var(--safe)' : 'var(--danger)'}40`,
      }}
      animate={{
        boxShadow: connected && !reducedMotion ? ['0 0 0 0 var(--safe-glow)', '0 0 12px 4px var(--safe-glow)', '0 0 0 0 var(--safe-glow)'] : undefined,
      }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
    >
      <motion.span
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: connected ? 'var(--safe)' : 'var(--danger)',
          boxShadow: `0 0 8px ${connected ? 'var(--safe)' : 'var(--danger)'}`,
        }}
        animate={connected && !reducedMotion ? { scale: [1, 1.3, 1] } : {}}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: connected ? 'var(--safe)' : 'var(--danger)' }}>
        {connected ? 'Online' : 'Offline'}
      </span>
    </motion.div>
  );
}

interface ControlButtonProps {
  label: string;
  icon: string;
  onClick: () => void;
  variant: 'primary' | 'secondary' | 'warning' | 'danger';
  reducedMotion: boolean;
}

function ControlButton({ label, icon, onClick, variant, reducedMotion }: ControlButtonProps) {
  const variantStyles = {
    primary: { bg: 'var(--brand-primary)', color: 'var(--surface)', border: 'none', hoverBg: 'var(--brand-primary-hover)' },
    secondary: { bg: 'var(--surface)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)', hoverBg: 'var(--surface-elevated)' },
    warning: { bg: 'rgba(255, 214, 0, 0.15)', color: 'var(--warning)', border: '1px solid var(--warning)40', hoverBg: 'rgba(255, 214, 0, 0.25)' },
    danger: { bg: 'rgba(255, 61, 0, 0.15)', color: 'var(--danger)', border: '1px solid var(--danger)40', hoverBg: 'rgba(255, 61, 0, 0.25)' },
  };

  const style = variantStyles[variant];

  return (
    <motion.button
      onClick={onClick}
      className="btn"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-sm)',
        padding: 'var(--space-sm) var(--space-md)',
        fontSize: 'var(--text-sm)',
        fontWeight: 500,
        borderRadius: 'var(--radius-md)',
        background: style.bg,
        color: style.color,
        border: style.border,
        textAlign: 'left',
        transition: 'all var(--duration-fast) ease',
      }}
      whileHover={!reducedMotion ? { background: style.hoverBg, scale: 1.01, x: 2 } : undefined}
      whileTap={!reducedMotion ? { scale: 0.98 } : undefined}
    >
      <span style={{ fontSize: 'var(--text-base)' }}>{icon}</span>
      <span>{label}</span>
    </motion.button>
  );
}

interface ThresholdSliderProps {
  label: string;
  unit: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  color: string;
  reducedMotion: boolean;
}

function ThresholdSlider({ label, unit, value, onChange, min, max, step, color, reducedMotion }: ThresholdSliderProps) {
  const [localValue, setLocalValue] = useState(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Math.round(parseInt(e.target.value) / step) * step;
    setLocalValue(newValue);
  };

  const handleBlur = () => {
    onChange(localValue);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <label style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-secondary)' }}>{label}</label>
        <motion.input
          type="number"
          value={localValue}
          onChange={handleChange}
          onBlur={handleBlur}
          min={min}
          max={max}
          step={step}
          style={{
            width: 80,
            padding: 'var(--space-xs) var(--space-sm)',
            fontSize: 'var(--text-sm)',
            fontFamily: 'var(--font-mono)',
            fontWeight: 600,
            color: color,
            background: 'var(--surface)',
            border: `1px solid ${color}40`,
            borderRadius: 'var(--radius-md)',
            textAlign: 'right',
            appearance: 'textfield',
          }}
          whileFocus={!reducedMotion ? { scale: 1.02, borderColor: color } : undefined}
        />
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{unit}</span>
      </div>
      <div style={{ position: 'relative', height: 6 }}>
        <div style={{ position: 'absolute', inset: 0, background: 'var(--surface)', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-subtle)' }} />
        <motion.div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            width: `${((localValue - min) / (max - min)) * 100}%`,
            background: `linear-gradient(90deg, ${color}, ${color}80)`,
            borderRadius: 'var(--radius-full)',
          }}
          animate={{ width: `${((localValue - min) / (max - min)) * 100}%` }}
          transition={getTransition({ duration: 0.2, ease: 'easeOut' }, reducedMotion)}
        />
        <motion.div
          style={{
            position: 'absolute',
            top: '50%',
            left: `${((localValue - min) / (max - min)) * 100}%`,
            transform: 'translate(-50%, -50%)',
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: color,
            border: '2px solid var(--surface)',
            boxShadow: `0 0 8px ${color}, 0 2px 4px rgba(0,0,0,0.3)`,
            cursor: 'ew-resize',
          }}
          animate={{ scale: reducedMotion ? 1 : [1, 1.1, 1] }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}