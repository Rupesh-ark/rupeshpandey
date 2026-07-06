import { Suspense, lazy, useCallback, useEffect, useRef, useState, type CSSProperties, type SetStateAction } from 'react';
import { sfxCharge, sfxClick, sfxClose, sfxOpen, sfxSelect, sfxSpin } from './audio/sfx';
import { SpecimenPlate } from './components/SpecimenPlate';
import { ThemeNav } from './components/ThemeNav';
import { LIFE_PROPS, getLifeProp, type LifePropId } from './data/lifeProps';
import { useArchiveAudio } from './hooks/useArchiveAudio';
import { useReducedMotion } from './hooks/useReducedMotion';
import { useWheelLifePropNavigation } from './hooks/useWheelLifePropNavigation';

type ArchivePhase = 'closed' | 'charging' | 'open';

const CHARGE_DURATION_MS = 850;
const REDUCED_MOTION_CHARGE_MS = 140;
const SCROLL_PERFORMANCE_IDLE_MS = 220;
const MOBILE_LAYOUT_QUERY = '(max-width: 720px)';
const CV_DOWNLOAD_URL = '/cv/rupesh-pandey-cv.pdf';
const CV_DOWNLOAD_NAME = 'Rupesh-Pandey-CV.pdf';
const LazyScene = lazy(() => import('./components/Scene').then((module) => ({ default: module.Scene })));

function useMobileLayout() {
  const [isMobile, setIsMobile] = useState(() => (
    typeof window === 'undefined' ? false : window.matchMedia(MOBILE_LAYOUT_QUERY).matches
  ));

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const query = window.matchMedia(MOBILE_LAYOUT_QUERY);
    const update = () => setIsMobile(query.matches);
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  return isMobile;
}

