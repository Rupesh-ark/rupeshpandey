import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { LifeProp } from '../../data/lifeProps';
import { setBodyCursor } from '../../utils/bodyCursor';
import { useLogoTexture } from './logoTexture';

export function LogoBillboard({
  prop,
  active,
  size,
  reducedMotion = false,
  onClick,
}: {
  prop: LifeProp;
  active: boolean;
  size: number;
  reducedMotion?: boolean;
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
    if (!groupRef.current) return;
    groupRef.current.quaternion.copy(camera.quaternion);
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
        <circleGeometry args={[size, 80]} />
        <meshBasicMaterial map={texture} transparent toneMapped={false} depthWrite={false} />
      </mesh>
      <mesh position={[0, 0, -0.006]}>
        <ringGeometry args={[size * 1.08, size * 1.2, 80]} />
        <meshBasicMaterial color={active ? prop.color : '#43515e'} transparent opacity={active ? 0.78 : 0.34} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  );
}
