import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { LIFE_PROPS, getLifeProp, type LifePropId } from '../data/lifeProps';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { CircularFloor } from './studio/CircularFloor';
import { FeaturedChamber } from './studio/FeaturedChamber';
import { ORBIT_HEIGHT, OrbitLogo, getOrbitConfig } from './studio/OrbitLogo';

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
      {/* One group per orbital plane (yaw to node, then incline): the drawn
          ring and its token share the same transform, so tokens sit on their
          ring by construction. All five rings stay visible — the active
          exhibit leaves a visibly empty orbit while it sits in the chamber. */}
      {LIFE_PROPS.map((prop, index) => {
        const orbit = getOrbitConfig(index);
        return (
          <group key={prop.id} position={[0, ORBIT_HEIGHT, 0]} rotation={[0, orbit.node, 0]}>
            <group rotation={[orbit.inclination, 0, 0]}>
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[orbit.radius, 0.0035, 6, 96]} />
                <meshBasicMaterial color="#a07c3e" transparent opacity={0.16} depthWrite={false} />
              </mesh>
              {prop.id !== activePropId && (
                <OrbitLogo prop={prop} index={index} reducedMotion={reducedMotion} animatedRef={animatedRef} onSelect={onSelectProp} />
              )}
            </group>
          </group>
        );
      })}
    </group>
  );
}
