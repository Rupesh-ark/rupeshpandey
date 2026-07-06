import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { getLifeProp, type LifePropId } from '../../data/lifeProps';
import { setBodyCursor } from '../../utils/bodyCursor';
import { createConsoleTexture } from './textures';

function ConsoleButton3D({
  label,
  x,
  color,
  variant,
  active = false,
  onClick,
}: {
  label: string;
  x: number;
  color: string;
  variant: 'spin' | 'music' | 'close';
  active?: boolean;
  onClick: () => void;
}) {
  const handlePointer = (event: { stopPropagation: () => void }) => {
    event.stopPropagation();
  };

  return (
    <group
      position={[x, 0, 0.018]}
      onPointerDown={handlePointer}
      onPointerUp={handlePointer}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      onPointerOver={(event) => {
        event.stopPropagation();
        setBodyCursor('pointer');
      }}
      onPointerOut={() => {
        setBodyCursor('auto');
      }}
      userData={{ label }}
    >
      <mesh>
        <planeGeometry args={[0.13, 0.13]} />
        <meshBasicMaterial color={active ? '#10221b' : '#061017'} transparent opacity={active ? 0.95 : 0.86} side={THREE.DoubleSide} />
      </mesh>
      {[
        [0, 0.065, 0.13, 0.004],
        [0, -0.065, 0.13, 0.004],
        [-0.065, 0, 0.004, 0.13],
        [0.065, 0, 0.004, 0.13],
      ].map(([borderX, borderY, width, height]) => (
        <mesh key={`${borderX}-${borderY}`} position={[borderX, borderY, 0.004]}>
          <boxGeometry args={[width, height, 0.003]} />
          <meshBasicMaterial color={color} transparent opacity={0.64} />
        </mesh>
      ))}
      {variant === 'spin' ? (
        <group>
          <mesh position={[0, 0, 0.008]}>
            <torusGeometry args={[0.032, 0.004, 8, 32, Math.PI * 1.55]} />
            <meshBasicMaterial color={color} transparent opacity={0.9} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0.027, 0.027, 0.009]} rotation={[0, 0, -0.82]}>
            <coneGeometry args={[0.014, 0.028, 3]} />
            <meshBasicMaterial color={color} transparent opacity={0.95} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ) : variant === 'music' ? (
        <group>
          <mesh position={[-0.025, -0.028, 0.009]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.018, 0.004, 8, 28]} />
            <meshBasicMaterial color={color} transparent opacity={active ? 1 : 0.7} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0.006, 0.014, 0.009]}>
            <boxGeometry args={[0.007, 0.078, 0.004]} />
            <meshBasicMaterial color={color} transparent opacity={active ? 1 : 0.7} />
          </mesh>
          <mesh position={[0.024, 0.044, 0.009]} rotation={[0, 0, -0.24]}>
            <boxGeometry args={[0.045, 0.007, 0.004]} />
            <meshBasicMaterial color={color} transparent opacity={active ? 1 : 0.7} />
          </mesh>
        </group>
      ) : (
        <group>
          <mesh rotation={[0, 0, Math.PI / 4]} position={[0, 0, 0.009]}>
            <boxGeometry args={[0.078, 0.007, 0.004]} />
            <meshBasicMaterial color={color} />
          </mesh>
          <mesh rotation={[0, 0, -Math.PI / 4]} position={[0, 0, 0.009]}>
            <boxGeometry args={[0.078, 0.007, 0.004]} />
            <meshBasicMaterial color={color} />
          </mesh>
        </group>
      )}
    </group>
  );
}

export function ArchiveConsole3D({
  activePropId,
  musicEnabled,
  onClose,
  onToggleMusic,
  onSpin,
}: {
  activePropId: LifePropId;
  musicEnabled: boolean;
  onClose: () => void;
  onToggleMusic: () => void;
  onSpin: () => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const activeProp = getLifeProp(activePropId);
  const code = activeProp.readout.catalog.split(' · ')[0];
  const texture = useMemo(() => createConsoleTexture({ code, label: activeProp.label, color: activeProp.color, accent: activeProp.accent }), [activeProp.accent, activeProp.color, activeProp.label, code]);

  useFrame(() => {
    if (!groupRef.current) return;
    groupRef.current.quaternion.copy(camera.quaternion);
  });

  useEffect(() => {
    return () => {
      texture.dispose();
      setBodyCursor('auto');
    };
  }, [texture]);

  return (
    <group ref={groupRef} position={[0, 0.86, 0.32]}>
      <mesh position={[-0.14, 0, 0]}>
        <planeGeometry args={[0.46, 0.145]} />
        <meshBasicMaterial map={texture} transparent toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[-0.14, 0, -0.01]}>
        <planeGeometry args={[0.48, 0.16]} />
        <meshBasicMaterial color="#03070a" transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>
      <ConsoleButton3D label={musicEnabled ? 'Disable music pulse' : 'Enable music pulse'} x={0.16} color={musicEnabled ? activeProp.accent : '#8b938f'} variant="music" active={musicEnabled} onClick={onToggleMusic} />
      <ConsoleButton3D label="Spin archive device" x={0.32} color={activeProp.color} variant="spin" onClick={onSpin} />
      <ConsoleButton3D label="Close archive" x={0.48} color="#f4efe6" variant="close" onClick={onClose} />
    </group>
  );
}
