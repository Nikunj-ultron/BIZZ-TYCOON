'use client';

import { useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';

interface SensorData {
  name: string;
  value: number;
  unit: string;
  status: 'SAFE' | 'WARNING' | 'DANGER' | 'ONLINE' | 'OFFLINE';
  icon?: string;
}

interface SensorGrid3DProps {
  sensors: SensorData[];
  width?: number;
  height?: number;
  className?: string;
}

const SENSOR_COLORS: Record<string, { color: number; emissive: number }> = {
  SAFE: { color: 0x00e676, emissive: 0x00e676 },
  WARNING: { color: 0xffd600, emissive: 0xffd600 },
  DANGER: { color: 0xff3d00, emissive: 0xff3d00 },
  ONLINE: { color: 0x00d4c8, emissive: 0x00d4c8 },
  OFFLINE: { color: 0x444444, emissive: 0x000000 },
};

export function SensorGrid3D({
  sensors = [],
  width = 600,
  height = 400,
  className = ''
}: SensorGrid3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sensorMeshesRef = useRef<Map<string, THREE.Group>>(new Map());
  const animationIdRef = useRef<number>(0);
  const clockRef = useRef<THREE.Clock | null>(null);

  const layout = useMemo(() => {
    const cols = Math.ceil(Math.sqrt(sensors.length));
    const rows = Math.ceil(sensors.length / cols);
    const spacing = 2.5;
    const startX = -((cols - 1) * spacing) / 2;
    const startZ = -((rows - 1) * spacing) / 2;

    return sensors.map((sensor, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      return {
        ...sensor,
        x: startX + col * spacing,
        z: startZ + row * spacing,
      };
    });
  }, [sensors]);

  useEffect(() => {
    if (!containerRef.current) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const w = containerRef.current.clientWidth || width;
    const h = containerRef.current.clientHeight || height;

    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    camera.position.set(0, 8, 10);
    camera.lookAt(0, 0, 0);

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

    // Ground plane
    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x0a0f1a,
      roughness: 0.8,
      metalness: 0.2,
      transparent: true,
      opacity: 0.3,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.5;
    scene.add(ground);

    // Grid lines
    const gridHelper = new THREE.GridHelper(20, 20, 0x00d4c8, 0x002244);
    gridHelper.position.y = -0.49;
    gridHelper.material.opacity = 0.2;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);

    // Create sensor nodes
    layout.forEach((sensor, index) => {
      const group = new THREE.Group();

      // Base platform
      const baseGeometry = new THREE.CylinderGeometry(0.8, 0.9, 0.15, 8);
      const baseColors = SENSOR_COLORS[sensor.status];
      const baseMaterial = new THREE.MeshStandardMaterial({
        color: baseColors.color,
        roughness: 0.3,
        metalness: 0.7,
        emissive: baseColors.emissive,
        emissiveIntensity: sensor.status === 'OFFLINE' ? 0 : 0.4,
      });
      const base = new THREE.Mesh(baseGeometry, baseMaterial);
      base.position.y = 0;
      group.add(base);

      // Sensor pillar
      const pillarGeometry = new THREE.CylinderGeometry(0.2, 0.3, 1.5, 8);
      const pillarMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a2e,
        roughness: 0.2,
        metalness: 0.9,
        emissive: baseColors.emissive,
        emissiveIntensity: 0.2,
      });
      const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
      pillar.position.y = 0.8;
      group.add(pillar);

      // Top indicator
      const topGeometry = new THREE.SphereGeometry(0.25, 16, 16);
      const topMaterial = new THREE.MeshStandardMaterial({
        color: baseColors.color,
        roughness: 0.1,
        metalness: 0.9,
        emissive: baseColors.emissive,
        emissiveIntensity: 1,
      });
      const top = new THREE.Mesh(topGeometry, topMaterial);
      top.position.y = 1.65;
      group.add(top);

      // Value ring (for numeric sensors)
      if (typeof sensor.value === 'number' && sensor.value >= 0) {
        const ringGeometry = new THREE.TorusGeometry(0.6, 0.03, 8, 32);
        const ringMaterial = new THREE.MeshBasicMaterial({
          color: baseColors.color,
          transparent: true,
          opacity: 0.6,
          blending: THREE.AdditiveBlending,
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.position.y = 1.65;
        ring.rotation.x = -Math.PI / 2;
        group.add(ring);

        // Store normalized value for animation
        (ring as any).userData.normalizedValue = Math.min(sensor.value / 1000, 1);
        (ring as any).userData.index = index;
      }

      // Pulsing glow for WARNING/DANGER
      if (sensor.status === 'WARNING' || sensor.status === 'DANGER') {
        const glowGeometry = new THREE.SphereGeometry(0.5, 16, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
          color: baseColors.color,
          transparent: true,
          opacity: 0.1,
          side: THREE.BackSide,
          blending: THREE.AdditiveBlending,
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.y = 0.8;
        group.add(glow);
        (glow as any).userData.isPulse = true;
      }

      group.position.set(sensor.x, 0, sensor.z);
      scene.add(group);
      sensorMeshesRef.current.set(sensor.name, group);
    });

    // Particle field for atmosphere
    const particleCount = 200;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);
    const particleSizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 25;
      particlePositions[i * 3 + 1] = Math.random() * 8;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 25;

      const color = new THREE.Color(0x00d4c8).lerp(new THREE.Color(0x0080ff), Math.random());
      particleColors[i * 3] = color.r * 0.2;
      particleColors[i * 3 + 1] = color.g * 0.2;
      particleColors[i * 3 + 2] = color.b * 0.2;

      particleSizes[i] = 0.02 + Math.random() * 0.03;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));
    particleGeometry.setAttribute('size', new THREE.BufferAttribute(particleSizes, 1));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.03,
      vertexColors: true,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0x00d4c8, 1);
    mainLight.position.set(5, 10, 5);
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0x0080ff, 0.5);
    fillLight.position.set(-5, 5, -5);
    scene.add(fillLight);

    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);

      if (!clockRef.current) return;

      const elapsed = clockRef.current.getElapsedTime();
      const delta = clockRef.current.getDelta();

      // Animate sensor nodes
      sensorMeshesRef.current.forEach((group, name) => {
        const sensor = layout.find(s => s.name === name);
        if (!sensor) return;

        group.traverse((obj) => {
          if (obj instanceof THREE.Mesh) {
            const userData = obj.userData;

            // Pulsing glow
            if (userData.isPulse) {
              const scale = 1 + Math.sin(elapsed * 2 + userData.index * 0.5) * 0.2;
              obj.scale.setScalar(scale);
              const mat = obj.material as THREE.MeshBasicMaterial;
              mat.opacity = 0.05 + Math.sin(elapsed * 2 + userData.index * 0.5) * 0.05;
            }

            // Value ring animation
            if (userData.normalizedValue !== undefined) {
              obj.rotation.z = elapsed * 0.2;
              const scale = 1 + userData.normalizedValue * 0.5 * Math.sin(elapsed * 3);
              obj.scale.setScalar(scale);
            }

            // Top indicator pulse
            if (obj.geometry instanceof THREE.SphereGeometry && obj.position.y > 1.5) {
              const pulse = 1 + Math.sin(elapsed * 3 + userData.index) * 0.1;
              obj.scale.setScalar(pulse);
            }
          }
        });

        // Subtle floating
        group.position.y = Math.sin(elapsed * 0.5 + sensor.x + sensor.z) * 0.05;
      });

      // Rotate particle field slowly
      particles.rotation.y = elapsed * 0.01;

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

      // Cleanup all sensor meshes
      sensorMeshesRef.current.forEach((group) => {
        group.traverse((obj) => {
          if (obj instanceof THREE.Mesh) {
            obj.geometry.dispose();
            if (Array.isArray(obj.material)) {
              obj.material.forEach(m => m.dispose());
            } else {
              (obj.material as THREE.Material).dispose();
            }
          }
        });
      });

      particles.geometry.dispose();
      (particles.material as THREE.Material).dispose();
      ground.geometry.dispose();
      (ground.material as THREE.Material).dispose();
      rendererRef.current?.dispose();
    };
  }, [width, height, layout.length]);

  return (
    <div
      ref={containerRef}
      className={`sensor-grid-3d-container ${className}`}
      style={{ width, height }}
      role="img"
      aria-label={`3D sensor grid with ${sensors.length} sensors`}
    />
  );
}