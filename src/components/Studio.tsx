import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { LIFE_PROPS, getLifeProp, type LifePropId } from '../data/lifeProps';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { CircularFloor } from './studio/CircularFloor';
import { FeaturedChamber } from './studio/FeaturedChamber';
import { OrbitLogo } from './studio/OrbitLogo';

interface StudioProps {
  visible: boolean;
  activePropId: LifePropId;
  musicEnabled: boolean;
  audioEnergyRef: { current: number };
  performancePausedRef: { current: boolean };
  onSelectProp: (id: LifePropId) => void;
}

export function Studio({ visible, activePropId, musicEnabled, audioEnergyRef, performancePausedRef, onSelectProp }: StudioProps) {
  const reducedMotion = useReducedMotion();
  const groupRef = useRef<THREE.Group>(null);
  const targetScale = useRef(new THREE.Vector3());
  const animatedRef = useRef(true);
  const activeProp = getLifeProp(activePropId);
  const orbitProps = useMemo(() => LIFE_PROPS.filter((prop) => prop.id !== activePropId), [activePropId]);

  useFrame((_, delta) => {
    animatedRef.current = visible && !performancePausedRef.current;
    if (!groupRef.current) return;
    const target = visible ? 1 : 0;
    if (visible) groupRef.current.visible = true;
    groupRef.current.scale.lerp(targetScale.current.setScalar(target), Math.min(1, delta * 5));
    if (!visible && groupRef.current.scale.x < 0.01) groupRef.current.visible = false;
  });

  return (
    <group ref={groupRef} position={[0, -0.1, 0]} scale={0}>
      <CircularFloor activeProp={activeProp} musicEnabled={musicEnabled} audioEnergyRef={audioEnergyRef} reducedMotion={reducedMotion} animatedRef={animatedRef} />
      <FeaturedChamber activeProp={activeProp} reducedMotion={reducedMotion} animatedRef={animatedRef} />
      {orbitProps.map((prop, index) => (
        <OrbitLogo key={prop.id} prop={prop} active={false} index={index} total={orbitProps.length} reducedMotion={reducedMotion} animatedRef={animatedRef} onSelect={onSelectProp} />
      ))}
    </group>
  );
}
