import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import type { LifeProp } from '../data/lifeProps';

export function SpecimenPlate({ activeProp }: { activeProp: LifeProp }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showScrollCue, setShowScrollCue] = useState(false);
  const readout = activeProp.readout;
  const plateStyle = { '--plate-accent': activeProp.color, '--plate-secondary': activeProp.accent } as CSSProperties;

  const syncScrollCue = useCallback(() => {
    const scrollPanel = scrollRef.current;
    if (!scrollPanel) return;

    const overflows = scrollPanel.scrollHeight > scrollPanel.clientHeight + 2;
    const hasMoreBelow = scrollPanel.scrollTop + scrollPanel.clientHeight < scrollPanel.scrollHeight - 2;
    setShowScrollCue(overflows && hasMoreBelow);
  }, []);

  useEffect(() => {
    const scrollPanel = scrollRef.current;
    if (!scrollPanel) return;

    scrollPanel.scrollTop = 0;
    syncScrollCue();

    const frame = window.requestAnimationFrame(syncScrollCue);
    const resizeObserver = new ResizeObserver(syncScrollCue);
    resizeObserver.observe(scrollPanel);
    window.addEventListener('resize', syncScrollCue);

    return () => {
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      window.removeEventListener('resize', syncScrollCue);
    };
  }, [activeProp.id, syncScrollCue]);

  const records = (
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
  );

  return (
    <aside
      className={`specimen-plate${readout.portrait ? ' specimen-plate--profile' : ''}`}
      style={plateStyle}
      aria-label={`${activeProp.label} specimen`}
      aria-live="polite"
      onWheelCapture={(event) => event.stopPropagation()}
    >
      <div ref={scrollRef} className="specimen-plate__scroll" onScroll={syncScrollCue}>
        <p className="specimen-plate__catalog">
          <span className="specimen-plate__tick" aria-hidden="true" />
          <span>{readout.catalog}</span>
        </p>

        {readout.portrait ? (
          <div className="specimen-plate__profile">
            <figure className="specimen-plate__portrait">
              <img src={readout.portrait.src} alt={readout.portrait.alt} width="480" height="470" />
            </figure>
            <div className="specimen-plate__profile-copy">
              <p className="specimen-plate__role">{readout.role}</p>
              {records}
            </div>
          </div>
        ) : (
          <>
            <p className="specimen-plate__role">{readout.role}</p>
            {records}
          </>
        )}
      </div>
      {showScrollCue && <span className="specimen-plate__scroll-cue" aria-hidden="true" />}
    </aside>
  );
}
