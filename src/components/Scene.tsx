import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ArchiveVessel } from './ArchiveVessel';
import { ArchiveConsole3D } from './scene/ArchiveConsole3D';
import { CameraManager } from './scene/CameraManager';
import { InspectionSurface } from './scene/InspectionSurface';
import { RotatableCapsule } from './scene/RotatableCapsule';
import type { LifePropId } from '../data/lifeProps';

const LazyStudio = lazy(() => import('./Studio').then((module) => ({ default: module.Studio })));

interface ScenePerfStats {
  fps: number;
  calls: number;
  triangles: number;
  geometries: number;
  textures: number;
  dpr: number;
}

interface SceneProps {
  opened: boolean;
  charging: boolean;
  prepareStudio: boolean;
  activePropId: LifePropId;
  spinRequest: number;
  musicEnabled: boolean;
  audioEnergyRef: { current: number };
  performancePausedRef: { current: boolean };
  showConsole: boolean;
  onCenterClick: () => void;
  onSpinArchive: () => void;
  onToggleMusic: () => void;
  onDownloadCv: () => void;
  onSelectProp: (id: LifePropId) => void;
  onStudioReady: () => void;
}

function StudioLoader({
  visible,
  activePropId,
  musicEnabled,
  audioEnergyRef,
  performancePausedRef,
  onSelectProp,
  onStudioReady,
}: {
  visible: boolean;
  activePropId: LifePropId;
  musicEnabled: boolean;
  audioEnergyRef: { current: number };
  performancePausedRef: { current: boolean };
  onSelectProp: (id: LifePropId) => void;
  onStudioReady: () => void;
}) {
  useEffect(() => {
    onStudioReady();
  }, [onStudioReady]);

  return <LazyStudio visible={visible} activePropId={activePropId} musicEnabled={musicEnabled} audioEnergyRef={audioEnergyRef} performancePausedRef={performancePausedRef} onSelectProp={onSelectProp} />;
}

function SceneContents({ opened, charging, prepareStudio, activePropId, spinRequest, musicEnabled, audioEnergyRef, performancePausedRef, showConsole, onCenterClick, onSpinArchive, onToggleMusic, onDownloadCv, onSelectProp, onStudioReady }: SceneProps) {
  return (
    <>
      <color attach="background" args={[opened ? '#120b06' : '#150d08']} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 6, 5]} intensity={1.15} color="#fff2df" />
      <spotLight position={[0.2, 4.2, 2.4]} angle={0.4} penumbra={0.8} intensity={opened ? 1.45 : 1.0} color="#ffe3bd" />
      <pointLight position={[-1.6, 1.2, 0.6]} intensity={opened ? 0.95 : 0.4} color="#ffd7a3" />
      <pointLight position={[2.4, 1.4, -1.4]} intensity={opened ? 1.1 : 0.42} color="#d9a441" />
      <pointLight position={[0, -0.9, 0]} intensity={opened ? 0.62 : 0.22} color="#a32e22" distance={3.2} />

      <CameraManager opened={opened} />
      <InspectionSurface />
      {opened && showConsole && <ArchiveConsole3D activePropId={activePropId} musicEnabled={musicEnabled} onClose={onCenterClick} onToggleMusic={onToggleMusic} onDownloadCv={onDownloadCv} onSpin={onSpinArchive} />}
      <RotatableCapsule opened={opened} spinRequest={spinRequest}>
        <ArchiveVessel opened={opened} charging={charging} audioEnergyRef={audioEnergyRef} onCenterClick={onCenterClick} />
        {prepareStudio && (
          <Suspense fallback={null}>
            <StudioLoader visible={opened} activePropId={activePropId} musicEnabled={musicEnabled} audioEnergyRef={audioEnergyRef} performancePausedRef={performancePausedRef} onSelectProp={onSelectProp} onStudioReady={onStudioReady} />
          </Suspense>
        )}
      </RotatableCapsule>
    </>
  );
}

// Writes samples straight into the overlay DOM node: routing them through
// React state re-renders the whole Canvas tree twice a second, which skews
// the very numbers this overlay exists to report.
function ScenePerfSampler({ target }: { target: { current: HTMLDivElement | null } }) {
  const gl = useThree((state) => state.gl);
  const [frameState] = useState(() => ({ frames: 0, elapsed: 0 }));

  useFrame((_, delta) => {
    frameState.frames += 1;
    frameState.elapsed += delta;

    if (frameState.elapsed < 0.5) return;

    const stats: ScenePerfStats = {
      fps: frameState.frames / frameState.elapsed,
      calls: gl.info.render.calls,
      triangles: gl.info.render.triangles,
      geometries: gl.info.memory.geometries,
      textures: gl.info.memory.textures,
      dpr: gl.getPixelRatio(),
    };

    if (target.current) {
      target.current.textContent = [
        `FPS ${Math.round(stats.fps)}`,
        `Calls ${stats.calls}`,
        `Tris ${Math.round(stats.triangles).toLocaleString()}`,
        `Geo ${stats.geometries}`,
        `Tex ${stats.textures}`,
        `DPR ${stats.dpr.toFixed(2)}`,
      ].join(' · ');
    }

    frameState.frames = 0;
    frameState.elapsed = 0;
  });

  return null;
}

export function Scene(props: SceneProps) {
  const perfOverlayRef = useRef<HTMLDivElement | null>(null);
  const showPerfOverlay = import.meta.env.DEV;

  return (
    <div className="scene-layer" aria-hidden="true">
      <Suspense fallback={null}>
        <Canvas camera={{ position: [0, 0.08, 1.9], fov: 39 }} gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }} dpr={[1, 1.25]}>
          <SceneContents {...props} />
          {showPerfOverlay && <ScenePerfSampler target={perfOverlayRef} />}
        </Canvas>
      </Suspense>
      {showPerfOverlay && <div className="scene-perf" aria-hidden="true" ref={perfOverlayRef} />}
    </div>
  );
}
