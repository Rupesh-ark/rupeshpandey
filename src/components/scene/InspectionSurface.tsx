import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { createRadialTexture } from './textures';

export function InspectionSurface() {
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
