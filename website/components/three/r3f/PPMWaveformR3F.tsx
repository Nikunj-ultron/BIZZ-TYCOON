'use client';

import { useMemo, useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Line, LineSegments, Mesh, Sprite, BufferGeometry, Float32BufferAttribute, LineBasicMaterial, MeshBasicMaterial, SpriteMaterial, CanvasTexture, Group, OrthographicCamera, Points, PointsMaterial } from 'three';

interface PPMWaveformR3FProps {
  ppm?: number;
  history?: number[];
  className?: string;
}

export function PPMWaveformR3F({ ppm = 0, history = [], className = '' }: PPMWaveformR3FProps) {
  const prefersReducedMotion = useRef(false);
  const [dataHistory, setDataHistory] = useState<number[]>(history.slice(-200));
  const [currentPPM, setCurrentPPM] = useState(ppm);

  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  useEffect(() => {
    setDataHistory(prev => [...prev, ppm].slice(-200));
    setCurrentPPM(ppm);
  }, [ppm]);

  const config = useMemo(() => {
    const status = currentPPM >= 500 ? 'DANGER' : currentPPM >= 200 ? 'WARNING' : 'SAFE';

    switch (status) {
      case 'DANGER':
        return {
          lineColor: 0xff3d00,
          fillColor: 0xff3d00,
          glowColor: 0xff3d00,
          particleColor: 0xff6b35,
          thresholdWarn: 200,
          thresholdDanger: 500,
          maxPPM: 1000,
        };
      case 'WARNING':
        return {
          lineColor: 0xffd600,
          fillColor: 0xffd600,
          glowColor: 0xffd600,
          particleColor: 0xffaa00,
          thresholdWarn: 200,
          thresholdDanger: 500,
          maxPPM: 1000,
        };
      default:
        return {
          lineColor: 0x00e676,
          fillColor: 0x00e676,
          glowColor: 0x00d4c8,
          particleColor: 0x00ffb3,
          thresholdWarn: 200,
          thresholdDanger: 500,
          maxPPM: 1000,
        };
    }
  }, [currentPPM]);

  const waveformLineRef = useRef<any>(null);
  const waveformFillRef = useRef<any>(null);
  const gridRef = useRef<any>(null);
  const thresholdGroupRef = useRef<any>(null);
  const particlesRef = useRef<any>(null);
  const ppmSpriteRef = useRef<any>(null);
  const ppmTextureRef = useRef<CanvasTexture | null>(null);
  const clockRef = useRef<THREE.Clock | null>(null);
  const lastParticleSpawnRef = useRef(0);

  useEffect(() => {
    clockRef.current = new THREE.Clock();
  }, []);

  // Update PPM display texture
  const updatePPMDisplay = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    const texture = new CanvasTexture(canvas);
    texture.needsUpdate = true;

    return (value: number) => {
      ppmTextureRef.current = texture;
      ctx.clearRect(0, 0, 256, 64);
      ctx.font = 'bold 32px "JetBrains Mono", monospace';
      ctx.fillStyle = '#' + config.lineColor.toString(16).padStart(6, '0');
      ctx.textAlign = 'center';
      ctx.fillText(`${value} PPM`, 128, 44);
      ctx.font = '16px "JetBrains Mono", monospace';
      ctx.fillStyle = '#888';
      ctx.fillText('GAS CONCENTRATION', 128, 58);
      texture.needsUpdate = true;
    };
  }, [config.lineColor]);

  useEffect(() => {
    updatePPMDisplay(currentPPM);
  }, [currentPPM, updatePPMDisplay]);

  useFrame((_, delta) => {
    if (prefersReducedMotion.current || !clockRef.current) return;

    const elapsed = clockRef.current.getElapsedTime();

    // Update waveform line
    if (waveformLineRef.current) {
      const positions = waveformLineRef.current.geometry.attributes.position;
      const fillPositions = waveformFillRef.current?.geometry.attributes.position;
      const maxPoints = positions.count;
      const historyLen = dataHistory.length;

      for (let i = 0; i < maxPoints; i++) {
        const x = -10 + (i / (maxPoints - 1)) * 20;
        positions.setX(i, x);

        if (i < historyLen) {
          const idx = i - (maxPoints - historyLen);
          if (idx >= 0) {
            const ppmVal = dataHistory[idx];
            const y = -5 + (ppmVal / config.maxPPM) * 10;
            positions.setY(i, Math.max(-5, Math.min(5, y)));
          } else {
            positions.setY(i, 0);
          }
        } else {
          positions.setY(i, 0);
        }
        positions.setZ(i, 0);
      }

      // Update fill geometry
      if (fillPositions) {
        for (let i = 0; i < maxPoints - 1; i++) {
          const x1 = positions.getX(i);
          const y1 = positions.getY(i);
          const x2 = positions.getX(i + 1);
          const y2 = positions.getY(i + 1);

          fillPositions.setXYZ(i * 6, x1, y1, 0.01);
          fillPositions.setXYZ(i * 6 + 1, x2, y2, 0.01);
          fillPositions.setXYZ(i * 6 + 2, x1, -5, 0.01);
          fillPositions.setXYZ(i * 6 + 3, x2, y2, 0.01);
          fillPositions.setXYZ(i * 6 + 4, x2, -5, 0.01);
          fillPositions.setXYZ(i * 6 + 5, x1, -5, 0.01);
        }
        fillPositions.needsUpdate = true;
      }

      positions.needsUpdate = true;
    }

    // Spawn particles
    lastParticleSpawnRef.current += delta;
    const spawnInterval = 0.05 + (1 - currentPPM / 1000) * 0.1;

    if (lastParticleSpawnRef.current > spawnInterval && particlesRef.current) {
      lastParticleSpawnRef.current = 0;
      const positions = particlesRef.current.geometry.attributes.position;
      const velocities = particlesRef.current.geometry.attributes.velocity;
      const lifetimes = particlesRef.current.geometry.attributes.lifetime;
      const maxLifetimes = particlesRef.current.geometry.attributes.maxLifetime;
      const colors = particlesRef.current.geometry.attributes.color;
      const sizes = particlesRef.current.geometry.attributes.size;

      for (let i = 0; i < positions.count; i++) {
        if (lifetimes.getX(i) >= maxLifetimes.getX(i)) {
          const ppmY = -5 + (currentPPM / config.maxPPM) * 10;
          positions.setXYZ(i, 9, ppmY, 0);

          const color = new THREE.Color(config.particleColor);
          colors.setXYZ(i, color.r, color.g, color.b);

          sizes.setX(i, 0.1 + Math.random() * 0.15);
          velocities.setX(i, -0.15 - Math.random() * 0.2);
          velocities.setY(i, (Math.random() - 0.5) * 0.2);
          velocities.setZ(i, 0);

          lifetimes.setX(i, 0);
          maxLifetimes.setX(i, 0.3 + Math.random() * 0.7);
          break;
        }
      }
    }

    // Update particles
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position;
      const velocities = particlesRef.current.geometry.attributes.velocity;
      const lifetimes = particlesRef.current.geometry.attributes.lifetime;
      const maxLifetimes = particlesRef.current.geometry.attributes.maxLifetime;
      const sizes = particlesRef.current.geometry.attributes.size;
      const material = particlesRef.current.material as PointsMaterial;

      for (let i = 0; i < positions.count; i++) {
        const lifeRatio = lifetimes.getX(i) / maxLifetimes.getX(i);

        if (lifeRatio < 1) {
          const vx = velocities.getX(i);
          const vy = velocities.getY(i);

          positions.setX(i, positions.getX(i) + vx * delta * 60);
          positions.setY(i, positions.getY(i) + vy * delta * 60 + Math.sin(elapsed * 5 + i) * 0.01);

          lifetimes.setX(i, lifetimes.getX(i) + delta);

          const baseSize = sizes.getX(i);
          material.size = baseSize * (1 - lifeRatio);
          material.opacity = 0.8 * (1 - lifeRatio);
        }
      }

      positions.needsUpdate = true;
      lifetimes.needsUpdate = true;
    }

    // Grid animation
    if (gridRef.current) {
      const mat = gridRef.current.material as THREE.LineBasicMaterial;
      mat.opacity = 0.2 + Math.sin(elapsed * 0.5) * 0.1;
    }

    // Threshold lines pulse
    if (thresholdGroupRef.current) {
      thresholdGroupRef.current.traverse((obj: THREE.Object3D) => {
        if (obj instanceof THREE.Line) {
          const mat = obj.material as THREE.LineBasicMaterial;
          mat.opacity = 0.4 + Math.sin(elapsed * 2) * 0.1;
        }
      });
    }

    // Waveform line glow pulse
    if (waveformLineRef.current) {
      const mat = waveformLineRef.current.material as THREE.LineBasicMaterial;
      mat.opacity = 0.8 + Math.sin(elapsed * 3) * 0.2;
    }

    // Update PPM display
    updatePPMDisplay(currentPPM);
  });

  return (
    <group>
      {/* Orthographic camera for 2D waveform */}
      <orthographicCamera
        position={[0, 0, 10]}
        left={-10}
        right={10}
        top={5}
        bottom={-5}
        near={0.1}
        far={100}
      />

      {/* Grid */}
      <lineSegments ref={gridRef}>
        <bufferGeometry>
          <float32BufferAttribute
            name="position"
            array={(() => {
              const vertices: number[] = [];
              for (let i = 0; i <= 20; i++) {
                const x = -10 + i;
                vertices.push(x, -5, 0, x, 5, 0);
              }
              for (let i = 0; i <= 10; i++) {
                const y = -5 + i;
                vertices.push(-10, y, 0, 10, y, 0);
              }
              return new Float32Array(vertices);
            })()}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color={0x002244} transparent opacity={0.3} />
      </lineSegments>

      {/* Threshold lines */}
      <group ref={thresholdGroupRef}>
        <line>
          <bufferGeometry>
            <float32BufferAttribute
              array={new Float32Array([-10, -5 + (config.thresholdWarn / config.maxPPM) * 10, 0, 10, -5 + (config.thresholdWarn / config.maxPPM) * 10, 0])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color={0xffd600} transparent opacity={0.5} />
        </line>
        <line>
          <bufferGeometry>
            <float32BufferAttribute
              array={new Float32Array([-10, -5 + (config.thresholdDanger / config.maxPPM) * 10, 0, 10, -5 + (config.thresholdDanger / config.maxPPM) * 10, 0])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color={0xff3d00} transparent opacity={0.5} />
        </line>
        {/* Threshold labels */}
        <sprite
          position={[-9.5, -5 + (config.thresholdWarn / config.maxPPM) * 10, 0]}
          scale={[3, 0.75, 1]}
        >
          <spriteMaterial
            map={(() => {
              const canvas = document.createElement('canvas');
              canvas.width = 128;
              canvas.height = 32;
              const ctx = canvas.getContext('2d')!;
              ctx.font = 'bold 16px "JetBrains Mono", monospace';
              ctx.fillStyle = '#ffd600';
              ctx.textAlign = 'center';
              ctx.fillText('WARN 200', 64, 22);
              const texture = new CanvasTexture(canvas);
              texture.needsUpdate = true;
              return texture;
            })()}
            transparent
            depthTest={false}
          />
        </sprite>
        <sprite
          position={[-9.5, -5 + (config.thresholdDanger / config.maxPPM) * 10, 0]}
          scale={[3, 0.75, 1]}
        >
          <spriteMaterial
            map={(() => {
              const canvas = document.createElement('canvas');
              canvas.width = 128;
              canvas.height = 32;
              const ctx = canvas.getContext('2d')!;
              ctx.font = 'bold 16px "JetBrains Mono", monospace';
              ctx.fillStyle = '#ff3d00';
              ctx.textAlign = 'center';
              ctx.fillText('DANGER 500', 64, 22);
              const texture = new CanvasTexture(canvas);
              texture.needsUpdate = true;
              return texture;
            })()}
            transparent
            depthTest={false}
          />
        </sprite>
      </group>

      {/* Waveform line */}
      <line ref={waveformLineRef}>
        <bufferGeometry>
          <float32BufferAttribute
            name="position"
            array={new Float32Array(200 * 3)}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color={config.lineColor} transparent opacity={1} linewidth={3} />
      </line>

      {/* Fill area */}
      <mesh ref={waveformFillRef}>
        <bufferGeometry>
          <float32BufferAttribute
            name="position"
            array={new Float32Array(200 * 6)}
            itemSize={3}
          />
        </bufferGeometry>
        <meshBasicMaterial
          color={config.fillColor}
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Particles */}
      <points ref={particlesRef} position={[0, 0, 0]}>
        <bufferGeometry>
          <float32BufferAttribute name="position" array={new Float32Array(100 * 3)} itemSize={3} />
          <float32BufferAttribute name="color" array={new Float32Array(100 * 3)} itemSize={3} />
          <float32BufferAttribute name="size" array={new Float32Array(100)} itemSize={1} />
          <float32BufferAttribute name="velocity" array={new Float32Array(100 * 3)} itemSize={3} />
          <float32BufferAttribute name="lifetime" array={new Float32Array(100)} itemSize={1} />
          <float32BufferAttribute name="maxLifetime" array={new Float32Array(100)} itemSize={1} />
        </bufferGeometry>
        <pointsMaterial
          size={0.15}
          vertexColors
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation
        />
      </points>

      {/* PPM Display Sprite */}
      <sprite
        ref={ppmSpriteRef}
        position={[0, 4, 0]}
        scale={[8, 2, 1]}
      >
        <spriteMaterial
          map={ppmTextureRef.current || new CanvasTexture(document.createElement('canvas'))}
          transparent
        />
      </sprite>
    </group>
  );
}