import { GasParticleField } from '@/components/three/GasParticleField';

interface ThreeVisualizerProps {
  ppm?: number;
  flame?: number;
  status?: string;
  connected?: boolean;
}

export function ThreeVisualizer({ ppm = 0, flame = 0, status = 'SAFE', connected = false }: ThreeVisualizerProps) {
  return (
    <GasParticleField ppm={ppm} status={status} width="100%" height="450px" />
  );
}
