'use client';

import { useEffect, useRef, useMemo, useState } from 'react';
import * as THREE from 'three';

interface PPMWaveformProps {
  ppm?: number;
  history?: number[];
  width?: number;
  height?: number;
  className?: string;
}

export function PPMWaveform({
  ppm = 0,
  history = [],
  width = 800,
  height = 300,
  className = ''
}: PPMWaveformProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const waveformLineRef = useRef<THREE.Line | null>(null);
  const waveformFillRef = useRef<THREE.Mesh | null>(null);
  const gridRef = useRef<THREE.LineSegments | null>(null);
  const thresholdLinesRef = useRef<THREE.Group | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const animationIdRef = useRef<number>(0);
  const clockRef = useRef<THREE.Clock | null>(null);
  const [dataHistory, setDataHistory] = useState<number[]>(history.slice(-200));
  const [currentPPM, setCurrentPPM] = useState(ppm);

  // Update internal history when props change
  useEffect(() => {
    setDataHistory(prev => {
      const newHistory = [...prev, ppm].slice(-200);
      return newHistory;
    });
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

  useEffect(() => {
    if (!containerRef.current) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const w = containerRef.current.clientWidth || width;
    const h = containerRef.current.clientHeight || height;

    // Orthographic camera for 2D waveform look
    const camera = new THREE.OrthographicCamera(
      -10, 10,  // left, right
      5, -5,    // top, bottom (inverted for screen coords)
      0.1, 100
    );
    camera.position.set(0, 0, 10);

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

    // Create grid
    const gridGeometry = new THREE.BufferGeometry();
    const gridPositions = new Float32Array(0); // Will be built dynamically
    const gridVertices: number[] = [];

    // Vertical lines (time)
    for (let i = 0; i <= 20; i++) {
      const x = -10 + i;
      gridVertices.push(x, -5, 0, x, 5, 0);
    }
    // Horizontal lines (PPM levels)
    for (let i = 0; i <= 10; i++) {
      const y = -5 + i;
      gridVertices.push(-10, y, 0, 10, y, 0);
    }

    gridGeometry.setAttribute('position', new THREE.Float32BufferAttribute(gridVertices, 3));

    const gridMaterial = new THREE.LineBasicMaterial({
      color: 0x002244,
      transparent: true,
      opacity: 0.3,
    });

    const grid = new THREE.LineSegments(gridGeometry, gridMaterial);
    scene.add(grid);
    gridRef.current = grid;

    // Threshold lines
    const thresholdGroup = new THREE.Group();

    const warnY = -5 + (config.thresholdWarn / config.maxPPM) * 10;
    const dangerY = -5 + (config.thresholdDanger / config.maxPPM) * 10;

    const warnGeometry = new THREE.BufferGeometry();
    warnGeometry.setAttribute('position', new THREE.Float32BufferAttribute([
      -10, warnY, 0, 10, warnY, 0
    ], 3));

    const warnMaterial = new THREE.LineBasicMaterial({
      color: 0xffd600,
      transparent: true,
      opacity: 0.5,
      linewidth: 2,
    });
    const warnLine = new THREE.Line(warnGeometry, warnMaterial);
    thresholdGroup.add(warnLine);

    const dangerGeometry = new THREE.BufferGeometry();
    dangerGeometry.setAttribute('position', new THREE.Float32BufferAttribute([
      -10, dangerY, 0, 10, dangerY, 0
    ], 3));

    const dangerMaterial = new THREE.LineBasicMaterial({
      color: 0xff3d00,
      transparent: true,
      opacity: 0.5,
      linewidth: 2,
    });
    const dangerLine = new THREE.Line(dangerGeometry, dangerMaterial);
    thresholdGroup.add(dangerLine);

    // Threshold labels (as sprites)
    const createLabel = (text: string, y: number, color: number) => {
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 32;
      const ctx = canvas.getContext('2d')!;
      ctx.font = 'bold 16px "JetBrains Mono", monospace';
      ctx.fillStyle = '#' + color.toString(16).padStart(6, '0');
      ctx.textAlign = 'center';
      ctx.fillText(text, 64, 22);

      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;

      const spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthTest: false,
      });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.position.set(-9.5, y, 0);
      sprite.scale.set(3, 0.75, 1);
      return sprite;
    };

    thresholdGroup.add(createLabel('WARN 200', warnY, 0xffd600));
    thresholdGroup.add(createLabel('DANGER 500', dangerY, 0xff3d00));

    scene.add(thresholdGroup);
    thresholdLinesRef.current = thresholdGroup;

    // Waveform line
    const maxPoints = 200;
    const waveformGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(maxPoints * 3);

    // Initialize with flat line
    for (let i = 0; i < maxPoints; i++) {
      const x = -10 + (i / (maxPoints - 1)) * 20;
      positions[i * 3] = x;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;
    }

    waveformGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    waveformGeometry.setDrawRange(0, maxPoints);

    // Line material with glow effect
    const lineMaterial = new THREE.LineBasicMaterial({
      color: config.lineColor,
      transparent: true,
      opacity: 1,
      linewidth: 3,
    });

    const waveformLine = new THREE.Line(waveformGeometry, lineMaterial);
    scene.add(waveformLine);
    waveformLineRef.current = waveformLine;

    // Fill area under curve
    const fillGeometry = new THREE.BufferGeometry();
    const fillPositions = new Float32Array(maxPoints * 6); // 2 triangles per point

    fillGeometry.setAttribute('position', new THREE.BufferAttribute(fillPositions, 3));
    fillGeometry.setDrawRange(0, maxPoints * 2); // 2 triangles per segment

    const fillMaterial = new THREE.MeshBasicMaterial({
      color: config.fillColor,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const waveformFill = new THREE.Mesh(fillGeometry, fillMaterial);
    scene.add(waveformFill);
    waveformFillRef.current = waveformFill;

    // Current value indicator
    const indicatorGeometry = new THREE.SphereGeometry(0.15, 16, 16);
    const indicatorMaterial = new THREE.MeshBasicMaterial({
      color: config.lineColor,
      transparent: true,
      opacity: 1,
      blending: THREE.AdditiveBlending,
    });
    const indicator = new THREE.Mesh(indicatorGeometry, indicatorMaterial);
    indicator.position.set(9, 0, 0.1);
    waveformLine.add(indicator); // Attach to line so it moves with latest point

    // Particle effects for data points
    const particleCount = 100;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);
    const particleSizes = new Float32Array(particleCount);
    const particleVelocities = new Float32Array(particleCount * 3);
    const particleLifetimes = new Float32Array(particleCount);
    const particleMaxLifetimes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = 9;
      particlePositions[i * 3 + 1] = 0;
      particlePositions[i * 3 + 2] = 0;

      const color = new THREE.Color(config.particleColor);
      particleColors[i * 3] = color.r;
      particleColors[i * 3 + 1] = color.g;
      particleColors[i * 3 + 2] = color.b;

      particleSizes[i] = 0.1 + Math.random() * 0.1;
      particleVelocities[i * 3] = -0.1 - Math.random() * 0.2;
      particleVelocities[i * 3 + 1] = (Math.random() - 0.5) * 0.1;
      particleVelocities[i * 3 + 2] = 0;
      particleLifetimes[i] = 0;
      particleMaxLifetimes[i] = 0.5 + Math.random() * 1;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));
    particleGeometry.setAttribute('size', new THREE.BufferAttribute(particleSizes, 1));
    particleGeometry.setAttribute('velocity', new THREE.BufferAttribute(particleVelocities, 3));
    particleGeometry.setAttribute('lifetime', new THREE.BufferAttribute(particleLifetimes, 1));
    particleGeometry.setAttribute('maxLifetime', new THREE.BufferAttribute(particleMaxLifetimes, 1));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.15,
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

    // PPM text display (as sprite)
    const ppmCanvas = document.createElement('canvas');
    ppmCanvas.width = 256;
    ppmCanvas.height = 64;
    const ppmCtx = ppmCanvas.getContext('2d')!;

    const ppmTexture = new THREE.CanvasTexture(ppmCanvas);
    const ppmSpriteMaterial = new THREE.SpriteMaterial({ map: ppmTexture, transparent: true });
    const ppmSprite = new THREE.Sprite(ppmSpriteMaterial);
    ppmSprite.position.set(0, 4, 0);
    ppmSprite.scale.set(8, 2, 1);
    scene.add(ppmSprite);

    const updatePPMDisplay = (value: number) => {
      ppmCtx.clearRect(0, 0, 256, 64);
      ppmCtx.font = 'bold 32px "JetBrains Mono", monospace';
      ppmCtx.fillStyle = '#' + config.lineColor.toString(16).padStart(6, '0');
      ppmCtx.textAlign = 'center';
      ppmCtx.fillText(`${value} PPM`, 128, 44);
      ppmCtx.font = '16px "JetBrains Mono", monospace';
      ppmCtx.fillStyle = '#888';
      ppmCtx.fillText('GAS CONCENTRATION', 128, 58);
      ppmTexture.needsUpdate = true;
    };

    updatePPMDisplay(currentPPM);

    let lastParticleSpawn = 0;

    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);

      if (!clockRef.current) return;

      const elapsed = clockRef.current.getElapsedTime();
      const delta = clockRef.current.getDelta();

      // Update waveform with current history
      if (waveformLineRef.current) {
        const positions = waveformLineRef.current.geometry.attributes.position;
        const fillPositions = waveformFillRef.current?.geometry.attributes.position;

        const historyLen = dataHistory.length;
        const maxPoints = positions.count;

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

        // Update fill geometry (triangles from line to bottom)
        if (fillPositions) {
          for (let i = 0; i < maxPoints - 1; i++) {
            const x1 = positions.getX(i);
            const y1 = positions.getY(i);
            const x2 = positions.getX(i + 1);
            const y2 = positions.getY(i + 1);

            // Triangle 1: (x1, y1) -> (x2, y2) -> (x1, -5)
            fillPositions.setXYZ(i * 6, x1, y1, 0.01);
            fillPositions.setXYZ(i * 6 + 1, x2, y2, 0.01);
            fillPositions.setXYZ(i * 6 + 2, x1, -5, 0.01);

            // Triangle 2: (x2, y2) -> (x2, -5) -> (x1, -5)
            fillPositions.setXYZ(i * 6 + 3, x2, y2, 0.01);
            fillPositions.setXYZ(i * 6 + 4, x2, -5, 0.01);
            fillPositions.setXYZ(i * 6 + 5, x1, -5, 0.01);
          }
          fillPositions.needsUpdate = true;
        }

        positions.needsUpdate = true;

        // Update indicator position (last data point)
        if (historyLen > 0) {
          const lastY = positions.getY(Math.min(historyLen - 1, maxPoints - 1));
          indicator.position.y = lastY;
        }
      }

      // Spawn particles at current value
      lastParticleSpawn += delta;
      const spawnInterval = 0.05 + (1 - currentPPM / 1000) * 0.1;

      if (lastParticleSpawn > spawnInterval && particlesRef.current) {
        lastParticleSpawn = 0;
        const positions = particlesRef.current.geometry.attributes.position;
        const velocities = particlesRef.current.geometry.attributes.velocity;
        const lifetimes = particlesRef.current.geometry.attributes.lifetime;
        const maxLifetimes = particlesRef.current.geometry.attributes.maxLifetime;
        const colors = particlesRef.current.geometry.attributes.color;
        const sizes = particlesRef.current.geometry.attributes.size;

        // Find a dead particle to respawn
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

        for (let i = 0; i < positions.count; i++) {
          const lifeRatio = lifetimes.getX(i) / maxLifetimes.getX(i);

          if (lifeRatio < 1) {
            const vx = velocities.getX(i);
            const vy = velocities.getY(i);

            positions.setX(i, positions.getX(i) + vx * delta * 60);
            positions.setY(i, positions.getY(i) + vy * delta * 60 + Math.sin(elapsed * 5 + i) * 0.01);

            lifetimes.setX(i, lifetimes.getX(i) + delta);

            // Fade out
            const baseSize = sizes.getX(i);
            (particlesRef.current.material as THREE.PointsMaterial).size = baseSize * (1 - lifeRatio);

            // Fade opacity
            const mat = particlesRef.current.material as THREE.PointsMaterial;
            mat.opacity = 0.8 * (1 - lifeRatio);
          }
        }

        positions.needsUpdate = true;
        lifetimes.needsUpdate = true;
      }

      // Grid subtle animation
      if (gridRef.current) {
        (gridRef.current.material as THREE.LineBasicMaterial).opacity =
          0.2 + Math.sin(elapsed * 0.5) * 0.1;
      }

      // Threshold lines pulse
      if (thresholdLinesRef.current) {
        thresholdLinesRef.current.traverse((obj) => {
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

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current) return;
      const w = containerRef.current.clientWidth || width;
      const h = containerRef.current.clientHeight || height;

      // Update orthographic camera
      camera.left = -10 * (w / width);
      camera.right = 10 * (w / width);
      camera.top = 5 * (h / height);
      camera.bottom = -5 * (h / height);
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

      waveformLineRef.current?.geometry.dispose();
      (waveformLineRef.current?.material as THREE.Material)?.dispose();
      waveformFillRef.current?.geometry.dispose();
      (waveformFillRef.current?.material as THREE.Material)?.dispose();
      gridRef.current?.geometry.dispose();
      (gridRef.current?.material as THREE.Material)?.dispose();
      particlesRef.current?.geometry.dispose();
      (particlesRef.current?.material as THREE.Material)?.dispose();
      ppmTexture.dispose();
      ppmSpriteMaterial.dispose();
      rendererRef.current?.dispose();
    };
  }, [width, height, config.lineColor, config.fillColor, config.glowColor, config.particleColor,
      config.thresholdWarn, config.thresholdDanger, config.maxPPM]);

  return (
    <div
      ref={containerRef}
      className={`ppm-waveform-container ${className}`}
      style={{ width, height }}
      role="img"
      aria-label={`PPM waveform, current: ${currentPPM} PPM`}
    />
  );
}