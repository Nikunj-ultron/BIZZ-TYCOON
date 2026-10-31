'use client';

import { useMemo, useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Mesh, CylinderGeometry, CircleGeometry, SphereGeometry, Group, MeshStandardMaterial, MeshBasicMaterial, Points, BufferGeometry, BufferAttribute, PointsMaterial, Color, PointLight as ThreePointLight, AmbientLight as ThreeAmbientLight, DirectionalLight as ThreeDirectionalLight } from 'three';

interface FlameVisualizationR3FProps {
  intensity?: number;
  className?: string;
}

export function FlameVisualizationR3F({ intensity = 0, className = '' }: FlameVisualizationR3FProps) {
  const prefersReducedMotion = useRef(false);

  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const normalizedIntensity = useMemo(() => Math.min(intensity / 1023, 1), [intensity]);

  const config = useMemo(() => {
    const i = normalizedIntensity;
    return {
      particleCount: Math.floor(200 + i * 800),
      smokeCount: Math.floor(50 + i * 150),
      flameHeight: 1 + i * 3,
      baseRadius: 0.5 + i * 0.5,
      colorCore: new Color(0xff3d00),
      colorMid: new Color(0xff6b35),
      colorTip: new Color(0xffd600),
      colorSmoke: new Color(0x333333),
      speed: 0.02 + i * 0.08,
      turbulence: 0.3 + i * 1.2,
    };
  }, [normalizedIntensity]);

  const flameParticlesRef = useRef<Points>(null);
  const smokeParticlesRef = useRef<Points>(null);
  const baseRef = useRef<Mesh>(null);
  const flameLightRef = useRef<ThreePointLight>(null);
  const clockRef = useRef<THREE.Clock | null>(null);
  const frameCountRef = useRef(0);

  useEffect(() => {
    clockRef.current = new THREE.Clock();
  }, []);

  useFrame((_, delta) => {
    if (prefersReducedMotion.current || !clockRef.current) return;

    const elapsed = clockRef.current.getElapsedTime();
    frameCountRef.current++;

    // Animate base emissive
    if (baseRef.current) {
      const baseMat = baseRef.current.material as MeshStandardMaterial;
      baseMat.emissiveIntensity = 0.2 + Math.sin(elapsed * 10) * 0.1 * normalizedIntensity;
    }

    // Animate flame particles
    if (flameParticlesRef.current) {
      const positions = flameParticlesRef.current.geometry.attributes.position;
      const velocities = flameParticlesRef.current.geometry.attributes.velocity;
      const lifetimes = flameParticlesRef.current.geometry.attributes.lifetime;
      const maxLifetimes = flameParticlesRef.current.geometry.attributes.maxLifetime;
      const colors = flameParticlesRef.current.geometry.attributes.color;
      const sizes = flameParticlesRef.current.geometry.attributes.size;

      for (let i = 0; i < positions.count; i++) {
        const vx = velocities.getX(i);
        const vy = velocities.getY(i);
        const vz = velocities.getZ(i);

        positions.setX(i, positions.getX(i) + vx * delta * 30);
        positions.setY(i, positions.getY(i) + vy * delta * 30);
        positions.setZ(i, positions.getZ(i) + vz * delta * 30);

        const noiseX = Math.sin(elapsed * 5 + i * 0.1) * 0.02 * config.turbulence;
        const noiseZ = Math.cos(elapsed * 5 + i * 0.1) * 0.02 * config.turbulence;
        positions.setX(i, positions.getX(i) + noiseX);
        positions.setZ(i, positions.getZ(i) + noiseZ);

        lifetimes.setX(i, lifetimes.getX(i) + delta);

        const lifeRatio = lifetimes.getX(i) / maxLifetimes.getX(i);
        const size = sizes.getX(i);
        (flameParticlesRef.current.material as PointsMaterial).size = size * (1 - lifeRatio * 0.7);

        if (lifeRatio >= 1 || positions.getY(i) > config.flameHeight) {
          const radius = Math.random() * config.baseRadius * 0.8;
          const angle = Math.random() * Math.PI * 2;

          positions.setX(i, Math.cos(angle) * radius);
          positions.setY(i, 0);
          positions.setZ(i, Math.sin(angle) * radius);

          lifetimes.setX(i, 0);
          maxLifetimes.setX(i, 0.3 + Math.random() * 1.5);

          velocities.setX(i, (Math.random() - 0.5) * config.turbulence);
          velocities.setY(i, config.speed * (0.5 + Math.random()));
          velocities.setZ(i, (Math.random() - 0.5) * config.turbulence);

          const heightRatio = Math.random();
          let color: Color;
          if (heightRatio < 0.3) {
            color = config.colorCore.clone();
          } else if (heightRatio < 0.7) {
            color = config.colorMid.clone().lerp(config.colorTip, (heightRatio - 0.3) / 0.4);
          } else {
            color = config.colorTip.clone();
          }
          colors.setX(i, color.r);
          colors.setY(i, color.g);
          colors.setZ(i, color.b);
        } else {
          const y = positions.getY(i);
          const heightNorm = Math.min(y / config.flameHeight, 1);

          let color: Color;
          if (heightNorm < 0.3) {
            color = config.colorCore.clone().lerp(config.colorMid, heightNorm / 0.3);
          } else if (heightNorm < 0.7) {
            color = config.colorMid.clone().lerp(config.colorTip, (heightNorm - 0.3) / 0.4);
          } else {
            color = config.colorTip.clone();
          }

          const flicker = 0.95 + Math.sin(elapsed * 20 + i) * 0.05;
          colors.setX(i, color.r * flicker);
          colors.setY(i, color.g * flicker);
          colors.setZ(i, color.b * flicker);
        }
      }

      positions.needsUpdate = true;
      colors.needsUpdate = true;
      lifetimes.needsUpdate = true;
    }

    // Animate smoke particles
    if (smokeParticlesRef.current) {
      const positions = smokeParticlesRef.current.geometry.attributes.position;
      const velocities = smokeParticlesRef.current.geometry.attributes.velocity;
      const lifetimes = smokeParticlesRef.current.geometry.attributes.lifetime;
      const maxLifetimes = smokeParticlesRef.current.geometry.attributes.maxLifetime;
      const sizes = smokeParticlesRef.current.geometry.attributes.size;

      for (let i = 0; i < positions.count; i++) {
        const vx = velocities.getX(i);
        const vy = velocities.getY(i);
        const vz = velocities.getZ(i);

        positions.setX(i, positions.getX(i) + vx * delta * 30);
        positions.setY(i, positions.getY(i) + vy * delta * 30);
        positions.setZ(i, positions.getZ(i) + vz * delta * 30);

        positions.setX(i, positions.getX(i) + Math.sin(elapsed + i) * 0.001);
        positions.setZ(i, positions.getZ(i) + Math.cos(elapsed + i) * 0.001);

        lifetimes.setX(i, lifetimes.getX(i) + delta);

        const lifeRatio = lifetimes.getX(i) / maxLifetimes.getX(i);

        if (lifeRatio >= 1 || positions.getY(i) > 5) {
          positions.setX(i, (Math.random() - 0.5) * 0.8);
          positions.setY(i, 0.5);
          positions.setZ(i, (Math.random() - 0.5) * 0.8);

          lifetimes.setX(i, 0);
          maxLifetimes.setX(i, 5 + Math.random() * 5);

          velocities.setX(i, (Math.random() - 0.5) * 0.02);
          velocities.setY(i, 0.01 + Math.random() * 0.03);
          velocities.setZ(i, (Math.random() - 0.5) * 0.02);

          const gray = 0.1 + Math.random() * 0.3;
          const colors = smokeParticlesRef.current.geometry.attributes.color;
          colors.setX(i, gray);
          colors.setY(i, gray);
          colors.setZ(i, gray);
        }

        const baseSize = sizes.getX(i);
        (smokeParticlesRef.current.material as PointsMaterial).size = baseSize * (1 + lifeRatio);
      }

      positions.needsUpdate = true;
      lifetimes.needsUpdate = true;
    }

    // Flicker flame light
    if (flameLightRef.current) {
      flameLightRef.current.intensity = normalizedIntensity * 2 * (0.8 + Math.sin(elapsed * 15) * 0.2);
    }
  });

  return (
    <group>
      {/* Lighting */}
      <ambientLight color={0x222233} intensity={0.5} />
      <pointLight
        ref={flameLightRef}
        color={0xff3d00}
        intensity={normalizedIntensity * 3}
        distance={5}
        position={[0, 2, 0]}
      />
      <directionalLight color={0x00d4c8} intensity={0.3} position={[0, 0, -5]} />

      {/* Base / Burner */}
      <mesh
        ref={baseRef}
        position={[0, -0.15, 0]}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[0.4, 0.5, 0.3, 16]} />
        <meshStandardMaterial
          color={0x1a1a2e}
          roughness={0.3}
          metalness={0.8}
          emissive={0x00d4c8}
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Burner holes */}
      <group>
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i / 8) * Math.PI * 2;
          return (
            <mesh
              key={i}
              position={[Math.cos(angle) * 0.25, 0.01, Math.sin(angle) * 0.25]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <circleGeometry args={[0.05, 8]} />
              <meshBasicMaterial
                color={0x00d4c8}
                transparent
                opacity={0.8}
              />
            </mesh>
          );
        })}
      </group>

      {/* Flame particles */}
      <points ref={flameParticlesRef} position={[0, 0, 0]}>
        <bufferGeometry>
          <bufferAttribute name="position" count={config.particleCount} itemSize={3} />
          <bufferAttribute name="color" count={config.particleCount} itemSize={3} />
          <bufferAttribute name="size" count={config.particleCount} itemSize={1} />
          <bufferAttribute name="velocity" count={config.particleCount} itemSize={3} />
          <bufferAttribute name="lifetime" count={config.particleCount} itemSize={1} />
          <bufferAttribute name="maxLifetime" count={config.particleCount} itemSize={1} />
        </bufferGeometry>
        <pointsMaterial
          size={0.1}
          vertexColors
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation
        />
      </points>

      {/* Smoke particles */}
      <points ref={smokeParticlesRef} position={[0, 0, 0]}>
        <bufferGeometry>
          <bufferAttribute name="position" count={config.smokeCount} itemSize={3} />
          <bufferAttribute name="color" count={config.smokeCount} itemSize={3} />
          <bufferAttribute name="size" count={config.smokeCount} itemSize={1} />
          <bufferAttribute name="velocity" count={config.smokeCount} itemSize={3} />
          <bufferAttribute name="lifetime" count={config.smokeCount} itemSize={1} />
          <bufferAttribute name="maxLifetime" count={config.smokeCount} itemSize={1} />
        </bufferGeometry>
        <pointsMaterial
          size={0.3}
          vertexColors
          transparent
          opacity={0.3}
          blending={THREE.NormalBlending}
          depthWrite={false}
          sizeAttenuation
        />
      </points>
    </group>
  );
}