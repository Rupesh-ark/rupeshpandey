import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { LifeProp } from '../../data/lifeProps';
import { EMBLEM_Y, PANEL_ANGLES } from './constants';
import { LogoBillboard } from './LogoBillboard';

export function FeaturedChamber({ activeProp, reducedMotion }: { activeProp: LifeProp; reducedMotion: boolean }) {
  const emblemRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const activeRingRef = useRef<THREE.Mesh>(null);
  const glassRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const projectionWashRef = useRef<THREE.Mesh>(null);
  const projectionCoreRef = useRef<THREE.Mesh>(null);
  const activation = useRef(0);
  const projectionWashShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0.06, -0.05);
    shape.lineTo(-1.22, -0.34);
    shape.lineTo(-1.28, 0.32);
    shape.lineTo(0.06, 0.05);
    shape.closePath();
    return shape;
  }, []);
  const projectionCoreShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0.08, -0.018);
    shape.lineTo(-1.12, -0.12);
    shape.lineTo(-1.12, 0.12);
    shape.lineTo(0.08, 0.018);
    shape.closePath();
    return shape;
  }, []);
  const materials = useMemo(
    () => ({
      darkMetal: new THREE.MeshStandardMaterial({ color: '#11161c', roughness: 0.32, metalness: 0.88 }),
      brushedMetal: new THREE.MeshStandardMaterial({ color: '#8e99a5', roughness: 0.18, metalness: 0.92 }),
      glass: new THREE.MeshPhysicalMaterial({ color: '#9edaff', roughness: 0.04, metalness: 0.02, transparent: true, opacity: 0.16, transmission: 0.34, thickness: 0.035, side: THREE.DoubleSide, depthWrite: false }),
      blueGlow: new THREE.MeshBasicMaterial({ color: '#24d8ff', transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }),
      projectionWash: new THREE.MeshBasicMaterial({ color: '#24d8ff', transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }),
      projectionCore: new THREE.MeshBasicMaterial({ color: '#24d8ff', transparent: true, opacity: 0.18, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }),
    }),
    [],
  );

  useEffect(() => {
    activation.current = Math.max(activation.current, 0.42);
  }, [activeProp.id]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const elapsed = reducedMotion ? 0 : state.clock.elapsedTime;
    const idle = reducedMotion ? 0 : (Math.sin(elapsed * 1.4) + 1) * 0.5;
    activation.current += (0 - activation.current) * Math.min(1, dt * 2.6);
    const charge = activation.current;

    if (emblemRef.current) {
      emblemRef.current.position.y = EMBLEM_Y + Math.sin(elapsed * 1.8) * (reducedMotion ? 0 : 0.018);
      const targetScale = 1 + idle * 0.025 + charge * 0.24;
      const scale = emblemRef.current.scale.x + (targetScale - emblemRef.current.scale.x) * Math.min(1, dt * 7);
      emblemRef.current.scale.setScalar(scale);
    }

    if (glowRef.current && glowRef.current.material instanceof THREE.MeshBasicMaterial) {
      glowRef.current.material.opacity = 0.2 + idle * 0.08 + charge * 0.38;
    }

    if (activeRingRef.current && activeRingRef.current.material instanceof THREE.MeshBasicMaterial) {
      activeRingRef.current.material.color.set(activeProp.color);
      activeRingRef.current.material.opacity = 0.16 + idle * 0.1 + charge * 0.42;
      const ringScale = 1 + idle * 0.08 + charge * 0.65;
      activeRingRef.current.scale.set(ringScale, ringScale, ringScale);
    }

    if (glassRef.current && glassRef.current.material instanceof THREE.MeshPhysicalMaterial) {
      glassRef.current.material.opacity = 0.18 + charge * 0.12;
    }

    if (lightRef.current) {
      lightRef.current.color.set(activeProp.color);
      lightRef.current.intensity = 0.32 + idle * 0.06 + charge * 0.95;
    }

    if (projectionWashRef.current && projectionWashRef.current.material instanceof THREE.MeshBasicMaterial) {
      projectionWashRef.current.material.color.set(activeProp.color);
      projectionWashRef.current.material.opacity = 0.08 + idle * 0.035 + charge * 0.12;
    }

    if (projectionCoreRef.current && projectionCoreRef.current.material instanceof THREE.MeshBasicMaterial) {
      projectionCoreRef.current.material.color.set(activeProp.accent);
      projectionCoreRef.current.material.opacity = 0.1 + idle * 0.045 + charge * 0.16;
    }
  });

  return (
    <group position={[0, 0.08, 0]}>
      <pointLight ref={lightRef} position={[0, 0.38, 0]} intensity={0.38} color="#24d8ff" distance={0.9} />
      <group position={[0.01, EMBLEM_Y, -0.018]} rotation={[0.02, -0.18, 0.015]}>
        <mesh ref={projectionWashRef} material={materials.projectionWash}>
          <shapeGeometry args={[projectionWashShape]} />
        </mesh>
        <mesh ref={projectionCoreRef} position={[0, 0, 0.004]} material={materials.projectionCore}>
          <shapeGeometry args={[projectionCoreShape]} />
        </mesh>
      </group>
      <mesh position={[0, 0.02, 0]} material={materials.darkMetal}>
        <cylinderGeometry args={[0.28, 0.31, 0.09, 96]} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.075, 0]} material={materials.brushedMetal}>
        <torusGeometry args={[0.25, 0.012, 10, 96]} />
      </mesh>
      <mesh position={[0, 0.13, 0]} material={materials.darkMetal}>
        <cylinderGeometry args={[0.14, 0.16, 0.065, 64]} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.18, 0]} material={materials.blueGlow}>
        <ringGeometry args={[0.08, 0.14, 96]} />
      </mesh>
      <mesh ref={activeRingRef} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.185, 0]}>
        <ringGeometry args={[0.14, 0.18, 96]} />
        <meshBasicMaterial color={activeProp.color} transparent opacity={0.28} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={glassRef} position={[0, 0.39, 0]} material={materials.glass}>
        <cylinderGeometry args={[0.24, 0.24, 0.46, 96, 1, true]} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.16, 0]} material={materials.brushedMetal}>
        <torusGeometry args={[0.24, 0.009, 8, 96]} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.62, 0]} material={materials.brushedMetal}>
        <torusGeometry args={[0.24, 0.009, 8, 96]} />
      </mesh>
      {PANEL_ANGLES.map((angle) => (
        <mesh key={`chamber-rib-${angle}`} position={[Math.sin(angle) * 0.245, 0.39, Math.cos(angle) * 0.245]} material={materials.brushedMetal}>
          <boxGeometry args={[0.008, 0.44, 0.008]} />
        </mesh>
      ))}
      <mesh position={[0, 0.68, 0]} material={materials.darkMetal}>
        <cylinderGeometry args={[0.28, 0.25, 0.07, 96]} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.725, 0]} material={materials.brushedMetal}>
        <torusGeometry args={[0.19, 0.016, 12, 96]} />
      </mesh>
      <group ref={emblemRef} position={[0, EMBLEM_Y, 0]}>
        <LogoBillboard
          prop={activeProp}
          active
          size={0.108}
          onClick={() => {
            activation.current = 1;
          }}
          reducedMotion={reducedMotion}
        />
        <mesh ref={glowRef} rotation={[Math.PI / 2, 0, 0]} material={materials.blueGlow}>
          <ringGeometry args={[0.09, 0.145, 96]} />
        </mesh>
      </group>
    </group>
  );
}
