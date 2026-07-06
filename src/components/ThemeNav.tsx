import type { CSSProperties } from 'react';
import { LIFE_PROPS, type LifeProp, type LifePropId } from '../data/lifeProps';

export function ThemeNav({ activeProp, onSelectProp }: { activeProp: LifeProp; onSelectProp: (id: LifePropId) => void }) {
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
