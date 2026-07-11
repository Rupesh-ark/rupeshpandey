import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { LifeProp } from '../../data/lifeProps';
import { setBodyCursor } from '../../utils/bodyCursor';
import { useLogoTexture } from './logoTexture';

// Scratch quaternion for the per-frame billboard math — never allocated in
// the frame loop.
const parentWorldQuaternion = new THREE.Quaternion();

export function LogoBillboard({
  prop,
  active,
  size,
  reducedMotion = false,
  animatedRef,
  onClick,
}: {
  prop: LifeProp;
  active: boolean;
  size: number;
  reducedMotion?: boolean;
  animatedRef?: { current: boolean };
  onClick?: () => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const hovering = useRef(false);
  const texture = useLogoTexture(prop);
  const { camera } = useThree();

  useEffect(() => {
    return () => {
      setBodyCursor('auto');
    };
  }, []);

  useFrame((_, delta) => {
    if (animatedRef && !animatedRef.current) return;
    if (!groupRef.current) return;
    // Face the camera in world space: compensate for parent rotations
    // (tilted orbit planes, the user-spun capsule) instead of assuming an
    // unrotated parent chain.
    if (groupRef.current.parent) {
      groupRef.current.parent.getWorldQuaternion(parentWorldQuaternion).invert();
      groupRef.current.quaternion.multiplyQuaternions(parentWorldQuaternion, camera.quaternion);
    } else {
      groupRef.current.quaternion.copy(camera.quaternion);
    }
    const targetScale = !reducedMotion && onClick && hovering.current ? 1.14 : 1;
    const scale = groupRef.current.scale.x + (targetScale - groupRef.current.scale.x) * (reducedMotion ? 1 : Math.min(1, delta * 9));
    groupRef.current.scale.setScalar(scale);
  });

  return (
    <group
      ref={groupRef}
      onPointerDown={(event) => {
        event.stopPropagation();
      }}
      onPointerUp={(event) => {
        event.stopPropagation();
      }}
      onClick={(event) => {
        event.stopPropagation();
        onClick?.();
      }}
      onPointerOver={() => {
        hovering.current = true;
        if (onClick) setBodyCursor('pointer');
      }}
      onPointerOut={() => {
        hovering.current = false;
        if (onClick) setBodyCursor('auto');
      }}
    >
      <mesh>
        <circleGeometry args={[size, 48]} />
        <meshBasicMaterial map={texture} transparent toneMapped={false} depthWrite={false} />
      </mesh>
      <mesh position={[0, 0, -0.006]}>
        <ringGeometry args={[size * 1.08, size * 1.2, 48]} />
        <meshBasicMaterial color={active ? '#c9a05a' : '#5a4d3c'} transparent opacity={active ? 0.82 : 0.34} side={THREE.DoubleSide} forceSinglePass depthWrite={false} />
      </mesh>
    </group>
  );
}
