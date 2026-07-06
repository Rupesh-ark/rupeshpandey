import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { getLifeProp, type LifePropId } from '../../data/lifeProps';
import { setBodyCursor } from '../../utils/bodyCursor';
import { createConsoleTexture } from './textures';

function useFontReadyVersion() {
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (typeof document === 'undefined' || !('fonts' in document)) return;
    let cancelled = false;

    void document.fonts.ready.then(() => {
      if (!cancelled) setVersion((current) => current + 1);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return version;
}

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
  variant: 'download' | 'spin' | 'music' | 'close';
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
        <circleGeometry args={[0.072, 40]} />
        <meshBasicMaterial color={active ? '#241608' : '#140c06'} transparent opacity={0.92} side={THREE.DoubleSide} forceSinglePass />
      </mesh>
      <mesh position={[0, 0, 0.002]}>
        <ringGeometry args={[0.062, 0.072, 48]} />
        <meshBasicMaterial color="#a07c3e" transparent opacity={0.85} side={THREE.DoubleSide} forceSinglePass />
      </mesh>
      <mesh position={[0, 0, 0.004]}>
        <ringGeometry args={[0.05, 0.053, 48]} />
        <meshBasicMaterial color="#a07c3e" transparent opacity={0.4} side={THREE.DoubleSide} forceSinglePass />
      </mesh>
      {variant === 'download' ? (
        <group>
          <mesh position={[0, 0.012, 0.009]}>
            <boxGeometry args={[0.008, 0.058, 0.004]} />
            <meshBasicMaterial color={color} transparent opacity={0.9} />
          </mesh>
          <mesh position={[-0.012, -0.018, 0.009]} rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[0.008, 0.034, 0.004]} />
            <meshBasicMaterial color={color} transparent opacity={0.9} />
          </mesh>
          <mesh position={[0.012, -0.018, 0.009]} rotation={[0, 0, -Math.PI / 4]}>
            <boxGeometry args={[0.008, 0.034, 0.004]} />
            <meshBasicMaterial color={color} transparent opacity={0.9} />
          </mesh>
          <mesh position={[0, -0.048, 0.009]}>
            <boxGeometry args={[0.076, 0.008, 0.004]} />
            <meshBasicMaterial color={color} transparent opacity={0.9} />
          </mesh>
          <mesh position={[-0.034, -0.036, 0.009]}>
            <boxGeometry args={[0.008, 0.028, 0.004]} />
            <meshBasicMaterial color={color} transparent opacity={0.9} />
          </mesh>
          <mesh position={[0.034, -0.036, 0.009]}>
            <boxGeometry args={[0.008, 0.028, 0.004]} />
            <meshBasicMaterial color={color} transparent opacity={0.9} />
          </mesh>
        </group>
      ) : variant === 'spin' ? (
        <group>
          <mesh position={[0, 0, 0.008]}>
            <torusGeometry args={[0.032, 0.004, 8, 32, Math.PI * 1.55]} />
            <meshBasicMaterial color={color} transparent opacity={0.9} side={THREE.DoubleSide} forceSinglePass />
          </mesh>
          <mesh position={[0.027, 0.027, 0.009]} rotation={[0, 0, -0.82]}>
            <coneGeometry args={[0.014, 0.028, 3]} />
            <meshBasicMaterial color={color} transparent opacity={0.95} side={THREE.DoubleSide} forceSinglePass />
          </mesh>
        </group>
      ) : variant === 'music' ? (
        <group>
          <mesh position={[-0.025, -0.028, 0.009]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.018, 0.004, 8, 28]} />
            <meshBasicMaterial color={color} transparent opacity={active ? 1 : 0.7} side={THREE.DoubleSide} forceSinglePass />
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
  onDownloadCv,
  onSpin,
}: {
  activePropId: LifePropId;
  musicEnabled: boolean;
  onClose: () => void;
  onToggleMusic: () => void;
  onDownloadCv: () => void;
  onSpin: () => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const activeProp = getLifeProp(activePropId);
  const code = activeProp.readout.catalog.split(' · ')[0];
  const fontReadyVersion = useFontReadyVersion();
  const texture = useMemo(() => createConsoleTexture({ code, label: activeProp.label, color: activeProp.color, accent: activeProp.accent }), [activeProp.accent, activeProp.color, activeProp.label, code, fontReadyVersion]);

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
        <meshBasicMaterial map={texture} transparent toneMapped={false} side={THREE.DoubleSide} forceSinglePass />
      </mesh>
      <mesh position={[-0.14, 0, -0.01]}>
        <planeGeometry args={[0.48, 0.16]} />
        <meshBasicMaterial color="#0f0905" transparent opacity={0.65} side={THREE.DoubleSide} forceSinglePass />
      </mesh>
      <ConsoleButton3D label="Download detailed CV" x={0.16} color="#eadfc4" variant="download" onClick={onDownloadCv} />
      <ConsoleButton3D label={musicEnabled ? 'Disable music pulse' : 'Enable music pulse'} x={0.32} color={musicEnabled ? activeProp.accent : '#8a7f6a'} variant="music" active={musicEnabled} onClick={onToggleMusic} />
      <ConsoleButton3D label="Spin archive device" x={0.48} color={activeProp.color} variant="spin" onClick={onSpin} />
      <ConsoleButton3D label="Close archive" x={0.64} color="#eadfc4" variant="close" onClick={onClose} />
    </group>
  );
}
