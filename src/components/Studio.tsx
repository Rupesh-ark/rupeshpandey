import { useRef } from 'react';
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
  audioEnergy: number;
  onSelectProp: (id: LifePropId) => void;
}

export function Studio({ visible, activePropId, musicEnabled, audioEnergy, onSelectProp }: StudioProps) {
  const reducedMotion = useReducedMotion();
  const groupRef = useRef<THREE.Group>(null);
  const targetScale = useRef(new THREE.Vector3());
  const activeProp = getLifeProp(activePropId);
  const orbitProps = LIFE_PROPS.filter((prop) => prop.id !== activePropId);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const target = visible ? 1 : 0;
    groupRef.current.scale.lerp(targetScale.current.setScalar(target), Math.min(1, delta * 5));
  });

  return (
    <group ref={groupRef} position={[0, -0.1, 0]} scale={0}>
      <CircularFloor activeProp={activeProp} musicEnabled={musicEnabled} audioEnergy={audioEnergy} reducedMotion={reducedMotion} />
      <FeaturedChamber activeProp={activeProp} reducedMotion={reducedMotion} />
      {orbitProps.map((prop, index) => (
        <OrbitLogo key={prop.id} prop={prop} active={false} index={index} total={orbitProps.length} reducedMotion={reducedMotion} onSelect={onSelectProp} />
      ))}
    </group>
  );
}
