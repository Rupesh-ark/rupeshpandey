import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { LifeProp, LifePropId } from '../../data/lifeProps';
import { LogoBillboard } from './LogoBillboard';

export function OrbitLogo({
  prop,
  active,
  index,
  total,
  reducedMotion,
  onSelect,
}: {
  prop: LifeProp;
  active: boolean;
  index: number;
  total: number;
  reducedMotion: boolean;
  onSelect: (id: LifePropId) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const baseAngle = (index / total) * Math.PI * 2 + Math.PI / 4;

  useFrame((state) => {
    if (!groupRef.current) return;
    const elapsed = reducedMotion ? 0 : state.clock.elapsedTime;
    const angle = baseAngle + elapsed * 0.38;
    const radius = active ? 0.57 : 0.66;
    groupRef.current.position.set(
      Math.sin(angle) * radius,
      0.32 + Math.sin(elapsed * 1.7 + index) * (reducedMotion ? 0 : 0.035),
      Math.cos(angle) * radius,
    );
  });

  return (
    <group ref={groupRef} position={[Math.sin(baseAngle) * 0.66, 0.32, Math.cos(baseAngle) * 0.66]}>
      <LogoBillboard prop={prop} active={active} size={active ? 0.098 : 0.08} reducedMotion={reducedMotion} onClick={() => onSelect(prop.id)} />
      <mesh position={[0, 0, -0.018]}>
        <ringGeometry args={[active ? 0.12 : 0.095, active ? 0.15 : 0.12, 80]} />
        <meshBasicMaterial color={prop.color} transparent opacity={active ? 0.46 : 0.22} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
}
