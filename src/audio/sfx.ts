/**
 * Synthesized UI sound effects — no audio assets.
 * Everything speaks one calm bell language (major-pentatonic, soft music-box
 * partials) so effects sit comfortably alongside the cheerful archive music.
 * A single lazily-created AudioContext is shared by all effects; it is only
 * created from user-gesture call sites, which satisfies autoplay policies.
 */

let context: AudioContext | null = null;
let master: GainNode | null = null;

function ensureContext(): AudioContext | null {
  if (!context) {
    const AudioContextConstructor = window.AudioContext
      ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextConstructor) return null;
    context = new AudioContextConstructor();
    master = context.createGain();
    master.gain.value = 0.8;
    master.connect(context.destination);
  }
  if (context.state === 'suspended') void context.resume();
  return context;
}

/** C-major pentatonic ladder, G4 → E6 — every note is consonant with every other. */
export const CHIME_SCALE = [392, 440, 523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.51];

/**
 * One soft bell strike: sine fundamental plus quiet inharmonic-ish partials,
 * higher partials dying faster — a small music-box tine, not a church bell.
 */
export function bell(
  frequency: number,
  { delay = 0, peak = 0.055, decay = 1.1 }: { delay?: number; peak?: number; decay?: number } = {},
) {
  const ctx = ensureContext();
  if (!ctx) return;
  const at = ctx.currentTime + delay;
  const partials: Array<[ratio: number, amplitude: number]> = [
    [1, 1],
    [2, 0.3],
    [3.01, 0.1],
    [4.16, 0.04],
  ];

  for (const [ratio, amplitude] of partials) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = frequency * ratio * (1 + (Math.random() - 0.5) * 0.002);
    const gain = ctx.createGain();
    const partialDecay = Math.max(decay / ratio, 0.12);
    gain.gain.setValueAtTime(0, at);
    gain.gain.linearRampToValueAtTime(peak * amplitude, at + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0003, at + partialDecay);
    osc.connect(gain).connect(master!);
    osc.start(at);
    osc.stop(at + partialDecay + 0.05);
  }
}

/** Button tap: a single short mid bell. */
export function sfxClick() {
  bell(659.25, { peak: 0.04, decay: 0.4 });
}

/** Charging the archive: an accelerating ascent up the scale, timed to the charge. */
export function sfxCharge(durationMs: number) {
  const duration = durationMs / 1000;
  const run = [392, 440, 523.25, 587.33, 659.25, 783.99, 880, 1046.5];
  const usable = duration * 0.92;
  run.forEach((frequency, index) => {
    const progress = index / (run.length - 1);
    // Notes bunch together as the mechanism winds tight.
    const delay = usable * (1 - Math.pow(1 - progress, 1.45));
    bell(frequency, { delay, peak: 0.02 + progress * 0.03, decay: 0.55 });
  });
}

/** The archive opens: a warm, slowly rolled major chord. */
export function sfxOpen() {
  bell(261.63, { peak: 0.06, decay: 2 });
  bell(523.25, { delay: 0.05, peak: 0.05, decay: 1.6 });
  bell(783.99, { delay: 0.12, peak: 0.045, decay: 1.6 });
  bell(1046.5, { delay: 0.2, peak: 0.04, decay: 1.8 });
}

/** The archive closes: a gentle descent coming to rest on the low root. */
export function sfxClose() {
  bell(880, { peak: 0.04, decay: 0.7 });
  bell(659.25, { delay: 0.09, peak: 0.04, decay: 0.7 });
  bell(523.25, { delay: 0.18, peak: 0.045, decay: 0.9 });
  bell(261.63, { delay: 0.3, peak: 0.05, decay: 1.6 });
}

/** Turning to another record: one barely-there low tap, easy to hear past. */
export function sfxSelect() {
  bell(523.25, { peak: 0.022, decay: 0.3 });
}

/** The spin button: a quick ascending flourish, like flicking a music box. */
export function sfxSpin() {
  [523.25, 659.25, 783.99, 1046.5].forEach((frequency, index) => {
    bell(frequency, { delay: index * 0.055, peak: 0.04, decay: 0.8 });
  });
}
