'use client';

import { useMemo, useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Mesh, CylinderGeometry, SphereGeometry, TorusGeometry, PlaneGeometry, BoxGeometry, Group, MeshStandardMaterial, MeshBasicMaterial, Points, BufferGeometry, BufferAttribute, PointsMaterial, Color, GridHelper, AmbientLight, DirectionalLight, Mesh as ThreeMesh } from 'three';

interface SensorData {
  name: string;
  value: number;
  unit: string;
  status: 'SAFE' | 'WARNING' | 'DANGER' | 'ONLINE' | 'OFFLINE';
}

interface SensorGrid3DR3FProps {
  sensors: SensorData[];
  className?: string;
}

const SENSOR_COLORS: Record<string, { color: number; emissive: number }> = {
  SAFE: { color: 0x00e676, emissive: 0x00e676 },
  WARNING: { color: 0xffd600, emissive: 0xffd600 },
  DANGER: { color: 0xff3d00, emissive: 0xff3d00 },
  ONLINE: { color: 0x00d4c8, emissive: 0x00d4c8 },
  OFFLINE: { color: 0x444444, emissive: 0x000000 },
};

export function SensorGrid3DR3F({ sensors = [], className = '' }: SensorGrid3DR3FProps) {
  const prefersReducedMotion = useRef(false);

  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

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
        index,
      };
    });
  }, [sensors]);

  const sensorGroupsRef = useRef<Map<string, THREE.Group>>(new Map());
  const particlesRef = useRef<Points>(null);
  const clockRef = useRef<THREE.Clock | null>(null);

  useEffect(() => {
    clockRef.current = new THREE.Clock();

    // Initialize sensor groups
    layout.forEach((sensor) => {
      const group = new Group();
      const colors = SENSOR_COLORS[sensor.status];

      // Base platform
      const baseGeo = new CylinderGeometry(0.8, 0.9, 0.15, 8);
      const baseMat = new MeshStandardMaterial({
        color: colors.color,
        roughness: 0.3,
        metalness: 0.7,
        emissive: colors.emissive,
        emissiveIntensity: sensor.status === 'OFFLINE' ? 0 : 0.4,
      });
      const base = new ThreeMesh(baseGeo, baseMat);
      base.position.y = 0;
      group.add(base);

      // Sensor pillar
      const pillarGeo = new CylinderGeometry(0.2, 0.3, 1.5, 8);
      const pillarMat = new MeshStandardMaterial({
        color: 0x1a1a2e,
        roughness: 0.2,
        metalness: 0.9,
        emissive: colors.emissive,
        emissiveIntensity: 0.2,
      });
      const pillar = new ThreeMesh(pillarGeo, pillarMat);
      pillar.position.y = 0.8;
      group.add(pillar);

      // Top indicator
      const topGeo = new SphereGeometry(0.25, 16, 16);
      const topMat = new MeshStandardMaterial({
        color: colors.color,
        roughness: 0.1,
        metalness: 0.9,
        emissive: colors.emissive,
        emissiveIntensity: 1,
      });
      const top = new ThreeMesh(topGeo, topMat);
      top.position.y = 1.65;
      group.add(top);

      // Value ring
      if (typeof sensor.value === 'number' && sensor.value >= 0) {
        const ringGeo = new TorusGeometry(0.6, 0.03, 8, 32);
        const ringMat = new MeshBasicMaterial({
          color: colors.color,
          transparent: true,
          opacity: 0.6,
          blending: THREE.AdditiveBlending,
        });
        const ring = new ThreeMesh(ringGeo, ringMat);
        ring.position.y = 1.65;
        ring.rotation.x = -Math.PI / 2;
        ring.userData.normalizedValue = Math.min(sensor.value / 1000, 1);
        ring.userData.index = sensor.index;
        group.add(ring);
      }

      // Pulsing glow for WARNING/DANGER
      if (sensor.status === 'WARNING' || sensor.status === 'DANGER') {
        const glowGeo = new SphereGeometry(0.5, 16, 16);
        const glowMat = new MeshBasicMaterial({
          color: colors.color,
          transparent: true,
          opacity: 0.1,
          side: THREE.BackSide,
          blending: THREE.AdditiveBlending,
        });
        const glow = new ThreeMesh(glowGeo, glowMat);
        glow.position.y = 0.8;
        glow.userData.isPulse = true;
        group.add(glow);
      }

      group.position.set(sensor.x, 0, sensor.z);
      sensorGroupsRef.current.set(sensor.name, group);
    });
  }, [layout]);

  // Initialize particles
  useEffect(() => {
    if (!particlesRef.current) return;

    const particleCount = 200;
    const geometry = new BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 25;
      positions[i * 3 + 1] = Math.random() * 8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 25;

      const color = new Color(0x00d4c8).lerp(new Color(0x0080ff), Math.random());
      colors[i * 3] = color.r * 0.2;
      colors[i * 3 + 1] = color.g * 0.2;
      colors[i * 3 + 2] = color.b * 0.2;

      sizes[i] = 0.02 + Math.random() * 0.03;
    }

    geometry.setAttribute('position', new BufferAttribute(positions, 3));
    geometry.setAttribute('color', new BufferAttribute(colors, 3));
    geometry.setAttribute('size', new BufferAttribute(sizes, 1));

    particlesRef.current.geometry.dispose();
    particlesRef.current.geometry = geometry;
  }, []);

  useFrame(() => {
    if (prefersReducedMotion.current || !clockRef.current) return;

    const elapsed = clockRef.current.getElapsedTime();

    // Animate sensor nodes
    sensorGroupsRef.current.forEach((group, name) => {
      const sensor = layout.find(s => s.name === name);
      if (!sensor) return;

      group.traverse((obj) => {
        if (obj instanceof ThreeMesh) {
          const userData = obj.userData;

          // Pulsing glow
          if (userData.isPulse) {
            const scale = 1 + Math.sin(elapsed * 2 + userData.index * 0.5) * 0.2;
            obj.scale.setScalar(scale);
            const mat = obj.material as MeshBasicMaterial;
            mat.opacity = 0.05 + Math.sin(elapsed * 2 + userData.index * 0.5) * 0.05;
          }

          // Value ring animation
          if (userData.normalizedValue !== undefined) {
            obj.rotation.z = elapsed * 0.2;
            const scale = 1 + userData.normalizedValue * 0.5 * Math.sin(elapsed * 3);
            obj.scale.setScalar(scale);
          }

          // Top indicator pulse
          if (obj.geometry instanceof SphereGeometry && obj.position.y > 1.5) {
            const pulse = 1 + Math.sin(elapsed * 3 + userData.index) * 0.1;
            obj.scale.setScalar(pulse);
          }
        }
      });

      // Subtle floating
      group.position.y = Math.sin(elapsed * 0.5 + sensor.x + sensor.z) * 0.05;
    });

    // Rotate particle field slowly
    if (particlesRef.current) {
      particlesRef.current.rotation.y = elapsed * 0.01;
    }
  });

  return (
    <group>
      {/* Ground plane */}
      <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial
          color={0x0a0f1a}
          roughness={0.8}
          metalness={0.2}
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* Grid helper */}
      <gridHelper args={[20, 20, 0x00d4c8, 0x002244]} position={[0, -0.49, 0]}>
        <meshBasicMaterial transparent opacity={0.2} />
      </gridHelper>

      {/* Sensor nodes */}
      {layout.map((sensor) => (
        <group key={sensor.name} position={[sensor.x, 0, sensor.z]}>
          {/* Base platform */}
          <mesh position={[0, 0, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.8, 0.9, 0.15, 8]} />
            <meshStandardMaterial
              color={SENSOR_COLORS[sensor.status].color}
              roughness={0.3}
              metalness={0.7}
              emissive={SENSOR_COLORS[sensor.status].emissive}
              emissiveIntensity={sensor.status === 'OFFLINE' ? 0 : 0.4}
            />
          </mesh>

          {/* Sensor pillar */}
          <mesh position={[0, 0.8, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.2, 0.3, 1.5, 8]} />
            <meshStandardMaterial
              color={0x1a1a2e}
              roughness={0.2}
              metalness={0.9}
              emissive={SENSOR_COLORS[sensor.status].emissive}
              emissiveIntensity={0.2}
            />
          </mesh>

          {/* Top indicator */}
          <mesh position={[0, 1.65, 0]} castShadow>
            <sphereGeometry args={[0.25, 16, 16]} />
            <meshStandardMaterial
              color={SENSOR_COLORS[sensor.status].color}
              roughness={0.1}
              metalness={0.9}
              emissive={SENSOR_COLORS[sensor.status].emissive}
              emissiveIntensity={1}
            />
          </mesh>

          {/* Value ring */}
          {typeof sensor.value === 'number' && sensor.value >= 0 && (
            <mesh position={[0, 1.65, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.6, 0.03, 8, 32]} />
              <meshBasicMaterial
                color={SENSOR_COLORS[sensor.status].color}
                transparent
                opacity={0.6}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
          )}

          {/* Pulsing glow for WARNING/DANGER */}
          {(sensor.status === 'WARNING' || sensor.status === 'DANGER') && (
            <mesh position={[0, 0.8, 0]}>
              <sphereGeometry args={[0.5, 16, 16]} />
              <meshBasicMaterial
                color={SENSOR_COLORS[sensor.status].color}
                transparent
                opacity={0.1}
                side={THREE.BackSide}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
          )}
        </group>
      ))}

      {/* Atmosphere particles */}
      <points ref={particlesRef} position={[0, 0, 0]}>
        <bufferGeometry>
          <bufferAttribute name="position" count={200} itemSize={3} />
          <bufferAttribute name="color" count={200} itemSize={3} />
          <bufferAttribute name="size" count={200} itemSize={1} />
        </bufferGeometry>
        <pointsMaterial
          size={0.03}
          vertexColors
          transparent
          opacity={0.3}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation
        />
      </points>

      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight color={0x00d4c8} intensity={1} position={[5, 10, 5]} castShadow />
      <directionalLight color={0x0080ff} intensity={0.5} position={[-5, 5, -5]} />
    </group>
  );
}