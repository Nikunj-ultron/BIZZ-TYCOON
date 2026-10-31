'use client';

import { useMemo, useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { BufferGeometry, BufferAttribute, PointsMaterial, Color } from 'three';

interface GasParticleFieldR3FProps {
  ppm?: number;
  status?: 'SAFE' | 'WARNING' | 'DANGER';
  className?: string;
}

export function GasParticleFieldR3F({ ppm = 0, status = 'SAFE', className = '' }: GasParticleFieldR3FProps) {
  const { size, viewport } = useThree();
  const pointsRef = useRef<THREE.Points | null>(null);
  const ambientRef = useRef<THREE.Points | null>(null);
  const clockRef = useRef<THREE.Clock | null>(null);
  const prefersReducedMotion = useRef(false);

  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const config = useMemo(() => {
    const ppmNormalized = Math.min(ppm / 1000, 1);

    if (status === 'DANGER' || ppm >= 500) {
      return {
        count: 800 + Math.floor(ppmNormalized * 1200),
        size: 0.04 + ppmNormalized * 0.08,
        speed: 0.02 + ppmNormalized * 0.06,
        spread: 3 + ppmNormalized * 5,
        colorStart: new Color(0xff3d00),
        colorMid: new Color(0xff6b35),
        colorEnd: new Color(0xffaa00),
        opacity: 0.6 + ppmNormalized * 0.3,
        turbulence: 0.5 + ppmNormalized * 1.5,
      };
    } else if (status === 'WARNING' || ppm >= 200) {
      return {
        count: 400 + Math.floor(ppmNormalized * 400),
        size: 0.03 + ppmNormalized * 0.05,
        speed: 0.01 + ppmNormalized * 0.04,
        spread: 2 + ppmNormalized * 3,
        colorStart: new Color(0xffd600),
        colorMid: new Color(0xffaa00),
        colorEnd: new Color(0x00ffb3),
        opacity: 0.4 + ppmNormalized * 0.3,
        turbulence: 0.3 + ppmNormalized * 1.0,
      };
    } else {
      return {
        count: 150,
        size: 0.02,
        speed: 0.005,
        spread: 1.5,
        colorStart: new Color(0x00e676),
        colorMid: new Color(0x00d4c8),
        colorEnd: new Color(0x0080ff),
        opacity: 0.3,
        turbulence: 0.1,
      };
    }
  }, [ppm, status]);

  // Initialize geometry and attributes
  useEffect(() => {
    if (!pointsRef.current || prefersReducedMotion.current) return;

    const particleCount = config.count;
    const geometry = new BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const velocities = new Float32Array(particleCount * 3);
    const lifetimes = new Float32Array(particleCount);
    const maxLifetimes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * config.spread;
      positions[i * 3 + 1] = -4 + Math.random() * 2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * config.spread;

      const heightRatio = Math.random();
      const color = new Color().lerpColors(config.colorStart, config.colorEnd, heightRatio);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      sizes[i] = config.size * (0.5 + Math.random() * 0.5);

      velocities[i * 3] = (Math.random() - 0.5) * config.turbulence;
      velocities[i * 3 + 1] = config.speed * (0.5 + Math.random());
      velocities[i * 3 + 2] = (Math.random() - 0.5) * config.turbulence;

      lifetimes[i] = 0;
      maxLifetimes[i] = 5 + Math.random() * 10;
    }

    geometry.setAttribute('position', new BufferAttribute(positions, 3));
    geometry.setAttribute('color', new BufferAttribute(colors, 3));
    geometry.setAttribute('size', new BufferAttribute(sizes, 1));
    geometry.setAttribute('velocity', new BufferAttribute(velocities, 3));
    geometry.setAttribute('lifetime', new BufferAttribute(lifetimes, 1));
    geometry.setAttribute('maxLifetime', new BufferAttribute(maxLifetimes, 1));

    if (pointsRef.current) {
      pointsRef.current.geometry.dispose();
      pointsRef.current.geometry = geometry;
    }

    clockRef.current = new THREE.Clock();
  }, [config.count, config.size, config.speed, config.spread, config.colorStart, config.colorEnd, config.opacity, config.turbulence]);

  // Ambient particles
  useEffect(() => {
    if (!ambientRef.current || prefersReducedMotion.current) return;

    const ambientCount = 200;
    const geometry = new BufferGeometry();
    const positions = new Float32Array(ambientCount * 3);
    const colors = new Float32Array(ambientCount * 3);
    const sizes = new Float32Array(ambientCount);

    for (let i = 0; i < ambientCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;

      const color = new Color(0x00d4c8).lerp(new Color(0x0080ff), Math.random());
      colors[i * 3] = color.r * 0.3;
      colors[i * 3 + 1] = color.g * 0.3;
      colors[i * 3 + 2] = color.b * 0.3;

      sizes[i] = 0.01 * (0.5 + Math.random());
    }

    geometry.setAttribute('position', new BufferAttribute(positions, 3));
    geometry.setAttribute('color', new BufferAttribute(colors, 3));
    geometry.setAttribute('size', new BufferAttribute(sizes, 1));

    if (ambientRef.current) {
      ambientRef.current.geometry.dispose();
      ambientRef.current.geometry = geometry;
    }
  }, []);

  useFrame((_, delta) => {
    if (prefersReducedMotion.current || !clockRef.current) return;

    const elapsed = clockRef.current.getElapsedTime();

    // Main particles
    if (pointsRef.current) {
      const positions = pointsRef.current.geometry.attributes.position;
      const velocities = pointsRef.current.geometry.attributes.velocity;
      const lifetimes = pointsRef.current.geometry.attributes.lifetime;
      const maxLifetimes = pointsRef.current.geometry.attributes.maxLifetime;
      const colors = pointsRef.current.geometry.attributes.color;
      const sizes = pointsRef.current.geometry.attributes.size;
      const material = pointsRef.current.material as PointsMaterial;

      for (let i = 0; i < positions.count; i++) {
        const vx = velocities.getX(i);
        const vy = velocities.getY(i);
        const vz = velocities.getZ(i);

        positions.setX(i, positions.getX(i) + vx * delta * 30);
        positions.setY(i, positions.getY(i) + vy * delta * 30);
        positions.setZ(i, positions.getZ(i) + vz * delta * 30);

        const noise = Math.sin(elapsed * 2 + i * 0.1) * 0.01;
        positions.setX(i, positions.getX(i) + noise);
        positions.setZ(i, positions.getZ(i) + noise);

        lifetimes.setX(i, lifetimes.getX(i) + delta);

        const lifeRatio = lifetimes.getX(i) / maxLifetimes.getX(i);
        const baseSize = sizes.getX(i);
        material.size = baseSize * (1 - lifeRatio * 0.5);

        if (lifeRatio >= 1 || positions.getY(i) > 6) {
          positions.setX(i, (Math.random() - 0.5) * config.spread);
          positions.setY(i, -4);
          positions.setZ(i, (Math.random() - 0.5) * config.spread);

          lifetimes.setX(i, 0);
          maxLifetimes.setX(i, 5 + Math.random() * 10);

          velocities.setX(i, (Math.random() - 0.5) * config.turbulence);
          velocities.setY(i, config.speed * (0.5 + Math.random()));
          velocities.setZ(i, (Math.random() - 0.5) * config.turbulence);

          const heightRatio = Math.random();
          const newColor = new Color().lerpColors(config.colorStart, config.colorEnd, heightRatio);
          colors.setX(i, newColor.r);
          colors.setY(i, newColor.g);
          colors.setZ(i, newColor.b);
        } else {
          const y = positions.getY(i);
          const heightNorm = Math.min(Math.max((y + 4) / 10, 0), 1);
          const color = new Color().lerpColors(config.colorStart, config.colorEnd, heightNorm);
          colors.setX(i, color.r);
          colors.setY(i, color.g);
          colors.setZ(i, color.b);
        }
      }

      positions.needsUpdate = true;
      colors.needsUpdate = true;
      lifetimes.needsUpdate = true;

      pointsRef.current.rotation.y = elapsed * 0.02;
    }

    // Ambient particles slow rotation
    if (ambientRef.current) {
      ambientRef.current.rotation.y = elapsed * 0.005;
    }
  });

  return (
    <group>
      <points
        ref={pointsRef}
        position={[0, 0, 0]}
      >
        <bufferGeometry>
          <bufferAttribute name="position" count={config.count} itemSize={3} />
          <bufferAttribute name="color" count={config.count} itemSize={3} />
          <bufferAttribute name="size" count={config.count} itemSize={1} />
        </bufferGeometry>
        <pointsMaterial
          size={config.size}
          vertexColors
          transparent
          opacity={config.opacity}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation
        />
      </points>
      <points
        ref={ambientRef}
        position={[0, 0, 0]}
      >
        <bufferGeometry>
          <bufferAttribute name="position" count={200} itemSize={3} />
          <bufferAttribute name="color" count={200} itemSize={3} />
          <bufferAttribute name="size" count={200} itemSize={1} />
        </bufferGeometry>
        <pointsMaterial
          size={0.01}
          vertexColors
          transparent
          opacity={0.15}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation
        />
      </points>
    </group>
  );
}