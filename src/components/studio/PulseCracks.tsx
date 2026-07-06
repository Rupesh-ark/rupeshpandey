import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CRACK_PATHS } from './constants';

export function PulseCracks({
  color,
  accent,
  musicEnabled,
  audioEnergy,
  reducedMotion,
}: {
  color: string;
  accent: string;
  musicEnabled: boolean;
  audioEnergy: number;
  reducedMotion: boolean;
}) {
  const crackRefs = useRef<THREE.Mesh[]>([]);
  const segmentCount = CRACK_PATHS[0]?.segments.length ?? 1;

  useFrame((state) => {
    const elapsed = reducedMotion ? 0 : state.clock.elapsedTime;

    crackRefs.current.forEach((mesh, index) => {
      const material = mesh.material;
      if (!(material instanceof THREE.MeshBasicMaterial)) return;

      const pathIndex = Math.floor(index / segmentCount);
      const segmentIndex = index % segmentCount;
      const path = CRACK_PATHS[pathIndex];
      if (!path) return;

      const beat = musicEnabled ? THREE.MathUtils.clamp(audioEnergy, 0, 1) : 0;
      const travel = reducedMotion ? 0.35 : (elapsed * (musicEnabled ? 0.42 + beat * 1.65 : 0.22) + path.phase) % 1;
      const segmentPosition = segmentIndex / Math.max(1, segmentCount - 1);
      const wave = Math.max(0, 1 - Math.abs(travel - segmentPosition) * 4.8);
      const baseOpacity = musicEnabled ? 0.06 + beat * 0.18 : 0.035;
      const pulseOpacity = wave * (musicEnabled ? 0.26 + beat * 0.62 : 0.16);

      material.opacity = baseOpacity + pulseOpacity;
      mesh.scale.z = 0.72 + wave * (musicEnabled ? 0.24 + beat * 0.76 : 0.18);
    });
  });

  return (
    <group>
      {CRACK_PATHS.map((path, pathIndex) => (
        <group key={`crack-path-${path.angle}`} rotation={[0, path.angle, 0]}>
          {path.segments.map((segment, segmentIndex) => {
            const refIndex = pathIndex * segmentCount + segmentIndex;
            return (
              <mesh
                key={`${path.angle}-${segment.radius}`}
                ref={(mesh) => {
                  if (mesh) crackRefs.current[refIndex] = mesh;
                }}
                position={[segment.offset, 0.077 + segmentIndex * 0.0008, segment.radius]}
              >
                <boxGeometry args={[0.008, 0.005, segment.length]} />
                <meshBasicMaterial color={segmentIndex === 0 ? accent : color} transparent opacity={0.04} blending={THREE.AdditiveBlending} depthWrite={false} />
              </mesh>
            );
          })}
        </group>
      ))}
    </group>
  );
}
