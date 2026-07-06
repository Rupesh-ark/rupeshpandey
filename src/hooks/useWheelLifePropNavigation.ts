import { useEffect, useRef, type Dispatch, type SetStateAction } from 'react';
import { getNextLifePropId, type LifePropId } from '../data/lifeProps';

const SPECIMEN_PLATE_SELECTOR = '.specimen-plate';
const MIN_WHEEL_DELTA = 8;
const WHEEL_GESTURE_IDLE_MS = 260;

function isWheelInsideSpecimenPlate(event: WheelEvent) {
  const target = event.target;

  if (target instanceof Element && target.closest(SPECIMEN_PLATE_SELECTOR)) return true;
  if (target instanceof Node && target.parentElement?.closest(SPECIMEN_PLATE_SELECTOR)) return true;

  if (typeof event.composedPath === 'function') {
    const insidePath = event.composedPath().some((pathTarget) => (
      pathTarget instanceof Element && Boolean(pathTarget.closest(SPECIMEN_PLATE_SELECTOR))
    ));
    if (insidePath) return true;
  }

  return Boolean(document.elementFromPoint(event.clientX, event.clientY)?.closest(SPECIMEN_PLATE_SELECTOR));
}

export function useWheelLifePropNavigation(
  enabled: boolean,
  setActivePropId: Dispatch<SetStateAction<LifePropId>>,
) {
  const wheelGestureLocked = useRef(false);
  const wheelGestureTimer = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;

    function handleWheel(event: WheelEvent) {
      if (isWheelInsideSpecimenPlate(event)) return;
      if (Math.abs(event.deltaY) < MIN_WHEEL_DELTA) return;
      event.preventDefault();

      if (wheelGestureTimer.current) window.clearTimeout(wheelGestureTimer.current);
      wheelGestureTimer.current = window.setTimeout(() => {
        wheelGestureLocked.current = false;
        wheelGestureTimer.current = null;
      }, WHEEL_GESTURE_IDLE_MS);

      if (wheelGestureLocked.current) return;

      wheelGestureLocked.current = true;
      setActivePropId((current) => getNextLifePropId(current, event.deltaY > 0 ? 1 : -1));
    }

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      window.removeEventListener('wheel', handleWheel);
      if (wheelGestureTimer.current) {
        window.clearTimeout(wheelGestureTimer.current);
        wheelGestureTimer.current = null;
      }
      wheelGestureLocked.current = false;
    };
  }, [enabled, setActivePropId]);
}
