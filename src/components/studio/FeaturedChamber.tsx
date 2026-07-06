import { useEffect, useMemo, useRef, type ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { LifeProp } from '../../data/lifeProps';
import { EMBLEM_Y, PANEL_ANGLES } from './constants';
import { LogoBillboard } from './LogoBillboard';

const UNIT_SCALE = new THREE.Vector3(1, 1, 1);

function StaticInstances({ matrices, material, children }: { matrices: THREE.Matrix4[]; material: THREE.Material; children: ReactNode }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    matrices.forEach((matrix, index) => mesh.setMatrixAt(index, matrix));
    mesh.instanceMatrix.needsUpdate = true;
  }, [matrices]);

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, matrices.length]} material={material}>
      {children}
    </instancedMesh>
  );
}

export function FeaturedChamber({ activeProp, reducedMotion, animatedRef }: { activeProp: LifeProp; reducedMotion: boolean; animatedRef: { current: boolean } }) {
  const emblemRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const activeRingRef = useRef<THREE.Mesh>(null);
  const glassRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const activation = useRef(0);
  const materials = useMemo(
    () => ({
      darkMetal: new THREE.MeshStandardMaterial({ color: '#1c130b', roughness: 0.32, metalness: 0.88 }),
      brushedMetal: new THREE.MeshStandardMaterial({ color: '#8c6f3f', roughness: 0.18, metalness: 0.92 }),
      // Same look as brushedMetal, but reserved for the instanced ribs: a
      // material shared between an InstancedMesh and regular meshes makes
      // three.js swap its shader program back and forth on every frame.
      brushedMetalInstanced: new THREE.MeshStandardMaterial({ color: '#8c6f3f', roughness: 0.18, metalness: 0.92 }),
      glass: new THREE.MeshPhysicalMaterial({ color: '#f3ddb0', roughness: 0.04, metalness: 0.02, transparent: true, opacity: 0.16, side: THREE.DoubleSide, depthWrite: false }),
      blueGlow: new THREE.MeshBasicMaterial({ color: '#d9a441', transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, forceSinglePass: true }),
    }),
    [],
  );
  const ribMatrices = useMemo(
    () => PANEL_ANGLES.map((angle) => new THREE.Matrix4().compose(new THREE.Vector3(Math.sin(angle) * 0.245, 0.39, Math.cos(angle) * 0.245), new THREE.Quaternion(), UNIT_SCALE)),
    [],
  );

  useEffect(() => {
    activation.current = Math.max(activation.current, 0.42);
  }, [activeProp.id]);

  useFrame((state, delta) => {
    if (!animatedRef.current) return;
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
  });

  return (
    <group position={[0, 0.08, 0]}>
      <pointLight ref={lightRef} position={[0, 0.38, 0]} intensity={0.38} color="#a32e22" distance={0.9} />
      <mesh position={[0, 0.02, 0]} material={materials.darkMetal}>
        <cylinderGeometry args={[0.28, 0.31, 0.09, 48]} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.075, 0]} material={materials.brushedMetal}>
        <torusGeometry args={[0.25, 0.012, 8, 48]} />
      </mesh>
      <mesh position={[0, 0.13, 0]} material={materials.darkMetal}>
        <cylinderGeometry args={[0.14, 0.16, 0.065, 40]} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.18, 0]} material={materials.blueGlow}>
        <ringGeometry args={[0.08, 0.14, 40]} />
      </mesh>
      <mesh ref={activeRingRef} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.185, 0]}>
        <ringGeometry args={[0.14, 0.18, 40]} />
        <meshBasicMaterial color={activeProp.color} transparent opacity={0.28} side={THREE.DoubleSide} forceSinglePass />
      </mesh>
      <mesh ref={glassRef} position={[0, 0.39, 0]} material={materials.glass}>
        <cylinderGeometry args={[0.24, 0.24, 0.46, 48, 1, true]} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.16, 0]} material={materials.brushedMetal}>
        <torusGeometry args={[0.24, 0.009, 8, 48]} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.62, 0]} material={materials.brushedMetal}>
        <torusGeometry args={[0.24, 0.009, 8, 48]} />
      </mesh>
      <StaticInstances matrices={ribMatrices} material={materials.brushedMetalInstanced}>
        <boxGeometry args={[0.008, 0.44, 0.008]} />
      </StaticInstances>
      <mesh position={[0, 0.68, 0]} material={materials.darkMetal}>
        <cylinderGeometry args={[0.28, 0.25, 0.07, 48]} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.725, 0]} material={materials.brushedMetal}>
        <torusGeometry args={[0.19, 0.016, 10, 48]} />
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
          animatedRef={animatedRef}
        />
        <mesh ref={glowRef} rotation={[Math.PI / 2, 0, 0]} material={materials.blueGlow}>
          <ringGeometry args={[0.09, 0.145, 40]} />
        </mesh>
      </group>
    </group>
  );
}
