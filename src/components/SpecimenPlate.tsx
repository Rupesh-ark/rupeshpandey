import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import type { LifeProp } from '../data/lifeProps';

export function SpecimenPlate({ activeProp }: { activeProp: LifeProp }) {
  const plateRef = useRef<HTMLElement>(null);
  const [showScrollCue, setShowScrollCue] = useState(false);
  const readout = activeProp.readout;
  const plateStyle = { '--plate-accent': activeProp.color, '--plate-secondary': activeProp.accent } as CSSProperties;

  const syncScrollCue = useCallback(() => {
    const plate = plateRef.current;
    if (!plate) return;

    const overflows = plate.scrollHeight > plate.clientHeight + 2;
    const hasMoreBelow = plate.scrollTop + plate.clientHeight < plate.scrollHeight - 2;
    setShowScrollCue(overflows && hasMoreBelow);
  }, []);

  useEffect(() => {
    const plate = plateRef.current;
    if (!plate) return;

    plate.scrollTop = 0;
    syncScrollCue();

    const frame = window.requestAnimationFrame(syncScrollCue);
    const resizeObserver = new ResizeObserver(syncScrollCue);
    resizeObserver.observe(plate);
    window.addEventListener('resize', syncScrollCue);

    return () => {
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      window.removeEventListener('resize', syncScrollCue);
    };
  }, [activeProp.id, syncScrollCue]);

  return (
    <>
      <span className="specimen-plate__beam" style={plateStyle} aria-hidden="true" />
      <aside
        ref={plateRef}
        className="specimen-plate"
        style={plateStyle}
        aria-label={`${activeProp.label} specimen`}
        aria-live="polite"
        onScroll={syncScrollCue}
        onWheelCapture={(event) => event.stopPropagation()}
      >
        <p className="specimen-plate__catalog">
          <span className="specimen-plate__tick" aria-hidden="true" />
          <span>{readout.catalog}</span>
        </p>
        <p className="specimen-plate__role">{readout.role}</p>
        <dl key={activeProp.id} className="specimen-plate__notes">
          {readout.records.map((record) => {
            const recordContent = (
              <>
                <span className="specimen-plate__record-title">{record.value}</span>
                {record.detail && <span className="specimen-plate__record-detail">{record.detail}</span>}
              </>
            );

            return (
              <div key={`${activeProp.id}-${record.label}-${record.value}`} className="specimen-plate__note">
                <dt>{record.label}</dt>
                <dd>
                  {record.href ? (
                    <a
                      className="specimen-plate__record-link"
                      href={record.href}
                      target={record.href.startsWith('mailto:') ? undefined : '_blank'}
                      rel={record.href.startsWith('mailto:') ? undefined : 'noreferrer'}
                    >
                      {recordContent}
                    </a>
                  ) : (
                    <span className="specimen-plate__record-content">{recordContent}</span>
                  )}
                </dd>
              </div>
            );
          })}
        </dl>
        {showScrollCue && <span className="specimen-plate__scroll-cue" aria-hidden="true" />}
      </aside>
    </>
  );
}
