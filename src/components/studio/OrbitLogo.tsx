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
  animatedRef,
  onSelect,
}: {
  prop: LifeProp;
  active: boolean;
  index: number;
  total: number;
  reducedMotion: boolean;
  animatedRef: { current: boolean };
  onSelect: (id: LifePropId) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const baseAngle = (index / total) * Math.PI * 2 + Math.PI / 4;

  useFrame((state) => {
    if (!animatedRef.current) return;
    if (!groupRef.current) return;
    // The tokens are the section navigation: they orbit at full speed even
    // under prefers-reduced-motion, so the scene behaves the same everywhere.
    const elapsed = state.clock.elapsedTime;
    const angle = baseAngle + elapsed * 0.38;
    const radius = active ? 0.57 : 0.66;
    groupRef.current.position.set(
      Math.sin(angle) * radius,
      0.32 + Math.sin(elapsed * 1.7 + index) * 0.035,
      Math.cos(angle) * radius,
    );
  });

  return (
    <group ref={groupRef} position={[Math.sin(baseAngle) * 0.66, 0.32, Math.cos(baseAngle) * 0.66]}>
      <LogoBillboard prop={prop} active={active} size={active ? 0.098 : 0.08} reducedMotion={reducedMotion} animatedRef={animatedRef} onClick={() => onSelect(prop.id)} />
      <mesh position={[0, 0, -0.018]}>
        <ringGeometry args={[active ? 0.115 : 0.093, active ? 0.128 : 0.104, 48]} />
        <meshBasicMaterial color="#a07c3e" transparent opacity={active ? 0.6 : 0.3} side={THREE.DoubleSide} forceSinglePass depthWrite={false} />
      </mesh>
    </group>
  );
}
