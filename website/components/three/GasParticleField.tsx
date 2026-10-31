import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html, Float } from '@react-three/drei';
import * as THREE from 'three';

export interface GasParticleFieldProps {
  ppm?: number;
  status?: string;
  width?: string | number;
  height?: string | number;
  onNodeClick?: (info: { ppm: number; status: string }) => void;
}

interface ParticlesProps {
  ppm: number;
  status: string;
  reducedMotion: boolean;
}

function GasParticles({ ppm = 0, status = 'SAFE', reducedMotion }: ParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const particleCount = Math.min(Math.max(1000, ppm * 3 + 300), 4000);

  // Generate particle positions and colors based on PPM density
  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const col = new Float32Array(particleCount * 3);

    const cSafe = new THREE.Color('#00E676');
    const cWarning = new THREE.Color('#FFD600');
    const cDanger = new THREE.Color('#FF3D00');
    const cPrimary = new THREE.Color('#00D4C8');

    for (let i = 0; i < particleCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = Math.cbrt(Math.random()) * 3.5;

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);

      let baseColor = cSafe;
      if (status === 'DANGER' || ppm >= 500) {
        baseColor = cDanger;
      } else if (status === 'WARNING' || ppm >= 200) {
        baseColor = cWarning;
      } else {
        baseColor = i % 2 === 0 ? cSafe : cPrimary;
      }

      col[i * 3] = baseColor.r;
      col[i * 3 + 1] = baseColor.g;
      col[i * 3 + 2] = baseColor.b;
    }

    return [pos, col];
  }, [particleCount, ppm, status]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geo;
  }, [positions, colors]);

  const material = useMemo(() => {
    return new THREE.PointsMaterial({
      size: 0.07,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }, []);

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  useFrame(({ clock }) => {
    if (!pointsRef.current || reducedMotion) return;
    const elapsedTime = clock.getElapsedTime();
    const speedFactor = 0.2 + (ppm / 1000) * 0.8;

    pointsRef.current.rotation.y = elapsedTime * 0.15 * speedFactor;
    pointsRef.current.rotation.x = Math.sin(elapsedTime * 0.1) * 0.1;

    const posAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const array = posAttr.array as Float32Array;

    for (let i = 0; i < particleCount; i++) {
      let y = array[i * 3 + 1];
      y -= 0.008 * speedFactor;
      if (y < -3.5) y = 3.5;
      array[i * 3 + 1] = y;
    }
    posAttr.needsUpdate = true;
  });

  return <points ref={pointsRef} geometry={geometry} material={material} />;
}

interface CoreNodeProps {
  ppm: number;
  status: string;
  onHover?: (hovered: boolean) => void;
  onClick?: () => void;
}

function CoreNode({ ppm, status, onHover, onClick }: CoreNodeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const coreColor = useMemo(() => {
    if (status === 'DANGER' || ppm >= 500) return '#FF3D00';
    if (status === 'WARNING' || ppm >= 200) return '#FFD600';
    return '#00D4C8';
  }, [status, ppm]);

  const coreGeometry = useMemo(() => new THREE.IcosahedronGeometry(1.0, 2), []);
  const coreMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: coreColor,
        wireframe: true,
        roughness: 0.2,
        metalness: 0.8,
        emissive: coreColor,
        emissiveIntensity: hovered ? 0.8 : 0.4,
      }),
    [coreColor, hovered]
  );

  const ringGeometry = useMemo(() => new THREE.TorusGeometry(1.5, 0.03, 16, 100), []);
  const ringMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#00FFB3',
        roughness: 0.1,
        metalness: 0.9,
        emissive: coreColor,
        emissiveIntensity: 0.6,
      }),
    [coreColor]
  );

  useEffect(() => {
    return () => {
      coreGeometry.dispose();
      coreMaterial.dispose();
      ringGeometry.dispose();
      ringMaterial.dispose();
    };
  }, [coreGeometry, coreMaterial, ringGeometry, ringMaterial]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.x = t * 0.3;
      meshRef.current.rotation.y = t * 0.4;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = t * -0.5;
      ringRef.current.rotation.x = Math.PI / 3 + Math.sin(t * 0.5) * 0.1;
    }
  });

  return (
    <group>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.8}>
        <mesh
          ref={meshRef}
          geometry={coreGeometry}
          material={coreMaterial}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
            onHover?.(true);
          }}
          onPointerOut={() => {
            setHovered(false);
            onHover?.(false);
          }}
          onClick={(e) => {
            e.stopPropagation();
            onClick?.();
          }}
        >
          {hovered && (
            <Html position={[0, 1.4, 0]} center>
              <div
                style={{
                  background: 'rgba(10, 15, 26, 0.9)',
                  border: `1px solid ${coreColor}`,
                  padding: '8px 12px',
                  borderRadius: '8px',
                  color: '#F0F4FF',
                  fontFamily: 'var(--font-display, monospace)',
                  fontSize: '12px',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
                  pointerEvents: 'none',
                }}
              >
                <div>Sensor Node #01</div>
                <div style={{ color: coreColor, fontWeight: 'bold' }}>
                  {ppm} PPM — {status}
                </div>
              </div>
            </Html>
          )}
        </mesh>

        <mesh ref={ringRef} geometry={ringGeometry} material={ringMaterial} />
      </Float>
    </group>
  );
}

