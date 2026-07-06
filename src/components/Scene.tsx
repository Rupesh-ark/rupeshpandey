import { Suspense, lazy, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Pokeball } from './Pokeball';
import { ArchiveConsole3D } from './scene/ArchiveConsole3D';
import { CameraManager } from './scene/CameraManager';
import { InspectionSurface } from './scene/InspectionSurface';
import { RotatableCapsule } from './scene/RotatableCapsule';
import type { LifePropId } from '../data/lifeProps';

const LazyStudio = lazy(() => import('./Studio').then((module) => ({ default: module.Studio })));

interface SceneProps {
  opened: boolean;
  charging: boolean;
  prepareStudio: boolean;
  activePropId: LifePropId;
  spinRequest: number;
  musicEnabled: boolean;
  audioEnergy: number;
  onCenterClick: () => void;
  onSpinArchive: () => void;
  onToggleMusic: () => void;
  onSelectProp: (id: LifePropId) => void;
  onStudioReady: () => void;
}

function StudioLoader({
  visible,
  activePropId,
  musicEnabled,
  audioEnergy,
  onSelectProp,
  onStudioReady,
}: {
  visible: boolean;
  activePropId: LifePropId;
  musicEnabled: boolean;
  audioEnergy: number;
  onSelectProp: (id: LifePropId) => void;
  onStudioReady: () => void;
}) {
  useEffect(() => {
    onStudioReady();
  }, [onStudioReady]);

  return <LazyStudio visible={visible} activePropId={activePropId} musicEnabled={musicEnabled} audioEnergy={audioEnergy} onSelectProp={onSelectProp} />;
}

function SceneContents({ opened, charging, prepareStudio, activePropId, spinRequest, musicEnabled, audioEnergy, onCenterClick, onSpinArchive, onToggleMusic, onSelectProp, onStudioReady }: SceneProps) {
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
      {opened && <ArchiveConsole3D activePropId={activePropId} musicEnabled={musicEnabled} onClose={onCenterClick} onToggleMusic={onToggleMusic} onSpin={onSpinArchive} />}
      <RotatableCapsule opened={opened} spinRequest={spinRequest}>
        <Pokeball opened={opened} charging={charging} onCenterClick={onCenterClick} />
        {prepareStudio && (
          <Suspense fallback={null}>
            <StudioLoader visible={opened} activePropId={activePropId} musicEnabled={musicEnabled} audioEnergy={audioEnergy} onSelectProp={onSelectProp} onStudioReady={onStudioReady} />
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
        <Canvas camera={{ position: [0, 0.08, 1.9], fov: 39 }} gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }} dpr={[1, 1.5]}>
          <SceneContents {...props} />
        </Canvas>
      </Suspense>
    </div>
  );
}
