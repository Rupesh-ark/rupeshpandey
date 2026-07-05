import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { Scene } from './components/Scene';
import { LIFE_PROPS, getLifeProp, getNextLifePropId, type LifeProp, type LifePropId } from './data/lifeProps';
import { useReducedMotion } from './hooks/useReducedMotion';

type ArchivePhase = 'closed' | 'charging' | 'open';

const CHARGE_DURATION_MS = 850;
const REDUCED_MOTION_CHARGE_MS = 140;

function ThemeNav({ activeProp, onSelectProp }: { activeProp: LifeProp; onSelectProp: (id: LifePropId) => void }) {
  const activeIndex = LIFE_PROPS.findIndex((prop) => prop.id === activeProp.id);

  return (
    <nav
      className="theme-nav"
      aria-label="Archive sections"
      style={{ '--nav-accent': activeProp.color, '--active-index': String(activeIndex) } as CSSProperties}
    >
      <span className="theme-nav__spine" aria-hidden="true" />
      <div className="theme-nav__head" aria-hidden="true">
        <span className="theme-nav__pulse" />
      </div>

      <ol className="theme-nav__stations">
        {LIFE_PROPS.map((prop) => (
          <li key={prop.id} className="theme-nav__station" data-active={activeProp.id === prop.id || undefined}>
            <button
              type="button"
              className="theme-nav__btn"
              aria-current={activeProp.id === prop.id ? 'page' : undefined}
              aria-label={prop.label}
              onClick={() => onSelectProp(prop.id)}
              style={{ '--item-color': prop.color } as CSSProperties}
            >
              <span className="theme-nav__led" aria-hidden="true" />
              <span className="theme-nav__code" aria-hidden="true">
                {prop.code}
              </span>
              <span className="theme-nav__name">{prop.label}</span>
            </button>
          </li>
        ))}
      </ol>

      <div className="theme-nav__foot" aria-hidden="true">
        <span className="theme-nav__mono">RP</span>
      </div>
      <span className="theme-nav__marker" aria-hidden="true" />
    </nav>
  );
}

function SpecimenPlate({ activeProp }: { activeProp: LifeProp }) {
  const readout = activeProp.readout;
  const plateStyle = { '--plate-accent': activeProp.color, '--plate-secondary': activeProp.accent } as CSSProperties;

  return (
    <>
      <span className="specimen-plate__beam" style={plateStyle} aria-hidden="true" />
      <aside
        className="specimen-plate"
        style={plateStyle}
        aria-label={`${activeProp.label} specimen`}
        aria-live="polite"
        onWheelCapture={(event) => event.stopPropagation()}
      >
        <p className="specimen-plate__catalog">
          <span className="specimen-plate__tick" aria-hidden="true" />
          <span>{readout.catalog}</span>
          <span aria-hidden="true">·</span>
          <span>{activeProp.label}</span>
        </p>
        <h1 className="specimen-plate__name">{readout.specimen}</h1>
        <p className="specimen-plate__role">{readout.role}</p>
        <dl key={activeProp.id} className="specimen-plate__notes">
          {readout.records.map((record) => (
            <div key={`${activeProp.id}-${record.label}-${record.value}`} className="specimen-plate__note">
              <dt>{record.label}</dt>
              <dd>{record.value}</dd>
            </div>
          ))}
        </dl>
        {readout.links && (
          <div className="specimen-plate__tags" aria-label={`${activeProp.label} links`}>
            {readout.links.map((link) => (
              <a key={link.href} className="specimen-plate__tag" href={link.href} target={link.href.startsWith('mailto:') ? undefined : '_blank'} rel={link.href.startsWith('mailto:') ? undefined : 'noreferrer'}>
                {link.label}
              </a>
            ))}
          </div>
        )}
      </aside>
    </>
  );
}

function isWheelInsideSpecimenPlate(event: WheelEvent) {
  const target = event.target;

  if (target instanceof Element && target.closest('.specimen-plate')) return true;
  if (target instanceof Node && target.parentElement?.closest('.specimen-plate')) return true;

  if (typeof event.composedPath === 'function') {
    const insidePath = event.composedPath().some((pathTarget) => (
      pathTarget instanceof Element && Boolean(pathTarget.closest('.specimen-plate'))
    ));
    if (insidePath) return true;
  }

  return Boolean(document.elementFromPoint(event.clientX, event.clientY)?.closest('.specimen-plate'));
}

export default function App() {
  const reducedMotion = useReducedMotion();
  const [archivePhase, setArchivePhase] = useState<ArchivePhase>('closed');
  const [activePropId, setActivePropId] = useState<LifePropId>(LIFE_PROPS[0].id);
  const [studioReady, setStudioReady] = useState(false);
  const [chargeComplete, setChargeComplete] = useState(false);
  const lastWheelAt = useRef(0);
  const opened = archivePhase === 'open';
  const charging = archivePhase === 'charging';
  const prepareStudio = charging || opened || studioReady;
  const activeProp = getLifeProp(activePropId);
  const toggleLabel = charging ? 'Charging archive' : opened ? 'Close archive' : 'Open archive';
  const toggleStatus = charging ? 'Charging' : opened ? 'Live' : 'Standby';

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

  useEffect(() => {
    if (!opened) return;

    function handleWheel(event: WheelEvent) {
      if (isWheelInsideSpecimenPlate(event)) return;
      if (Math.abs(event.deltaY) < 8) return;
      const now = performance.now();
      if (now - lastWheelAt.current < 420) return;

      event.preventDefault();
      lastWheelAt.current = now;
      setActivePropId((current) => getNextLifePropId(current, event.deltaY > 0 ? 1 : -1));
    }

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [opened]);

  return (
    <>
      <Scene
        opened={opened}
        charging={charging}
        prepareStudio={prepareStudio}
        activePropId={activePropId}
        onCenterClick={handleCenterClick}
        onSelectProp={setActivePropId}
        onStudioReady={handleStudioReady}
      />
      <button
        type="button"
        className="archive-toggle"
        aria-label={`${toggleLabel} Pokeball`}
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
      {opened && <ThemeNav activeProp={activeProp} onSelectProp={setActivePropId} />}
      {opened && <SpecimenPlate activeProp={activeProp} />}
    </>
  );
}
