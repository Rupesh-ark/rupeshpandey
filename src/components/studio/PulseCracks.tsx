import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CRACK_PATHS } from './constants';

const SEGMENT_COUNT = CRACK_PATHS[0]?.segments.length ?? 1;
const INSTANCE_COUNT = CRACK_PATHS.length * SEGMENT_COUNT;

interface CrackInstance {
  pathIndex: number;
  segmentIndex: number;
  position: THREE.Vector3;
  quaternion: THREE.Quaternion;
  baseScale: THREE.Vector3;
}

// All crack segments render through one InstancedMesh instead of 48 meshes.
// Per-segment opacity can't be folded into instance colors (tone mapping and
// sRGB encoding run before blending, so color × opacity shifts brightness);
// an instanced opacity attribute multiplied into the fragment alpha keeps the
// output identical to the per-mesh original.
export function PulseCracks({
  color,
  accent,
  musicEnabled,
  audioEnergyRef,
  reducedMotion,
  animatedRef,
}: {
  color: string;
  accent: string;
  musicEnabled: boolean;
  audioEnergyRef: { current: number };
  reducedMotion: boolean;
  animatedRef: { current: boolean };
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const scratch = useMemo(() => ({ matrix: new THREE.Matrix4(), scale: new THREE.Vector3(), color: new THREE.Color() }), []);
  const opacityAttribute = useMemo(
    () => new THREE.InstancedBufferAttribute(new Float32Array(INSTANCE_COUNT).fill(0.04), 1),
    [],
  );
  const material = useMemo(() => {
    const basic = new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
    basic.onBeforeCompile = (shader) => {
      shader.vertexShader = `attribute float instanceOpacity;\nvarying float vInstanceOpacity;\n${shader.vertexShader}`.replace(
        '#include <begin_vertex>',
        '#include <begin_vertex>\n\tvInstanceOpacity = instanceOpacity;',
      );
      shader.fragmentShader = `varying float vInstanceOpacity;\n${shader.fragmentShader}`.replace(
        'vec4 diffuseColor = vec4( diffuse, opacity );',
        'vec4 diffuseColor = vec4( diffuse, opacity * vInstanceOpacity );',
      );
    };
    return basic;
  }, []);

  const instances = useMemo<CrackInstance[]>(
    () => CRACK_PATHS.flatMap((path, pathIndex) => {
      const pathRotation = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), path.angle);
      return path.segments.map((segment, segmentIndex) => ({
        pathIndex,
        segmentIndex,
        position: new THREE.Vector3(segment.offset, 0.077 + segmentIndex * 0.0008, segment.radius).applyQuaternion(pathRotation),
        quaternion: pathRotation,
        baseScale: new THREE.Vector3(0.008, 0.005, segment.length),
      }));
    }),
    [],
  );

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    mesh.geometry.setAttribute('instanceOpacity', opacityAttribute);
    instances.forEach((instance, index) => {
      scratch.matrix.compose(instance.position, instance.quaternion, instance.baseScale);
      mesh.setMatrixAt(index, scratch.matrix);
      scratch.color.set(instance.segmentIndex === 0 ? accent : color);
      mesh.setColorAt(index, scratch.color);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [accent, color, instances, opacityAttribute, scratch]);

  useFrame((state) => {
    const mesh = meshRef.current;
    if (!mesh || !animatedRef.current) return;
    const elapsed = reducedMotion ? 0 : state.clock.elapsedTime;
    const audioEnergy = audioEnergyRef.current;
    const beat = musicEnabled ? THREE.MathUtils.clamp(audioEnergy, 0, 1) : 0;

    instances.forEach((instance, index) => {
      const path = CRACK_PATHS[instance.pathIndex];
      const travel = reducedMotion ? 0.35 : (elapsed * (musicEnabled ? 0.42 + beat * 1.65 : 0.22) + path.phase) % 1;
      const segmentPosition = instance.segmentIndex / Math.max(1, SEGMENT_COUNT - 1);
      const wave = Math.max(0, 1 - Math.abs(travel - segmentPosition) * 4.8);
      const baseOpacity = musicEnabled ? 0.06 + beat * 0.18 : 0.035;
      const pulseOpacity = wave * (musicEnabled ? 0.26 + beat * 0.62 : 0.16);
      const lengthScale = 0.72 + wave * (musicEnabled ? 0.24 + beat * 0.76 : 0.18);

      scratch.scale.copy(instance.baseScale);
      scratch.scale.z *= lengthScale;
      scratch.matrix.compose(instance.position, instance.quaternion, scratch.scale);
      mesh.setMatrixAt(index, scratch.matrix);
      opacityAttribute.setX(index, baseOpacity + pulseOpacity);
    });

    mesh.instanceMatrix.needsUpdate = true;
    opacityAttribute.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, INSTANCE_COUNT]} material={material} frustumCulled={false}>
      <boxGeometry args={[1, 1, 1]} />
    </instancedMesh>
  );
}
