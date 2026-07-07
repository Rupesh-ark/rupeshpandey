import { useRef, type ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSpinChimes } from '../../hooks/useSpinChimes';

const YAW_LIMIT = 0.5;
const RUBBER_BAND = 0.16; // extra travel allowed past the limit, with resistance
const DRAG_SENSITIVITY = 0.0035;

type PointerCaptureTarget = {
  setPointerCapture?: (pointerId: number) => void;
  releasePointerCapture?: (pointerId: number) => void;
  hasPointerCapture?: (pointerId: number) => boolean;
};

function getPointerCaptureTarget(target: EventTarget | null): PointerCaptureTarget | null {
  return target && typeof target === 'object' ? target as PointerCaptureTarget : null;
}

export function RotatableCapsule({ opened, spinRequest, children }: { opened: boolean; spinRequest: number; children: ReactNode }) {
  const groupRef = useRef<THREE.Group>(null);
  const dragging = useRef(false);
  const startX = useRef(0);
  const startYaw = useRef(0);
  const targetYaw = useRef(0);
  const spinOffset = useRef(0);
  const spinVelocity = useRef(0);
  const lastSpinRequest = useRef(spinRequest);
  const previousDragYaw = useRef(0);
  const smoothedDragVelocity = useRef(0);
  const flickVelocity = useRef(0);
  const chimes = useSpinChimes();

  const endDrag = () => {
    if (!dragging.current) return;
    dragging.current = false;
    flickVelocity.current = THREE.MathUtils.clamp(smoothedDragVelocity.current, -6, 6);
  };

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const dt = Math.min(delta, 0.05);
    if (!opened) {
      dragging.current = false;
      targetYaw.current = 0;
      spinOffset.current = 0;
      spinVelocity.current = 0;
      flickVelocity.current = 0;
      smoothedDragVelocity.current = 0;
      lastSpinRequest.current = spinRequest;
    }

    if (opened && spinRequest !== lastSpinRequest.current) {
      lastSpinRequest.current = spinRequest;
      spinVelocity.current += Math.PI * 3.2;
    }

    if (spinVelocity.current !== 0) {
      spinOffset.current += spinVelocity.current * dt;
      spinVelocity.current *= Math.exp(-dt * 2.4);
      if (Math.abs(spinVelocity.current) < 0.01) spinVelocity.current = 0;
    }

    // Released flick keeps the ball coasting, easing out like a slipping platter.
    if (!dragging.current && flickVelocity.current !== 0) {
      targetYaw.current += flickVelocity.current * dt;
      flickVelocity.current *= Math.exp(-dt * 3.2);
      if (Math.abs(flickVelocity.current) < 0.02) flickVelocity.current = 0;
    }

    // Spring back inside the limits once the hand lets go.
    if (!dragging.current && Math.abs(targetYaw.current) > YAW_LIMIT) {
      const bounded = THREE.MathUtils.clamp(targetYaw.current, -YAW_LIMIT, YAW_LIMIT);
      targetYaw.current += (bounded - targetYaw.current) * Math.min(1, dt * 9);
      flickVelocity.current *= Math.exp(-dt * 10);
      if (Math.abs(targetYaw.current - bounded) < 0.001) targetYaw.current = bounded;
    }

    // Frame-rate-independent follow: tight under the hand, softer glide otherwise.
    const targetRotation = targetYaw.current + spinOffset.current;
    const follow = 1 - Math.exp(-dt * (dragging.current ? 16 : 7));
    groupRef.current.rotation.y += (targetRotation - groupRef.current.rotation.y) * follow;

    const dragVelocity = dragging.current ? (targetYaw.current - previousDragYaw.current) / dt : 0;
    previousDragYaw.current = targetYaw.current;
    if (dragging.current) {
      smoothedDragVelocity.current += (dragVelocity - smoothedDragVelocity.current) * Math.min(1, dt * 12);
    }

    // Chimes follow the hand while dragging and the coast after a flick.
    chimes.update(dragging.current ? dragVelocity : flickVelocity.current, dt);
  });

  return (
    <group
      ref={groupRef}
      onPointerDown={(event) => {
        if (!opened) return;
        event.stopPropagation();
        const target = getPointerCaptureTarget(event.target);
        try {
          target?.setPointerCapture?.(event.pointerId);
        } catch {
          // Touch pointers can already be inactive; drag still works uncaptured.
        }
        dragging.current = true;
        startX.current = event.nativeEvent.clientX;
        startYaw.current = targetYaw.current;
        previousDragYaw.current = targetYaw.current;
        smoothedDragVelocity.current = 0;
        flickVelocity.current = 0;
      }}
      onPointerMove={(event) => {
        if (!opened || !dragging.current) return;
        event.stopPropagation();
        const deltaX = event.nativeEvent.clientX - startX.current;
        const raw = startYaw.current + deltaX * DRAG_SENSITIVITY;
        const excess = Math.abs(raw) - YAW_LIMIT;
        targetYaw.current = excess > 0
          ? Math.sign(raw) * (YAW_LIMIT + Math.min(excess * 0.28, RUBBER_BAND))
          : raw;
      }}
      onPointerUp={(event) => {
        event.stopPropagation();
        const target = getPointerCaptureTarget(event.target);
        // Touch pointerup auto-releases capture; releasing an already-released
        // pointer id throws in Firefox.
        if (target?.hasPointerCapture?.(event.pointerId) && target.releasePointerCapture) {
          try {
            target.releasePointerCapture(event.pointerId);
          } catch {
            // Already released between the check and the call — nothing to do.
          }
        }
        endDrag();
      }}
      onPointerCancel={endDrag}
      onPointerLeave={endDrag}
    >
      {children}
    </group>
  );
}
