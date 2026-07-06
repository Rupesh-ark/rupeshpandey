import { useMemo, useRef } from 'react';
import { bell, CHIME_SCALE } from '../audio/sfx';

const NOTCH_RADIANS = 0.085; // rotation travelled between chime strikes
const MIN_INTERVAL_MS = 90; // cascade cap so fast spins shimmer instead of clatter
const FULL_SPEED = 3; // rad/s that counts as a fast spin

/**
 * Wind-chime rotation feedback: turning the ball strikes soft pentatonic
 * bells — ascending when turned forward, descending backward, denser and a
 * touch brighter with speed. Calm by construction: every note is consonant.
 */
export function useSpinChimes() {
  const travelled = useRef(0);
  const noteIndex = useRef(4);
  const lastStrikeAt = useRef(0);

  return useMemo(() => ({
    /** Feed the current angular velocity (rad/s); call with 0 when idle. */
    update(velocity: number, dt: number) {
      const speed = Math.abs(velocity);
      if (speed < 0.05) {
        travelled.current = 0;
        return;
      }

      travelled.current += speed * dt;
      if (travelled.current < NOTCH_RADIANS) return;

      const now = performance.now();
      if (now - lastStrikeAt.current < MIN_INTERVAL_MS) return;
      travelled.current = 0;
      lastStrikeAt.current = now;

      // Walk the scale in the direction of the spin, reflecting at the ends.
      const step = (velocity > 0 ? 1 : -1) * (Math.random() < 0.22 ? 2 : 1);
      let next = noteIndex.current + step;
      if (next >= CHIME_SCALE.length) next = CHIME_SCALE.length - 2;
      if (next < 0) next = 1;
      noteIndex.current = next;

      const intensity = Math.min(speed / FULL_SPEED, 1);
      bell(CHIME_SCALE[next], {
        peak: 0.02 + intensity * 0.035,
        decay: 1 + intensity * 0.4,
      });
    },
  }), []);
}
