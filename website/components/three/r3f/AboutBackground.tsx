'use client';

import { useFrame } from '@react-three/fiber';
import { Stars, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useReducedMotion } from '@/lib/animations/useReducedMotion';
import { useRef, useEffect } from 'react';
import { ThreeCanvas } from './ThreeCanvas';

// Ambient background particles - uses useRef for stable buffer attributes
function AmbientParticles({ count = 500 }: { count: number }) {
  const positionsRef = useRef<Float32Array | null>(null);
  const colorsRef = useRef<Float32Array | null>(null);
  const sizesRef = useRef<Float32Array | null>(null);
  const geometryRef = useRef<THREE.BufferGeometry | null>(null);
  const timeRef = useRef(0);
  const reducedMotion = useReducedMotion();

  // Initialize geometry once
  useEffect(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const radius = 15 + Math.random() * 35;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      const colorChoice = Math.random();
      if (colorChoice < 0.33) {
        colors[i * 3] = 0; colors[i * 3 + 1] = 0.83; colors[i * 3 + 2] = 0.78; // brand
      } else if (colorChoice < 0.66) {
        colors[i * 3] = 0; colors[i * 3 + 1] = 0.9; colors[i * 3 + 2] = 0.46; // safe
      } else {
        colors[i * 3] = 1; colors[i * 3 + 1] = 0.84; colors[i * 3 + 2] = 0; // warning
      }

      sizes[i] = 0.5 + Math.random() * 1.5;
    }

    positionsRef.current = positions;
    colorsRef.current = colors;
    sizesRef.current = sizes;

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometryRef.current = geometry;

    return () => {
      geometry.dispose();
    };
  }, [count]);

  // Animate particles
  useFrame(() => {
    if (reducedMotion || !geometryRef.current) return;
    timeRef.current += 0.001;

    const positions = positionsRef.current;
    if (!positions) return;

    for (let i = 0; i < count; i++) {
      // Subtle floating motion
      positions[i * 3 + 1] += Math.sin(timeRef.current + i * 0.1) * 0.002;
    }
    geometryRef.current.attributes.position.needsUpdate = true;
  });

  return (
    <points>
      {geometryRef.current && <primitive object={geometryRef.current} />}
      <pointsMaterial
        vertexColors
        sizeAttenuation
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// Floating geometric shapes - uses useFrame for animations
function FloatingGeometry() {
  const reducedMotion = useReducedMotion();
  const groupRef = useRef<THREE.Group | null>(null);
  const timeRef = useRef(0);

  const geometries = [
    { type: 'octahedron', args: [1], position: [-8, 3, -5], rotationSpeed: [0.1, 0.05, 0.02], color: 0x00d4c8 },
    { type: 'tetrahedron', args: [0.8], position: [6, -2, -8], rotationSpeed: [-0.05, 0.1, 0.03], color: 0x00e676 },
    { type: 'icosahedron', args: [0.6], position: [-4, -4, 6], rotationSpeed: [0.03, -0.08, 0.05], color: 0xffd600 },
    { type: 'dodecahedron', args: [0.7], position: [7, 4, 4], rotationSpeed: [-0.07, 0.02, -0.06], color: 0xff3d00 },
  ];

  // Initialize meshes
  useEffect(() => {
    const group = new THREE.Group();
    geometries.forEach((geo) => {
      let geometry: THREE.BufferGeometry;
      switch (geo.type) {
        case 'octahedron':
          geometry = new THREE.OctahedronGeometry(...geo.args);
          break;
        case 'tetrahedron':
          geometry = new THREE.TetrahedronGeometry(...geo.args);
          break;
        case 'icosahedron':
          geometry = new THREE.IcosahedronGeometry(...geo.args);
          break;
        case 'dodecahedron':
          geometry = new THREE.DodecahedronGeometry(...geo.args);
          break;
        default:
          geometry = new THREE.BoxGeometry(1, 1, 1);
      }

      const mesh = new THREE.Mesh(
        geometry,
        new THREE.MeshStandardMaterial({
          color: geo.color,
          metalness: 0.3,
          roughness: 0.4,
          transparent: true,
          opacity: 0.7,
          wireframe: true,
        })
      );
      mesh.position.set(geo.position[0], geo.position[1], geo.position[2]);
      mesh.userData = { rotationSpeed: geo.rotationSpeed, basePosition: geo.position };
      group.add(mesh);

      // Outer wireframe glow
      const outerGeometry = geometry.clone();
      outerGeometry.scale(1.1, 1.1, 1.1);
      const outerMesh = new THREE.Mesh(
        outerGeometry,
        new THREE.MeshBasicMaterial({
          color: geo.color,
          transparent: true,
          opacity: 0.1,
          wireframe: true,
        })
      );
      outerMesh.position.set(geo.position[0], geo.position[1], geo.position[2]);
      outerMesh.userData = { rotationSpeed: geo.rotationSpeed, basePosition: geo.position };
      group.add(outerMesh);
    });
    groupRef.current = group;
  }, []);

  // Animate meshes
  useFrame(() => {
    if (reducedMotion || !groupRef.current) return;
    timeRef.current += 0.01;

    groupRef.current.children.forEach((child, index) => {
      if (child instanceof THREE.Mesh && child.userData.rotationSpeed) {
        const speed = child.userData.rotationSpeed;
        child.rotation.x += speed[0] * 0.01;
        child.rotation.y += speed[1] * 0.01;
        child.rotation.z += speed[2] * 0.01;

        // Floating position animation
        const basePos = child.userData.basePosition;
        if (basePos) {
          child.position.x = basePos[0] + Math.sin(timeRef.current + index) * 0.3;
          child.position.y = basePos[1] + Math.cos(timeRef.current * 0.7 + index) * 0.3;
          child.position.z = basePos[2] + Math.sin(timeRef.current * 0.3 + index) * 0.3;
        }
      }
    });
  });

  return groupRef.current ? <primitive object={groupRef.current} /> : null;
}

// Data visualization rings - uses useFrame for animations
function DataRings() {
  const reducedMotion = useReducedMotion();
  const ringsRef = useRef<THREE.Group | null>(null);
  const timeRef = useRef(0);

  // Initialize rings
  useEffect(() => {
    const group = new THREE.Group();
    [0, 1, 2].forEach((ring) => {
      const ringGeometry = new THREE.RingGeometry(3 + ring * 1.5, 3.2 + ring * 1.5, 32);
      const material = new THREE.MeshBasicMaterial({
        color: ring === 0 ? 0x00d4c8 : ring === 1 ? 0x00e676 : 0xffd600,
        transparent: true,
        opacity: 0.15 - ring * 0.03,
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(ringGeometry, material);
      mesh.rotation.x = -Math.PI / 2;
      mesh.userData = { ringIndex: ring };
      group.add(mesh);
    });
    ringsRef.current = group;
  }, []);

  // Animate rings
  useFrame(() => {
    if (reducedMotion || !ringsRef.current) return;
    timeRef.current += 0.005;

    ringsRef.current.children.forEach((child, index) => {
      if (child instanceof THREE.Mesh && child.userData.ringIndex !== undefined) {
        const ring = child.userData.ringIndex;
        child.rotation.z = timeRef.current * (0.02 + ring * 0.01);
        child.scale.setScalar(1 + Math.sin(timeRef.current * 0.5 + ring) * 0.02);
      }
    });
  });

  return ringsRef.current ? <primitive object={ringsRef.current} /> : null;
}

// Background Scene
function BackgroundScene() {
  return (
    <>
      <primitive attach="background" object={new THREE.Color('#0A0F1A')} />
      <primitive attach="fog" object={new THREE.Fog('#0A0F1A', 20, 100)} />

      {/* Stars */}
      <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} />

      {/* Ambient particles */}
      <AmbientParticles count={300} />

      {/* Data rings */}
      <DataRings />

      {/* Floating geometry */}
      <FloatingGeometry />

      {/* Lights */}
      <primitive object={new THREE.AmbientLight(0x00d4c8, 0.2)} />
      <primitive object={new THREE.DirectionalLight(0x00d4c8, 0.3)} position={[10, 10, 5]} />
      <primitive object={new THREE.DirectionalLight(0x00e676, 0.2)} position={[-10, 5, -5]} />
      <primitive object={new THREE.PointLight(0xffd600, 0.5, 50, 2)} position={[0, 0, 10]} />
      <primitive object={new THREE.PointLight(0xff3d00, 0.3, 30, 2)} position={[0, -5, 0]} />
    </>
  );
}

export function AboutBackground() {
  const reducedMotion = useReducedMotion();

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
      <ThreeCanvas
        camera={{ position: [0, 0, 15], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
        style={{ width: '100%', height: '100%' }}
      >
        <BackgroundScene />
        <OrbitControls enablePan={false} enableZoom={true} minZoom={0.5} maxZoom={3} autoRotate={!reducedMotion} autoRotateSpeed={0.2} />
      </ThreeCanvas>
    </div>
  );
}