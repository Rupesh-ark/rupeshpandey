import { useEffect, useMemo, useRef, type ReactNode } from 'react';
import * as THREE from 'three';
import { createRadialTexture } from './textures';

const TICK_ANGLES = Array.from({ length: 24 }, (_, index) => (index / 24) * Math.PI * 2);
const BEAM_ANGLES = Array.from({ length: 10 }, (_, index) => (index / 10) * Math.PI * 2);
const UNIT_SCALE = new THREE.Vector3(1, 1, 1);

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

export function InspectionSurface() {
  const shadowTexture = useMemo(() => createRadialTexture({ center: 'rgba(12, 7, 3, 0.58)', edge: 'rgba(12, 7, 3, 0)' }), []);
  const auraTexture = useMemo(() => createRadialTexture({ center: 'rgba(163, 46, 34, 0.22)', edge: 'rgba(163, 46, 34, 0)' }), []);
  const tickMatrices = useMemo(() => {
    const major: THREE.Matrix4[] = [];
    const minor: THREE.Matrix4[] = [];

    TICK_ANGLES.forEach((angle, index) => {
      const matrix = createInstanceMatrix(new THREE.Vector3(Math.sin(angle) * 1.55, -1.218, Math.cos(angle) * 1.55), angle);
      if (index % 3 === 0) major.push(matrix);
      else minor.push(matrix);
    });

    return { major, minor };
  }, []);
  const beamMatrices = useMemo(() => {
    const long: THREE.Matrix4[] = [];
    const short: THREE.Matrix4[] = [];

    BEAM_ANGLES.forEach((angle, index) => {
      const matrix = createInstanceMatrix(new THREE.Vector3(Math.sin(angle) * 1.05, -0.73, Math.cos(angle) * 1.05), angle);
      if (index % 2 === 0) long.push(matrix);
      else short.push(matrix);
    });

    return { long, short };
  }, []);

  useEffect(() => {
    return () => {
      shadowTexture.dispose();
      auraTexture.dispose();
    };
  }, [auraTexture, shadowTexture]);

  return (
    <group>
      <mesh position={[0, -1.24, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[1.35, 0.72, 1]}>
        <circleGeometry args={[1.36, 72]} />
        <meshBasicMaterial map={shadowTexture} transparent depthWrite={false} opacity={0.95} />
      </mesh>
      <mesh position={[0, -1.235, 0.02]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.82, 72]} />
        <meshBasicMaterial map={auraTexture} transparent depthWrite={false} blending={THREE.AdditiveBlending} opacity={0.56} />
      </mesh>
      {[1.25, 1.55, 1.88].map((radius, index) => (
        <mesh key={radius} position={[0, -1.226 + index * 0.002, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[radius, 0.006, 8, 96]} />
          <meshBasicMaterial color={index === 1 ? '#d9a441' : '#a32e22'} transparent opacity={index === 1 ? 0.22 : 0.16} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      ))}
      <StaticInstances matrices={tickMatrices.major}>
        <boxGeometry args={[0.01, 0.004, 0.18]} />
        <meshBasicMaterial color="#a07c3e" transparent opacity={0.28} blending={THREE.AdditiveBlending} depthWrite={false} />
      </StaticInstances>
      <StaticInstances matrices={tickMatrices.minor}>
        <boxGeometry args={[0.01, 0.004, 0.08]} />
        <meshBasicMaterial color="#a07c3e" transparent opacity={0.13} blending={THREE.AdditiveBlending} depthWrite={false} />
      </StaticInstances>
      <StaticInstances matrices={beamMatrices.long}>
        <planeGeometry args={[0.018, 0.82]} />
        <meshBasicMaterial color="#a07c3e" transparent opacity={0.055} side={THREE.DoubleSide} forceSinglePass blending={THREE.AdditiveBlending} depthWrite={false} />
      </StaticInstances>
      <StaticInstances matrices={beamMatrices.short}>
        <planeGeometry args={[0.018, 0.48]} />
        <meshBasicMaterial color="#a07c3e" transparent opacity={0.032} side={THREE.DoubleSide} forceSinglePass blending={THREE.AdditiveBlending} depthWrite={false} />
      </StaticInstances>
    </group>
  );
}
