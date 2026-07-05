import { Suspense, lazy, useEffect, useMemo, useRef, type ReactNode } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Pokeball } from './Pokeball';
import { useReducedMotion } from '../hooks/useReducedMotion';
import type { LifePropId } from '../data/lifeProps';

const LazyStudio = lazy(() => import('./Studio').then((module) => ({ default: module.Studio })));

interface SceneProps {
  opened: boolean;
  charging: boolean;
  prepareStudio: boolean;
  activePropId: LifePropId;
  onCenterClick: () => void;
  onSelectProp: (id: LifePropId) => void;
  onStudioReady: () => void;
}

function RotatableCapsule({ opened, children }: { opened: boolean; children: ReactNode }) {
  const groupRef = useRef<THREE.Group>(null);
  const dragging = useRef(false);
  const startX = useRef(0);
  const startYaw = useRef(0);
  const targetYaw = useRef(0);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const dt = Math.min(delta, 0.05);
    if (!opened) {
      dragging.current = false;
      targetYaw.current = 0;
    }
    groupRef.current.rotation.y += (targetYaw.current - groupRef.current.rotation.y) * Math.min(1, dt * 8);
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

function CameraManager({ opened }: { opened: boolean }) {
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

function createRadialTexture({ center, edge }: { center: string; edge: string }) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const context = canvas.getContext('2d');

  if (context) {
    const gradient = context.createRadialGradient(256, 256, 12, 256, 256, 252);
    gradient.addColorStop(0, center);
    gradient.addColorStop(1, edge);
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

function InspectionSurface() {
  const shadowTexture = useMemo(() => createRadialTexture({ center: 'rgba(0, 0, 0, 0.58)', edge: 'rgba(0, 0, 0, 0)' }), []);
  const auraTexture = useMemo(() => createRadialTexture({ center: 'rgba(36, 216, 255, 0.22)', edge: 'rgba(36, 216, 255, 0)' }), []);

  useEffect(() => {
    return () => {
      shadowTexture.dispose();
      auraTexture.dispose();
    };
  }, [auraTexture, shadowTexture]);

  return (
    <group>
      <mesh position={[0, -1.24, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[1.35, 0.72, 1]}>
        <circleGeometry args={[1.36, 128]} />
        <meshBasicMaterial map={shadowTexture} transparent depthWrite={false} opacity={0.95} />
      </mesh>
      <mesh position={[0, -1.235, 0.02]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.82, 128]} />
        <meshBasicMaterial map={auraTexture} transparent depthWrite={false} blending={THREE.AdditiveBlending} opacity={0.56} />
      </mesh>
      {[1.25, 1.55, 1.88].map((radius, index) => (
        <mesh key={radius} position={[0, -1.226 + index * 0.002, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[radius, 0.006, 8, 160]} />
          <meshBasicMaterial color={index === 1 ? '#f0b35a' : '#24d8ff'} transparent opacity={index === 1 ? 0.22 : 0.16} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      ))}
      {Array.from({ length: 24 }, (_, index) => (index / 24) * Math.PI * 2).map((angle, index) => (
        <mesh key={angle} position={[Math.sin(angle) * 1.55, -1.218, Math.cos(angle) * 1.55]} rotation={[0, angle, 0]}>
          <boxGeometry args={[0.01, 0.004, index % 3 === 0 ? 0.18 : 0.08]} />
          <meshBasicMaterial color="#24d8ff" transparent opacity={index % 3 === 0 ? 0.28 : 0.13} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      ))}
      {Array.from({ length: 10 }, (_, index) => (index / 10) * Math.PI * 2).map((angle, index) => (
        <mesh key={`beam-${angle}`} position={[Math.sin(angle) * 1.05, -0.73, Math.cos(angle) * 1.05]} rotation={[0, angle, 0]}>
          <planeGeometry args={[0.018, index % 2 === 0 ? 0.82 : 0.48]} />
          <meshBasicMaterial color="#24d8ff" transparent opacity={index % 2 === 0 ? 0.055 : 0.032} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

function StudioLoader({
  visible,
  activePropId,
  onSelectProp,
  onStudioReady,
}: {
  visible: boolean;
  activePropId: LifePropId;
  onSelectProp: (id: LifePropId) => void;
  onStudioReady: () => void;
}) {
  useEffect(() => {
    onStudioReady();
  }, [onStudioReady]);

  return <LazyStudio visible={visible} activePropId={activePropId} onSelectProp={onSelectProp} />;
}

function SceneContents({ opened, charging, prepareStudio, activePropId, onCenterClick, onSelectProp, onStudioReady }: SceneProps) {
  return (
    <>
      <color attach="background" args={[opened ? '#03050a' : '#05060a']} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[4, 6, 5]} intensity={0.92} />
      <spotLight position={[0.2, 4.2, 2.4]} angle={0.4} penumbra={0.8} intensity={opened ? 1.1 : 0.78} color="#e8f4ff" />
      <pointLight position={[-1.6, 1.2, 0.6]} intensity={opened ? 0.72 : 0.25} color="#ffd7a3" />
      <pointLight position={[2.4, 1.4, -1.4]} intensity={opened ? 0.86 : 0.28} color="#8fdcff" />
      <pointLight position={[0, -0.9, 0]} intensity={opened ? 0.52 : 0.18} color="#24d8ff" distance={3.2} />

      <CameraManager opened={opened} />
      <InspectionSurface />
      <RotatableCapsule opened={opened}>
        <Pokeball opened={opened} charging={charging} onCenterClick={onCenterClick} />
        {prepareStudio && (
          <Suspense fallback={null}>
            <StudioLoader visible={opened} activePropId={activePropId} onSelectProp={onSelectProp} onStudioReady={onStudioReady} />
          </Suspense>
        )}
      </RotatableCapsule>
    </>
  );
}

export function Scene(props: SceneProps) {
  return (
    <div className="scene-layer" aria-hidden="true">
      <Suspense fallback={null}>
        <Canvas camera={{ position: [0, 0.08, 1.9], fov: 39 }} gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }} dpr={[1, 1.75]}>
          <SceneContents {...props} />
        </Canvas>
      </Suspense>
    </div>
  );
}
