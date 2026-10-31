'use client';

import { useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';

interface FlameVisualizationProps {
  intensity?: number; // 0-1023
  width?: number;
  height?: number;
  className?: string;
}

export function FlameVisualization({
  intensity = 0,
  width = 400,
  height = 300,
  className = ''
}: FlameVisualizationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const flameParticlesRef = useRef<THREE.Points | null>(null);
  const smokeParticlesRef = useRef<THREE.Points | null>(null);
  const baseMeshRef = useRef<THREE.Mesh | null>(null);
  const animationIdRef = useRef<number>(0);
  const clockRef = useRef<THREE.Clock | null>(null);

  const normalizedIntensity = useMemo(() => Math.min(intensity / 1023, 1), [intensity]);

  const config = useMemo(() => {
    const i = normalizedIntensity;
    return {
      particleCount: Math.floor(200 + i * 800),
      smokeCount: Math.floor(50 + i * 150),
      flameHeight: 1 + i * 3,
      baseRadius: 0.5 + i * 0.5,
      colorCore: new THREE.Color(0xff3d00),
      colorMid: new THREE.Color(0xff6b35),
      colorTip: new THREE.Color(0xffd600),
      colorSmoke: new THREE.Color(0x333333),
      speed: 0.02 + i * 0.08,
      turbulence: 0.3 + i * 1.2,
      spawnRate: 5 + i * 30,
    };
  }, [normalizedIntensity]);

  useEffect(() => {
    if (!containerRef.current) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const w = containerRef.current.clientWidth || width;
    const h = containerRef.current.clientHeight || height;

    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    camera.position.set(0, 1.5, 5);
    camera.lookAt(0, 1, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    clockRef.current = new THREE.Clock();

    // Base / Burner
    const baseGeometry = new THREE.CylinderGeometry(0.4, 0.5, 0.3, 16);
    const baseMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a2e,
      roughness: 0.3,
      metalness: 0.8,
      emissive: 0x00d4c8,
      emissiveIntensity: 0.2,
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = -0.15;
    scene.add(base);
    baseMeshRef.current = base;

    // Burner holes (emissive)
    const holeGeometry = new THREE.CircleGeometry(0.05, 8);
    const holeMaterial = new THREE.MeshBasicMaterial({
      color: 0x00d4c8,
      transparent: true,
      opacity: 0.8
    });
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const hole = new THREE.Mesh(holeGeometry, holeMaterial);
      hole.position.set(
        Math.cos(angle) * 0.25,
        0.01,
        Math.sin(angle) * 0.25
      );
      hole.rotation.x = -Math.PI / 2;
      scene.add(hole);
    }

    // Flame particles
    const flameCount = config.particleCount;
    const flameGeometry = new THREE.BufferGeometry();
    const flamePositions = new Float32Array(flameCount * 3);
    const flameColors = new Float32Array(flameCount * 3);
    const flameSizes = new Float32Array(flameCount);
    const flameVelocities = new Float32Array(flameCount * 3);
    const flameLifetimes = new Float32Array(flameCount);
    const flameMaxLifetimes = new Float32Array(flameCount);

    for (let i = 0; i < flameCount; i++) {
      const radius = Math.random() * config.baseRadius * 0.8;
      const angle = Math.random() * Math.PI * 2;

      flamePositions[i * 3] = Math.cos(angle) * radius;
      flamePositions[i * 3 + 1] = Math.random() * 0.2;
      flamePositions[i * 3 + 2] = Math.sin(angle) * radius;

      const heightRatio = Math.random();
      let color: THREE.Color;
      if (heightRatio < 0.3) {
        color = config.colorCore.clone();
      } else if (heightRatio < 0.7) {
        color = config.colorMid.clone().lerp(config.colorTip, (heightRatio - 0.3) / 0.4);
      } else {
        color = config.colorTip.clone();
      }
      flameColors[i * 3] = color.r;
      flameColors[i * 3 + 1] = color.g;
      flameColors[i * 3 + 2] = color.b;

      flameSizes[i] = 0.05 + Math.random() * 0.15;

      flameVelocities[i * 3] = (Math.random() - 0.5) * config.turbulence;
      flameVelocities[i * 3 + 1] = config.speed * (0.5 + Math.random());
      flameVelocities[i * 3 + 2] = (Math.random() - 0.5) * config.turbulence;

      flameLifetimes[i] = 0;
      flameMaxLifetimes[i] = 0.5 + Math.random() * 2;
    }

    flameGeometry.setAttribute('position', new THREE.BufferAttribute(flamePositions, 3));
    flameGeometry.setAttribute('color', new THREE.BufferAttribute(flameColors, 3));
    flameGeometry.setAttribute('size', new THREE.BufferAttribute(flameSizes, 1));
    flameGeometry.setAttribute('velocity', new THREE.BufferAttribute(flameVelocities, 3));
    flameGeometry.setAttribute('lifetime', new THREE.BufferAttribute(flameLifetimes, 1));
    flameGeometry.setAttribute('maxLifetime', new THREE.BufferAttribute(flameMaxLifetimes, 1));

    const flameMaterial = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });

    const flameParticles = new THREE.Points(flameGeometry, flameMaterial);
    scene.add(flameParticles);
    flameParticlesRef.current = flameParticles;

    // Smoke particles
    const smokeCount = config.smokeCount;
    const smokeGeometry = new THREE.BufferGeometry();
    const smokePositions = new Float32Array(smokeCount * 3);
    const smokeColors = new Float32Array(smokeCount * 3);
    const smokeSizes = new Float32Array(smokeCount);
    const smokeVelocities = new Float32Array(smokeCount * 3);
    const smokeLifetimes = new Float32Array(smokeCount);
    const smokeMaxLifetimes = new Float32Array(smokeCount);

    for (let i = 0; i < smokeCount; i++) {
      smokePositions[i * 3] = (Math.random() - 0.5) * 1;
      smokePositions[i * 3 + 1] = 1 + Math.random() * 2;
      smokePositions[i * 3 + 2] = (Math.random() - 0.5) * 1;

      const gray = 0.1 + Math.random() * 0.3;
      smokeColors[i * 3] = gray;
      smokeColors[i * 3 + 1] = gray;
      smokeColors[i * 3 + 2] = gray;

      smokeSizes[i] = 0.2 + Math.random() * 0.4;

      smokeVelocities[i * 3] = (Math.random() - 0.5) * 0.02;
      smokeVelocities[i * 3 + 1] = 0.01 + Math.random() * 0.03;
      smokeVelocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02;

      smokeLifetimes[i] = Math.random() * 5;
      smokeMaxLifetimes[i] = 5 + Math.random() * 5;
    }

    smokeGeometry.setAttribute('position', new THREE.BufferAttribute(smokePositions, 3));
    smokeGeometry.setAttribute('color', new THREE.BufferAttribute(smokeColors, 3));
    smokeGeometry.setAttribute('size', new THREE.BufferAttribute(smokeSizes, 1));
    smokeGeometry.setAttribute('velocity', new THREE.BufferAttribute(smokeVelocities, 3));
    smokeGeometry.setAttribute('lifetime', new THREE.BufferAttribute(smokeLifetimes, 1));
    smokeGeometry.setAttribute('maxLifetime', new THREE.BufferAttribute(smokeMaxLifetimes, 1));

    const smokeMaterial = new THREE.PointsMaterial({
      size: 0.3,
      vertexColors: true,
      transparent: true,
      opacity: 0.3,
      blending: THREE.NormalBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });

    const smokeParticles = new THREE.Points(smokeGeometry, smokeMaterial);
    scene.add(smokeParticles);
    smokeParticlesRef.current = smokeParticles;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x222233, 0.5);
    scene.add(ambientLight);

    const flameLight = new THREE.PointLight(0xff3d00, normalizedIntensity * 3, 5);
    flameLight.position.set(0, 2, 0);
    scene.add(flameLight);

    const rimLight = new THREE.DirectionalLight(0x00d4c8, 0.3);
    rimLight.position.set(0, 0, -5);
    scene.add(rimLight);

    let frameCount = 0;

    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);

      if (!clockRef.current) return;

      const elapsed = clockRef.current.getElapsedTime();
      const delta = clockRef.current.getDelta();

      frameCount++;

      // Animate base emissive
      if (baseMeshRef.current) {
        const baseMat = baseMeshRef.current.material as THREE.MeshStandardMaterial;
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

          // Add turbulence (Perlin-like noise using sine waves)
          const noiseX = Math.sin(elapsed * 5 + i * 0.1) * 0.02 * config.turbulence;
          const noiseZ = Math.cos(elapsed * 5 + i * 0.1) * 0.02 * config.turbulence;
          positions.setX(i, positions.getX(i) + noiseX);
          positions.setZ(i, positions.getZ(i) + noiseZ);

          lifetimes.setX(i, lifetimes.getX(i) + delta);

          const lifeRatio = lifetimes.getX(i) / maxLifetimes.getX(i);

          // Fade and shrink as lifetime increases
          const size = sizes.getX(i);
          (flameParticlesRef.current.material as THREE.PointsMaterial).size = size * (1 - lifeRatio * 0.7);

          // Respawn
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
            let color: THREE.Color;
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
            // Color transition based on height
            const y = positions.getY(i);
            const heightNorm = Math.min(y / config.flameHeight, 1);

            let color: THREE.Color;
            if (heightNorm < 0.3) {
              color = config.colorCore.clone().lerp(config.colorMid, heightNorm / 0.3);
            } else if (heightNorm < 0.7) {
              color = config.colorMid.clone().lerp(config.colorTip, (heightNorm - 0.3) / 0.4);
            } else {
              color = config.colorTip.clone();
            }

            // Add flicker
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
        const colors = smokeParticlesRef.current.geometry.attributes.color as THREE.BufferAttribute;

        for (let i = 0; i < positions.count; i++) {
          const vx = velocities.getX(i);
          const vy = velocities.getY(i);
          const vz = velocities.getZ(i);

          positions.setX(i, positions.getX(i) + vx * delta * 30);
          positions.setY(i, positions.getY(i) + vy * delta * 30);
          positions.setZ(i, positions.getZ(i) + vz * delta * 30);

          // Add drift
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
            colors.setX(i * 3, gray);
            colors.setY(i * 3, gray);
            colors.setZ(i * 3, gray);
          }

          const baseSize = sizes.getX(i);
          (smokeParticlesRef.current.material as THREE.PointsMaterial).size = baseSize * (1 + lifeRatio);
        }

        positions.needsUpdate = true;
        lifetimes.needsUpdate = true;
      }

      // Flicker flame light
      flameLight.intensity = normalizedIntensity * 2 * (0.8 + Math.sin(elapsed * 15) * 0.2);

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current) return;
      const w = containerRef.current.clientWidth || width;
      const h = containerRef.current.clientHeight || height;
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

      baseMeshRef.current?.geometry.dispose();
      (baseMeshRef.current?.material as THREE.Material)?.dispose();
      flameParticlesRef.current?.geometry.dispose();
      (flameParticlesRef.current?.material as THREE.Material)?.dispose();
      smokeParticlesRef.current?.geometry.dispose();
      (smokeParticlesRef.current?.material as THREE.Material)?.dispose();
      rendererRef.current?.dispose();
    };
  }, [width, height, config.particleCount, config.smokeCount, config.flameHeight, config.baseRadius,
      config.colorCore.getHex(), config.colorMid.getHex(), config.colorTip.getHex(),
      config.speed, config.turbulence, config.spawnRate, normalizedIntensity]);

  return (
    <div
      ref={containerRef}
      className={`flame-visualization-container ${className}`}
      style={{ width, height }}
      role="img"
      aria-label={`Flame intensity: ${intensity}`}
    />
  );
}