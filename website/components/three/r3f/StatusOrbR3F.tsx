'use client';

import { useMemo, useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Mesh, IcosahedronGeometry, TorusGeometry, SphereGeometry, Group, MeshStandardMaterial, MeshBasicMaterial, Points, BufferGeometry, BufferAttribute, PointsMaterial, Color, PointLight, AmbientLight, DirectionalLight } from 'three';

interface StatusOrbR3FProps {
  status: 'SAFE' | 'WARNING' | 'DANGER' | 'UNKNOWN';
  ppm?: number;
  size?: number;
  className?: string;
}

export function StatusOrbR3F({ status = 'SAFE', ppm = 0, className = '' }: StatusOrbR3FProps) {
  const prefersReducedMotion = useRef(false);

  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const config = useMemo(() => {
    switch (status) {
      case 'DANGER':
        return {
          coreColor: 0xff3d00,
          ringColor: 0xff6b35,
          glowColor: 0xff3d00,
          particleColors: [0xff3d00, 0xff6b35, 0xffaa00, 0xffd600],
          pulseSpeed: 1.5,
          pulseScale: 1.4,
          rotationSpeed: 0.8,
          particleSpeed: 0.05,
          particleCount: 500,
          emissiveIntensity: 1.2,
        };
      case 'WARNING':
        return {
          coreColor: 0xffd600,
          ringColor: 0xffaa00,
          glowColor: 0xffd600,
          particleColors: [0xffd600, 0xffaa00, 0x00ffb3, 0x00d4c8],
          pulseSpeed: 1.0,
          pulseScale: 1.25,
          rotationSpeed: 0.5,
          particleSpeed: 0.03,
          particleCount: 300,
          emissiveIntensity: 0.8,
        };
      default:
        return {
          coreColor: 0x00d4c8,
          ringColor: 0x00ffb3,
          glowColor: 0x00d4c8,
          particleColors: [0x00e676, 0x00d4c8, 0x0080ff, 0x00b3ff],
          pulseSpeed: 0.6,
          pulseScale: 1.15,
          rotationSpeed: 0.3,
          particleSpeed: 0.015,
          particleCount: 150,
          emissiveIntensity: 0.5,
        };
    }
  }, [status]);

  const coreRef = useRef<Mesh>(null);
  const pulseRef = useRef<Mesh>(null);
  const ringGroupRef = useRef<Group>(null);
  const particlesRef = useRef<Points>(null);
  const clockRef = useRef<THREE.Clock | null>(null);

  // Initialize clock
  useEffect(() => {
    clockRef.current = new THREE.Clock();
  }, []);

  // Animate
  useFrame(() => {
    if (prefersReducedMotion.current || !clockRef.current) return;

    const elapsed = clockRef.current.getElapsedTime();

    // Core rotation
    if (coreRef.current) {
      coreRef.current.rotation.x = elapsed * config.rotationSpeed * 0.3;
      coreRef.current.rotation.y = elapsed * config.rotationSpeed * 0.4;
    }

    // Ring group rotation
    if (ringGroupRef.current) {
      ringGroupRef.current.rotation.x = elapsed * config.rotationSpeed * 0.2;
      ringGroupRef.current.rotation.y = elapsed * config.rotationSpeed * -0.3;
      ringGroupRef.current.rotation.z = elapsed * config.rotationSpeed * 0.1;
    }

    // Pulse animation
    if (pulseRef.current) {
      const pulseScale = 1 + Math.sin(elapsed * config.pulseSpeed) * (config.pulseScale - 1) * 0.5;
      pulseRef.current.scale.setScalar(pulseScale);
      const mat = pulseRef.current.material as MeshBasicMaterial;
      mat.opacity = 0.1 + Math.sin(elapsed * config.pulseSpeed) * 0.1;
    }

    // Particle animation
    if (particlesRef.current) {
      particlesRef.current.rotation.y = elapsed * 0.05;

      const positions = particlesRef.current.geometry.attributes.position;
      const velocities = particlesRef.current.geometry.attributes.velocity;
      const phases = particlesRef.current.geometry.attributes.phase;
      const sizes = particlesRef.current.geometry.attributes.size;

      for (let i = 0; i < positions.count; i++) {
        const vx = velocities.getX(i);
        const vy = velocities.getY(i);
        const vz = velocities.getZ(i);
        const phase = phases.getX(i);

        positions.setX(i, positions.getX(i) + vx * 0.016 * 30 + Math.sin(elapsed * 2 + phase) * 0.002);
        positions.setY(i, positions.getY(i) + vy * 0.016 * 30 + Math.cos(elapsed * 2 + phase) * 0.002);
        positions.setZ(i, positions.getZ(i) + vz * 0.016 * 30 + Math.sin(elapsed * 3 + phase) * 0.002);

        const x = positions.getX(i);
        const y = positions.getY(i);
        const z = positions.getZ(i);
        const dist = Math.sqrt(x * x + y * y + z * z);

        if (dist > 3.5 || dist < 1.2) {
          const radius = 1.5 + Math.random() * 1.5;
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);

          positions.setX(i, radius * Math.sin(phi) * Math.cos(theta));
          positions.setY(i, radius * Math.sin(phi) * Math.sin(theta));
          positions.setZ(i, radius * Math.cos(phi));

          const colorIndex = Math.floor(Math.random() * config.particleColors.length);
          const color = new Color(config.particleColors[colorIndex]);
          const colors = particlesRef.current.geometry.attributes.color;
          colors.setX(i, color.r);
          colors.setY(i, color.g);
          colors.setZ(i, color.b);
        }

        const baseSize = sizes.getX(i);
        const pulseSize = baseSize * (1 + Math.sin(elapsed * 3 + phase) * 0.3);
        (particlesRef.current.material as PointsMaterial).size = pulseSize;
      }

      positions.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <pointLight color={config.glowColor} intensity={2} position={[0, 0, 3]} />
      <directionalLight color={0xffffff} intensity={0.3} position={[0, 0, -5]} />

      {/* Core */}
      <mesh
        ref={coreRef}
        position={[0, 0, 0]}
        castShadow
        receiveShadow
      >
        <icosahedronGeometry args={[1, 3]} />
        <meshStandardMaterial
          color={config.coreColor}
          roughness={0.1}
          metalness={0.9}
          emissive={config.glowColor}
          emissiveIntensity={config.emissiveIntensity}
        />
      </mesh>

      {/* Pulse glow */}
      <mesh
        ref={pulseRef}
        position={[0, 0, 0]}
        scale={1.2}
      >
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshBasicMaterial
          color={config.glowColor}
          transparent
          opacity={0.15}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Rotating rings */}
      <group ref={ringGroupRef}>
        <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.5, 0.02, 16, 100]} />
          <meshStandardMaterial
            color={config.ringColor}
            roughness={0.1}
            metalness={0.9}
            emissive={config.ringColor}
            emissiveIntensity={0.6}
          />
        </mesh>
        <mesh position={[0, 0, 0]} rotation={[0, -Math.PI / 2, 0]} scale={1.1}>
          <torusGeometry args={[1.5, 0.02, 16, 100]} />
          <meshStandardMaterial
            color={config.ringColor}
            roughness={0.1}
            metalness={0.9}
            emissive={config.ringColor}
            emissiveIntensity={0.6}
          />
        </mesh>
        <mesh position={[0, 0, 0]} rotation={[0, 0, -Math.PI / 2]} scale={1.2}>
          <torusGeometry args={[1.5, 0.02, 16, 100]} />
          <meshStandardMaterial
            color={config.ringColor}
            roughness={0.1}
            metalness={0.9}
            emissive={config.ringColor}
            emissiveIntensity={0.6}
          />
        </mesh>
      </group>

      {/* Particles */}
      <points
        ref={particlesRef}
        position={[0, 0, 0]}
      >
        <bufferGeometry>
          <bufferAttribute name="position" count={config.particleCount} itemSize={3} />
          <bufferAttribute name="color" count={config.particleCount} itemSize={3} />
          <bufferAttribute name="size" count={config.particleCount} itemSize={1} />
          <bufferAttribute name="velocity" count={config.particleCount} itemSize={3} />
          <bufferAttribute name="phase" count={config.particleCount} itemSize={1} />
        </bufferGeometry>
        <pointsMaterial
          size={0.04}
          vertexColors
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation
        />
      </points>
    </group>
  );
}