import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { Scene } from './components/Scene';
import { LIFE_PROPS, getLifeProp, getNextLifePropId, type LifeProp, type LifePropId } from './data/lifeProps';

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

  return (
    <aside
      className="specimen-plate"
      style={{ '--plate-accent': activeProp.color } as CSSProperties}
      aria-label={`${activeProp.label} specimen`}
      aria-live="polite"
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
  );
}

export default function App() {
  const [opened, setOpened] = useState(false);
  const [activePropId, setActivePropId] = useState<LifePropId>(LIFE_PROPS[0].id);
  const lastWheelAt = useRef(0);
  const activeProp = getLifeProp(activePropId);

  const handleCenterClick = useCallback(() => {
    setOpened((current) => !current);
  }, []);

  useEffect(() => {
    if (!opened) return;

    function handleWheel(event: WheelEvent) {
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
      <Scene opened={opened} activePropId={activePropId} onCenterClick={handleCenterClick} onSelectProp={setActivePropId} />
      {opened && <ThemeNav activeProp={activeProp} onSelectProp={setActivePropId} />}
      {opened && <SpecimenPlate activeProp={activeProp} />}
    </>
  );
}