export default function App() {
  const reducedMotion = useReducedMotion();
  const isMobileLayout = useMobileLayout();
  const [archivePhase, setArchivePhase] = useState<ArchivePhase>('closed');
  const [activePropId, setActivePropId] = useState<LifePropId>(LIFE_PROPS[0].id);
  const [studioReady, setStudioReady] = useState(false);
  const [chargeComplete, setChargeComplete] = useState(false);
  const [spinRequest, setSpinRequest] = useState(0);
  const [sceneRequested, setSceneRequested] = useState(false);
  const performancePausedRef = useRef(false);
  const specimenScrollTimer = useRef<number | null>(null);
  const opened = archivePhase === 'open';
  const charging = archivePhase === 'charging';
  const prepareStudio = charging || opened || studioReady;
  const activeProp = getLifeProp(activePropId);
  const toggleLabel = charging ? 'Charging archive' : 'Open archive';
  const toggleStatus = charging ? 'Charging' : 'Standby';
  const { musicEnabled, audioEnergyRef, toggleMusic: handleToggleMusic } = useArchiveAudio(opened);

  useEffect(() => {
    setSceneRequested(true);
  }, []);

  const handleCenterClick = useCallback(() => {
    if (charging) return;
    if (opened) {
      sfxClose();
      setArchivePhase('closed');
      return;
    }

    sfxClick();
    sfxCharge(reducedMotion ? REDUCED_MOTION_CHARGE_MS : CHARGE_DURATION_MS);
    setChargeComplete(false);
    setArchivePhase('charging');
  }, [charging, opened, reducedMotion]);

  const handleStudioReady = useCallback(() => {
    setStudioReady(true);
  }, []);

  const handleSpinArchive = useCallback(() => {
    sfxSpin();
    setSpinRequest((current) => current + 1);
  }, []);

  const handleToggleMusicWithClick = useCallback(() => {
    sfxClick();
    handleToggleMusic();
  }, [handleToggleMusic]);

  const handleDownloadCv = useCallback(() => {
    sfxClick();
    if (typeof document === 'undefined') return;

    const link = document.createElement('a');
    link.href = CV_DOWNLOAD_URL;
    link.download = CV_DOWNLOAD_NAME;
    document.body.append(link);
    link.click();
    link.remove();
  }, []);

  const handleSelectProp = useCallback((action: SetStateAction<LifePropId>) => {
    setActivePropId((current) => {
      const next = typeof action === 'function' ? action(current) : action;
      if (next !== current) sfxSelect();
      return next;
    });
  }, []);

  // Kept as a ref (not state): a state toggle here re-renders the entire
  // canvas tree on every scroll gesture, which is itself a frame drop.
  const handleSpecimenScrollActivity = useCallback(() => {
    performancePausedRef.current = true;

    if (specimenScrollTimer.current) window.clearTimeout(specimenScrollTimer.current);
    specimenScrollTimer.current = window.setTimeout(() => {
      performancePausedRef.current = false;
      specimenScrollTimer.current = null;
    }, SCROLL_PERFORMANCE_IDLE_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (specimenScrollTimer.current) window.clearTimeout(specimenScrollTimer.current);
    };
  }, []);

  useEffect(() => {
    if (opened) return;

    if (specimenScrollTimer.current) {
      window.clearTimeout(specimenScrollTimer.current);
      specimenScrollTimer.current = null;
    }
    performancePausedRef.current = false;
  }, [opened]);

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
      sfxOpen();
      setArchivePhase('open');
    }
  }, [chargeComplete, charging, studioReady]);

  useWheelLifePropNavigation(opened, handleSelectProp);

  return (
    <>
      {sceneRequested && (
        <Suspense fallback={null}>
          <LazyScene
            opened={opened}
            charging={charging}
            prepareStudio={prepareStudio}
            activePropId={activePropId}
            spinRequest={spinRequest}
            musicEnabled={musicEnabled}
            audioEnergyRef={audioEnergyRef}
            performancePausedRef={performancePausedRef}
            showConsole={!isMobileLayout}
            onCenterClick={handleCenterClick}
            onSpinArchive={handleSpinArchive}
            onToggleMusic={handleToggleMusicWithClick}
            onDownloadCv={handleDownloadCv}
            onSelectProp={handleSelectProp}
            onStudioReady={handleStudioReady}
          />
        </Suspense>
      )}
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
          <button type="button" aria-pressed={musicEnabled} onClick={handleToggleMusicWithClick}>
            {musicEnabled ? 'Disable music pulse' : 'Enable music pulse'}
          </button>
          <button type="button" onClick={handleDownloadCv}>
            Download detailed CV
          </button>
          <button type="button" onClick={handleCenterClick}>
            Close archive
          </button>
        </div>
      )}
      {opened && isMobileLayout && (
        <div
          className="archive-console-bar"
          style={{ '--console-accent': activeProp.color, '--console-secondary': activeProp.accent } as CSSProperties}
        >
          <div className="archive-console-bar__plaque">
            <span className="archive-console-bar__label">
              <span className="archive-console-bar__seal" aria-hidden="true" />
              {activeProp.label}
            </span>
            <span className="archive-console-bar__code">Exhibit · {activeProp.readout.catalog.split(' · ')[0]}</span>
          </div>
          <div className="archive-console-bar__actions">
            <a
              className="archive-console-bar__btn"
              href={CV_DOWNLOAD_URL}
              download={CV_DOWNLOAD_NAME}
              aria-label="Download detailed CV"
              style={{ color: '#eadfc4' }}
              onClick={() => sfxClick()}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 4.5v9.2m0 0 3.7-3.7M12 13.7 8.3 10M6.2 18.5h11.6" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <button
              type="button"
              className="archive-console-bar__btn"
              aria-pressed={musicEnabled}
              aria-label={musicEnabled ? 'Disable music' : 'Enable music'}
              style={{ color: musicEnabled ? activeProp.accent : '#8a7f6a' }}
              onClick={handleToggleMusicWithClick}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M9.5 18V6.2l8-1.7V16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                <circle cx="7.3" cy="18" r="2.3" fill="currentColor" />
                <circle cx="15.3" cy="16" r="2.3" fill="currentColor" />
              </svg>
            </button>
            <button
              type="button"
              className="archive-console-bar__btn"
              aria-label="Spin archive device"
              style={{ color: activeProp.color }}
              onClick={handleSpinArchive}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
                <path d="M17.6 2.6l.4 4.5-4.5-.4z" fill="currentColor" />
              </svg>
            </button>
            <button
              type="button"
              className="archive-console-bar__btn"
              aria-label="Close archive"
              style={{ color: '#eadfc4' }}
              onClick={handleCenterClick}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6.5 6.5l11 11m0-11l-11 11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      )}
      {opened && <ThemeNav activeProp={activeProp} onSelectProp={handleSelectProp} />}
      {opened && <SpecimenPlate activeProp={activeProp} onScrollActivity={handleSpecimenScrollActivity} />}
    </>
  );
}
