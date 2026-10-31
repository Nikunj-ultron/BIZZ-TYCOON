'use client';

import { useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';

interface StatusOrbProps {
  status: 'SAFE' | 'WARNING' | 'DANGER';
  ppm?: number;
  size?: number;
  className?: string;
}

export function StatusOrb({ status = 'SAFE', ppm = 0, size = 150, className = '' }: StatusOrbProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const coreRef = useRef<THREE.Mesh | null>(null);
  const ringRef = useRef<THREE.Group | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const pulseRef = useRef<THREE.Mesh | null>(null);
  const animationIdRef = useRef<number>(0);
  const clockRef = useRef<THREE.Clock | null>(null);

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

  useEffect(() => {
    if (!containerRef.current) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const width = containerRef.current.clientWidth || size;
    const height = containerRef.current.clientHeight || size;

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 0, 6);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    clockRef.current = new THREE.Clock();

    // Core sphere with detailed geometry
    const coreGeometry = new THREE.IcosahedronGeometry(1, 3);
    const coreMaterial = new THREE.MeshStandardMaterial({
      color: config.coreColor,
      roughness: 0.1,
      metalness: 0.9,
      emissive: config.glowColor,
      emissiveIntensity: config.emissiveIntensity,
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    scene.add(core);
    coreRef.current = core;

    // Outer glow pulse ring
    const pulseGeometry = new THREE.SphereGeometry(1.2, 32, 32);
    const pulseMaterial = new THREE.MeshBasicMaterial({
      color: config.glowColor,
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
    });
    const pulse = new THREE.Mesh(pulseGeometry, pulseMaterial);
    scene.add(pulse);
    pulseRef.current = pulse;

    // Rotating rings
    const ringGeometry = new THREE.TorusGeometry(1.5, 0.02, 16, 100);
    const ringMaterial = new THREE.MeshStandardMaterial({
      color: config.ringColor,
      roughness: 0.1,
      metalness: 0.9,
      emissive: config.ringColor,
      emissiveIntensity: 0.6,
    });

    const ringGroup = new THREE.Group();

    const ring1 = new THREE.Mesh(ringGeometry, ringMaterial);
    ring1.rotation.x = Math.PI / 2;
    ringGroup.add(ring1);

    const ring2 = new THREE.Mesh(ringGeometry, ringMaterial.clone());
    ring2.rotation.y = Math.PI / 2;
    ring2.scale.setScalar(1.1);
    ringGroup.add(ring2);

    const ring3 = new THREE.Mesh(ringGeometry, ringMaterial.clone());
    ring3.rotation.z = Math.PI / 2;
    ring3.scale.setScalar(1.2);
    ringGroup.add(ring3);

    scene.add(ringGroup);
    ringRef.current = ringGroup;

    // Particle system
    const particleCount = config.particleCount;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const velocities = new Float32Array(particleCount * 3);
    const phases = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const radius = 1.5 + Math.random() * 1.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      const colorIndex = Math.floor(Math.random() * config.particleColors.length);
      const color = new THREE.Color(config.particleColors[colorIndex]);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      sizes[i] = 0.02 + Math.random() * 0.04;

      velocities[i * 3] = (Math.random() - 0.5) * config.particleSpeed;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * config.particleSpeed;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * config.particleSpeed;

      phases[i] = Math.random() * Math.PI * 2;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    particleGeometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
    particleGeometry.setAttribute('phase', new THREE.BufferAttribute(phases, 1));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.04,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);
    particlesRef.current = particles;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(config.glowColor, 2, 10);
    pointLight.position.set(0, 0, 3);
    scene.add(pointLight);

    const rimLight = new THREE.PointLight(0xffffff, 1, 10);
    rimLight.position.set(0, 0, -5);
    scene.add(rimLight);

    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);

      if (!clockRef.current) return;

      const elapsed = clockRef.current.getElapsedTime();
      const delta = clockRef.current.getDelta();

      // Core rotation
      if (coreRef.current) {
        coreRef.current.rotation.x = elapsed * config.rotationSpeed * 0.3;
        coreRef.current.rotation.y = elapsed * config.rotationSpeed * 0.4;
      }

      // Ring group rotation
      if (ringRef.current) {
        ringRef.current.rotation.x = elapsed * config.rotationSpeed * 0.2;
        ringRef.current.rotation.y = elapsed * config.rotationSpeed * -0.3;
        ringRef.current.rotation.z = elapsed * config.rotationSpeed * 0.1;
      }

      // Pulse animation
      if (pulseRef.current) {
        const pulseScale = 1 + Math.sin(elapsed * config.pulseSpeed) * (config.pulseScale - 1) * 0.5;
        pulseRef.current.scale.setScalar(pulseScale);
        (pulseRef.current.material as THREE.MeshBasicMaterial).opacity =
          0.1 + Math.sin(elapsed * config.pulseSpeed) * 0.1;
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

          // Orbital motion with noise
          positions.setX(i, positions.getX(i) + vx * delta * 30 + Math.sin(elapsed * 2 + phase) * 0.002);
          positions.setY(i, positions.getY(i) + vy * delta * 30 + Math.cos(elapsed * 2 + phase) * 0.002);
          positions.setZ(i, positions.getZ(i) + vz * delta * 30 + Math.sin(elapsed * 3 + phase) * 0.002);

          // Keep particles in spherical shell
          const x = positions.getX(i);
          const y = positions.getY(i);
          const z = positions.getZ(i);
          const dist = Math.sqrt(x * x + y * y + z * z);

          if (dist > 3.5 || dist < 1.2) {
            // Respawn at random position on sphere
            const radius = 1.5 + Math.random() * 1.5;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);

            positions.setX(i, radius * Math.sin(phi) * Math.cos(theta));
            positions.setY(i, radius * Math.sin(phi) * Math.sin(theta));
            positions.setZ(i, radius * Math.cos(phi));

            const colorIndex = Math.floor(Math.random() * config.particleColors.length);
            const color = new THREE.Color(config.particleColors[colorIndex]);
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
          }

          // Pulsing size
          const baseSize = sizes.getX(i);
          const pulseSize = baseSize * (1 + Math.sin(elapsed * 3 + phase) * 0.3);
          (particlesRef.current.material as THREE.PointsMaterial).size = pulseSize;
        }

        positions.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current) return;
      const w = containerRef.current.clientWidth || size;
      const h = containerRef.current.clientHeight || size;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationIdRef.current);

      if (rendererRef.current?.domElement) {
        containerRef.current?.removeChild(rendererRef.current.domElement);
      }

      // Cleanup
      coreRef.current?.geometry.dispose();
      (coreRef.current?.material as THREE.Material)?.dispose();
      pulseRef.current?.geometry.dispose();
      (pulseRef.current?.material as THREE.Material)?.dispose();

      if (ringRef.current) {
        ringRef.current.traverse((obj) => {
          if (obj instanceof THREE.Mesh) {
            obj.geometry.dispose();
            (obj.material as THREE.Material).dispose();
          }
        });
      }

      particlesRef.current?.geometry.dispose();
      (particlesRef.current?.material as THREE.Material)?.dispose();
      rendererRef.current?.dispose();
    };
  }, [size, config.coreColor, config.ringColor, config.glowColor, config.particleColors.join(),
      config.pulseSpeed, config.pulseScale, config.rotationSpeed, config.particleSpeed,
      config.particleCount, config.emissiveIntensity]);

  return (
    <div
      ref={containerRef}
      className={`status-orb-container ${className}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Status: ${status}, PPM: ${ppm}`}
    />
  );
}