export function GasParticleField({
  ppm = 0,
  status = 'SAFE',
  width = '100%',
  height = '450px',
  onNodeClick,
}: GasParticleFieldProps) {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [selectedInfo, setSelectedInfo] = useState<{ ppm: number; status: string } | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const handleNodeClick = () => {
    const info = { ppm, status };
    setSelectedInfo(info);
    onNodeClick?.(info);
  };

  return (
    <div
      className="gas-particle-field-container"
      style={{
        width,
        height,
        position: 'relative',
        background: 'var(--surface, #0A0F1A)',
        borderRadius: 'var(--radius-lg, 16px)',
        overflow: 'hidden',
        border: '1px solid var(--border-subtle, #1E2A4A)',
      }}
      role="region"
      aria-label="3D Gas Particle Concentration Field"
    >
      <Canvas
        camera={{ position: [0, 0, 5.5], fov: 60 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={['#0A0F1A']} />
        <ambientLight intensity={1.5} />
        <pointLight position={[5, 5, 5]} intensity={3} color="#00FFB3" />
        <pointLight position={[-5, -5, -5]} intensity={2} color="#00D4C8" />

        <GasParticles ppm={ppm} status={status} reducedMotion={reducedMotion} />
        <CoreNode ppm={ppm} status={status} onClick={handleNodeClick} />

        <OrbitControls
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
          autoRotate={!reducedMotion}
          autoRotateSpeed={0.5}
          maxDistance={10}
          minDistance={2}
          dampingFactor={0.05}
        />
      </Canvas>

      {/* UI Overlay */}
      <div
        style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          zIndex: 10,
          pointerEvents: 'none',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        <div
          style={{
            background: 'rgba(17, 24, 39, 0.85)',
            border: '1px solid var(--border-subtle, #1E2A4A)',
            padding: '8px 14px',
            borderRadius: '20px',
            fontFamily: 'var(--font-display, monospace)',
            fontSize: '12px',
            fontWeight: 700,
            color: 'var(--text-primary, #F0F4FF)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor:
                status === 'DANGER' || ppm >= 500
                  ? 'var(--danger, #FF3D00)'
                  : status === 'WARNING' || ppm >= 200
                  ? 'var(--warning, #FFD600)'
                  : 'var(--safe, #00E676)',
              boxShadow: '0 0 10px currentColor',
            }}
          />
          3D Particle Field: {ppm} PPM ({status})
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: '16px',
          right: '16px',
          zIndex: 10,
          background: 'rgba(10, 15, 26, 0.8)',
          padding: '6px 12px',
          borderRadius: '8px',
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '11px',
          color: 'var(--text-secondary, #8BA4D6)',
          border: '1px solid var(--border-subtle, #1E2A4A)',
          backdropFilter: 'blur(4px)',
          pointerEvents: 'none',
        }}
      >
        Drag to rotate | Scroll to zoom | Click core for details
      </div>
    </div>
  );
}

export default GasParticleField;
