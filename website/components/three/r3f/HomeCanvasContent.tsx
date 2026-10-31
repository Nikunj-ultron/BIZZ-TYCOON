'use client';

import * as THREE from 'three';
import { StatusOrbR3F } from './StatusOrbR3F';

interface HomeCanvasContentProps {
  status: 'SAFE' | 'WARNING' | 'DANGER' | 'UNKNOWN';
  ppm: number;
}

export function HomeCanvasContent({ status = 'UNKNOWN', ppm = 0 }: HomeCanvasContentProps) {
  return (
    <>
      <primitive attach="fog" object={new THREE.Fog('#0A0F1A', 5, 50)} />
      <ambientLight intensity={0.3} />
      <directionalLight color={status === 'DANGER' ? 0xff3d00 : status === 'WARNING' ? 0xffd600 : 0x00d4c8} intensity={0.5} position={[5, 5, 5]} />
      <StatusOrbR3F status={status} ppm={ppm} />
    </>
  );
}