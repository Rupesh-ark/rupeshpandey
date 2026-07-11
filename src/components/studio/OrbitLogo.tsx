import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { LIFE_PROPS, type LifeProp, type LifePropId } from '../../data/lifeProps';
import { LogoBillboard } from './LogoBillboard';

// Solar-system layout: each exhibit token owns an orbit — staggered radii,
// Kepler-flavoured speeds (inner orbits run faster), and a small tilt per
// orbital plane so the paths interleave instead of stacking on one ring.
// Indexed by the exhibit's stable position in LIFE_PROPS. The arrays hold
// five distinct orbits; a sixth exhibit would share exhibit 0's orbit
// (co-orbital, offset by phase) rather than collide with it.
const ORBIT_RADII = [0.5, 0.61, 0.72, 0.83, 0.94];
const ORBIT_INCLINATIONS = [0.14, 0.09, 0.12, 0.17, 0.07];
const ORBIT_NODES = [0, 1.3, 2.6, 3.9, 5.2];
export const ORBIT_HEIGHT = 0.32;

export function getOrbitConfig(index: number) {
  const radius = ORBIT_RADII[index % ORBIT_RADII.length];
  return {
    radius,
    speed: 0.38 * Math.pow(0.66 / radius, 1.5),
    inclination: ORBIT_INCLINATIONS[index % ORBIT_INCLINATIONS.length],
    node: ORBIT_NODES[index % ORBIT_NODES.length],
    phase: (index / LIFE_PROPS.length) * Math.PI * 2 + Math.PI / 4,
  };
}

// Rendered inside the orbit-plane group Studio builds for the drawn ring
// (yaw-to-node, then incline), so the token only ever moves in the plane of
// its own ring — the tilt transform exists exactly once, in Studio.
export function OrbitLogo({
  prop,
  index,
  reducedMotion,
  animatedRef,
  onSelect,
}: {
  prop: LifeProp;
  index: number;
  reducedMotion: boolean;
  animatedRef: { current: boolean };
  onSelect: (id: LifePropId) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const orbit = getOrbitConfig(index);

  useFrame((state) => {
    if (!animatedRef.current) return;
    if (!groupRef.current) return;
    // The tokens are the section navigation: they orbit at full speed even
    // under prefers-reduced-motion, so the scene behaves the same everywhere.
    const elapsed = state.clock.elapsedTime;
    const angle = orbit.phase + elapsed * orbit.speed;
    groupRef.current.position.set(
      Math.sin(angle) * orbit.radius,
      Math.sin(elapsed * 1.7 + index) * 0.025,
      Math.cos(angle) * orbit.radius,
    );
  });

  return (
    <group ref={groupRef} position={[Math.sin(orbit.phase) * orbit.radius, 0, Math.cos(orbit.phase) * orbit.radius]}>
      <LogoBillboard prop={prop} active={false} size={0.08} reducedMotion={reducedMotion} animatedRef={animatedRef} onClick={() => onSelect(prop.id)} />
      <mesh position={[0, 0, -0.018]}>
        <ringGeometry args={[0.093, 0.104, 48]} />
        <meshBasicMaterial color="#a07c3e" transparent opacity={0.3} side={THREE.DoubleSide} forceSinglePass depthWrite={false} />
      </mesh>
    </group>
  );
}
