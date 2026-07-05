import { useEffect, useRef } from 'react';
import type { PlaceData } from '../data/content';

interface LightboxProps {
  place: PlaceData | null;
  onClose: () => void;
}

export function Lightbox({ place, onClose }: LightboxProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (place) closeRef.current?.focus();
  }, [place]);

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }

    if (!place) return;
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [place, onClose]);

  if (!place) return null;

  return (
    <div className="dialog-overlay" role="dialog" aria-modal="true" aria-labelledby={`place-${place.id}-title`} onClick={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <div className="dialog-card photo-card">
        <div className="photo-placeholder" style={{ background: place.placeholderColor }}>
          <span>Photo slot</span>
        </div>
        <p className="eyebrow">Map pin</p>
        <h2 id={`place-${place.id}-title`}>{place.title}</h2>
        <p>{place.description}</p>
        <p className="caption">{place.caption}</p>
        <div className="panel-actions">
          <button ref={closeRef} className="secondary" type="button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
