import { useEffect, useRef, type Dispatch, type SetStateAction } from 'react';
import { getNextLifePropId, type LifePropId } from '../data/lifeProps';

const SPECIMEN_PLATE_SELECTOR = '.specimen-plate';
const MIN_WHEEL_DELTA = 8;
const WHEEL_GESTURE_IDLE_MS = 260;
// Touch swipes: predominantly-vertical flicks on the scene navigate sections,
// mirroring the desktop wheel gesture. Horizontal drags stay with the vessel.
const OVERLAY_SELECTOR = '.specimen-plate, .theme-nav, .archive-console-bar, .archive-accessible-controls, button, a';
const SWIPE_MIN_DISTANCE_PX = 48;
const SWIPE_MAX_DURATION_MS = 650;
const SWIPE_VERTICAL_BIAS = 1.4;

function isInsideOverlay(target: EventTarget | null) {
  return target instanceof Element && Boolean(target.closest(OVERLAY_SELECTOR));
}

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

    let swipeStart: { x: number; y: number; time: number } | null = null;

    function handleTouchStart(event: TouchEvent) {
      swipeStart = null;
      if (event.touches.length !== 1) return;
      if (isInsideOverlay(event.target)) return;
      const touch = event.touches[0];
      swipeStart = { x: touch.clientX, y: touch.clientY, time: performance.now() };
    }

    function handleTouchEnd(event: TouchEvent) {
      const start = swipeStart;
      swipeStart = null;
      if (!start || event.changedTouches.length !== 1) return;
      if (performance.now() - start.time > SWIPE_MAX_DURATION_MS) return;

      const touch = event.changedTouches[0];
      const deltaX = touch.clientX - start.x;
      const deltaY = touch.clientY - start.y;
      if (Math.abs(deltaY) < SWIPE_MIN_DISTANCE_PX) return;
      if (Math.abs(deltaY) < Math.abs(deltaX) * SWIPE_VERTICAL_BIAS) return;

      // Swipe up advances, like scrolling down.
      setActivePropId((current) => getNextLifePropId(current, deltaY < 0 ? 1 : -1));
    }

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
      if (wheelGestureTimer.current) {
        window.clearTimeout(wheelGestureTimer.current);
        wheelGestureTimer.current = null;
      }
      wheelGestureLocked.current = false;
    };
  }, [enabled, setActivePropId]);
}
