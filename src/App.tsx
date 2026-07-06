import { useCallback, useEffect, useState } from 'react';
import { Scene } from './components/Scene';
import { SpecimenPlate } from './components/SpecimenPlate';
import { ThemeNav } from './components/ThemeNav';
import { LIFE_PROPS, getLifeProp, type LifePropId } from './data/lifeProps';
import { useArchiveAudio } from './hooks/useArchiveAudio';
import { useReducedMotion } from './hooks/useReducedMotion';
import { useWheelLifePropNavigation } from './hooks/useWheelLifePropNavigation';

type ArchivePhase = 'closed' | 'charging' | 'open';

const CHARGE_DURATION_MS = 850;
const REDUCED_MOTION_CHARGE_MS = 140;

export default function App() {
  const reducedMotion = useReducedMotion();
  const [archivePhase, setArchivePhase] = useState<ArchivePhase>('closed');
  const [activePropId, setActivePropId] = useState<LifePropId>(LIFE_PROPS[0].id);
  const [studioReady, setStudioReady] = useState(false);
  const [chargeComplete, setChargeComplete] = useState(false);
  const [spinRequest, setSpinRequest] = useState(0);
  const opened = archivePhase === 'open';
  const charging = archivePhase === 'charging';
  const prepareStudio = charging || opened || studioReady;
  const activeProp = getLifeProp(activePropId);
  const toggleLabel = charging ? 'Charging archive' : 'Open archive';
  const toggleStatus = charging ? 'Charging' : 'Standby';
  const { musicEnabled, audioEnergy, toggleMusic: handleToggleMusic } = useArchiveAudio(opened);

  const handleCenterClick = useCallback(() => {
    if (charging) return;
    if (opened) {
      setArchivePhase('closed');
      return;
    }

    setChargeComplete(false);
    setArchivePhase('charging');
  }, [charging, opened]);

  const handleStudioReady = useCallback(() => {
    setStudioReady(true);
  }, []);

  const handleSpinArchive = useCallback(() => {
    setSpinRequest((current) => current + 1);
  }, []);

  useEffect(() => {
    if (!charging) return;

    const timer = window.setTimeout(
      () => setChargeComplete(true),
      reducedMotion ? REDUCED_MOTION_CHARGE_MS : CHARGE_DURATION_MS,
    );

    return () => window.clearTimeout(timer);
  }, [charging, reducedMotion]);

  useEffect(() => {
    if (charging && studioReady && chargeComplete) {
      setArchivePhase('open');
    }
  }, [chargeComplete, charging, studioReady]);

  useWheelLifePropNavigation(opened, setActivePropId);

  return (
    <>
      <Scene
        opened={opened}
        charging={charging}
        prepareStudio={prepareStudio}
        activePropId={activePropId}
        spinRequest={spinRequest}
        musicEnabled={musicEnabled}
        audioEnergy={audioEnergy}
        onCenterClick={handleCenterClick}
        onSpinArchive={handleSpinArchive}
        onToggleMusic={handleToggleMusic}
        onSelectProp={setActivePropId}
        onStudioReady={handleStudioReady}
      />
      {!opened && (
        <div className="archive-identity" aria-label="Rupesh Pandey portfolio archive">
          <span className="archive-identity__name">Rupesh Pandey</span>
          <span className="archive-identity__meta">Portfolio archive</span>
        </div>
      )}
      {!opened && (
        <button
          type="button"
          className="archive-toggle"
          aria-label={`${toggleLabel} archive device`}
          aria-pressed={opened}
          aria-busy={charging || undefined}
          data-phase={archivePhase}
          disabled={charging}
          onClick={handleCenterClick}
        >
          <span className="archive-toggle__status" aria-hidden="true">
            {toggleStatus}
          </span>
          <span>{toggleLabel}</span>
        </button>
      )}
      {opened && (
        <div className="archive-accessible-controls" aria-label="Archive keyboard controls">
          <button type="button" onClick={handleSpinArchive}>
            Spin archive device
          </button>
          <button type="button" aria-pressed={musicEnabled} onClick={handleToggleMusic}>
            {musicEnabled ? 'Disable music pulse' : 'Enable music pulse'}
          </button>
          <button type="button" onClick={handleCenterClick}>
            Close archive
          </button>
        </div>
      )}
      {opened && <ThemeNav activeProp={activeProp} onSelectProp={setActivePropId} />}
      {opened && <SpecimenPlate activeProp={activeProp} />}
    </>
  );
}
