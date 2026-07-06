import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type WheelEvent } from 'react';
import type { LifeProp } from '../data/lifeProps';

const MOBILE_LAYOUT_QUERY = '(max-width: 720px)';

export function SpecimenPlate({ activeProp, onScrollActivity }: { activeProp: LifeProp; onScrollActivity: () => void }) {
  const plateRef = useRef<HTMLElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const showScrollCueRef = useRef(false);
  const scrollCueFrameRef = useRef<number | null>(null);
  const [showScrollCue, setShowScrollCue] = useState(false);
  const readout = activeProp.readout;
  const plateStyle = { '--plate-accent': activeProp.color, '--plate-secondary': activeProp.accent } as CSSProperties;

  // Desktop: measure the section's natural height and set explicit pixels so
  // the CSS height transition can animate between sections (height: auto
  // changes don't fire transitions). Mobile keeps the fixed-height sheet.
  const syncPlateHeight = useCallback(() => {
    const plate = plateRef.current;
    if (!plate) return;

    if (window.matchMedia(MOBILE_LAYOUT_QUERY).matches) {
      plate.style.height = '';
      return;
    }

    // FLIP: measure the natural (auto, min/max-clamped) height, then animate
    // from the current height to it.
    const startHeight = plate.offsetHeight;
    plate.style.height = 'auto';
    const targetHeight = plate.offsetHeight;
    if (targetHeight === startHeight) {
      plate.style.height = `${targetHeight}px`;
      return;
    }
    plate.style.height = `${startHeight}px`;
    void plate.offsetHeight; // commit the start value before transitioning
    plate.style.height = `${targetHeight}px`;
  }, []);

  useLayoutEffect(() => {
    syncPlateHeight();
    window.addEventListener('resize', syncPlateHeight);
    return () => window.removeEventListener('resize', syncPlateHeight);
  }, [activeProp.id, syncPlateHeight]);

  const updateScrollCue = useCallback(() => {
    const scrollPanel = scrollRef.current;
    if (!scrollPanel) return;

    const overflows = scrollPanel.scrollHeight > scrollPanel.clientHeight + 2;
    const hasMoreBelow = scrollPanel.scrollTop + scrollPanel.clientHeight < scrollPanel.scrollHeight - 2;
    const nextShowScrollCue = overflows && hasMoreBelow;
    if (showScrollCueRef.current === nextShowScrollCue) return;

    showScrollCueRef.current = nextShowScrollCue;
    setShowScrollCue(nextShowScrollCue);
  }, []);

  const syncScrollCue = useCallback(() => {
    if (scrollCueFrameRef.current !== null) return;

    scrollCueFrameRef.current = window.requestAnimationFrame(() => {
      scrollCueFrameRef.current = null;
      updateScrollCue();
    });
  }, [updateScrollCue]);

  const handleScroll = useCallback(() => {
    onScrollActivity();
    syncScrollCue();
  }, [onScrollActivity, syncScrollCue]);

  const handleWheelCapture = useCallback((event: WheelEvent<HTMLElement>) => {
    event.stopPropagation();
    onScrollActivity();
  }, [onScrollActivity]);

  useEffect(() => {
    return () => {
      if (scrollCueFrameRef.current !== null) window.cancelAnimationFrame(scrollCueFrameRef.current);
    };
  }, []);

  useEffect(() => {
    const scrollPanel = scrollRef.current;
    if (!scrollPanel) return;

    scrollPanel.scrollTop = 0;
    updateScrollCue();

    const frame = window.requestAnimationFrame(syncScrollCue);
    const resizeObserver = new ResizeObserver(syncScrollCue);
    resizeObserver.observe(scrollPanel);
    window.addEventListener('resize', syncScrollCue);

    return () => {
      window.cancelAnimationFrame(frame);
      if (scrollCueFrameRef.current !== null) {
        window.cancelAnimationFrame(scrollCueFrameRef.current);
        scrollCueFrameRef.current = null;
      }
      resizeObserver.disconnect();
      window.removeEventListener('resize', syncScrollCue);
    };
  }, [activeProp.id, syncScrollCue, updateScrollCue]);

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
      ref={plateRef}
      className={`specimen-plate${readout.portrait ? ' specimen-plate--profile' : ''}`}
      style={plateStyle}
      aria-label={`${activeProp.label} specimen`}
      aria-live="polite"
      onWheelCapture={handleWheelCapture}
    >
      <div ref={scrollRef} className="specimen-plate__scroll" onScroll={handleScroll}>
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
