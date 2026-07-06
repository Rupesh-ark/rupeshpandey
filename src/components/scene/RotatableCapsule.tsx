import { useRef, type ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export function RotatableCapsule({ opened, spinRequest, children }: { opened: boolean; spinRequest: number; children: ReactNode }) {
  const reducedMotion = useReducedMotion();
  const groupRef = useRef<THREE.Group>(null);
  const dragging = useRef(false);
  const startX = useRef(0);
  const startYaw = useRef(0);
  const targetYaw = useRef(0);
  const spinOffset = useRef(0);
  const spinVelocity = useRef(0);
  const lastSpinRequest = useRef(spinRequest);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const dt = Math.min(delta, 0.05);
    if (!opened) {
      dragging.current = false;
      targetYaw.current = 0;
      spinOffset.current = 0;
      spinVelocity.current = 0;
      lastSpinRequest.current = spinRequest;
    }

    if (opened && spinRequest !== lastSpinRequest.current) {
      lastSpinRequest.current = spinRequest;
      spinVelocity.current += reducedMotion ? Math.PI * 0.7 : Math.PI * 3.2;
    }

    if (spinVelocity.current !== 0) {
      spinOffset.current += spinVelocity.current * dt;
      spinVelocity.current *= Math.exp(-dt * (reducedMotion ? 12 : 2.4));
      if (Math.abs(spinVelocity.current) < 0.01) spinVelocity.current = 0;
    }

    const targetRotation = targetYaw.current + spinOffset.current;
    groupRef.current.rotation.y += (targetRotation - groupRef.current.rotation.y) * Math.min(1, dt * 8);
  });

  return (
    <group
      ref={groupRef}
      onPointerDown={(event) => {
        if (!opened) return;
        dragging.current = true;
        startX.current = event.nativeEvent.clientX;
        startYaw.current = targetYaw.current;
      }}
      onPointerMove={(event) => {
        if (!opened || !dragging.current) return;
        const deltaX = event.nativeEvent.clientX - startX.current;
        targetYaw.current = THREE.MathUtils.clamp(startYaw.current + deltaX * 0.0035, -0.5, 0.5);
      }}
      onPointerUp={() => {
        dragging.current = false;
      }}
      onPointerLeave={() => {
        dragging.current = false;
      }}
    >
      {children}
    </group>
  );
}
