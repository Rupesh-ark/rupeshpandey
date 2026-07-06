import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export function CameraManager({ opened }: { opened: boolean }) {
  const reducedMotion = useReducedMotion();
  const { camera, size } = useThree();
  const targetPosition = useMemo(() => new THREE.Vector3(), []);
  const targetLookAt = useMemo(() => new THREE.Vector3(), []);
  const currentLookAt = useRef(new THREE.Vector3(0, 0.03, 1.15));

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const compact = size.width <= 720;

    if (!opened && compact) {
      targetPosition.set(0, 0.08, 2.62);
      targetLookAt.set(0, 0, 1.12);
    } else if (!opened) {
      targetPosition.set(0, 0.08, 2.08);
      targetLookAt.set(0, 0, 1.18);
    } else if (compact) {
      targetPosition.set(0.78, 1.28, 3.16);
      targetLookAt.set(-0.04, -0.02, 0.05);
    } else {
      targetPosition.set(2.55, 1.36, 2.12);
      targetLookAt.set(-0.55, 0.04, 0.03);
    }

    const amount = reducedMotion ? 1 : Math.min(1, dt * (opened ? 2.2 : 4.5));
    camera.position.lerp(targetPosition, amount);
    currentLookAt.current.lerp(targetLookAt, amount);
    camera.lookAt(currentLookAt.current);

    if (camera instanceof THREE.PerspectiveCamera) {
      const targetFov = compact ? (opened ? 44 : 48) : opened ? 39 : 42;
      camera.fov += (targetFov - camera.fov) * amount;
      camera.updateProjectionMatrix();
    }
  });

  return null;
}
