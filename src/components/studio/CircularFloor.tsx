import { useEffect, useMemo, useRef, type ReactNode } from 'react';
import * as THREE from 'three';
import type { LifeProp } from '../../data/lifeProps';
import { FLOOR_RADIUS, PANEL_ANGLES, VENT_ANGLES } from './constants';
import { PulseCracks } from './PulseCracks';

const FLOOR_RINGS = [0.38, 0.68, 0.92];
const FAN_ANGLES = Array.from({ length: 6 }, (_, index) => (index / 6) * Math.PI * 2);
const VENT_OFFSETS = [-0.055, 0, 0.055];
const UNIT_SCALE = new THREE.Vector3(1, 1, 1);
const Y_AXIS = new THREE.Vector3(0, 1, 0);

function createInstanceMatrix(position: THREE.Vector3, rotationY: number) {
  return new THREE.Matrix4().compose(
    position,
    new THREE.Quaternion().setFromEuler(new THREE.Euler(0, rotationY, 0)),
    UNIT_SCALE,
  );
}

function StaticInstances({ matrices, children }: { matrices: THREE.Matrix4[]; children: ReactNode }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    matrices.forEach((matrix, index) => mesh.setMatrixAt(index, matrix));
    mesh.instanceMatrix.needsUpdate = true;
  }, [matrices]);

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, matrices.length]}>
      {children}
    </instancedMesh>
  );
}

export function CircularFloor({ activeProp, musicEnabled, audioEnergyRef, reducedMotion, animatedRef }: { activeProp: LifeProp; musicEnabled: boolean; audioEnergyRef: { current: number }; reducedMotion: boolean; animatedRef: { current: boolean } }) {
  const panelMatrices = useMemo(
    () => PANEL_ANGLES.map((angle) => createInstanceMatrix(new THREE.Vector3(Math.sin(angle) * 0.55, 0.046, Math.cos(angle) * 0.55), angle)),
    [],
  );
  const ventMatrices = useMemo(
    () => VENT_ANGLES.flatMap((angle) => {
      const base = new THREE.Vector3(Math.sin(angle) * 0.74, 0.064, Math.cos(angle) * 0.74);
      return VENT_OFFSETS.map((offset) => {
        const position = base.clone().add(new THREE.Vector3(offset, 0, 0).applyAxisAngle(Y_AXIS, angle));
        return createInstanceMatrix(position, angle);
      });
    }),
    [],
  );
  const fanMatrices = useMemo(
    () => FAN_ANGLES.map((angle) => createInstanceMatrix(new THREE.Vector3(Math.sin(angle) * 0.11, 0.108, Math.cos(angle) * 0.11), angle + 0.45)),
    [],
  );

  return (
    <group>
      <mesh position={[0, -0.018, 0]}>
        <cylinderGeometry args={[FLOOR_RADIUS, FLOOR_RADIUS, 0.075, 64]} />
        <meshStandardMaterial color="#160e08" roughness={0.46} metalness={0.86} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, 0]}>
        <circleGeometry args={[FLOOR_RADIUS, 64]} />
        <meshStandardMaterial color="#241a10" roughness={0.4} metalness={0.8} />
      </mesh>
      <StaticInstances matrices={panelMatrices}>
        <boxGeometry args={[0.28, 0.018, 0.48]} />
        <meshStandardMaterial color="#120b06" roughness={0.5} metalness={0.72} />
      </StaticInstances>
      {FLOOR_RINGS.map((radius) => (
        <mesh key={radius} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.052, 0]}>
          <torusGeometry args={[radius, 0.006, 8, 48]} />
          <meshStandardMaterial color="#a07c3e" roughness={0.22} metalness={1} />
        </mesh>
      ))}
      <PulseCracks color={activeProp.color} accent={activeProp.accent} musicEnabled={musicEnabled} audioEnergyRef={audioEnergyRef} reducedMotion={reducedMotion} animatedRef={animatedRef} />
      <StaticInstances matrices={ventMatrices}>
        <boxGeometry args={[0.012, 0.012, 0.12]} />
        <meshStandardMaterial color="#6e3a1c" emissive="#c96f2a" emissiveIntensity={0.35} roughness={0.6} metalness={0.2} />
      </StaticInstances>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.058, 0]}>
        <circleGeometry args={[0.22, 48]} />
        <meshBasicMaterial color="#a32e22" transparent opacity={0.2} />
      </mesh>
      <mesh position={[0, 0.07, 0]}>
        <cylinderGeometry args={[0.28, 0.3, 0.055, 40]} />
        <meshStandardMaterial color="#120b06" roughness={0.38} metalness={0.86} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.105, 0]}>
        <torusGeometry args={[0.25, 0.014, 10, 40]} />
        <meshStandardMaterial color="#8c6f3f" roughness={0.24} metalness={1} />
      </mesh>
      <StaticInstances matrices={fanMatrices}>
        <boxGeometry args={[0.065, 0.012, 0.24]} />
        <meshStandardMaterial color="#221710" roughness={0.28} metalness={0.92} />
      </StaticInstances>
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.105, 0.105, 0.035, 40]} />
        <meshStandardMaterial color="#2c1f12" roughness={0.22} metalness={0.95} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.07, 0]}>
        <torusGeometry args={[FLOOR_RADIUS, 0.018, 8, 64]} />
        <meshStandardMaterial color="#d8c9a6" roughness={0.18} metalness={0.82} />
      </mesh>
    </group>
  );
}
